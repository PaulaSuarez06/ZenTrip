const BOOKING_TYPES = [
  { key: 'hoteles',      label: 'Hoteles',      emoji: '🏨' },
  { key: 'vuelos',       label: 'Vuelos',       emoji: '✈️' },
  { key: 'actividades',  label: 'Actividades',  emoji: '🎯' },
  { key: 'rutas',        label: 'Rutas',        emoji: '🗺️' },
  { key: 'restaurantes', label: 'Restaurantes', emoji: '🍽️' },
];

export default function BookingBar({ onBook, activeKey }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
      <span className="body-3 text-neutral-5 shrink-0 font-bold bold"><strong>Reservar:</strong></span>
      {BOOKING_TYPES.map(({ key, label, emoji }) => {
        const isActive = key === activeKey;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onBook?.(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border body-3 transition-colors shrink-0 whitespace-nowrap
              ${isActive
                ? 'border-primary-3 bg-primary-1 text-primary-3'
                : 'border-neutral-1 bg-white text-neutral-5 hover:border-primary-3 hover:bg-primary-1 hover:text-primary-3'
              }`}
          >
            <span>{emoji}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
