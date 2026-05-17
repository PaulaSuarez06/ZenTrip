import { useNavigate } from 'react-router-dom';
import ImageLoadGate from '../../shared/ImageLoadGate';

const CATEGORY_COLOR = {
  ROADTRIP:    'text-orange-500',
  ISLAS:       'text-emerald-600',
  INVIERNO:    'text-blue-600',
  GASTRONOMÍA: 'text-orange-600',
  AVENTURA:    'text-amber-700',
  CIUDAD:      'text-rose-700',
  PLAYA:       'text-sky-600',
  CULTURAL:    'text-yellow-600',
  MONTAÑA:     'text-stone-600',
  NATURALEZA:  'text-green-700',
  ROMÁNTICO:   'text-pink-600',
  FAMILIA:     'text-violet-600',
  MOCHILERO:   'text-teal-600',
  LUJO:        'text-yellow-700',
  FESTIVAL:    'text-fuchsia-600',
};

export default function InspirationCard({ article }) {
  const navigate = useNavigate();
  const color = CATEGORY_COLOR[article.category] ?? 'text-primary-3';

  return (
    <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden border border-neutral-1 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <ImageLoadGate src={article.image} alt={article.title}>
        <div className="h-40 sm:h-44 md:h-56 overflow-hidden bg-neutral-1">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      </ImageLoadGate>
      <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-1 gap-2 sm:gap-2.5">
        <span className={`text-xs font-bold uppercase tracking-wide ${color}`}>
          {article.emoji} {article.category}
        </span>
        <h3 className="body-bold text-secondary-5 leading-tight line-clamp-2 text-sm sm:text-base">
          {article.title}
        </h3>
        <p className="body-3 text-neutral-4 line-clamp-2 flex-1 text-xs sm:text-sm">
          {article.summary}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-2 mt-1 sm:mt-2">
          <span className="body-3 text-neutral-3 text-xs">{article.readingTime} min lectura</span>
          <button
            type="button"
            onClick={() => navigate(`/inspiracion/${article.id}`)}
            className="w-full sm:w-auto bg-primary-3 hover:bg-orange-400 text-white body-3 font-semibold px-3 sm:px-4 py-2 sm:py-1.5 rounded-full transition-colors cursor-pointer text-xs sm:text-sm"
          >
            Leer →
          </button>
        </div>
      </div>
    </div>
  );
}
