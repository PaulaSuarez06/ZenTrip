import { TYPE_CONFIG } from '../../../../../utils/activityConfig';

export { TYPE_CONFIG };

export function parseDate(isoStr) {
  const [y, m, d] = isoStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDayHeader(isoStr, locale = 'es') {
  const d = parseDate(isoStr);
  return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
}

export const STATUS_CONFIG = {
  reservado: { label: '✓ Reservado', className: 'bg-auxiliary-green-2 text-auxiliary-green-5' },
  pendiente: { label: 'Pendiente',   className: 'bg-neutral-1 text-neutral-4' },
  cancelado: { label: 'Cancelado',   className: 'bg-feedback-error-bg text-feedback-error' },
};
