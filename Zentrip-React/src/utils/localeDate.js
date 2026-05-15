// Jan 1, 2024 = Monday — usamos esta fecha como ancla para generar nombres de días en orden Lun-Dom
const ANCHOR_MONDAY = new Date(2024, 0, 1);

export function buildDateHelpers(locale) {
  const shortMonthFmt = new Intl.DateTimeFormat(locale, { month: 'short' });
  const longMonthFmt  = new Intl.DateTimeFormat(locale, { month: 'long' });
  const shortDayFmt   = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const longDayFmt    = new Intl.DateTimeFormat(locale, { weekday: 'long' });

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const monthsShort    = Array.from({ length: 12 }, (_, i) => shortMonthFmt.format(new Date(2024, i, 1)));
  const monthsLong     = Array.from({ length: 12 }, (_, i) => cap(longMonthFmt.format(new Date(2024, i, 1))));
  const dayNamesShort  = Array.from({ length: 7 },  (_, i) => {
    const s = shortDayFmt.format(new Date(ANCHOR_MONDAY.getTime() + i * 86400000));
    return cap(s).slice(0, 3);
  });
  const dayNamesLong   = Array.from({ length: 7 },  (_, i) => cap(longDayFmt.format(new Date(ANCHOR_MONDAY.getTime() + i * 86400000))));

  function formatRange(startISO, endISO) {
    if (!startISO && !endISO) return null;
    const fmt = (iso) => { const [y,m,d] = iso.split('-'); return new Date(+y, +m-1, +d); };
    if (startISO && endISO) {
      const s = fmt(startISO), e = fmt(endISO);
      if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth())
        return `${s.getDate()} - ${e.getDate()} ${monthsShort[s.getMonth()]} ${s.getFullYear()}`;
      return `${s.getDate()} ${monthsShort[s.getMonth()]} - ${e.getDate()} ${monthsShort[e.getMonth()]} ${e.getFullYear()}`;
    }
    const d = fmt(startISO || endISO);
    return `${d.getDate()} ${monthsLong[d.getMonth()]} ${d.getFullYear()}`;
  }

  function formatDayHeader(dateStr) {
    if (!dateStr || dateStr === 'sin-fecha') return locale === 'es' ? 'Sin fecha' : '';
    const [y, m, d] = dateStr.split('-');
    const date = new Date(+y, +m - 1, +d);
    const dow = (date.getDay() + 6) % 7; // Monday = 0
    return `${dayNamesLong[dow]}, ${date.getDate()} ${monthsShort[+m - 1]} ${y}`;
  }

  return { monthsShort, monthsLong, dayNamesShort, dayNamesLong, formatRange, formatDayHeader };
}
