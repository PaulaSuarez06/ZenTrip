import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Users, Calendar, Heart, MessageCircle, Bookmark,
  Copy, Check, Lock, Wallet, Package, Settings, UserCircle,
  Image as ImageIcon, CalendarDays, ChevronLeft, ChevronRight, X, Folder, Trash2, Ticket,
  Plane, Hotel, Car, Compass, Utensils, Star, ChevronDown,
} from 'lucide-react';
import { getCommunityPostById, toggleLike, toggleSave, unpublishPost } from '../../services/communityService';
import CommentsModal from './CommentsModal';
import EditPostVisibilityModal from './EditPostVisibilityModal';
import UserAvatar from '../ui/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/routes';
import DayCalendar from '../trips/detail/components/itinerary/DayCalendar';
import { TripContentTabs, SummarySidebar } from '../shared/SharedTripContent';

// --- Helpers ---a

import { useLanguage } from '../../context/LanguageContext';
import { buildDateHelpers } from '../../utils/localeDate';
import { DIVISAS } from '../../utils/divisas';

function timeAgo(timestamp) {
  if (!timestamp) return '';
  const ts = timestamp?.seconds ? timestamp.seconds * 1000 : new Date(timestamp).getTime();
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins || 1} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `hace ${days} día${days !== 1 ? 's' : ''}`;
  return `hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) !== 1 ? 'es' : ''}`;
}

function getTripDays(startDate, endDate) {
  if (!startDate || !endDate) return [];
  const days = [];
  let cur = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  while (cur <= end) {
    days.push(cur.toISOString().split('T')[0]);
    cur = new Date(cur.getTime() + 86400000);
  }
  return days;
}

function formatDayHeader(dateStr, locale = 'es') {
  if (!dateStr || dateStr === 'sin-fecha') return 'Sin fecha';
  const [y, m, d] = dateStr.split('-');
  return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(+y, +m - 1, +d));
}

function getBookingDate(booking) {
  if (booking.bookingType === 'vuelo') return booking.segments?.[0]?.date || null;
  if (booking.bookingType === 'hotel') return booking.checkIn || null;
  if (booking.bookingType === 'actividad') return booking.date || null;
  if (booking.bookingType === 'restaurante') return booking.date || null;
  if (booking.bookingType === 'coche') return booking.pickUpDate || null;
  return null;
}

// Normalise gallery: old posts have string[], new have {url, folderName}[]
function normalizeGallery(images) {
  return (images || []).map((img) =>
    typeof img === 'string' ? { url: img, folderName: '' } : img
  );
}

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
  vuelo:       { label: 'Vuelo',       Icon: Plane,    borderClass: 'border-blue-100',   iconClass: 'text-blue-500' },
  hotel:       { label: 'Hotel',       Icon: Hotel,    borderClass: 'border-teal-100',   iconClass: 'text-teal-500' },
  actividad:   { label: 'Actividad',   Icon: Compass,  borderClass: 'border-violet-100', iconClass: 'text-violet-500' },
  restaurante: { label: 'Restaurante', Icon: Utensils, borderClass: 'border-orange-100', iconClass: 'text-orange-500' },
  coche:       { label: 'Coche',       Icon: Car,      borderClass: 'border-amber-100',  iconClass: 'text-amber-500' },
};

