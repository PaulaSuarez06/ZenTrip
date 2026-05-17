import { useEffect, useState, useMemo, useRef } from 'react';
import {
  MapPin, Users, Lock, Wallet, Package, UserCircle,
  Image as ImageIcon, CalendarDays, ChevronLeft, ChevronRight, X, Folder, Ticket,
  Plane, Hotel, Car, Compass, Utensils, Star, ChevronDown,
} from 'lucide-react';
import DayCalendar from '../trips/detail/components/itinerary/DayCalendar';
import { useLanguage } from '../../context/LanguageContext';
import { buildDateHelpers } from '../../utils/localeDate';
import { DIVISAS } from '../../utils/divisas';

// ── Helpers ─────────────────────────────────────────────────────────────────

export function fmtMoney(amount) {
  if (amount == null || Number.isNaN(amount)) return '—';
  return amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDayShort(dateStr, locale = 'es') {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const day = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(dt);
  return `${day.charAt(0).toUpperCase() + day.slice(1, 3)} ${d}`;
}

function fmtDayFull(dateStr, locale = 'es') {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(y, m - 1, d));
}

function extractTime(v) {
  if (!v) return null;
  if (typeof v === 'string' && v.includes('T')) return v.split('T')[1].slice(0, 5);
  return v;
}

function fmtFlightDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(y, m - 1, d));
}

function getBookingDate(booking) {
  if (booking.bookingType === 'vuelo') return booking.segments?.[0]?.date || null;
  if (booking.bookingType === 'hotel') return booking.checkIn || null;
  if (booking.bookingType === 'actividad') return booking.date || null;
  if (booking.bookingType === 'restaurante') return booking.date || null;
  if (booking.bookingType === 'coche') return booking.pickUpDate || null;
  return null;
}

// ── Constantes ───────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  actividad:   { label: 'Actividad',   Icon: Compass,  badgeClass: 'bg-violet-50 text-violet-600',  dotClass: 'bg-violet-400' },
  vuelo:       { label: 'Vuelo',       Icon: Plane,    badgeClass: 'bg-blue-50 text-blue-700',      dotClass: 'bg-blue-400' },
  hotel:       { label: 'Hotel',       Icon: Hotel,    badgeClass: 'bg-teal-50 text-teal-700',      dotClass: 'bg-teal-400' },
  restaurante: { label: 'Restaurante', Icon: Utensils, badgeClass: 'bg-orange-50 text-orange-700', dotClass: 'bg-orange-400' },
  restaurant:  { label: 'Restaurante', Icon: Utensils, badgeClass: 'bg-orange-50 text-orange-700', dotClass: 'bg-orange-400' },
  coche:       { label: 'Coche',       Icon: Car,      badgeClass: 'bg-amber-50 text-amber-600',   dotClass: 'bg-amber-400' },
  car:         { label: 'Coche',       Icon: Car,      badgeClass: 'bg-amber-50 text-amber-600',   dotClass: 'bg-amber-400' },
  tren:        { label: 'Tren',        Icon: MapPin,   badgeClass: 'bg-indigo-50 text-indigo-600', dotClass: 'bg-indigo-400' },
  ruta:        { label: 'Ruta',        Icon: MapPin,   badgeClass: 'bg-emerald-50 text-emerald-600', dotClass: 'bg-emerald-400' },
};

const BOOKING_TYPE_CONFIG = {
  vuelo:       { label: 'Vuelo',       Icon: Plane    },
  hotel:       { label: 'Hotel',       Icon: Hotel    },
  actividad:   { label: 'Actividad',   Icon: Compass  },
  restaurante: { label: 'Restaurante', Icon: Utensils },
  coche:       { label: 'Coche',       Icon: Car      },
};

const EXPENSE_CATS = [
  { key: 'alojamiento',   label: 'Alojamiento',   color: 'bg-blue-500' },
  { key: 'transporte',    label: 'Transporte',    color: 'bg-orange-500' },
  { key: 'comida',        label: 'Comida',        color: 'bg-green-500' },
  { key: 'actividades',   label: 'Actividades',   color: 'bg-purple-500' },
  { key: 'supermercado',  label: 'Supermercado',  color: 'bg-teal-500' },
  { key: 'compras',       label: 'Compras',       color: 'bg-pink-500' },
  { key: 'salud',         label: 'Salud',         color: 'bg-red-500' },
  { key: 'otros',         label: 'Otros',         color: 'bg-neutral-400' },
  { key: 'personalizada', label: 'Personalizada', color: 'bg-indigo-500' },
];

