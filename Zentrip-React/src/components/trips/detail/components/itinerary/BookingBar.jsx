import { Hotel, Plane, Ticket, Map, Utensils } from 'lucide-react';

const BOOKING_TYPES = [
  { key: 'hoteles',      label: 'Hoteles',      Icon: Hotel },
  { key: 'vuelos',       label: 'Vuelos',       Icon: Plane },
  { key: 'actividades',  label: 'Actividades',  Icon: Ticket },
  { key: 'rutas',        label: 'Rutas',        Icon: Map },
  { key: 'restaurantes', label: 'Restaurantes', Icon: Utensils },
];

export default function BookingBar({ onBook, activeKey }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
      <span className="body-3 text-neutral-5 shrink-0 font-bold bold"><strong>Reservar:</strong></span>
      {BOOKING_TYPES.map(({ key, label, Icon }) => {
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
            <Icon size={14} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
