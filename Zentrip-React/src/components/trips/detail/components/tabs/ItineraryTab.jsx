import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useBudget } from '../budget/useBudget';
import { useAuth } from '../../../../../context/AuthContext';
import { getLuggageProgressSummary } from '../../../../../services/tripService';
import BookingBar from '../itinerary/BookingBar';
import TripSummaryCard from '../itinerary/TripSummaryCard';
import ParticipantsCard from '../itinerary/ParticipantsCard';
import DayCalendar from '../itinerary/DayCalendar';
import DayActivities from '../itinerary/DayActivities';
import HotelSearch from '../bookings/hotels/HotelSearch';
import CarSearch from '../bookings/cars/CarSearch';
import RestaurantSearch from '../bookings/restaurants/RestaurantSearch';
import ActivitySearch from '../bookings/activities/ActivitySearch';
import FlightsExplorer from '../../../../flights/FlightsExplorer';
import BookingBanner from '../bookings/BookingBanner';
import ImageLoadGate from '../../../../shared/ImageLoadGate';
import RouteExplorer from '../bookings/routes/RouteExplorer';
import PlaceholderTab from './PlaceholderTab';

const BOOKING_LABELS = {
  trenes: 'Trenes',
};

const FLIGHT_BANNER_SRC = '/img/background/bookings/plane.jpg';

export default function ItinerarioTab({
  trip,
  members,
  activities,
  activitiesByDate,
  tripDays,
  tripId,
  onAddActivity,
  onViewActivity,
  onEditActivity,
  onDeleteActivity,
  onInvite,
  initialActiveBooking = null,
  initialRouteData = null,
  onBookingOpened,
  onGoToReservas,
  weatherByDate = {},
  locationByDate = {},
  initialSelectedDay = null,
  highlightActivityId = null,
}) {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDay, setSelectedDay] = useState(() =>
    initialSelectedDay ?? (tripDays.includes(today) ? today : (tripDays[0] ?? null))
  );
  const [activeBooking, setActiveBooking] = useState(initialActiveBooking);

  const { user } = useAuth();
  const { allPersonalBudgets } = useBudget(tripId, null);
  const groupBudget = useMemo(
    () => allPersonalBudgets.reduce((s, b) => s + (b.budget ?? 0), 0),
    [allPersonalBudgets],
  );

  const [luggagePct, setLuggagePct] = useState({ personalPct: null, groupPct: null });
  useEffect(() => {
    if (!tripId || !user?.uid) return;
    getLuggageProgressSummary(tripId, user.uid).then(setLuggagePct).catch(() => {});
  }, [tripId, user?.uid]);

  useEffect(() => {
    if (initialSelectedDay) setSelectedDay(initialSelectedDay);
  }, [initialSelectedDay]);

  const handleBookingSelect = (key) => {
    const opening = activeBooking !== key;
    setActiveBooking((prev) => (prev === key ? null : key));
    if (opening) onBookingOpened?.();
  };

  const renderBookingContent = () => {
    if (activeBooking === 'hoteles') return <HotelSearch key={members.length} trip={trip} members={members} tripId={tripId} />;
    if (activeBooking === 'coches') return <CarSearch key={members.length} trip={trip} members={members} tripId={tripId} />;
    if (activeBooking === 'restaurantes') return <RestaurantSearch key={members.length} trip={trip} tripId={tripId} members={members} />;
    if (activeBooking === 'actividades') return <ActivitySearch key={members.length} trip={trip} tripId={tripId} members={members} />;
    if (activeBooking === 'rutas') {
      return (
        <RouteExplorer
          trip={trip}
          tripId={tripId}
          tripDays={tripDays}
          activitiesByDate={activitiesByDate}
          initialData={initialRouteData}
        />
      );
    }
    if (activeBooking === 'vuelos') {
      const acceptedCount = members.filter((m) => m.invitationStatus === 'accepted').length;
      return (
        <ImageLoadGate src={FLIGHT_BANNER_SRC} alt="Vuelos">
          <div className="bg-white rounded-2xl border border-neutral-1 overflow-hidden">
            <BookingBanner
              src={FLIGHT_BANNER_SRC}
              alt="Vuelos"
              title="¿Cómo llegáis?"
              subtitle="Busca vuelos para tu grupo en cualquier destino del mundo"
            />
            <div className="p-4 sm:p-6">
              <FlightsExplorer
                embedded
                tripContext={{
                  tripId,
                  tripName: trip?.name,
                  origin: trip?.origin,
                  destination: trip?.destination,
                  stops: trip?.stops ?? [],
                  memberCount: acceptedCount || 1,
                  startDate: trip?.startDate,
                  endDate: trip?.endDate,
                }}
              />
            </div>
          </div>
        </ImageLoadGate>
      );
    }
    return <PlaceholderTab label={BOOKING_LABELS[activeBooking] ?? 'Próximamente'} emoji="🚧" />;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de reservas */}
      <div className="bg-white rounded-2xl border border-neutral-1 px-4 py-3">
        <BookingBar activeKey={activeBooking} onBook={handleBookingSelect} />
      </div>

      {activeBooking ? (
        <>
          <button
            type="button"
            onClick={() => setActiveBooking(null)}
            className="flex items-center gap-1.5 body-3 text-neutral-4 hover:text-neutral-6 w-fit transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al itinerario
          </button>
          {renderBookingContent()}
        </>
      ) : (
        <>
          {/* Contenido principal: sidebar + calendario/actividades */}
          <div className="flex gap-4 items-start">
            {/* Sidebar izquierdo */}
            <div className="hidden lg:flex flex-col gap-4 w-56 shrink-0">
              <TripSummaryCard
                trip={trip}
                activityCount={activities.length}
                budget={groupBudget}
                personalPackingPct={luggagePct.personalPct}
                groupPackingPct={luggagePct.groupPct}
              />
              <ParticipantsCard members={members} onInvite={onInvite} />
            </div>

            {/* Área derecha: calendario + actividades del día */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              {tripDays.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-1 p-8 text-center">
                  <p className="body text-neutral-4">Este viaje no tiene fechas definidas</p>
                </div>
              ) : (
                <>
                  <DayCalendar
                    tripDays={tripDays}
                    selectedDay={selectedDay}
                    onSelectDay={setSelectedDay}
                    activitiesByDate={activitiesByDate}
                    weatherByDate={weatherByDate}
                  />
                  <DayActivities
                    selectedDay={selectedDay}
                    activitiesByDate={activitiesByDate}
                    onAddActivity={onAddActivity}
                    onViewActivity={onViewActivity}
                    onEditActivity={onEditActivity}
                    onDeleteActivity={onDeleteActivity}
                    onGoToReservas={onGoToReservas}
                    weatherData={selectedDay ? weatherByDate[selectedDay] : null}
                    location={selectedDay ? (locationByDate[selectedDay] || trip?.destination) : trip?.destination}
                    members={members}
                    highlightActivityId={highlightActivityId}
                  />
                </>
              )}
            </div>
          </div>

          {/* Sidebar en móvil — debajo del contenido */}
          <div className="flex flex-col gap-4 lg:hidden">
            <TripSummaryCard
              trip={trip}
              activityCount={activities.length}
              budget={groupBudget}
            />
            <ParticipantsCard members={members} onInvite={onInvite} />
          </div>
        </>
      )}
    </div>
  );
}