// ── Componentes de tarjetas de reservas ──────────────────────────────────────

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
            <div className="flex items-center gap-2 flex-wrap">
              {segLabel && <span className="text-[10px] font-bold text-secondary-4 uppercase tracking-wide bg-secondary-1 rounded px-1.5 py-0.5">{segLabel}</span>}
              <span className="body-3 font-semibold text-neutral-7">{segDep} → {segArr}</span>
              {seg.flightNumber && <span className="body-3 text-neutral-4">{seg.flightNumber}</span>}
            </div>
            {(depAirport || arrAirport) && (
              <p className="body-3 text-neutral-3 truncate">{depAirport}{depAirport && arrAirport ? ' → ' : ''}{arrAirport}</p>
            )}
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
                  {extractTime(seg.departureTime)}{seg.departureTime && seg.arrivalTime ? ' → ' : ''}{extractTime(seg.arrivalTime)}
                </span>
              )}
            </div>
            {airlines && <p className="body-3 text-neutral-5 flex items-center gap-1"><span className="text-neutral-3">✈</span> {airlines}</p>}
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
              {booking.checkIn && booking.checkOut && <span>{booking.checkIn} → {booking.checkOut}</span>}
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
          {booking.address && <p className="body-3 text-neutral-4 truncate mt-0.5">📍 {booking.address}</p>}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {booking.rating != null && <span className="text-[11px] font-bold text-auxiliary-yellow-5">★ {Number(booking.rating).toFixed(1)}</span>}
            {booking.price != null && <span className="text-[11px] font-semibold text-secondary-4">{fmtMoney(booking.price)} {booking.currency || ''}</span>}
            {booking.duration && <span className="text-[11px] text-neutral-4">⏱ {booking.duration}</span>}
            {booking.date && <span className="text-[11px] text-neutral-4">{booking.date}</span>}
            {booking.persons > 0 && <span className="text-[11px] text-neutral-4">{booking.persons} persona{booking.persons !== 1 ? 's' : ''}</span>}
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
          {booking.address && <p className="body-3 text-neutral-4 truncate mt-0.5">{booking.address}</p>}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {booking.rating != null && <span className="text-[11px] font-bold text-auxiliary-yellow-5">★ {booking.rating}</span>}
            {booking.date && <span className="text-[11px] text-neutral-4">{booking.date}</span>}
            {booking.persons > 0 && <span className="text-[11px] text-neutral-4">{booking.persons} persona{booking.persons !== 1 ? 's' : ''}</span>}
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
            {booking.supplierName && <p className="body-3 text-neutral-4">{booking.supplierName}</p>}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 body-3 text-neutral-4 mt-0.5">
              {booking.pickUpDate && booking.dropOffDate && <span>{booking.pickUpDate} → {booking.dropOffDate}</span>}
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

function renderBookingCard(b, i) {
  if (b.bookingType === 'vuelo') return <VueloCard key={i} booking={b} />;
  if (b.bookingType === 'hotel') return <HotelCard key={i} booking={b} />;
  if (b.bookingType === 'actividad') return <ActividadCard key={i} booking={b} />;
  if (b.bookingType === 'restaurante' || b.bookingType === 'restaurant') return <RestauranteCard key={i} booking={b} />;
  if (b.bookingType === 'coche') return <CocheCard key={i} booking={b} />;
  return null;
}

// ── Tabs ─────────────────────────────────────────────────────────────────────