const EXPENSE_CATS = [
  { key: 'alojamiento',   label: 'Alojamiento',   color: 'bg-blue-500',    text: 'text-blue-700',   bg: 'bg-blue-50' },
  { key: 'transporte',    label: 'Transporte',    color: 'bg-orange-500',  text: 'text-orange-700', bg: 'bg-orange-50' },
  { key: 'comida',        label: 'Comida',        color: 'bg-green-500',   text: 'text-green-700',  bg: 'bg-green-50' },
  { key: 'actividades',   label: 'Actividades',   color: 'bg-purple-500',  text: 'text-purple-700', bg: 'bg-purple-50' },
  { key: 'supermercado',  label: 'Supermercado',  color: 'bg-teal-500',    text: 'text-teal-700',   bg: 'bg-teal-50' },
  { key: 'compras',       label: 'Compras',       color: 'bg-pink-500',    text: 'text-pink-700',   bg: 'bg-pink-50' },
  { key: 'salud',         label: 'Salud',         color: 'bg-red-500',     text: 'text-red-700',    bg: 'bg-red-50' },
  { key: 'otros',         label: 'Otros',         color: 'bg-neutral-400', text: 'text-neutral-600',bg: 'bg-neutral-50' },
  { key: 'personalizada', label: 'Personalizada', color: 'bg-indigo-500',  text: 'text-indigo-700', bg: 'bg-indigo-50' },
];

// --- Shared components ---

