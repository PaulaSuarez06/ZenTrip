import { MapPin } from 'lucide-react';
import { ScoreBadge, StarRow } from './HotelAtoms';

export default function HotelCard({ hotel, onView }) {
  return (
    <div className="flex flex-col sm:flex-row bg-white border border-neutral-1 rounded-xl overflow-hidden hover:border-primary-2 hover:shadow-md transition-all cursor-pointer">
      {/* Imagen */}
      <div className="w-full h-40 sm:h-auto sm:w-28 sm:shrink-0 bg-secondary-1 flex items-center justify-center overflow-hidden">
        {hotel.photo
          ? <img src={hotel.photo} alt={hotel.name} className="w-full h-full object-cover" />
          : <span className="text-4xl">🏨</span>
        }
      </div>

      {/* Info */}
      <div className="flex-1 p-3 sm:border-r border-neutral-1 min-w-0">
        <p className="body-2-semibold text-neutral-7 leading-tight mb-1">{hotel.name}</p>

        {hotel.loc && (
          <p className="flex items-center gap-1 body-3 text-neutral-4 mb-2">
            <MapPin className="w-3 h-3 shrink-0" />
            {hotel.loc}
          </p>
        )}

        <StarRow stars={hotel.stars} />

        {hotel.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {hotel.tags.map((tag) => (
              <span key={tag} className="text-[11px] px-2 py-0.5 bg-neutral-1 text-neutral-5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {hotel.reviewScoreWord && (
          <p className="body-3 text-neutral-4 mt-1.5">
            {hotel.reviewScoreWord} · {hotel.reviewCount.toLocaleString()} valoraciones
          </p>
        )}
      </div>

      {/* Precio + acción */}
      <div className="w-full sm:w-36 sm:shrink-0 p-3 border-t sm:border-t-0 border-neutral-1 flex flex-col gap-3 sm:gap-0 sm:justify-between items-start sm:items-end">
        <div className="text-left sm:text-right">
          <ScoreBadge score={hotel.score} />
          {hotel.price != null ? (
            <div className="mt-2">
              <p className="body-3 text-neutral-4">desde</p>
              <p className="title-h3-desktop text-neutral-7 leading-tight">
                {hotel.price} {hotel.currency}
              </p>
              <p className="body-3 text-neutral-4">/ noche</p>
            </div>
          ) : (
            <p className="body-3 text-neutral-4 mt-2">Precio no disponible</p>
          )}
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1.5 w-full sm:w-auto">
          <span className="text-[11px] font-bold px-2 py-1 bg-auxiliary-green-2 text-auxiliary-green-5 rounded-full font-titles">
            {hotel.avail}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onView(hotel); }}
            className="body-3 font-semibold px-3 py-1.5 rounded-lg border border-primary-3 text-primary-3 bg-white hover:bg-primary-1 transition whitespace-nowrap w-full sm:w-auto"
          >
            Ver hotel →
          </button>
        </div>
      </div>
    </div>
  );
}