function ItinerarioTab({ tripDays, activitiesByDate, bookings = [] }) {
  const { language } = useLanguage();
  const { formatDayHeader } = useMemo(() => buildDateHelpers(language), [language]);
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
    return (activitiesByDate[selectedDay] || []).slice().sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [selectedDay, activitiesByDate]);

  const dayBookings = useMemo(() => (selectedDay ? bookingsByDate[selectedDay] || [] : []), [selectedDay, bookingsByDate]);

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
      <DayCalendar tripDays={tripDays} selectedDay={selectedDay} onSelectDay={setSelectedDay} activitiesByDate={activitiesByDate} weatherByDate={{}} disableAutoJump />
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
                      <div className="flex flex-col items-end shrink-0 w-12 pt-2">
                        <span className="body-3 text-neutral-5 font-semibold leading-tight">{act.startTime || '—'}</span>
                        {act.endTime && <span className="body-3 text-neutral-3 mt-auto leading-tight">{act.endTime}</span>}
                      </div>
                      <div className="flex flex-col items-center shrink-0 pt-2">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${isBooked ? 'bg-auxiliary-green-5' : typeCfg.dotClass}`} />
                        {!isLast && <div className="w-px flex-1 bg-neutral-1 mt-1.5" />}
                      </div>
                      <div className={`flex-1 min-w-0 rounded-2xl border p-3 sm:p-4 mb-3 shadow-sm transition ${isBooked ? 'bg-auxiliary-green-1 border-auxiliary-green-3' : 'bg-white border-neutral-1'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="body-bold text-secondary-5 leading-snug">{act.name}</h4>
                          <span className={`flex items-center gap-1 body-3 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap shrink-0 ${typeCfg.badgeClass}`}>
                            <TypeIcon className="w-3 h-3 shrink-0" />{typeCfg.label}
                          </span>
                        </div>
                        {act.city && (
                          <div className="flex items-center gap-1 mt-1.5 body-3 text-neutral-4">
                            <MapPin className="w-3 h-3 shrink-0" /><span>{act.city}</span>
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
                    const name = b.hotelName || b.activityName || b.restaurantName || b.carName
                      || (b.segments?.[0] ? `${b.segments[0].departureCode || b.segments[0].departureCity} → ${b.segments[0].arrivalCode || b.segments[0].arrivalCity}` : 'Reserva');
                    const persons = b.passengerCount || b.persons || null;
                    const price = b.totalPrice ?? b.price ?? null;
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-xl border border-neutral-1 bg-neutral-1/40 px-3 py-2.5">
                        {(() => { const Ico = BOOKING_TYPE_CONFIG[b.bookingType]?.Icon; return Ico ? <Ico className="w-4 h-4 text-neutral-4 shrink-0" /> : null; })()}
                        <div className="flex-1 min-w-0">
                          <p className="body-3 font-semibold text-secondary-5 truncate">{name}</p>
                          <div className="flex gap-3 flex-wrap mt-0.5">
                            {persons > 0 && <span className="flex items-center gap-1 text-[11px] text-neutral-4"><Users className="w-3 h-3 shrink-0" />{persons} {persons === 1 ? 'persona' : 'personas'}</span>}
                            {price != null && <span className="text-[11px] font-semibold text-neutral-5">{fmtMoney(price)} {b.currency || ''}</span>}
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

function CategoryBar({ cat, amount, total, currency }) {
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cat.color}`} />
      <span className="body-3 text-neutral-5 w-24 truncate shrink-0">{cat.label}</span>
      <div className="flex-1 h-2 bg-neutral-1 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="body-3 text-neutral-4 w-8 text-right shrink-0">{pct}%</span>
      <span className="body-3 font-semibold text-neutral-5 w-24 text-right shrink-0">
        {fmtMoney(amount)} <span className="font-normal text-neutral-3">{currency || ''}</span>
      </span>
    </div>
  );
}

function DaySelectBudget({ days, selected, onSelect, fmtDay, currency }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  const selectedData = days.find((d) => d.date === selected);
  return (
    <div ref={ref} className="relative w-full">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border transition-colors ${open ? 'border-primary-3 ring-2 ring-primary-3/20' : 'border-neutral-2 hover:border-neutral-3'} bg-white`}>
        {selectedData ? (
          <div className="flex items-center justify-between gap-2 flex-1 min-w-0">
            <span className="body-3 font-semibold text-secondary-5 truncate">{fmtDay(selectedData.date)}</span>
            <span className="body-3 font-semibold text-primary-3 shrink-0">{fmtMoney(selectedData.total)} {currency}</span>
          </div>
        ) : <span className="body-3 text-neutral-3 flex-1">Selecciona un día...</span>}
        <ChevronDown className={`w-4 h-4 shrink-0 text-neutral-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-neutral-2 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {days.map(({ date, total }) => (
            <button key={date} type="button" onClick={() => { onSelect(date); setOpen(false); }}
              className={`w-full flex items-center justify-between gap-4 px-4 py-2.5 transition-colors ${selected === date ? 'bg-primary-1' : 'hover:bg-neutral-1'}`}>
              <span className={`body-3 font-semibold ${selected === date ? 'text-primary-4' : 'text-secondary-5'}`}>{fmtDay(date)}</span>
              <span className={`body-3 font-semibold shrink-0 ${selected === date ? 'text-primary-3' : 'text-neutral-4'}`}>{fmtMoney(total)} {currency}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PresupuestoTab({ data }) {
  const { language } = useLanguage();
  const [view, setView] = useState('resumen');
  const [selectedDay, setSelectedDay] = useState(null);

  const summary = data.expenseSummary;
  const displayTotal = summary?.totalSpent > 0 ? summary.totalSpent : data.totalBudget;
  const currency = data.budgetCurrency || '';
  const participantCount = data.participantCount || 1;
  const days = data.days || (data.startDate && data.endDate
    ? Math.round((new Date(data.endDate) - new Date(data.startDate)) / 86400000) + 1
    : 1);

  const activeCats = useMemo(() => {
    if (!summary?.categoryTotals) return [];
    return EXPENSE_CATS.map((c) => ({ ...c, amount: summary.categoryTotals[c.key] || 0 })).filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount);
  }, [summary]);

  const sortedDays = useMemo(() => {
    if (!summary?.dailyTotals) return [];
    return Object.entries(summary.dailyTotals).sort(([a], [b]) => a.localeCompare(b)).map(([date, d]) => ({ date, ...d }));
  }, [summary]);

  const selectedDayData = useMemo(() => (selectedDay && summary?.dailyTotals ? summary.dailyTotals[selectedDay] || null : null), [selectedDay, summary]);
  const selectedDayCats = useMemo(() => {
    if (!selectedDayData?.categories) return [];
    return EXPENSE_CATS.map((c) => ({ ...c, amount: selectedDayData.categories[c.key] || 0 })).filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount);
  }, [selectedDayData]);

  const fmtDayFullLocal = (dateStr) => fmtDayFull(dateStr, language);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-neutral-1 p-5">
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-neutral-4" />
            <p className="body-bold text-secondary-5">Presupuesto del viaje</p>
            {summary && <span className="body-3 text-neutral-3 bg-neutral-1 rounded-full px-2 py-0.5">Gastos reales</span>}
          </div>
          {summary && (
            <div className="flex rounded-full border border-neutral-1 overflow-hidden">
              {['resumen', 'por-dia'].map((v) => (
                <button key={v} type="button" onClick={() => setView(v)}
                  className={`px-3 py-1 body-3 font-semibold transition-colors ${view === v ? 'bg-secondary-5 text-white' : 'text-neutral-4 hover:bg-neutral-1'}`}>
                  {v === 'resumen' ? 'Resumen' : 'Por día'}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3 flex-wrap mb-5">
          <div className="flex-1 min-w-28 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            <p className="body-3 text-green-700 font-semibold mb-0.5">Total del viaje</p>
            <p className="title-h2-desktop text-green-800 leading-tight">{fmtMoney(displayTotal)}{currency && <span className="body-2 ml-1 font-normal">{currency}</span>}</p>
          </div>
          {days > 1 && displayTotal && (
            <div className="flex-1 min-w-28 bg-primary-1 border border-primary-2 rounded-xl px-4 py-3">
              <p className="body-3 text-primary-4 font-semibold mb-0.5">Por día</p>
              <p className="title-h2-desktop text-primary-5 leading-tight">{fmtMoney(displayTotal / days)}{currency && <span className="body-2 ml-1 font-normal">{currency}</span>}</p>
            </div>
          )}
          {participantCount > 1 && displayTotal && (
            <div className="flex-1 min-w-28 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
              <p className="body-3 text-orange-700 font-semibold mb-0.5">Por persona</p>
              <p className="title-h2-desktop text-orange-800 leading-tight">{fmtMoney(displayTotal / participantCount)}{currency && <span className="body-2 ml-1 font-normal">{currency}</span>}</p>
            </div>
          )}
        </div>
        {view === 'resumen' && activeCats.length > 0 && (
          <div className="flex flex-col gap-2.5 pt-4 border-t border-neutral-1">
            <p className="body-3 font-semibold text-neutral-5 mb-1">Desglose por categoría</p>
            {activeCats.map((cat) => <CategoryBar key={cat.key} cat={cat} amount={cat.amount} total={summary.totalSpent} currency={currency} />)}
          </div>
        )}
        {view === 'por-dia' && sortedDays.length > 0 && (
          <div className="flex flex-col gap-4 pt-4 border-t border-neutral-1">
            <div className="grid grid-cols-3 gap-3">
              <DaySelectBudget days={sortedDays} selected={selectedDay} onSelect={setSelectedDay} fmtDay={fmtDayFullLocal} currency={currency} />
            </div>
            {selectedDay && selectedDayData && (
              <div className="bg-neutral-1/50 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="body-3 font-semibold text-secondary-5">{fmtDayFullLocal(selectedDay)}</p>
                  <p className="body-bold text-primary-3">{fmtMoney(selectedDayData.total)} {currency}</p>
                </div>
                {participantCount > 1 && <p className="body-3 text-neutral-4">≈ {fmtMoney(selectedDayData.total / participantCount)} {currency} por persona</p>}
                {selectedDayCats.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-neutral-2">
                    {selectedDayCats.map((cat) => <CategoryBar key={cat.key} cat={cat} amount={cat.amount} total={selectedDayData.total} currency={currency} />)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-neutral-1 p-4 flex items-start gap-2.5">
        <Lock className="w-4 h-4 text-neutral-3 mt-0.5 shrink-0" />
        <p className="body-3 text-neutral-4">Los gastos individuales, comprobantes de pago y deudas entre participantes no están disponibles en la vista pública.</p>
      </div>
    </div>
  );
}

function LuggageList({ items, accent = false }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 min-w-0">
          <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${accent ? 'bg-blue-100 text-blue-600' : 'bg-primary-1 text-primary-4'}`}>✓</span>
          <span className="body-3 text-neutral-5 truncate">{item}</span>
        </div>
      ))}
    </div>
  );
}

