import { useState, useEffect } from 'react';
import { Hotel, Plane, Ticket, Map, Utensils, Trash2 } from 'lucide-react';
import { getBookings, deleteBooking } from '../../../../../services/tripService';
import { useAuth } from '../../../../../context/AuthContext';
import { SectionLabel } from './hotels/HotelAtoms';
import HotelBookingCard from './hotels/HotelBookingCard';
import CarBookingCard from './cars/CarBookingCard';
import FlightBookingCard from './flights/FlightBookingCard';
import ActivityBookingCard from './activities/ActivityBookingCard';
import RestaurantBookingCard from './restaurants/RestaurantBookingCard';
import BookingDetailModal from './hotels/BookingDetailModal';

const SECTIONS = [
  { type: 'hotel',      label: 'Alojamiento',  Icon: Hotel,    tab: 'hoteles'      },
  { type: 'vuelo',      label: 'Vuelos',        Icon: Plane,    tab: 'vuelos'       },
  //{ type: 'car',        label: 'Coches',        Icon: Car,      tab: 'coches'       },
  { type: 'actividad',  label: 'Actividades',   Icon: Ticket,   tab: 'actividades'  },
  { type: 'restaurant', label: 'Restaurantes',  Icon: Utensils, tab: 'restaurantes' },
  { type: 'ruta',       label: 'Rutas',         Icon: Map,      tab: 'rutas'        },
];

function RouteCard({ booking, tripId, onCancelled, highlighted = false }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBooking(tripId, booking.id);
      onCancelled(booking.id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className={`bg-white border rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm ${highlighted ? 'border-transparent highlight-glow' : 'border-neutral-1'}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-primary-1 flex items-center justify-center shrink-0">
          <Map className="w-4 h-4 text-primary-4" />
        </div>
        <div className="min-w-0">
          <p className="body-2-semibold text-neutral-7 truncate">{booking.name || 'Ruta guardada'}</p>
          {booking.waypoints && booking.waypoints.length > 0 ? (
            <p className="body-3 text-neutral-5 truncate">
              De <span className="font-semibold">{typeof booking.waypoints[0] === 'string' ? booking.waypoints[0] : booking.waypoints[0]?.value || '—'}</span> a <span className="font-semibold">{typeof booking.waypoints[booking.waypoints.length - 1] === 'string' ? booking.waypoints[booking.waypoints.length - 1] : booking.waypoints[booking.waypoints.length - 1]?.value || '—'}</span>
            </p>
          ) : (
            <p className="body-3 text-neutral-4">
              {[booking.distance, booking.duration].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="p-1.5 rounded-full text-neutral-3 hover:text-feedback-error hover:bg-feedback-error-bg transition disabled:opacity-40 shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function AllBookings({ tripId, members = [], highlightBookingId, onGoBook, onRefetch }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (!tripId || !user) { setLoading(false); return; }
    setLoading(true);
    getBookings(tripId)
      .then((data) => setBookings(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tripId, user]);

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="body-2 text-neutral-4">Debes iniciar sesión para ver las reservas.</p>
      </div>
    );
  }

  const onCancelled = (id) => {
    setBookings((prev) => prev.filter((x) => x.id !== id));
    onRefetch?.();
  };

  const renderCard = (booking) => {
    const shared = {
      key: booking.id,
      booking,
      tripId,
      members,
      highlighted: booking.id === highlightBookingId,
      onCancelled,
    };
    switch (booking.type) {
      case 'hotel':      return <HotelBookingCard {...shared} onDetails={setSelectedBooking} />;
      case 'car':        return <CarBookingCard {...shared} />;
      case 'vuelo':      return <FlightBookingCard {...shared} />;
      case 'actividad':  return <ActivityBookingCard {...shared} />;
      case 'restaurant': return <RestaurantBookingCard {...shared} />;
      case 'ruta':       return <RouteCard key={booking.id} booking={booking} tripId={tripId} highlighted={booking.id === highlightBookingId} onCancelled={onCancelled} />;
      default:           return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="w-6 h-6 border-2 border-primary-3 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-4 sm:p-6 text-center py-16">
        <span className="text-5xl block mb-4">📋</span>
        <p className="body-2-semibold text-neutral-6 mb-1">Sin reservas todavía</p>
        <p className="body-3 text-neutral-4 mb-6">Empieza a añadir hoteles, vuelos, actividades y más</p>
        <div className="flex flex-wrap justify-center gap-2">
          {SECTIONS.map(({ tab, Icon, label }) => (
            <button
              key={tab}
              onClick={() => onGoBook?.(tab)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary-2 text-primary-4 body-3 font-semibold hover:bg-primary-1 transition"
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {SECTIONS.map(({ type, label, Icon }) => {
        const group = bookings.filter((b) => b.type === type);
        if (group.length === 0) return null;
        return (
          <div key={type} className="mb-7">
            <SectionLabel><span className="flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" />{label}</span></SectionLabel>
            <div className="flex flex-col gap-3">
              {group.map(renderCard)}
            </div>
          </div>
        );
      })}

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          tripId={tripId}
          onClose={() => setSelectedBooking(null)}
          onUpdated={(updated) => {
            setBookings((prev) => prev.map((b) => b.id === updated.id ? updated : b));
            setSelectedBooking(updated);
          }}
        />
      )}
    </div>
  );
}
