import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, ExternalLink } from 'lucide-react';
import { fmtDate } from './hotelUtils';
import { SectionLabel } from './HotelAtoms';
import BookingDetailModal from './BookingDetailModal';
import { useAuth } from '../../../../../../context/AuthContext';
import { getBookings, deleteBooking, deleteActivity } from '../../../../../../services/tripService';

function CancelBookingModal({ booking, tripId, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await deleteBooking(tripId, booking.id);
      if (booking.activityId) {
        await deleteActivity(tripId, booking.activityId);
      }
      onConfirm();
      window.location.reload();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-neutral-7/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl p-6">
        <h3 className="title-h3-desktop text-neutral-7 mb-2">¿Cancelar reserva?</h3>
        <p className="body-2 text-neutral-5 mb-4">
          Esto eliminará la reserva de ZenTrip, pero <span className="font-bold text-neutral-7">debes cancelarla también en el sitio web</span> donde la hiciste para evitar cargos.
        </p>
        {booking.bookingUrl && (
          <a
            href={booking.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-10 rounded-lg border border-secondary-3 text-secondary-3 body-3 font-bold hover:bg-secondary-1 transition mb-4"
          >
            Ir a Booking.com para cancelar
          </a>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-neutral-2 body-3 font-bold text-neutral-5 hover:bg-neutral-1 transition"
          >
            Volver
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 h-10 rounded-lg bg-feedback-error text-white body-3 font-bold hover:opacity-90 transition disabled:opacity-50"
          >
            {deleting ? 'Eliminando…' : 'Sí, cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CancelBookingButton({ booking, tripId, onCancelled }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="h-9 px-3 rounded-lg border border-feedback-error text-feedback-error-strong body-3 font-bold flex items-center justify-center hover:bg-red-50 transition w-full sm:w-auto"
      >
        Cancelar reserva
      </button>
      {showModal && (
        <CancelBookingModal
          booking={booking}
          tripId={tripId}
          onConfirm={() => { setShowModal(false); onCancelled(); }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

export default function HotelSearch({ trip, members = [], tripId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [existingBookings, setExistingBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (!tripId || !user) return;
    getBookings(tripId)
      .then((data) => setExistingBookings(data.filter((b) => b.type === 'hotel')))
      .catch(() => {});
  }, [tripId, user]);

  const handleSearch = () => {
    const acceptedCount = members.filter((m) => m.invitationStatus === 'accepted').length;
    navigate('/hotels', {
      state: {
        tripContext: {
          tripId,
          tripName: trip?.name,
          destination: trip?.destination,
          startDate: trip?.startDate,
          endDate: trip?.endDate,
          memberCount: acceptedCount || 1,
          currency: trip?.currency || 'EUR',
        },
      },
    });
  };

  if (!user) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 bg-primary-1 rounded-[50%_50%_50%_0] mx-auto mb-4 flex items-center justify-center text-2xl">
          🔒
        </div>
        <h2 className="title-h3-desktop text-neutral-7 mb-2">Acceso restringido</h2>
        <p className="body-2 text-neutral-4">Debes iniciar sesión para ver hoteles.</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <div className="text-center mb-7">
        <div className="w-14 h-14 bg-primary-1 rounded-[50%_50%_50%_0] mx-auto mb-3 flex items-center justify-center text-2xl">
          🏨
        </div>
        <h2 className="title-h3-desktop text-neutral-7 mb-1">Hoteles del viaje</h2>
        <p className="body-2 text-neutral-4">Busca y guarda el alojamiento de tu grupo en un solo lugar</p>
      </div>

      {/* Reservas existentes */}
      {existingBookings.length > 0 && (
        <div className="mb-7">
          <SectionLabel>Alojamiento reservado</SectionLabel>
          <div className="flex flex-col gap-3">
            {existingBookings.map((b) => (
              <div key={b.id} className="bg-auxiliary-green-1 border border-auxiliary-green-3 rounded-xl px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(b)}
                  className="w-full text-left mb-3 hover:opacity-80 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🏨</span>
                      <div>
                        <p className="body-2-semibold text-neutral-7">{b.hotelName}</p>
                        <p className="body-3 text-neutral-4">{fmtDate(b.checkIn)} → {fmtDate(b.checkOut)} · {b.nights} noche{b.nights !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    {b.pricePerNight != null && (
                      <div className="text-right shrink-0">
                        <p className="body-2-semibold text-auxiliary-green-5">{b.pricePerNight} {b.currency}<span className="body-3 font-normal"> /noche</span></p>
                        <p className="body-3 text-neutral-4">{b.totalPrice} {b.currency} total</p>
                      </div>
                    )}
                  </div>
                </button>
                <div className="flex flex-col sm:flex-row gap-2">
                  {b.bookingUrl && (
                    <a
                      href={b.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 h-9 rounded-lg border border-auxiliary-green-4 text-auxiliary-green-5 body-3 font-bold flex items-center justify-center gap-1.5 hover:bg-auxiliary-green-2 transition"
                    >
                      Ver en Booking.com
                    </a>
                  )}
                  <CancelBookingButton
                    booking={b}
                    tripId={tripId}
                    onCancelled={() => setExistingBookings((prev) => prev.filter((x) => x.id !== b.id))}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA buscar */}
      <button
        onClick={handleSearch}
        className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl border-2 border-dashed border-primary-2 hover:border-primary-3 hover:bg-primary-1 transition group"
      >
        <div className="w-10 h-10 rounded-full bg-primary-1 group-hover:bg-primary-2 flex items-center justify-center transition shrink-0">
          <Hotel className="w-5 h-5 text-primary-4" />
        </div>
        <div className="text-left">
          <p className="body-semibold text-primary-4">Buscar hoteles</p>
          <p className="body-3 text-neutral-4 flex items-center gap-1">
            Abre el buscador de hoteles <ExternalLink className="w-3 h-3" />
          </p>
        </div>
      </button>

      {/* Info */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {[
          { icon: '🔍', title: 'Busca y compara', desc: 'Filtra por precio, estrellas y puntuación' },
          { icon: '✅', title: 'Guarda en el viaje', desc: 'El hotel queda en el itinerario del grupo' },
          { icon: '👥', title: 'Para todo el grupo', desc: 'Indica habitaciones y adultos' },
          { icon: '📄', title: 'Comprobante incluido', desc: 'Sube la captura de la reserva' },
        ].map((t) => (
          <div key={t.title} className="bg-neutral-1/60 rounded-xl p-3">
            <p className="text-lg mb-1">{t.icon}</p>
            <p className="body-3 font-semibold text-neutral-6">{t.title}</p>
            <p className="body-3 text-neutral-4">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* Modal de reserva existente */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          tripId={tripId}
          onClose={() => setSelectedBooking(null)}
          onUpdated={(updated) => {
            setExistingBookings((prev) => prev.map((b) => b.id === updated.id ? updated : b));
            setSelectedBooking(updated);
          }}
        />
      )}
    </>
  );
}
