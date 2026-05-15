import { useState, useMemo } from 'react';
import { Share2, Settings, Users } from 'lucide-react';
import ShareTripModal from '../../../community/ShareTripModal';
import { useAuth } from '../../../../context/AuthContext';
import TripActionsMenu from './TripActionsMenu';
import { useLanguage } from '../../../../context/LanguageContext';
import { buildDateHelpers } from '../../../../utils/localeDate';

function countTripDays(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const s = new Date(startDate + 'T00:00:00');
  const e = new Date(endDate + 'T00:00:00');
  return Math.round((e - s) / 86400000) + 1;
}

export default function TripDetailHeader({ trip, members, activities, currentWeather, isCreator, onEditTrip, onDeleteTrip, onLeaveTrip }) {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const { formatRange } = useMemo(() => buildDateHelpers(language), [language]);
  const [showShare, setShowShare] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const acceptedMembers = members.filter((m) => m.invitationStatus === 'accepted');
  const memberCount = acceptedMembers.length;
  const dateLabel = formatRange(trip.startDate, trip.endDate);
  const days = countTripDays(trip.startDate, trip.endDate);

  return (
    <>
    <div className="bg-white rounded-2xl border border-neutral-1 px-4 sm:px-6 py-4 sm:py-5 flex items-start justify-between gap-3 flex-wrap">
      {/* Info del viaje */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <h1 className="title-h2-mobile md:title-h2-desktop text-secondary-5 truncate">
          {trip.name || 'Viaje sin nombre'}
        </h1>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 body-3 text-neutral-4">
          <span>{dateLabel}</span>
          {days && <><span>·</span><span>{days} días</span></>}
          {memberCount > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {memberCount} {memberCount === 1 ? 'participante' : 'participantes'}
              </span>
            </>
          )}
          {trip.currency && <><span>·</span><span>{trip.currency}</span></>}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        {/* Weather chip — clima actual en el destino */}
        <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 body-3 text-blue-600">
          <span className="text-base leading-none">
            {currentWeather?.emoji ?? '🌡️'}
          </span>
          <span className="font-semibold">
            {currentWeather?.temp != null ? `${currentWeather.temp}ºC` : '—'}
          </span>
          <span className="text-blue-300">·</span>
          <span>{trip.destination || '—'}</span>
        </div>

        <button
          type="button"
          onClick={() => setShowShare(true)}
          className="flex items-center gap-1.5 border border-neutral-2 rounded-full p-2 sm:px-4 sm:py-1.5 body-3 text-neutral-5 hover:bg-neutral-1 transition-colors"
          aria-label="Compartir"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Compartir</span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setActionsOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 border rounded-full p-2 sm:px-4 sm:py-1.5 body-3 transition-colors ${actionsOpen ? 'border-secondary-3 bg-secondary-1 text-secondary-5' : 'border-neutral-2 text-neutral-5 hover:bg-neutral-1'}`}
            aria-label="Acciones"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Acciones</span>
          </button>
          {actionsOpen && (
            <TripActionsMenu
              isCreator={isCreator}
              onEditTrip={onEditTrip}
              onDeleteTrip={onDeleteTrip}
              onLeaveTrip={onLeaveTrip}
              onClose={() => setActionsOpen(false)}
            />
          )}
        </div>
      </div>
    </div>

    {showShare && (
      <ShareTripModal
        trip={trip}
        members={members}
        activities={activities}
        user={user}
        profile={profile}
        isCreator={isCreator}
        onClose={() => setShowShare(false)}
      />
    )}
    </>
  );
}
