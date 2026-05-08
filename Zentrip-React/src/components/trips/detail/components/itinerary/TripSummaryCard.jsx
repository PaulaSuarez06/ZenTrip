
function countTripDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const s = new Date(startDate + 'T00:00:00');
  const e = new Date(endDate + 'T00:00:00');
  return Math.round((e - s) / 86400000) + 1;
}

function SummaryItem({ emoji, value, label, valueNode }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-50">
      <span className="w-5 h-5 text-lg" role="img" aria-label={label}>{emoji}</span>
      {valueNode ?? <span className="body-bold text-secondary-5">{value}</span>}
      <span className="body-3 text-neutral-3 text-center leading-tight">{label}</span>
    </div>
  );
}

export default function TripSummaryCard({ trip, activityCount = 0, budget = 0, personalPackingPct = null, groupPackingPct = null }) {
  const days = countTripDays(trip?.startDate, trip?.endDate);

  const luggageValueNode = (personalPackingPct !== null || groupPackingPct !== null) ? (
    <span className="body-3 font-bold whitespace-nowrap">
      <span className="text-secondary-5">{personalPackingPct ?? '—'}%</span>
      <span className="text-neutral-3"> / </span>
      <span className="text-primary-4">{groupPackingPct ?? '—'}%</span>
    </span>
  ) : (
    <span className="body-bold text-secondary-5">—</span>
  );

  return (
    <div className="bg-white rounded-2xl border border-neutral-1 p-4">
      <p className="body-3 text-neutral-4 font-semibold uppercase tracking-wide mb-3">Resumen</p>
      <div className="grid grid-cols-2 gap-2">
        <SummaryItem emoji="📅" value={days || '—'} label="días" />
        <SummaryItem emoji="📝" value={activityCount} label="actividades" />
        <SummaryItem emoji="💸" value={budget ? Intl.NumberFormat('es', { notation: 'compact', maximumFractionDigits: 1 }).format(budget) : '—'} label="gastos" />
        <SummaryItem emoji="🧳" label="equipaje" valueNode={luggageValueNode} />
      </div>
    </div>
  );
}
