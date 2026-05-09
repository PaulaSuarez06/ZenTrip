import { useNavigate } from 'react-router-dom';

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
    <div className="bg-white rounded-2xl overflow-hidden border border-neutral-1 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="h-44 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <span className={`text-xs font-bold uppercase tracking-wide ${color}`}>
          {article.emoji} {article.category}
        </span>
        <h3 className="body-bold text-secondary-5 leading-tight line-clamp-2">
          {article.title}
        </h3>
        <p className="body-3 text-neutral-4 line-clamp-2 flex-1">
          {article.summary}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="body-3 text-neutral-3">{article.readingTime} min lectura</span>
          <button
            type="button"
            onClick={() => navigate(`/inspiracion/${article.id}`)}
            className="bg-primary-3 hover:bg-orange-400 text-white body-3 font-semibold px-4 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            Leer →
          </button>
        </div>
      </div>
    </div>
  );
}
