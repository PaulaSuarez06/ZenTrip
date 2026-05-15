import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Users, Calendar, Lock, CalendarDays, ChevronLeft, ChevronRight, X, Wallet, Package, Image as ImageIcon, Ticket, Plane, Hotel, Car, Compass, Utensils, Folder } from 'lucide-react';
import { getTripShare } from '../../../services/tripShareService';
import DayCalendar from '../detail/components/itinerary/DayCalendar';
import { ROUTES } from '../../../config/routes';

const MONTHS_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const DAY_NAMES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

const TYPE_CONFIG = {
  actividad:   { label: 'Actividad',   badgeClass: 'bg-violet-50 text-violet-600' },
  vuelo:       { label: 'Vuelo',       badgeClass: 'bg-blue-50 text-blue-700' },
  hotel:       { label: 'Hotel',       badgeClass: 'bg-teal-50 text-teal-700' },
  restaurante: { label: 'Restaurante', badgeClass: 'bg-orange-50 text-orange-700' },
  restaurant:  { label: 'Restaurante', badgeClass: 'bg-orange-50 text-orange-700' },
  coche:       { label: 'Coche',       badgeClass: 'bg-amber-50 text-amber-600' },
  tren:        { label: 'Tren',        badgeClass: 'bg-indigo-50 text-indigo-600' },
  ruta:        { label: 'Ruta',        badgeClass: 'bg-emerald-50 text-emerald-600' },
};

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return null;
  const parse = (d) => { const [y, m, day] = d.split('-'); return { y: +y, m: +m - 1, d: +day }; };
  if (startDate && endDate) {
    const s = parse(startDate);
    const e = parse(endDate);
    if (s.y === e.y && s.m === e.m) return `${s.d} - ${e.d} ${MONTHS_SHORT[s.m]} ${s.y}`;
    return `${s.d} ${MONTHS_SHORT[s.m]} - ${e.d} ${MONTHS_SHORT[e.m]} ${e.y}`;
  }
  return null;
}

