import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../config/routes";
import CategoryBar from "./CategoryBar";
import SplashScreen from "../shared/SplashScreen";
import HomeCalendar from "./HomeCalendar";
import { useHomeCalendarData } from "./hooks/useHomeCalendarData";
import { useMyTrips } from "../trips/list/hooks/useMyTrips";
import TripCard from "../trips/list/components/TripCard";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { getUserProfile } from "../../services/profileService";

const heroImages = [
  '/img/background/home/hero/img_hero_1.jpg',
  '/img/background/home/hero/img_hero_2.jpg',
  '/img/background/home/hero/img_hero_3.jpg',
  '/img/background/home/hero/img_hero_4.jpg',
  '/img/background/home/hero/img_hero_5.jpg',
  '/img/background/home/hero/img_hero_6.jpg',
];


export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile, user } = useAuth();
  const [showInviteError, setShowInviteError] = useState(searchParams.get('inviteError') === 'emailMismatch');
  const [imagenCargada, setImagenCargada] = useState(false);
  const heroImg = useMemo(() => heroImages[Math.floor(Math.random() * heroImages.length)], []);
  const { activeTripDayMap, tripNameMap, pastTripDaySet, activitiesByDate } = useHomeCalendarData();
  const { enCurso, proximos, loading: tripsLoading } = useMyTrips();
  const misViajes = [...enCurso, ...proximos].slice(0, 3);
  const [tripMeta, setTripMeta] = useState({});

  useEffect(() => {
    if (misViajes.length === 0) return;
    Promise.all(
      misViajes.map(async (trip) => {
        const [membersSnap, expSnap] = await Promise.all([
          getDocs(collection(db, 'trips', trip.id, 'members')),
          getDocs(collection(db, 'trips', trip.id, 'expenses')),
        ]);
        const members = membersSnap.docs.map((d) => d.data());
        const accepted = members.filter((m) => m.invitationStatus === 'accepted' || !m.invitationStatus);
        const coordinator = accepted.find((m) => m.role === 'coordinator');
        const totalSpent = expSnap.docs.reduce((sum, d) => {
          const e = d.data();
          return sum + (e.tripAmount ?? e.amount ?? 0);
        }, 0);
        let creatorName = '';
        if (coordinator?.uid) {
          const profile = await getUserProfile(coordinator.uid);
          creatorName = profile?.firstName || profile?.displayName || coordinator.email?.split('@')[0] || '';
        }
        return {
          tripId: trip.id,
          memberCount: accepted.length,
          creatorName,
          totalSpent,
        };
      })
    ).then((results) => {
      const map = {};
      results.forEach((r) => { map[r.tripId] = r; });
      setTripMeta(map);
    });
  }, [misViajes.map((t) => t.id).join(',')]);

  useEffect(() => {
    if (!showInviteError) return;
    setSearchParams((prev) => { prev.delete('inviteError'); return prev; }, { replace: true });
    const timer = setTimeout(() => setShowInviteError(false), 8000);
    return () => clearTimeout(timer);
  }, []);
  const registeredName =
    profile?.firstName ||
    profile?.displayName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "usuario";

  return (
    <>
      <img src={heroImg} style={{ display: 'none' }} onLoad={() => setImagenCargada(true)} alt="" />
      {!imagenCargada && <SplashScreen />}
      {imagenCargada && <>
      {showInviteError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-7 flex flex-col items-center gap-5 text-center">
            <div className="w-14 h-14 rounded-full bg-feedback-error flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-feedback-error-strong" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="title-h3-desktop text-neutral-6 mb-2">Invitación no válida</p>
              <p className="body-2 text-neutral-4">
                Esta invitación fue enviada a una dirección de correo diferente a la tuya. Cierra sesión e inicia sesión con la cuenta correcta para unirte al viaje.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowInviteError(false)}
              className="w-full bg-primary-3 hover:bg-orange-400 text-white body-2-semibold py-3 rounded-full transition duration-200"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
      <div
      style={{
        backgroundImage: `url('${heroImg}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        height: "100dvh",
        width: "calc(100% + 2rem)",
        margin: 0,
        padding: 0,
        marginLeft: "-1rem",
        marginTop: "-6.5rem",
        marginBottom: "0",
      }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.2)" }} />

      {/* Text content — left side */}
      <div className="absolute left-5 right-5 top-24 sm:left-10 sm:top-32 sm:right-auto md:left-14 md:top-36 lg:left-16 lg:top-40 max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl text-left">
        <h1 className="title-h1-mobile md:title-h1-desktop text-white">
          ¡Bienvenid@, {registeredName}!
        </h1>

        <h2 className="title-h2-mobile md:title-h2-desktop text-white mt-2">
          Plan, Pack &amp; Go
        </h2>

        <p className="body-bold text-white mt-4">
          Planifica tu próximo gran viaje o explora nuevos destinos para tu próxima aventura
        </p>

        <button
          type="button"
          onClick={() => navigate(ROUTES.TRIPS.CREATE)}
          className="mt-5 bg-primary-3 hover:bg-orange-400 text-white body-2-semibold px-5 py-2 rounded-full transition duration-200 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
        >
          Crear un nuevo viaje
        </button>

        {/* Calendar below text — oculto solo cuando pantalla ancha Y corta */}
        <div className="mt-6 w-full max-w-xs [@media(min-width:768px)_and_(max-height:800px)]:hidden">
          <HomeCalendar
            activeTripDayMap={activeTripDayMap}
            tripNameMap={tripNameMap}
            pastTripDaySet={pastTripDaySet}
            activitiesByDate={activitiesByDate}
          />
        </div>
      </div>

      {/* Calendar derecha — solo cuando pantalla ancha Y corta */}
      <div className="hidden [@media(min-width:768px)_and_(max-height:800px)]:block absolute right-14 top-36 lg:right-16 lg:top-40 w-72 lg:w-80">
        <HomeCalendar
          activeTripDayMap={activeTripDayMap}
          tripNameMap={tripNameMap}
          pastTripDaySet={pastTripDaySet}
          activitiesByDate={activitiesByDate}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <CategoryBar />
      </div>
    </div>
    {/* ── Mi espacio ── */}
    <section className="pt-20 pb-12 px-16 sm:px-24 lg:px-32">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="body-3 font-semibold text-primary-3 uppercase tracking-wide mb-1">Mi espacio</p>
            <h2 className="title-h2-desktop text-secondary-5">Mis próximos viajes</h2>
            <p className="body-2 text-neutral-4 mt-1">Continúa donde lo dejaste o empieza algo nuevo</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.TRIPS.LIST)}
            className="shrink-0 mt-1 bg-primary-1 text-primary-3 hover:bg-primary-2 body-3 font-semibold px-4 py-2 rounded-full transition-colors cursor-pointer"
          >
            Ver todos mis viajes →
          </button>
        </div>

        {tripsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-neutral-1 rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : misViajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center bg-white rounded-2xl border border-neutral-1">
            <p className="body-2 text-neutral-4">Aún no tienes viajes activos</p>
            <button
              type="button"
              onClick={() => navigate(ROUTES.TRIPS.CREATE)}
              className="px-5 py-2 rounded-full bg-primary-3 hover:bg-orange-400 text-white body-3 font-semibold transition-colors cursor-pointer"
            >
              Crear un viaje
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14">
            {misViajes.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                isDraft={false}
                memberCount={tripMeta[trip.id]?.memberCount ?? 0}
                creatorName={tripMeta[trip.id]?.creatorName ?? ''}
                totalSpent={tripMeta[trip.id]?.totalSpent}
                imageHeight="h-48"
                contentGap="gap-3"
                onClick={() => navigate(`/trips/${trip.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </>}
    </>
  );
}