function CopyLinkButton({ postId }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/p/${postId}`;
  async function handleCopy() {
    try { await navigator.clipboard.writeText(url); }
    catch { const el = document.createElement('textarea'); el.value = url; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copiar enlace"
      className={`flex items-center gap-1.5 body-3 font-semibold px-3 py-1.5 rounded-full border transition-colors ${
        copied ? 'bg-green-50 border-green-300 text-green-700' : 'border-neutral-2 text-neutral-5 hover:bg-neutral-1'
      }`}
    >
      {copied ? <><Check className="w-3.5 h-3.5" />Copiado</> : <><Copy className="w-3.5 h-3.5" />Copiar enlace</>}
    </button>
  );
}

function GuestBanner({ postId }) {
  const redirect = postId ? `?redirect=/p/${postId}` : '';
  return (
    <div className="bg-secondary-5 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
      <div className="flex-1">
        <p className="body-bold text-white mb-1">¿Te inspira este viaje?</p>
        <p className="body-3 text-white/70">Únete a ZenTrip gratis y planifica tu propio viaje, guarda itinerarios y conecta con otros viajeros.</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Link to={`${ROUTES.AUTH.REGISTER}${redirect}`} className="bg-primary-3 hover:bg-orange-400 text-white body-3 font-semibold px-4 py-2 rounded-full transition-colors">
          Crear cuenta gratis
        </Link>
        <Link to={`${ROUTES.AUTH.LOGIN}${redirect}`} className="bg-white/10 hover:bg-white/20 text-white body-3 font-semibold px-4 py-2 rounded-full transition-colors">
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}

function TabNav({ tabs, activeTab, onChange }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-1 overflow-x-auto scrollbar-hide">
      <div className="flex items-center px-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`
              relative flex items-center gap-2 px-4 py-4 body-3 font-semibold whitespace-nowrap transition-colors shrink-0
              ${activeTab === tab.key
                ? 'text-primary-3 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-3 after:rounded-t-full'
                : 'text-neutral-4 hover:text-neutral-6'}
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Tab: Itinerario ---

function ItinerarioTab({ tripDays, activitiesByDate, bookings = [] }) {
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

// --- Tab: Presupuesto ---

function fmtMoney(amount) {
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

function DaySelect({ days, selected, onSelect, fmtDayFull, currency }) {
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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border transition-colors ${
          open ? 'border-primary-3 ring-2 ring-primary-3/20' : 'border-neutral-2 hover:border-neutral-3'
        } bg-white`}
      >
        {selectedData ? (
          <div className="flex items-center justify-between gap-2 flex-1 min-w-0">
            <span className="body-3 font-semibold text-secondary-5 truncate">{fmtDayFull(selectedData.date)}</span>
            <span className="body-3 font-semibold text-primary-3 shrink-0">{fmtMoney(selectedData.total)} {currency}</span>
          </div>
        ) : (
          <span className="body-3 text-neutral-3 flex-1">Selecciona un día...</span>
        )}
        <ChevronDown className={`w-4 h-4 shrink-0 text-neutral-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-neutral-2 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {days.map(({ date, total }) => (
            <button
              key={date}
              type="button"
              onClick={() => { onSelect(date); setOpen(false); }}
              className={`w-full flex items-center justify-between gap-4 px-4 py-2.5 transition-colors ${
                selected === date ? 'bg-primary-1' : 'hover:bg-neutral-1'
              }`}
            >
              <span className={`body-3 font-semibold ${selected === date ? 'text-primary-4' : 'text-secondary-5'}`}>
                {fmtDayFull(date)}
              </span>
              <span className={`body-3 font-semibold shrink-0 ${selected === date ? 'text-primary-3' : 'text-neutral-4'}`}>
                {fmtMoney(total)} {currency}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PresupuestoTab({ post, perDay }) {
  const { language } = useLanguage();
  const [view, setView] = useState('resumen');
  const [selectedDay, setSelectedDay] = useState(null);

  const summary = post.expenseSummary;
  const displayTotal = summary?.totalSpent > 0 ? summary.totalSpent : post.totalBudget;
  const currency = post.budgetCurrency || '';
  const participantCount = post.participantCount || 1;
  const days = post.days || 1;

  const activeCats = useMemo(() => {
    if (!summary?.categoryTotals) return [];
    return EXPENSE_CATS
      .map((c) => ({ ...c, amount: summary.categoryTotals[c.key] || 0 }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [summary]);

  const sortedDays = useMemo(() => {
    if (!summary?.dailyTotals) return [];
    return Object.entries(summary.dailyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));
  }, [summary]);

  const selectedDayData = useMemo(() => {
    if (!selectedDay || !summary?.dailyTotals) return null;
    return summary.dailyTotals[selectedDay] || null;
  }, [selectedDay, summary]);

  const selectedDayCats = useMemo(() => {
    if (!selectedDayData?.categories) return [];
    return EXPENSE_CATS
      .map((c) => ({ ...c, amount: selectedDayData.categories[c.key] || 0 }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [selectedDayData]);

  function fmtDay(dateStr) { return fmtDayShort(dateStr, language); }
  function fmtDayFullLocal(dateStr) { return fmtDayFull(dateStr, language); }

  return (
    <div className="flex flex-col gap-4">
      {/* Resumen de cifras */}
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
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`px-3 py-1 body-3 font-semibold transition-colors ${view === v ? 'bg-secondary-5 text-white' : 'text-neutral-4 hover:bg-neutral-1'}`}
                >
                  {v === 'resumen' ? 'Resumen' : 'Por día'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 flex-wrap mb-5">
          <div className="flex-1 min-w-28 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            <p className="body-3 text-green-700 font-semibold mb-0.5">Total del viaje</p>
            <p className="title-h2-desktop text-green-800 leading-tight">
              {fmtMoney(displayTotal)}
              {currency && <span className="body-2 ml-1 font-normal">{currency}</span>}
            </p>
          </div>
          {days > 1 && displayTotal && (
            <div className="flex-1 min-w-28 bg-primary-1 border border-primary-2 rounded-xl px-4 py-3">
              <p className="body-3 text-primary-4 font-semibold mb-0.5">Por día</p>
              <p className="title-h2-desktop text-primary-5 leading-tight">
                {fmtMoney(displayTotal / days)}
                {currency && <span className="body-2 ml-1 font-normal">{currency}</span>}
              </p>
            </div>
          )}
          {participantCount > 1 && displayTotal && (
            <div className="flex-1 min-w-28 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
              <p className="body-3 text-orange-700 font-semibold mb-0.5">Por persona</p>
              <p className="title-h2-desktop text-orange-800 leading-tight">
                {fmtMoney(displayTotal / participantCount)}
                {currency && <span className="body-2 ml-1 font-normal">{currency}</span>}
              </p>
            </div>
          )}
        </div>

        {/* Resumen general */}
        {view === 'resumen' && activeCats.length > 0 && (
          <div className="flex flex-col gap-2.5 pt-4 border-t border-neutral-1">
            <p className="body-3 font-semibold text-neutral-5 mb-1">Desglose por categoría</p>
            {activeCats.map((cat) => (
              <CategoryBar key={cat.key} cat={cat} amount={cat.amount} total={summary.totalSpent} currency={currency} />
            ))}
          </div>
        )}

        {/* Por día */}
        {view === 'por-dia' && sortedDays.length > 0 && (
          <div className="flex flex-col gap-4 pt-4 border-t border-neutral-1">
            <div className="grid grid-cols-3 gap-3">
              <DaySelect
                days={sortedDays}
                selected={selectedDay}
                onSelect={setSelectedDay}
                fmtDayFull={fmtDayFullLocal}
                currency={currency}
              />
            </div>

            {selectedDay && selectedDayData && (
              <div className="bg-neutral-1/50 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="body-3 font-semibold text-secondary-5">{fmtDayFullLocal(selectedDay)}</p>
                  <p className="body-bold text-primary-3">{fmtMoney(selectedDayData.total)} {currency}</p>
                </div>
                {participantCount > 1 && (
                  <p className="body-3 text-neutral-4">≈ {fmtMoney(selectedDayData.total / participantCount)} {currency} por persona</p>
                )}
                {selectedDayCats.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-neutral-2">
                    {selectedDayCats.map((cat) => (
                      <CategoryBar key={cat.key} cat={cat} amount={cat.amount} total={selectedDayData.total} currency={currency} />
                    ))}
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

// --- Tab: Galería ---

function GaleriaTab({ photos }) {
  const folderNames = useMemo(
    () => [...new Set(photos.map((p) => p.folderName || ''))],
    [photos]
  );

  const showFolders = folderNames.length > 1 || (folderNames.length === 1 && folderNames[0] !== '');

  const [selectedFolder, setSelectedFolder] = useState('__all__');
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const visiblePhotos = useMemo(
    () => selectedFolder === '__all__' ? photos : photos.filter((p) => (p.folderName || '') === selectedFolder),
    [photos, selectedFolder]
  );

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setLightboxIdx((i) => Math.min(i + 1, visiblePhotos.length - 1));
      if (e.key === 'ArrowLeft')  setLightboxIdx((i) => Math.max(i - 1, 0));
      if (e.key === 'Escape')     setLightboxIdx(null);
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
          <button
            type="button"
            onClick={() => setSelectedFolder('__all__')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition ${
              selectedFolder === '__all__'
                ? 'bg-primary-1 text-primary-4 border-primary-2'
                : 'bg-white text-neutral-5 border-neutral-2 hover:bg-neutral-1'
            }`}
          >
            <Folder className="w-3.5 h-3.5 shrink-0" />
            Todas
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
              selectedFolder === '__all__' ? 'bg-primary-2 text-primary-5' : 'bg-neutral-1 text-neutral-4'
            }`}>{photos.length}</span>
          </button>
          {folderNames.map((folder) => {
            const count = photos.filter((p) => (p.folderName || '') === folder).length;
            const isActive = selectedFolder === folder;
            return (
              <button
                key={folder || '__none__'}
                type="button"
                onClick={() => setSelectedFolder(folder)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition ${
                  isActive
                    ? 'bg-primary-1 text-primary-4 border-primary-2'
                    : 'bg-white text-neutral-5 border-neutral-2 hover:bg-neutral-1'
                }`}
              >
                <Folder className="w-3.5 h-3.5 shrink-0" />
                {folder || 'General'}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                  isActive ? 'bg-primary-2 text-primary-5' : 'bg-neutral-1 text-neutral-4'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visiblePhotos.map((photo, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl overflow-hidden cursor-zoom-in group"
            onClick={() => setLightboxIdx(i)}
          >
            <img
              src={photo.url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-50 flex flex-col p-3 sm:p-4" onClick={() => setLightboxIdx(null)}>
          <div className="absolute inset-0 bg-neutral-7/80 backdrop-blur-sm" />
          <div className="relative z-10 flex items-center justify-between mb-3 shrink-0" onClick={(e) => e.stopPropagation()}>
            <p className="text-white/50 text-xs">{lightboxIdx + 1} / {visiblePhotos.length}</p>
            <button
              type="button"
              onClick={() => setLightboxIdx(null)}
              className="w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative z-10 flex-1 flex items-center justify-center min-h-0" onClick={(e) => e.stopPropagation()}>
            <img
              src={visiblePhotos[lightboxIdx].url}
              alt=""
              className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setLightboxIdx((i) => Math.max(i - 1, 0))}
              disabled={lightboxIdx === 0}
              className="absolute left-1 sm:left-2 w-9 h-9 rounded-full bg-neutral-7/60 border border-white/20 text-white hover:bg-neutral-7/80 flex items-center justify-center transition disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setLightboxIdx((i) => Math.min(i + 1, visiblePhotos.length - 1))}
              disabled={lightboxIdx === visiblePhotos.length - 1}
              className="absolute right-1 sm:right-2 w-9 h-9 rounded-full bg-neutral-7/60 border border-white/20 text-white hover:bg-neutral-7/80 flex items-center justify-center transition disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Tab: Equipaje ---

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
        <span className="body-3 text-neutral-3 bg-neutral-1 rounded-full px-2 py-0.5">
          {categories.length + (hasPersonal ? personalCategories.length : 0)} artículos
        </span>
      </div>

      {hasGroup && (
        <div className="flex flex-col gap-3">
          {hasPersonal && (
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-primary-3 shrink-0" />
              <p className="body-3 font-semibold text-primary-3">Equipaje grupal · {categories.length} artículos</p>
            </div>
          )}
          <LuggageList items={categories} />
        </div>
      )}

      {hasPersonal && (
        <div className="flex flex-col gap-3 pt-4 border-t border-neutral-1">
          <div className="flex items-center gap-1.5">
            <UserCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <p className="body-3 font-semibold text-blue-600">Equipaje personal · {personalCategories.length} artículos</p>
          </div>
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

// --- Tab: Reservas ---

function fmtFlightDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(y, m - 1, d));
}

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

function ReservasTab({ bookings }) {
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

// --- Main component ---

export default function CommunityPostPublic() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const { formatRange } = useMemo(() => buildDateHelpers(language), [language]);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState(0);
  const [likedBy, setLikedBy] = useState([]);
  const [savedBy, setSavedBy] = useState([]);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('itinerario');
  const [showEditVisibility, setShowEditVisibility] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getCommunityPostById(postId).then((data) => {
      if (!data) { setNotFound(true); setLoading(false); return; }
      setPost(data);
      setLikes(data.likes ?? 0);
      setLikedBy(data.likedBy ?? []);
      setSavedBy(data.savedBy ?? []);
      setLoading(false);
    }).catch(() => { setNotFound(true); setLoading(false); });
  }, [postId]);

  const isLiked = user ? likedBy.includes(user.uid) : false;
  const isSaved = user ? savedBy.includes(user.uid) : false;
  const isOwner = user ? user.uid === post?.userId : false;

  async function handleLike() {
    if (!user || likeLoading) return;
    setLikeLoading(true);
    const nowLiked = !isLiked;
    setLikedBy((prev) => nowLiked ? [...prev, user.uid] : prev.filter((id) => id !== user.uid));
    setLikes((prev) => prev + (nowLiked ? 1 : -1));
    try { await toggleLike(post.id, user.uid, profile); }
    catch {
      setLikedBy((prev) => nowLiked ? prev.filter((id) => id !== user.uid) : [...prev, user.uid]);
      setLikes((prev) => prev + (nowLiked ? -1 : 1));
    }
    finally { setLikeLoading(false); }
  }

  function handleVisibilitySaved(updates) {
    setPost((prev) => ({ ...prev, ...updates }));
  }

  async function handleDeletePost() {
    setDeleting(true);
    try {
      await unpublishPost(post.id);
      navigate(ROUTES.COMMUNITY);
    } catch {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function handleSave() {
    if (!user || saveLoading) return;
    setSaveLoading(true);
    const nowSaved = !isSaved;
    setSavedBy((prev) => nowSaved ? [...prev, user.uid] : prev.filter((id) => id !== user.uid));
    try { await toggleSave(post.id, user.uid, profile); }
    catch { setSavedBy((prev) => nowSaved ? prev.filter((id) => id !== user.uid) : [...prev, user.uid]); }
    finally { setSaveLoading(false); }
  }

  const { tripDays, activitiesByDate, galleryPhotos } = useMemo(() => {
    if (!post) return { tripDays: [], activitiesByDate: {}, galleryPhotos: [] };
    const tripDays = getTripDays(post.startDate, post.endDate);
    const activitiesByDate = (post.itinerary ?? []).reduce((acc, act) => {
      const d = act.date || 'sin-fecha';
      if (!acc[d]) acc[d] = [];
      acc[d].push(act);
      return acc;
    }, {});
    return { tripDays, activitiesByDate, galleryPhotos: normalizeGallery(post.galleryImages) };
  }, [post]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col gap-4 animate-pulse">
        <div className="h-5 w-16 bg-neutral-1 rounded" />
        <div className="bg-white rounded-2xl border border-neutral-1 overflow-hidden">
          <div className="w-full h-64 sm:h-80 bg-neutral-1" />
          <div className="px-5 sm:px-8 py-5 flex flex-col gap-4">
            <div className="h-8 w-2/3 bg-neutral-1 rounded" />
            <div className="h-4 w-1/2 bg-neutral-1 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-32 gap-4 text-center">
        <MapPin className="w-16 h-16 text-neutral-2" />
        <p className="title-h3-desktop text-neutral-5">Publicación no encontrada</p>
        <p className="body-2 text-neutral-4">Este viaje ya no está disponible o el enlace es incorrecto.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-2 bg-primary-3 hover:bg-orange-400 text-white body-2-semibold px-6 py-2.5 rounded-full transition-colors"
        >
          Ir al inicio
        </button>
      </div>
    );
  }

  const dateLabel = formatRange(post.startDate, post.endDate);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4">
      {/* Back button — solo visible si hay sesión */}
      {user && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 body-3 text-neutral-4 hover:text-secondary-5 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver
        </button>
      )}

      {/* Header card — cover image flush at top, then content */}
      <div className="bg-white rounded-2xl overflow-hidden border border-neutral-1 shadow-sm">
        {post.coverImage ? (
          <div className="relative w-full h-64 sm:h-80">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 pb-5">
              <h1 className="title-h2-desktop text-white leading-tight drop-shadow-sm">{post.title}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {post.destination && (
                  <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white body-3 font-semibold px-3 py-1 rounded-full">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {post.destination}{post.origin && ` · desde ${post.origin}`}
                  </span>
                )}
                {dateLabel && (
                  <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white body-3 font-semibold px-3 py-1 rounded-full">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    {dateLabel}{post.days ? ` · ${post.days} días` : ''}
                  </span>
                )}
                {post.participantCount > 0 && (
                  <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white body-3 font-semibold px-3 py-1 rounded-full">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    {post.participantCount} {post.participantCount === 1 ? 'persona' : 'personas'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-5 sm:px-8 pt-6 pb-4">
            <h1 className="title-h2-desktop text-secondary-5 leading-tight">{post.title}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              {post.destination && (
                <span className="flex items-center gap-1.5 bg-neutral-1 text-neutral-5 body-3 font-semibold px-3 py-1.5 rounded-full">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-primary-3" />
                  {post.destination}{post.origin && ` · desde ${post.origin}`}
                </span>
              )}
              {dateLabel && (
                <span className="flex items-center gap-1.5 bg-neutral-1 text-neutral-5 body-3 font-semibold px-3 py-1.5 rounded-full">
                  <Calendar className="w-3.5 h-3.5 shrink-0 text-primary-3" />
                  {dateLabel}{post.days ? ` · ${post.days} días` : ''}
                </span>
              )}
              {post.participantCount > 0 && (
                <span className="flex items-center gap-1.5 bg-neutral-1 text-neutral-5 body-3 font-semibold px-3 py-1.5 rounded-full">
                  <Users className="w-3.5 h-3.5 shrink-0 text-primary-3" />
                  {post.participantCount} {post.participantCount === 1 ? 'persona' : 'personas'}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="px-5 sm:px-8 py-4 sm:py-5 flex flex-col gap-3 border-t border-neutral-1">
          {/* Author + action buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <UserAvatar
                src={post.userAvatar}
                fullName={post.username}
                sizeClass="w-9 h-9"
                backgroundColor={post.userAvatarColor}
                initialsClass="text-xs text-white font-bold"
                backgroundClass={post.userAvatarColor ? '' : 'bg-primary-3'}
              />
              <div>
                <p className="body-3 font-semibold text-secondary-5">@{post.username}</p>
                <p className="text-[11px] text-neutral-3">{timeAgo(post.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {user && (
                <>
                  <button
                    type="button"
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 body-3 px-3 py-1.5 rounded-full border transition-colors ${
                      isLiked ? 'bg-red-50 border-red-300 text-red-500' : 'border-neutral-2 text-neutral-5 hover:bg-neutral-1'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                    <span>{likes}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowComments(true)}
                    className="flex items-center gap-1.5 body-3 px-3 py-1.5 rounded-full border border-neutral-2 text-neutral-5 hover:bg-neutral-1 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.commentsCount ?? 0}</span>
                  </button>
                  {!isOwner && (
                    <button
                      type="button"
                      onClick={handleSave}
                      className={`flex items-center gap-1.5 body-3 px-3 py-1.5 rounded-full border transition-colors ${
                        isSaved ? 'bg-primary-1 border-primary-2 text-primary-3' : 'border-neutral-2 text-neutral-5 hover:bg-neutral-1'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-primary-3' : ''}`} />
                      {isSaved ? 'Guardado' : 'Guardar'}
                    </button>
                  )}
                </>
              )}
              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowEditVisibility(true)}
                    title="Editar visibilidad del viaje compartido"
                    className="flex items-center gap-1.5 body-3 font-semibold px-3 py-1.5 rounded-full border border-neutral-2 text-neutral-5 hover:bg-neutral-1 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Editar visibilidad
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    title="Borrar publicación (el viaje no se elimina)"
                    className="flex items-center gap-1.5 body-3 font-semibold px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Borrar publicación
                  </button>
                </>
              )}
              <CopyLinkButton postId={post.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Guest banner */}
      {!user && <GuestBanner postId={postId} />}

      {/* Content: sidebar + tabs */}
      <div className="flex gap-4 items-start">
        <SummarySidebar data={post} />
        <div className="flex-1 min-w-0">
          <TripContentTabs
            data={post}
            tripDays={tripDays}
            activitiesByDate={activitiesByDate}
            galleryPhotos={galleryPhotos}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>


      {showComments && <CommentsModal post={post} onClose={() => setShowComments(false)} />}
      {showEditVisibility && (
        <EditPostVisibilityModal
          post={post}
          onClose={() => setShowEditVisibility(false)}
          onSaved={handleVisibilitySaved}
        />
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setShowDeleteConfirm(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="body-bold text-secondary-5">¿Borrar publicación?</p>
                <p className="body-3 text-neutral-4 mt-1">Se eliminará de la comunidad y de los guardados de otros usuarios. Tu viaje en ZenTrip no se borrará.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 border border-neutral-2 text-neutral-5 body-3 font-semibold py-2.5 rounded-full hover:bg-neutral-1 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white body-3 font-semibold py-2.5 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Borrando...</> : 'Sí, borrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
