import { useState, useMemo } from 'react';
import { Users, Lock, CalendarDays, Plane, Hotel, Car, Compass, Utensils } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { getBookingDate, formatDayHeader, BOOKING_TYPE_CONFIG } from '../utils/postHelpers';

// --- Local helpers ---

function fmtMoney(amount) {
  if (amount == null || Number.isNaN(amount)) return '—';
  return amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtFlightDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(y, m - 1, d));
}

// --- Local card components ---

function VueloCard({ booking }) {
  const pax = booking.passengerCount;
  const segs = booking.segments ?? [];
  const first = segs[0];
  const last = segs[segs.length - 1];
  const dep = first ? `${first.departureCity || ''} (${first.departureCode || ''})`.trim() : '';
  const arr = last ? `${last.arrivalCity || ''} (${last.arrivalCode || ''})`.trim() : '';
  const routeLabel = dep && arr ? `${dep} → ${arr}` : booking.isRoundTrip ? 'Ida y vuelta' : 'Vuelo de ida';
  const tripKind = booking.isRoundTrip ? 'Ida y vuelta' : segs.length > 1 ? `${segs.length} tramos` : 'Solo ida';

  return (
    <div className="bg-white border border-secondary-2 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-secondary-1 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary-2 flex items-center justify-center shrink-0">
          <Plane className="w-4 h-4 text-secondary-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="body-2-semibold text-neutral-7">{routeLabel}</p>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <span className="body-3 text-neutral-4">{tripKind}</span>
            {pax > 0 && (
              <span className="flex items-center gap-1 body-3 text-neutral-4">
                · <Users className="w-3 h-3 shrink-0" /> {pax} {pax === 1 ? 'pasajero' : 'pasajeros'}
              </span>
            )}
          </div>
        </div>
        {booking.totalPrice != null && (
          <div className="text-right shrink-0">
            <p className="body-2-semibold text-secondary-4">{fmtMoney(booking.totalPrice)} {booking.currency || ''}</p>
            {pax > 1 && <p className="text-[11px] text-neutral-4">≈ {fmtMoney(booking.totalPrice / pax)} /persona</p>}
          </div>
        )}
      </div>

      {/* Segmentos */}
      {segs.map((seg, i) => {
        const segDep = `${seg.departureCity || ''} (${seg.departureCode || ''})`.trim();
        const segArr = `${seg.arrivalCity || ''} (${seg.arrivalCode || ''})`.trim();
        const depAirport = seg.departureAirportName || seg.departureAirport?.name || null;
        const arrAirport = seg.arrivalAirportName || seg.arrivalAirport?.name || null;
        const airlines = seg.carriers?.map(c => c.name).join(' · ') || seg.airline || null;
        const segLabel = segs.length > 1
          ? (i === 0 ? 'Ida' : booking.isRoundTrip && i === segs.length - 1 ? 'Vuelta' : `Tramo ${i + 1}`)
          : null;
        return (
          <div key={i} className="px-4 py-3 border-t border-neutral-1 flex flex-col gap-1.5">
            {/* Título del segmento */}
            <div className="flex items-center gap-2 flex-wrap">
              {segLabel && (
                <span className="text-[10px] font-bold text-secondary-4 uppercase tracking-wide bg-secondary-1 rounded px-1.5 py-0.5">{segLabel}</span>
              )}
              <span className="body-3 font-semibold text-neutral-7">{segDep} → {segArr}</span>
              {seg.flightNumber && <span className="body-3 text-neutral-4">{seg.flightNumber}</span>}
            </div>
            {/* Aeropuertos */}
            {(depAirport || arrAirport) && (
              <p className="body-3 text-neutral-3 truncate">{depAirport}{depAirport && arrAirport ? ' → ' : ''}{arrAirport}</p>
            )}
            {/* Fecha y horas */}
            <div className="flex items-center gap-3 flex-wrap">
              {seg.date && (
                <span className="flex items-center gap-1 body-3 text-neutral-5">
                  <CalendarDays className="w-3.5 h-3.5 text-neutral-3 shrink-0" />
                  {fmtFlightDate(seg.date)}
                </span>
              )}
              {(seg.departureTime || seg.arrivalTime) && (
                <span className="flex items-center gap-1 body-3 font-semibold text-neutral-7">
                  <Plane className="w-3.5 h-3.5 text-neutral-3 shrink-0" />
                  {seg.departureTime}{seg.departureTime && seg.arrivalTime ? ' → ' : ''}{seg.arrivalTime}
                </span>
              )}
            </div>
            {/* Aerolínea */}
            {airlines && (
              <p className="body-3 text-neutral-5 flex items-center gap-1">
                <span className="text-neutral-3">✈</span> {airlines}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HotelCard({ booking }) {
  return (
    <div className="bg-auxiliary-green-1 border border-auxiliary-green-3 rounded-xl px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl shrink-0">🏨</span>
          <div className="min-w-0">
            <p className="body-2-semibold text-neutral-7 truncate">{booking.hotelName}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 body-3 text-neutral-4 mt-0.5">
              {booking.checkIn && booking.checkOut && (
                <span>{booking.checkIn} → {booking.checkOut}</span>
              )}
              {booking.nights && <span>{booking.nights} noche{booking.nights !== 1 ? 's' : ''}</span>}
            </div>
          </div>
        </div>
        {booking.totalPrice != null && (
          <div className="text-right shrink-0">
            <p className="body-2-semibold text-auxiliary-green-5">{fmtMoney(booking.totalPrice)} <span className="body-3 font-normal">{booking.currency || ''}</span></p>
            <p className="text-[11px] text-neutral-4">total</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActividadCard({ booking }) {
  return (
    <div className="bg-white border border-neutral-1 rounded-xl px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0">🎯</span>
        <div className="flex-1 min-w-0">
          <p className="body-2-semibold text-neutral-7">{booking.activityName}</p>
          {booking.address && (
            <p className="body-3 text-neutral-4 truncate mt-0.5">📍 {booking.address}</p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {booking.rating != null && (
              <span className="text-[11px] font-bold text-auxiliary-yellow-5">★ {Number(booking.rating).toFixed(1)}</span>
            )}
            {booking.price != null && (
              <span className="text-[11px] font-semibold text-secondary-4">{fmtMoney(booking.price)} {booking.currency || ''}</span>
            )}
            {booking.duration && <span className="text-[11px] text-neutral-4">⏱ {booking.duration}</span>}
            {booking.date && <span className="text-[11px] text-neutral-4">{booking.date}</span>}
            {booking.persons > 0 && (
              <span className="text-[11px] text-neutral-4">{booking.persons} persona{booking.persons !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RestauranteCard({ booking }) {
  return (
    <div className="bg-auxiliary-green-1 border border-auxiliary-green-3 rounded-xl px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-xl shrink-0">🍽️</span>
        <div className="flex-1 min-w-0">
          <p className="body-2-semibold text-neutral-7">{booking.restaurantName}</p>
          {booking.address && (
            <p className="body-3 text-neutral-4 truncate mt-0.5">{booking.address}</p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {booking.rating != null && (
              <span className="text-[11px] font-bold text-auxiliary-yellow-5">★ {booking.rating}</span>
            )}
            {booking.date && <span className="text-[11px] text-neutral-4">{booking.date}</span>}
            {booking.persons > 0 && (
              <span className="text-[11px] text-neutral-4">{booking.persons} persona{booking.persons !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CocheCard({ booking }) {
  return (
    <div className="bg-auxiliary-green-1 border border-auxiliary-green-3 rounded-xl px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl shrink-0">🚗</span>
          <div className="min-w-0">
            <p className="body-2-semibold text-neutral-7">{booking.carName}</p>
            {booking.supplierName && (
              <p className="body-3 text-neutral-4">{booking.supplierName}</p>
            )}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 body-3 text-neutral-4 mt-0.5">
              {booking.pickUpDate && booking.dropOffDate && (
                <span>{booking.pickUpDate} → {booking.dropOffDate}</span>
              )}
              {booking.days > 0 && <span>{booking.days} día{booking.days !== 1 ? 's' : ''}</span>}
            </div>
          </div>
        </div>
        {booking.totalPrice != null && (
          <div className="text-right shrink-0">
            <p className="body-2-semibold text-auxiliary-green-5">{fmtMoney(booking.totalPrice)} <span className="body-3 font-normal">{booking.currency || ''}</span></p>
            <p className="text-[11px] text-neutral-4">total</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReservasTab({ bookings }) {
  const { language } = useLanguage();
  const [typeFilter, setTypeFilter] = useState('todas');
  const [viewMode, setViewMode] = useState('tipo');

  const typeOrder = ['vuelo', 'hotel', 'actividad', 'restaurante', 'coche'];
  const availableTypes = typeOrder.filter((t) => bookings.some((b) => b.bookingType === t));

  const filteredBookings = useMemo(
    () => (typeFilter === 'todas' ? bookings : bookings.filter((b) => b.bookingType === typeFilter)),
    [bookings, typeFilter]
  );

  const grouped = useMemo(() => {
    const groups = { vuelo: [], hotel: [], actividad: [], restaurante: [], coche: [] };
    for (const b of filteredBookings) {
      if (groups[b.bookingType]) groups[b.bookingType].push(b);
    }
    return groups;
  }, [filteredBookings]);

  const byDay = useMemo(() => {
    const days = {};
    for (const b of filteredBookings) {
      const date = getBookingDate(b) || 'sin-fecha';
      if (!days[date]) days[date] = [];
      days[date].push(b);
    }
    return days;
  }, [filteredBookings]);

  const sortedDayKeys = useMemo(
    () => Object.keys(byDay).sort((a, b) => {
      if (a === 'sin-fecha') return 1;
      if (b === 'sin-fecha') return -1;
      return a.localeCompare(b);
    }),
    [byDay]
  );

  const filledTypes = typeOrder.filter((t) => grouped[t]?.length > 0);

  function renderCard(b, i) {
    if (b.bookingType === 'vuelo') return <VueloCard key={i} booking={b} />;
    if (b.bookingType === 'hotel') return <HotelCard key={i} booking={b} />;
    if (b.bookingType === 'actividad') return <ActividadCard key={i} booking={b} />;
    if (b.bookingType === 'restaurante') return <RestauranteCard key={i} booking={b} />;
    if (b.bookingType === 'coche') return <CocheCard key={i} booking={b} />;
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Controles: filtro por tipo + vista */}
      <div className="bg-white rounded-2xl border border-neutral-1 p-3 flex items-center gap-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setTypeFilter('todas')}
            className={`px-3 py-1.5 body-3 font-semibold rounded-full shrink-0 border transition-colors ${
              typeFilter === 'todas' ? 'bg-secondary-5 text-white border-secondary-5' : 'bg-white text-neutral-4 border-neutral-2 hover:bg-neutral-1'
            }`}
          >
            Todas
          </button>
          {availableTypes.map((t) => {
            const cfg = BOOKING_TYPE_CONFIG[t];
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 body-3 font-semibold rounded-full shrink-0 border transition-colors ${
                  typeFilter === t ? 'bg-secondary-5 text-white border-secondary-5' : 'bg-white text-neutral-4 border-neutral-2 hover:bg-neutral-1'
                }`}
              >
                <span>{cfg.icon}</span>{cfg.label}s
              </button>
            );
          })}
        </div>

        <div className="flex rounded-full border border-neutral-1 overflow-hidden shrink-0">
          {[['tipo', 'Por tipo'], ['dia', 'Por día']].map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setViewMode(v)}
              className={`px-3 py-1 body-3 font-semibold transition-colors ${viewMode === v ? 'bg-secondary-5 text-white' : 'text-neutral-4 hover:bg-neutral-1'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Vista por tipo */}
      {viewMode === 'tipo' && (
        <div className="flex flex-col gap-5">
          {filledTypes.map((type) => {
            const cfg = BOOKING_TYPE_CONFIG[type];
            return (
              <div key={type} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">{cfg.icon}</span>
                  <p className="body-bold text-secondary-5">{cfg.label}{grouped[type].length > 1 ? 's' : ''}</p>
                  <span className="body-3 text-neutral-3 bg-neutral-1 rounded-full px-2 py-0.5">{grouped[type].length}</span>
                </div>
                {grouped[type].map((b, i) => renderCard(b, i))}
              </div>
            );
          })}
          {filledTypes.length === 0 && (
            <div className="bg-white rounded-2xl border border-neutral-1 p-10 text-center">
              <p className="body text-neutral-4">Sin reservas para este filtro</p>
            </div>
          )}
        </div>
      )}

      {/* Vista por día */}
      {viewMode === 'dia' && (
        <div className="flex flex-col gap-5">
          {sortedDayKeys.map((dateKey) => (
            <div key={dateKey} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-neutral-4" />
                <p className="body-bold text-secondary-5">{formatDayHeader(dateKey, language)}</p>
                <span className="body-3 text-neutral-3 bg-neutral-1 rounded-full px-2 py-0.5">{byDay[dateKey].length}</span>
              </div>
              {byDay[dateKey].map((b, i) => renderCard(b, i))}
            </div>
          ))}
          {sortedDayKeys.length === 0 && (
            <div className="bg-white rounded-2xl border border-neutral-1 p-10 text-center">
              <p className="body text-neutral-4">Sin reservas para este filtro</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-start gap-2 body-3 text-neutral-3 bg-neutral-1/60 rounded-xl p-3">
        <Lock className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Números de confirmación, localizadores y datos de pago nunca se comparten en la vista pública.</span>
      </div>
    </div>
  );
}