function countDays(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const s = new Date(startDate + 'T00:00:00');
  const e = new Date(endDate + 'T00:00:00');
  return Math.round((e - s) / 86400000) + 1;
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

function formatDayHeader(dateStr) {
  if (!dateStr || dateStr === 'sin-fecha') return 'Sin fecha';
  const [y, m, d] = dateStr.split('-');
  const date = new Date(+y, +m - 1, +d);
  return `${DAY_NAMES[date.getDay()]}, ${+d} ${MONTHS_SHORT[+m - 1]} ${y}`;
}


function ItinerarioTab({ tripDays, activitiesByDate }) {
  const [selectedDay, setSelectedDay] = useState(tripDays[0] ?? null);

  const dayActivities = useMemo(() => {
    if (!selectedDay) return [];
    return (activitiesByDate[selectedDay] || [])
      .slice()
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [selectedDay, activitiesByDate]);

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
        <h3 className="title-h3-desktop text-secondary-5 mb-4">{formatDayHeader(selectedDay)}</h3>

        {dayActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2 text-center">
            <CalendarDays className="w-10 h-10 text-neutral-2" />
            <p className="body text-neutral-4">Sin actividades para este día</p>
          </div>
        ) : (
          <div className="mt-2">
            {dayActivities.map((act, i) => {
              const typeCfg = TYPE_CONFIG[act.type] || TYPE_CONFIG.actividad;
              return (
                <div key={act.id || i} className="flex gap-2 min-w-0">
                  <div className="flex flex-col items-end shrink-0 w-11 pt-1">
                    <span className="body-3 text-neutral-5 font-semibold leading-tight">{act.startTime || '—'}</span>
                    {act.endTime && (
                      <span className="body-3 text-neutral-3 mt-auto leading-tight">{act.endTime}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-3 h-3 rounded-full shrink-0 mt-1.5 bg-primary-3" />
                    {i < dayActivities.length - 1 && <div className="w-px flex-1 bg-neutral-1 mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0 rounded-2xl border border-neutral-1 bg-white p-3 sm:p-4 mb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <h4 className="body-bold text-secondary-5 wrap-break-word">{act.name}</h4>
                      <span className={`body-3 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap self-start shrink-0 ${typeCfg.badgeClass}`}>
                        {typeCfg.label}
                      </span>
                    </div>
                    {act.city && (
                      <div className="flex items-center gap-1 mt-1.5 body-3 text-neutral-3">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{act.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MinimalHeader() {
  return (
    <div className="sticky top-0 z-40 px-4 pt-4">
      <header
        className="w-full rounded-[9999px] h-16 flex items-center justify-between pl-3 pr-3 md:pl-5 md:pr-4 lg:pl-6 lg:pr-4"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.30)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src="/img/logo/logo-sin-texto-png.png" alt="ZenTrip" className="h-10 w-auto" />
          <span className="title-h3-desktop whitespace-nowrap mt-1">
            <span className="text-secondary-5">Zen</span>
            <span className="text-primary-3">Trip</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.AUTH.LOGIN}
            className="body-3 font-semibold text-neutral-5 px-4 py-2 rounded-full border border-neutral-2 bg-white/60 hover:bg-white/90 transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            to={ROUTES.AUTH.REGISTER}
            className="body-3 font-semibold text-white bg-primary-3 hover:bg-orange-400 px-4 py-2 rounded-full transition-colors"
          >
            Registrarte
          </Link>
        </div>
      </header>
    </div>
  );
}

const BOOKING_ICONS = { vuelo: Plane, hotel: Hotel, coche: Car, actividad: Compass, restaurante: Utensils };
const BOOKING_COLORS = { vuelo: 'border-blue-100', hotel: 'border-teal-100', coche: 'border-amber-100', actividad: 'border-violet-100', restaurante: 'border-orange-100' };

function ShareContentTabs({ share, tripDays, activitiesByDate, hasItinerary }) {
  const tabs = [
    { key: 'itinerario', label: 'Itinerario', Icon: CalendarDays, show: true },
    { key: 'galeria',    label: 'Galería',    Icon: ImageIcon,    show: share.shareGallery && share.galleryImages?.length > 0 },
    { key: 'presupuesto',label: 'Presupuesto',Icon: Wallet,       show: share.shareBudget && share.totalBudget != null },
    { key: 'equipaje',   label: 'Equipaje',   Icon: Package,      show: share.shareLuggage && (share.luggageCategories?.length > 0 || share.personalLuggageCategories?.length > 0) },
    { key: 'reservas',   label: 'Reservas',   Icon: Ticket,       show: share.shareBookings && share.bookings?.length > 0 },
  ].filter((t) => t.show);

  const [active, setActive] = useState(tabs[0]?.key ?? 'itinerario');

  if (tabs.length <= 1) {
    return hasItinerary
      ? <ItinerarioTab tripDays={tripDays} activitiesByDate={activitiesByDate} />
      : <div className="bg-white rounded-2xl border border-neutral-1 p-10 text-center"><CalendarDays className="w-10 h-10 text-neutral-2 mx-auto mb-3" /><p className="body text-neutral-4">Este viaje no tiene actividades en el itinerario</p></div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tab nav */}
      <div className="bg-white rounded-2xl border border-neutral-1 overflow-x-auto scrollbar-hide">
        <div className="flex items-center px-2">
          {tabs.map((tab) => (
            <button key={tab.key} type="button" onClick={() => setActive(tab.key)}
              className={`relative flex items-center gap-2 px-4 py-4 body-3 font-semibold whitespace-nowrap transition-colors shrink-0 ${
                active === tab.key
                  ? 'text-primary-3 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-3 after:rounded-t-full'
                  : 'text-neutral-4 hover:text-neutral-6'
              }`}>
              <tab.Icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {active === 'itinerario' && (hasItinerary
        ? <ItinerarioTab tripDays={tripDays} activitiesByDate={activitiesByDate} />
        : <div className="bg-white rounded-2xl border border-neutral-1 p-10 text-center"><p className="body text-neutral-4">Sin actividades</p></div>
      )}

      {active === 'galeria' && (
        <div className="bg-white rounded-2xl border border-neutral-1 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-neutral-4" /><p className="body-bold text-secondary-5">Galería del viaje</p><span className="body-3 text-neutral-3">({share.galleryImages.length} fotos)</span></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {share.galleryImages.map((photo, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden"><img src={photo.url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" /></div>
            ))}
          </div>
        </div>
      )}

      {active === 'presupuesto' && (() => {
        const total = share.totalBudget;
        const days = share.endDate && share.startDate ? Math.round((new Date(share.endDate) - new Date(share.startDate)) / 86400000) + 1 : null;
        const pax = share.participantCount || 1;
        const cur = share.budgetCurrency || share.currency || '';
        return (
          <div className="bg-white rounded-2xl border border-neutral-1 p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2"><Wallet className="w-5 h-5 text-neutral-4" /><p className="body-bold text-secondary-5">Presupuesto del viaje</p></div>
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-28 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                <p className="body-3 text-green-700 font-semibold mb-0.5">Total</p>
                <p className="title-h2-desktop text-green-800 leading-tight">{Math.round(total).toLocaleString('es-ES')} <span className="body-2 font-normal">{cur}</span></p>
              </div>
              {days > 1 && <div className="flex-1 min-w-28 bg-primary-1 border border-primary-2 rounded-xl px-4 py-3"><p className="body-3 text-primary-4 font-semibold mb-0.5">Por día</p><p className="title-h2-desktop text-primary-5 leading-tight">{Math.round(total / days).toLocaleString('es-ES')} <span className="body-2 font-normal">{cur}</span></p></div>}
              {pax > 1 && <div className="flex-1 min-w-28 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3"><p className="body-3 text-orange-700 font-semibold mb-0.5">Por persona</p><p className="title-h2-desktop text-orange-800 leading-tight">{Math.round(total / pax).toLocaleString('es-ES')} <span className="body-2 font-normal">{cur}</span></p></div>}
            </div>
          </div>
        );
      })()}

      {active === 'equipaje' && (
        <div className="bg-white rounded-2xl border border-neutral-1 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2"><Package className="w-5 h-5 text-neutral-4" /><p className="body-bold text-secondary-5">Equipaje compartido</p></div>
          {share.luggageCategories?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
              {share.luggageCategories.map((item, i) => <div key={i} className="flex items-center gap-2 body-3 text-neutral-5"><span className="w-4 h-4 rounded-full bg-primary-1 text-primary-4 flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>{item}</div>)}
            </div>
          )}
          {share.luggageScopeAll && share.personalLuggageCategories?.length > 0 && (
            <div className="pt-3 border-t border-neutral-1 flex flex-col gap-2">
              <p className="body-3 font-semibold text-blue-600">Equipaje personal (anónimo)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {share.personalLuggageCategories.map((item, i) => <div key={i} className="flex items-center gap-2 body-3 text-neutral-5"><span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>{item}</div>)}
              </div>
            </div>
          )}
        </div>
      )}

      {active === 'reservas' && (
        <div className="flex flex-col gap-3">
          {share.bookings.map((b, i) => {
            const Icon = BOOKING_ICONS[b.bookingType] || Ticket;
            const color = BOOKING_COLORS[b.bookingType] || 'border-neutral-1';
            const name = b.hotelName || b.activityName || b.restaurantName || b.carName
              || (b.segments?.[0] ? `${b.segments[0].departureAirport?.code || ''} → ${b.segments[b.segments.length-1]?.arrivalAirport?.code || ''}` : 'Reserva');
            const detail = b.bookingType === 'hotel' ? `${b.checkIn || ''} → ${b.checkOut || ''}` : b.bookingType === 'coche' ? `${b.pickUpDate || ''} → ${b.dropOffDate || ''}` : b.date || '';
            return (
              <div key={i} className={`bg-white rounded-xl border ${color} p-4 flex items-center gap-3`}>
                <Icon className="w-5 h-5 text-neutral-4 shrink-0" />
                <div className="flex-1 min-w-0"><p className="body-3 font-semibold text-secondary-5 truncate">{name}</p>{detail && <p className="body-3 text-neutral-4">{detail}</p>}</div>
                {(b.totalPrice || b.price) && <span className="body-3 font-semibold text-neutral-5 shrink-0">{(b.totalPrice || b.price).toLocaleString('es-ES')} {b.currency || ''}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function JoinBanner() {
  return (
    <div className="bg-secondary-5 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
      <div className="flex-1">
        <p className="body-bold text-white mb-1">¿Te inspira este viaje?</p>
        <p className="body-3 text-white/70">Únete a ZenTrip gratis y planifica el tuyo, guarda itinerarios y viaja mejor.</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Link
          to={ROUTES.AUTH.REGISTER}
          className="bg-primary-3 hover:bg-orange-400 text-white body-3 font-semibold px-4 py-2 rounded-full transition-colors"
        >
          Crear cuenta gratis
        </Link>
        <Link
          to={ROUTES.AUTH.LOGIN}
          className="bg-white/10 hover:bg-white/20 text-white body-3 font-semibold px-4 py-2 rounded-full transition-colors"
        >
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}

export default function TripSharePublic() {
  const { shareId } = useParams();
  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getTripShare(shareId)
      .then((data) => {
        if (!data) setNotFound(true);
        else setShare(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [shareId]);

  const { tripDays, activitiesByDate, hasItinerary } = useMemo(() => {
    if (!share) return { tripDays: [], activitiesByDate: {}, hasItinerary: false };

    const tripDays = getTripDays(share.startDate, share.endDate);

    const activitiesByDate = (share.itinerary ?? []).reduce((acc, act) => {
      const d = act.date || 'sin-fecha';
      if (!acc[d]) acc[d] = [];
      acc[d].push(act);
      return acc;
    }, {});

    const hasItinerary = (share.itinerary ?? []).length > 0;

    return { tripDays, activitiesByDate, hasItinerary };
  }, [share]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <MinimalHeader />
        <main className="flex-1 px-4 py-6">
          <div className="max-w-7xl mx-auto flex flex-col gap-4 animate-pulse">
            <div className="bg-white rounded-2xl border border-neutral-1 overflow-hidden">
              <div className="w-full h-64 bg-neutral-1" />
              <div className="p-6 flex flex-col gap-4">
                <div className="h-8 w-2/3 bg-neutral-1 rounded" />
                <div className="h-4 w-1/2 bg-neutral-1 rounded" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <MinimalHeader />
        <main className="flex-1 px-4 py-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <MapPin className="w-16 h-16 text-neutral-2" />
            <p className="title-h3-desktop text-neutral-5">Enlace no encontrado</p>
            <p className="body-2 text-neutral-4">Este viaje ya no está disponible o el enlace es incorrecto.</p>
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="mt-2 bg-primary-3 hover:bg-orange-400 text-white body-2-semibold px-6 py-2.5 rounded-full transition-colors"
            >
              Ir a ZenTrip
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const dateLabel = formatDateRange(share.startDate, share.endDate);
  const days = countDays(share.startDate, share.endDate);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <MinimalHeader />
      <main className="flex-1 px-4 py-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
      {/* Header card */}
      <div className="bg-white rounded-2xl overflow-hidden border border-neutral-1 shadow-sm">
        {share.coverImage && (
          <div className="w-full h-56 sm:h-72">
            <img src={share.coverImage} alt={share.tripName} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="px-5 sm:px-8 py-5 sm:py-6 flex flex-col gap-3">
          <div>
            <h1 className="title-h2-desktop text-secondary-5 leading-tight">{share.shareTitle || share.tripName || 'Viaje sin nombre'}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 body-3 text-neutral-4 mt-2">
              {share.destination && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {share.destination}
                  {share.origin && <span className="text-neutral-3 ml-1">· desde {share.origin}</span>}
                </span>
              )}
              {dateLabel && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 shrink-0" />
                  {dateLabel}
                  {days && <span className="text-neutral-3">· {days} días</span>}
                </span>
              )}
              {share.participantCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 shrink-0" />
                  {share.participantCount} {share.participantCount === 1 ? 'persona' : 'personas'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-3 border-t border-neutral-1 body-3 text-neutral-3">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>Vista privada · Solo lectura</span>
          </div>
        </div>
      </div>

      {/* Join banner */}
      <JoinBanner />

      {/* Tabs */}
      <ShareContentTabs share={share} tripDays={tripDays} activitiesByDate={activitiesByDate} hasItinerary={hasItinerary} />

      <div className="flex items-start gap-2 body-3 text-neutral-3 pb-4">
        <Lock className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Notas personales y datos privados no se incluyen en esta vista.</span>
      </div>
    </div>
      </main>
    </div>
  );
}
