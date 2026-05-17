import { TYPE_CONFIG } from '../../../utils/activityConfig';

// --- Time helpers ---

export function timeAgo(timestamp) {
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

export function getTripDays(startDate, endDate) {
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

export function formatDayHeader(dateStr, locale = 'es') {
  if (!dateStr || dateStr === 'sin-fecha') return 'Sin fecha';
  const [y, m, d] = dateStr.split('-');
  return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(+y, +m - 1, +d));
}

export function getBookingDate(booking) {
  if (booking.bookingType === 'vuelo') return booking.segments?.[0]?.date || null;
  if (booking.bookingType === 'hotel') return booking.checkIn || null;
  if (booking.bookingType === 'actividad') return booking.date || null;
  if (booking.bookingType === 'restaurante') return booking.date || null;
  if (booking.bookingType === 'coche') return booking.pickUpDate || null;
  return null;
}

// Normalise gallery: old posts have string[], new have {url, folderName}[]
export function normalizeGallery(images) {
  return (images || []).map((img) =>
    typeof img === 'string' ? { url: img, folderName: '' } : img
  );
}

// --- Config objects ---

export { TYPE_CONFIG };

export const BOOKING_TYPE_CONFIG = {
  vuelo:       { label: 'Vuelo',       Icon: Plane,    borderClass: 'border-blue-100',   iconClass: 'text-blue-500' },
  hotel:       { label: 'Hotel',       Icon: Hotel,    borderClass: 'border-teal-100',   iconClass: 'text-teal-500' },
  actividad:   { label: 'Actividad',   Icon: Compass,  borderClass: 'border-violet-100', iconClass: 'text-violet-500' },
  restaurante: { label: 'Restaurante', Icon: Utensils, borderClass: 'border-orange-100', iconClass: 'text-orange-500' },
  coche:       { label: 'Coche',       Icon: Car,      borderClass: 'border-amber-100',  iconClass: 'text-amber-500' },
};

export const EXPENSE_CATS = [
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
