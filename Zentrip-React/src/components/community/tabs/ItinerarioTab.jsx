import { useState, useMemo } from 'react';
import { MapPin, Users, CalendarDays, Star, Compass } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import DayCalendar from '../../trips/detail/components/itinerary/DayCalendar';
import { formatDayHeader, getBookingDate, TYPE_CONFIG, BOOKING_TYPE_CONFIG } from '../utils/postHelpers';

function fmtMoney(amount) {
  if (amount == null || Number.isNaN(amount)) return '—';
  return amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ItinerarioTab({ tripDays, activitiesByDate, bookings = [] }) {
  const { language } = useLanguage();
  const [selectedDay, setSelectedDay] = useState(tripDays[0] ?? null);

  const bookingsByDate = useMemo(() => {
    const byDate = {};
    for (const b of bookings) {
      const date = getBookingDate(b);
      if (!date) continue;
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(b);
    }
    return byDate;
  }, [bookings]);

  const dayActivities = useMemo(() => {
    if (!selectedDay) return [];
    return (activitiesByDate[selectedDay] || [])
      .slice()
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [selectedDay, activitiesByDate]);

  const dayBookings = useMemo(
    () => (selectedDay ? bookingsByDate[selectedDay] || [] : []),
    [selectedDay, bookingsByDate]
  );

  if (tripDays.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-1 p-10 text-center">
        <CalendarDays className="w-10 h-10 text-neutral-2 mx-auto mb-3" />
        <p className="body text-neutral-4">Este viaje no tiene fechas definidas en el itinerario</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DayCalendar
        tripDays={tripDays}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        activitiesByDate={activitiesByDate}
        weatherByDate={{}}
        disableAutoJump
      />

      <div className="bg-white rounded-2xl border border-neutral-1 p-4">
        <div className="mb-4">
          <h3 className="title-h3-desktop text-secondary-5">{formatDayHeader(selectedDay, language)}</h3>
        </div>

        {dayActivities.length === 0 && dayBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2 text-center">
            <CalendarDays className="w-10 h-10 text-neutral-2" />
            <p className="body text-neutral-4">Sin actividades para este día</p>
          </div>
        ) : (
          <div>
            {dayActivities.length > 0 && (
              <div className="mt-2">
                {dayActivities.map((act, i) => {
                  const typeCfg = TYPE_CONFIG[act.type] || TYPE_CONFIG.actividad;
                  const TypeIcon = typeCfg.Icon || Compass;
                  const isBooked = act.status === 'reservado';
                  const isLast = i === dayActivities.length - 1;
                  return (
                    <div key={act.id || i} className="flex gap-3 min-w-0">
                      {/* Hora */}
                      <div className="flex flex-col items-end shrink-0 w-12 pt-2">
                        <span className="body-3 text-neutral-5 font-semibold leading-tight">{act.startTime || '—'}</span>
                        {act.endTime && (
                          <span className="body-3 text-neutral-3 mt-auto leading-tight">{act.endTime}</span>
                        )}
                      </div>
                      {/* Línea de tiempo */}
                      <div className="flex flex-col items-center shrink-0 pt-2">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${isBooked ? 'bg-auxiliary-green-5' : typeCfg.dotClass}`} />
                        {!isLast && <div className="w-px flex-1 bg-neutral-1 mt-1.5" />}
                      </div>
                      {/* Tarjeta */}
                      <div className={`flex-1 min-w-0 rounded-2xl border p-3 sm:p-4 mb-3 shadow-sm transition ${
                        isBooked
                          ? 'bg-auxiliary-green-1 border-auxiliary-green-3'
                          : 'bg-white border-neutral-1'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="body-bold text-secondary-5 leading-snug">{act.name}</h4>
                          <span className={`flex items-center gap-1 body-3 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap shrink-0 ${typeCfg.badgeClass}`}>
                            <TypeIcon className="w-3 h-3 shrink-0" />
                            {typeCfg.label}
                          </span>
                        </div>
                        {act.city && (
                          <div className="flex items-center gap-1 mt-1.5 body-3 text-neutral-4">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{act.city}</span>
                          </div>
                        )}
                        {isBooked && (
                          <span className="inline-flex items-center gap-1 mt-1.5 body-3 font-semibold text-auxiliary-green-5">
                            <Star className="w-3 h-3 shrink-0" /> Reservado
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {dayBookings.length > 0 && (
              <div className={dayActivities.length > 0 ? 'mt-4 pt-4 border-t border-neutral-1' : 'mt-2'}>
                <p className="body-3 font-semibold text-neutral-4 mb-3">Reservas del día</p>
                <div className="flex flex-col gap-2">
                  {dayBookings.map((b, i) => {
                    const cfg = BOOKING_TYPE_CONFIG[b.bookingType];
                    const name = b.hotelName || b.activityName || b.restaurantName || b.carName
                      || (b.segments?.[0]
                        ? `${b.segments[0].departureCode || b.segments[0].departureCity} → ${b.segments[0].arrivalCode || b.segments[0].arrivalCity}`
                        : 'Reserva');
                    const persons = b.passengerCount || b.persons || null;
                    const price = b.totalPrice ?? b.price ?? null;
                    const currency = b.currency || '';
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-xl border border-neutral-1 bg-neutral-1/40 px-3 py-2.5">
                        <span className="text-base shrink-0">{cfg?.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="body-3 font-semibold text-secondary-5 truncate">{name}</p>
                          <div className="flex gap-3 flex-wrap mt-0.5">
                            {persons > 0 && (
                              <span className="flex items-center gap-1 text-[11px] text-neutral-4">
                                <Users className="w-3 h-3 shrink-0" />{persons} {persons === 1 ? 'persona' : 'personas'}
                              </span>
                            )}
                            {price != null && (
                              <span className="text-[11px] font-semibold text-neutral-5">
                                {fmtMoney(price)} {currency}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
