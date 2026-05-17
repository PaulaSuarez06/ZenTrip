import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Users, Calendar, Lock, CalendarDays, Wallet, Ticket, Package, Image as ImageIcon } from 'lucide-react';
import { getTripShare } from '../../../services/tripShareService';
import { ROUTES } from '../../../config/routes';
import { useLanguage } from '../../../context/LanguageContext';
import { buildDateHelpers } from '../../../utils/localeDate';
import { TripContentTabs, SummarySidebar } from '../../shared/SharedTripContent';

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

function normalizeGallery(images) {
  return (images || []).map((img) => typeof img === 'string' ? { url: img, folderName: '' } : img);
}

function InfoChip({ Icon, children, glass = false }) {
  if (glass) {
    return (
      <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white body-3 font-semibold px-3 py-1 rounded-full">
        <Icon className="w-3.5 h-3.5 shrink-0" />{children}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 bg-neutral-1 text-neutral-5 body-3 font-semibold px-3 py-1.5 rounded-full">
      <Icon className="w-3.5 h-3.5 shrink-0 text-primary-3" />{children}
    </span>
  );
}

function MinimalHeader() {
  return (
    <div className="sticky top-0 z-40 px-4 pt-4">
      <header className="w-full rounded-[9999px] h-16 flex items-center justify-between pl-3 pr-3 md:pl-5 md:pr-4 lg:pl-6 lg:pr-4"
        style={{ backgroundColor: 'rgba(255,255,255,0.30)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src="/img/logo/logo-sin-texto-png.png" alt="ZenTrip" className="h-10 w-auto" />
          <span className="title-h3-desktop whitespace-nowrap mt-1">
            <span className="text-secondary-5">Zen</span><span className="text-primary-3">Trip</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to={ROUTES.AUTH.LOGIN} className="body-3 font-semibold text-neutral-5 px-4 py-2 rounded-full border border-neutral-2 bg-white/60 hover:bg-white/90 transition-colors">
            Iniciar sesión
          </Link>
          <Link to={ROUTES.AUTH.REGISTER} className="body-3 font-semibold text-white bg-primary-3 hover:bg-orange-400 px-4 py-2 rounded-full transition-colors">
            Registrarte
          </Link>
        </div>
      </header>
    </div>
  );
}

export default function TripSharePublic() {
  const { shareId } = useParams();
  const { language } = useLanguage();
  const { formatRange } = useMemo(() => buildDateHelpers(language), [language]);
  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('itinerario');

  useEffect(() => {
    getTripShare(shareId)
      .then((data) => { if (!data) setNotFound(true); else setShare(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [shareId]);

  const { tripDays, activitiesByDate, galleryPhotos } = useMemo(() => {
    if (!share) return { tripDays: [], activitiesByDate: {}, galleryPhotos: [] };
    const tripDays = getTripDays(share.startDate, share.endDate);
    const activitiesByDate = (share.itinerary ?? []).reduce((acc, act) => {
      const d = act.date || 'sin-fecha';
      if (!acc[d]) acc[d] = [];
      acc[d].push(act);
      return acc;
    }, {});
    return { tripDays, activitiesByDate, galleryPhotos: normalizeGallery(share.galleryImages) };
  }, [share]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <MinimalHeader />
        <main className="flex-1 px-4 py-6">
          <div className="max-w-7xl mx-auto flex flex-col gap-4 animate-pulse">
            <div className="bg-white rounded-2xl border border-neutral-1 overflow-hidden">
              <div className="w-full h-72 bg-neutral-1" />
              <div className="p-6 flex flex-col gap-4">
                <div className="h-8 w-2/3 bg-neutral-1 rounded-xl" />
                <div className="flex gap-2"><div className="h-7 w-28 bg-neutral-1 rounded-full" /><div className="h-7 w-24 bg-neutral-1 rounded-full" /></div>
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
            <div className="w-20 h-20 bg-neutral-1 rounded-2xl flex items-center justify-center">
              <MapPin className="w-10 h-10 text-neutral-3" />
            </div>
            <p className="title-h3-desktop text-secondary-5">Enlace no encontrado</p>
            <p className="body-2 text-neutral-4">Este viaje ya no está disponible o el enlace es incorrecto.</p>
            <Link to={ROUTES.AUTH.LOGIN} className="mt-2 bg-primary-3 hover:bg-orange-400 text-white body-2-semibold px-6 py-2.5 rounded-full transition-colors">
              Ir a ZenTrip
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const dateLabel = formatRange(share.startDate, share.endDate);
  const days = countDays(share.startDate, share.endDate);


  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <MinimalHeader />
      <main className="flex-1 px-4 py-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">

          {/* Hero */}
          <div className="bg-white rounded-2xl overflow-hidden border border-neutral-1 shadow-sm">
            {share.coverImage ? (
              <div className="relative w-full h-64 sm:h-80">
                <img src={share.coverImage} alt={share.shareTitle || share.tripName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 pb-5">
                  <h1 className="title-h2-desktop text-white leading-tight drop-shadow-sm">{share.shareTitle || share.tripName || 'Viaje sin nombre'}</h1>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {share.destination && <InfoChip Icon={MapPin} glass>{share.destination}{share.origin && ` · desde ${share.origin}`}</InfoChip>}
                    {dateLabel && <InfoChip Icon={Calendar} glass>{dateLabel}{days ? ` · ${days} días` : ''}</InfoChip>}
                    {share.participantCount > 0 && <InfoChip Icon={Users} glass>{share.participantCount} {share.participantCount === 1 ? 'persona' : 'personas'}</InfoChip>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-5 sm:px-8 pt-6 pb-4">
                <h1 className="title-h2-desktop text-secondary-5 leading-tight">{share.shareTitle || share.tripName || 'Viaje sin nombre'}</h1>
                <div className="flex flex-wrap gap-2 mt-3">
                  {share.destination && <InfoChip Icon={MapPin}>{share.destination}{share.origin && ` · desde ${share.origin}`}</InfoChip>}
                  {dateLabel && <InfoChip Icon={Calendar}>{dateLabel}{days ? ` · ${days} días` : ''}</InfoChip>}
                  {share.participantCount > 0 && <InfoChip Icon={Users}>{share.participantCount} {share.participantCount === 1 ? 'persona' : 'personas'}</InfoChip>}
                </div>
              </div>
            )}
            <div className="px-5 sm:px-8 py-3 border-t border-neutral-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 shrink-0 text-neutral-3" />
              <span className="body-3 text-neutral-3">Vista privada · Solo lectura</span>
            </div>
          </div>

          {/* Banner CTA */}
          <div className="bg-secondary-5 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex-1">
              <p className="body-bold text-white mb-1">¿Te inspira este viaje?</p>
              <p className="body-3 text-white/70">Únete a ZenTrip gratis y planifica tu propio viaje, guarda itinerarios y conecta con otros viajeros.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link to={ROUTES.AUTH.REGISTER} className="bg-primary-3 hover:bg-orange-400 text-white body-3 font-semibold px-4 py-2 rounded-full transition-colors">Crear cuenta gratis</Link>
              <Link to={ROUTES.AUTH.LOGIN} className="bg-white/10 hover:bg-white/20 text-white body-3 font-semibold px-4 py-2 rounded-full transition-colors">Iniciar sesión</Link>
            </div>
          </div>

          {/* Contenido + sidebar */}
          <div className="flex gap-4 items-start">
            <SummarySidebar data={share} />
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <TripContentTabs
                data={share}
                tripDays={tripDays}
                activitiesByDate={activitiesByDate}
                galleryPhotos={galleryPhotos}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
