export function parseDate(isoStr) {
  const [y, m, d] = isoStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDayHeader(isoStr, locale = 'es') {
  const d = parseDate(isoStr);
  return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
}

export const TYPE_CONFIG = {
  actividad:   { label: 'Actividad',    badgeClass: 'bg-violet-100 text-violet-600' },
  restaurante: { label: 'Restaurante',  badgeClass: 'bg-orange-100 text-orange-600' },
  restaurant:  { label: 'Restaurante',  badgeClass: 'bg-orange-100 text-orange-600' },
  hotel:       { label: 'Hotel',        badgeClass: 'bg-blue-100 text-blue-600' },
  vuelo:       { label: 'Vuelo',        badgeClass: 'bg-cyan-100 text-cyan-700' },
  tren:        { label: 'Tren',         badgeClass: 'bg-indigo-100 text-indigo-600' },
  coche:       { label: 'Coche',        badgeClass: 'bg-amber-100 text-amber-600' },
  car:         { label: 'Coche',        badgeClass: 'bg-amber-100 text-amber-600' },
  ruta:        { label: 'Ruta',         badgeClass: 'bg-emerald-100 text-emerald-600' },
};

export const STATUS_CONFIG = {
  reservado: { label: '✓ Reservado', className: 'bg-auxiliary-green-2 text-auxiliary-green-5' },
  pendiente: { label: 'Pendiente',   className: 'bg-neutral-1 text-neutral-4' },
  cancelado: { label: 'Cancelado',   className: 'bg-feedback-error-bg text-feedback-error' },
};