function EquipajeTab({ categories, personalCategories, scopeAll }) {
  const hasGroup = categories.length > 0;
  const hasPersonal = scopeAll && personalCategories?.length > 0;
  return (
    <div className="bg-white rounded-2xl border border-neutral-1 p-5 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-neutral-4" />
        <p className="body-bold text-secondary-5">Equipaje</p>
        <span className="body-3 text-neutral-3 bg-neutral-1 rounded-full px-2 py-0.5">{categories.length + (hasPersonal ? personalCategories.length : 0)} artículos</span>
      </div>
      {hasGroup && (
        <div className="flex flex-col gap-3">
          {hasPersonal && <div className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-primary-3 shrink-0" /><p className="body-3 font-semibold text-primary-3">Equipaje grupal · {categories.length} artículos</p></div>}
          <LuggageList items={categories} />
        </div>
      )}
      {hasPersonal && (
        <div className="flex flex-col gap-3 pt-4 border-t border-neutral-1">
          <div className="flex items-center gap-1.5"><UserCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" /><p className="body-3 font-semibold text-blue-600">Equipaje personal · {personalCategories.length} artículos</p></div>
          <LuggageList items={personalCategories} accent />
          <p className="body-3 text-neutral-3">Los artículos personales se muestran sin identificar a quién pertenecen.</p>
        </div>
      )}
      <div className="flex items-center gap-2 bg-neutral-1/60 rounded-xl p-3">
        <Lock className="w-4 h-4 text-neutral-3 shrink-0" />
        <p className="body-3 text-neutral-3">La distribución del equipaje entre participantes no está disponible en la vista pública.</p>
      </div>
    </div>
  );
}

function GaleriaTab({ photos }) {
  const folderNames = useMemo(() => [...new Set(photos.map((p) => p.folderName || ''))], [photos]);
  const showFolders = folderNames.length > 1 || (folderNames.length === 1 && folderNames[0] !== '');
  const [selectedFolder, setSelectedFolder] = useState('__all__');
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const visiblePhotos = useMemo(() => selectedFolder === '__all__' ? photos : photos.filter((p) => (p.folderName || '') === selectedFolder), [photos, selectedFolder]);
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setLightboxIdx((i) => Math.min(i + 1, visiblePhotos.length - 1));
      if (e.key === 'ArrowLeft') setLightboxIdx((i) => Math.max(i - 1, 0));
      if (e.key === 'Escape') setLightboxIdx(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx, visiblePhotos.length]);
  return (
    <div className="bg-white rounded-2xl border border-neutral-1 p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-neutral-4" />
        <p className="body-bold text-secondary-5">Galería del viaje</p>
        <span className="body-3 text-neutral-3">({photos.length} foto{photos.length !== 1 ? 's' : ''})</span>
      </div>
      {showFolders && (
        <div className="flex flex-wrap gap-2">
          {['__all__', ...folderNames].map((folder) => {
            const count = folder === '__all__' ? photos.length : photos.filter((p) => (p.folderName || '') === folder).length;
            const isActive = selectedFolder === folder;
            return (
              <button key={folder} type="button" onClick={() => setSelectedFolder(folder)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition ${isActive ? 'bg-primary-1 text-primary-4 border-primary-2' : 'bg-white text-neutral-5 border-neutral-2 hover:bg-neutral-1'}`}>
                <Folder className="w-3.5 h-3.5 shrink-0" />
                {folder === '__all__' ? 'Todas' : (folder || 'General')}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${isActive ? 'bg-primary-2 text-primary-5' : 'bg-neutral-1 text-neutral-4'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visiblePhotos.map((photo, i) => (
          <div key={i} className="aspect-square rounded-xl overflow-hidden cursor-zoom-in group" onClick={() => setLightboxIdx(i)}>
            <img src={photo.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          </div>
        ))}
      </div>
      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-50 flex flex-col p-3 sm:p-4" onClick={() => setLightboxIdx(null)}>
          <div className="absolute inset-0 bg-neutral-7/80 backdrop-blur-sm" />
          <div className="relative z-10 flex items-center justify-between mb-3 shrink-0" onClick={(e) => e.stopPropagation()}>
            <p className="text-white/50 text-xs">{lightboxIdx + 1} / {visiblePhotos.length}</p>
            <button type="button" onClick={() => setLightboxIdx(null)} className="w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 flex items-center justify-center transition"><X className="w-5 h-5" /></button>
          </div>
          <div className="relative z-10 flex-1 flex items-center justify-center min-h-0" onClick={(e) => e.stopPropagation()}>
            <img src={visiblePhotos[lightboxIdx].url} alt="" className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" />
            <button type="button" onClick={() => setLightboxIdx((i) => Math.max(i - 1, 0))} disabled={lightboxIdx === 0} className="absolute left-1 sm:left-2 w-9 h-9 rounded-full bg-neutral-7/60 border border-white/20 text-white hover:bg-neutral-7/80 flex items-center justify-center transition disabled:opacity-20 disabled:cursor-not-allowed"><ChevronLeft className="w-5 h-5" /></button>
            <button type="button" onClick={() => setLightboxIdx((i) => Math.min(i + 1, visiblePhotos.length - 1))} disabled={lightboxIdx === visiblePhotos.length - 1} className="absolute right-1 sm:right-2 w-9 h-9 rounded-full bg-neutral-7/60 border border-white/20 text-white hover:bg-neutral-7/80 flex items-center justify-center transition disabled:opacity-20 disabled:cursor-not-allowed"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReservasTab({ bookings }) {
  const { language } = useLanguage();
  const { formatDayHeader } = useMemo(() => buildDateHelpers(language), [language]);
  const [typeFilter, setTypeFilter] = useState('todas');
  const [viewMode, setViewMode] = useState('tipo');
  const typeOrder = ['vuelo', 'hotel', 'actividad', 'restaurante', 'coche'];
  const availableTypes = typeOrder.filter((t) => bookings.some((b) => b.bookingType === t));
  const filteredBookings = useMemo(() => typeFilter === 'todas' ? bookings : bookings.filter((b) => b.bookingType === typeFilter), [bookings, typeFilter]);
  const grouped = useMemo(() => {
    const g = { vuelo: [], hotel: [], actividad: [], restaurante: [], coche: [] };
    for (const b of filteredBookings) { if (g[b.bookingType]) g[b.bookingType].push(b); }
    return g;
  }, [filteredBookings]);
  const byDay = useMemo(() => {
    const d = {};
    for (const b of filteredBookings) { const date = getBookingDate(b) || 'sin-fecha'; if (!d[date]) d[date] = []; d[date].push(b); }
    return d;
  }, [filteredBookings]);
  const sortedDayKeys = useMemo(() => Object.keys(byDay).sort((a, b) => { if (a === 'sin-fecha') return 1; if (b === 'sin-fecha') return -1; return a.localeCompare(b); }), [byDay]);
  const filledTypes = typeOrder.filter((t) => grouped[t]?.length > 0);
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-neutral-1 p-3 flex items-center gap-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0">
          <button type="button" onClick={() => setTypeFilter('todas')} className={`px-3 py-1.5 body-3 font-semibold rounded-full shrink-0 border transition-colors ${typeFilter === 'todas' ? 'bg-secondary-5 text-white border-secondary-5' : 'bg-white text-neutral-4 border-neutral-2 hover:bg-neutral-1'}`}>Todas</button>
          {availableTypes.map((t) => {
            const cfg = BOOKING_TYPE_CONFIG[t];
            return (
              <button key={t} type="button" onClick={() => setTypeFilter(t)} className={`flex items-center gap-1.5 px-3 py-1.5 body-3 font-semibold rounded-full shrink-0 border transition-colors ${typeFilter === t ? 'bg-secondary-5 text-white border-secondary-5' : 'bg-white text-neutral-4 border-neutral-2 hover:bg-neutral-1'}`}>
                <cfg.Icon className="w-3.5 h-3.5 shrink-0" />{cfg.label}s
              </button>
            );
          })}
        </div>
        <div className="flex rounded-full border border-neutral-1 overflow-hidden shrink-0">
          {[['tipo', 'Por tipo'], ['dia', 'Por día']].map(([v, l]) => (
            <button key={v} type="button" onClick={() => setViewMode(v)} className={`px-3 py-1 body-3 font-semibold transition-colors ${viewMode === v ? 'bg-secondary-5 text-white' : 'text-neutral-4 hover:bg-neutral-1'}`}>{l}</button>
          ))}
        </div>
      </div>
      {viewMode === 'tipo' && (
        <div className="flex flex-col gap-5">
          {filledTypes.map((type) => {
            const cfg = BOOKING_TYPE_CONFIG[type];
            return (
              <div key={type} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <cfg.Icon className="w-4 h-4 text-neutral-4 shrink-0" />
                  <p className="body-bold text-secondary-5">{cfg.label}{grouped[type].length > 1 ? 's' : ''}</p>
                  <span className="body-3 text-neutral-3 bg-neutral-1 rounded-full px-2 py-0.5">{grouped[type].length}</span>
                </div>
                {grouped[type].map((b, i) => renderBookingCard(b, i))}
              </div>
            );
          })}
          {filledTypes.length === 0 && <div className="bg-white rounded-2xl border border-neutral-1 p-10 text-center"><p className="body text-neutral-4">Sin reservas para este filtro</p></div>}
        </div>
      )}
      {viewMode === 'dia' && (
        <div className="flex flex-col gap-5">
          {sortedDayKeys.map((dateKey) => (
            <div key={dateKey} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-neutral-4" />
                <p className="body-bold text-secondary-5">{formatDayHeader(dateKey, language)}</p>
                <span className="body-3 text-neutral-3 bg-neutral-1 rounded-full px-2 py-0.5">{byDay[dateKey].length}</span>
              </div>
              {byDay[dateKey].map((b, i) => renderBookingCard(b, i))}
            </div>
          ))}
          {sortedDayKeys.length === 0 && <div className="bg-white rounded-2xl border border-neutral-1 p-10 text-center"><p className="body text-neutral-4">Sin reservas para este filtro</p></div>}
        </div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function getCurrencySymbol(currency) {
  if (!currency) return '';
  const code = currency.split(/[\s-]/)[0].trim().toUpperCase();
  return DIVISAS.find(d => d.code === code)?.symbol || currency.split(' ').at(-1) || currency;
}

export function SummarySidebar({ data, extraContent = null }) {
  const displayTotal = data.expenseSummary?.totalSpent > 0 ? data.expenseSummary.totalSpent : data.totalBudget;
  const currencySymbol = getCurrencySymbol(data.budgetCurrency);
  const budgetValue = data.shareBudget && displayTotal
    ? `${displayTotal >= 10000 ? new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 1 }).format(displayTotal) : Math.round(displayTotal).toLocaleString('es-ES')} ${currencySymbol}`.trim()
    : null;
  const days = data.days || (data.startDate && data.endDate ? Math.round((new Date(data.endDate) - new Date(data.startDate)) / 86400000) + 1 : null);
  const items = [
    days ? { Icon: CalendarDays, value: days, label: 'días' } : null,
    data.participantCount > 0 ? { Icon: Users, value: data.participantCount, label: data.participantCount === 1 ? 'persona' : 'personas' } : null,
    data.itinerary?.length > 0 ? { Icon: Ticket, value: data.itinerary.length, label: 'actividades' } : null,
    budgetValue ? { Icon: Wallet, value: budgetValue, label: 'presupuesto total' } : null,
  ].filter(Boolean);
  if (items.length === 0 && !extraContent) return null;
  return (
    <div className="hidden lg:flex flex-col gap-4 w-52 shrink-0">
      {items.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-1 p-4">
          <p className="body-3 text-neutral-4 font-semibold uppercase tracking-wide mb-3">Resumen</p>
          <div className="grid grid-cols-2 gap-2">
            {items.map(({ Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5 p-3 rounded-xl bg-neutral-1/60 text-center">
                <Icon className="w-5 h-5 text-primary-3" />
                <span className="body-bold text-secondary-5 mt-0.5 text-sm wrap-break-word w-full">{value}</span>
                <span className="body-3 text-neutral-3 leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {extraContent}
      <div className="bg-neutral-1/60 rounded-2xl border border-neutral-1 p-4 flex items-start gap-2">
        <Lock className="w-4 h-4 text-neutral-3 shrink-0 mt-0.5" />
        <p className="body-3 text-neutral-3">Solo lectura. Notas y datos privados están ocultos.</p>
      </div>
    </div>
  );
}

// ── Componente principal de tabs ──────────────────────────────────────────────

export function TripContentTabs({ data, tripDays, activitiesByDate, galleryPhotos, activeTab, onTabChange }) {
  const tabs = [
    { key: 'itinerario',  label: 'Itinerario',  icon: CalendarDays, show: true },
    { key: 'reservas',    label: 'Reservas',    icon: Ticket,       show: data.shareBookings && data.bookings?.length > 0 },
    { key: 'presupuesto', label: 'Presupuesto', icon: Wallet,       show: data.shareBudget && data.totalBudget != null },
    { key: 'equipaje',    label: 'Equipaje',    icon: Package,      show: data.shareLuggage && (data.luggageCategories?.length > 0 || data.personalLuggageCategories?.length > 0) },
    { key: 'galeria',     label: 'Galería',     icon: ImageIcon,    show: data.shareGallery && galleryPhotos?.length > 0 },
  ].filter((t) => t.show);

  return (
    <div className="flex flex-col gap-4">
      {/* Tab nav */}
      {tabs.length > 1 && (
        <div className="bg-white rounded-2xl border border-neutral-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center px-2">
            {tabs.map((tab) => (
              <button key={tab.key} type="button" onClick={() => onTabChange(tab.key)}
                className={`relative flex items-center gap-2 px-4 py-4 body-3 font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  activeTab === tab.key
                    ? 'text-primary-3 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-3 after:rounded-t-full'
                    : 'text-neutral-4 hover:text-neutral-6'
                }`}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'itinerario' && <ItinerarioTab tripDays={tripDays} activitiesByDate={activitiesByDate} bookings={data.shareBookings ? (data.bookings ?? []) : []} />}
      {activeTab === 'reservas' && <ReservasTab bookings={data.bookings ?? []} />}
      {activeTab === 'presupuesto' && <PresupuestoTab data={data} />}
      {activeTab === 'equipaje' && <EquipajeTab categories={data.luggageCategories ?? []} personalCategories={data.personalLuggageCategories ?? []} scopeAll={data.luggageScopeAll} />}
      {activeTab === 'galeria' && <GaleriaTab photos={galleryPhotos ?? []} />}

      <div className="flex items-start gap-2 body-3 text-neutral-3 pb-2">
        <Lock className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Notas personales y datos privados no se incluyen en esta vista.</span>
      </div>
    </div>
  );
}
