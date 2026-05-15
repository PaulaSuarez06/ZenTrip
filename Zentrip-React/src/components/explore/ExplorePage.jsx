import { useEffect, useState, useMemo } from 'react';
import { getInspirations } from '../../services/inspirationsService';
import InspirationCard from '../home/components/InspirationCard';

const CATEGORY_CONFIG = [
  { key: 'ROADTRIP',    label: 'Roadtrip',    emoji: '🗺️' },
  { key: 'ISLAS',       label: 'Islas',       emoji: '🏝️' },
  { key: 'INVIERNO',    label: 'Invierno',    emoji: '❄️' },
  { key: 'GASTRONOMÍA', label: 'Gastronomía', emoji: '🍽️' },
  { key: 'AVENTURA',    label: 'Aventura',    emoji: '🧗' },
  { key: 'CIUDAD',      label: 'Ciudad',      emoji: '🏙️' },
  { key: 'PLAYA',       label: 'Playa',       emoji: '🏖️' },
  { key: 'CULTURAL',    label: 'Cultural',    emoji: '🏛️' },
  { key: 'MONTAÑA',     label: 'Montaña',     emoji: '🏔️' },
  { key: 'NATURALEZA',  label: 'Naturaleza',  emoji: '🌿' },
  { key: 'ROMÁNTICO',   label: 'Romántico',   emoji: '💕' },
  { key: 'FAMILIA',     label: 'Familia',     emoji: '👨‍👩‍👧' },
  { key: 'MOCHILERO',   label: 'Mochilero',   emoji: '🎒' },
  { key: 'LUJO',        label: 'Lujo',        emoji: '✨' },
  { key: 'FESTIVAL',    label: 'Festival',    emoji: '🎉' },
];

export default function ExplorePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    getInspirations().then(data => {
      setArticles(data);
      setLoading(false);
    });
  }, []);

  const availableCategories = useMemo(() => {
    const seen = new Set(articles.map(a => a.category));
    return CATEGORY_CONFIG.filter(c => seen.has(c.key));
  }, [articles]);

  const filtered = useMemo(() => {
    let result = articles;
    if (activeCategory) {
      result = result.filter(a => a.category === activeCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.summary?.toLowerCase().includes(q) ||
        a.destination?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [articles, activeCategory, query]);

  const hasActiveFilters = !!activeCategory || !!query.trim();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-8">

      {/* Cabecera */}
      <div className="mb-10">
        <p className="body-3 font-semibold text-primary-3 uppercase tracking-wide mb-1">¿Y SI...?</p>
        <h1 className="title-h2-desktop text-secondary-5">Explora ideas para tu próximo viaje</h1>
        <p className="body-2 text-neutral-4 mt-1">Ideas, rutas y experiencias para que no pares de soñar</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative mb-6">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-3 w-5 h-5 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Busca por destino, tipo de viaje o palabra clave..."
          className="w-full pl-12 pr-10 py-3.5 rounded-full border border-neutral-2 body-2 text-secondary-5 placeholder:text-neutral-3 focus:outline-none focus:ring-2 focus:ring-primary-3/30 focus:border-primary-3 bg-white shadow-sm transition-shadow"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-3 hover:text-neutral-5 transition-colors cursor-pointer"
            aria-label="Limpiar búsqueda"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Chips de categoría */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-1.5 rounded-full body-3 font-semibold transition-all cursor-pointer border ${
            !activeCategory
              ? 'bg-primary-3 text-white border-primary-3 shadow-sm'
              : 'bg-white border-neutral-2 text-neutral-5 hover:border-primary-3 hover:text-primary-3'
          }`}
        >
          Todos
        </button>
        {availableCategories.map(cat => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
            className={`px-4 py-1.5 rounded-full body-3 font-semibold transition-all cursor-pointer border ${
              activeCategory === cat.key
                ? 'bg-primary-3 text-white border-primary-3 shadow-sm'
                : 'bg-white border-neutral-2 text-neutral-5 hover:border-primary-3 hover:text-primary-3'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Contador de resultados + reset */}
      {!loading && (
        <div className="flex items-center justify-between mb-6">
          <p className="body-3 text-neutral-4">
            {filtered.length === 0
              ? 'Ninguna idea encontrada'
              : `${filtered.length} idea${filtered.length !== 1 ? 's' : ''} encontrada${filtered.length !== 1 ? 's' : ''}`}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => { setQuery(''); setActiveCategory(null); }}
              className="body-3 text-primary-3 hover:underline cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-neutral-1 rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <p className="text-4xl">🔍</p>
          <p className="body-bold text-secondary-5">Sin resultados</p>
          <p className="body-2 text-neutral-4">
            Prueba con otra palabra clave o elige una categoría diferente
          </p>
          <button
            type="button"
            onClick={() => { setQuery(''); setActiveCategory(null); }}
            className="mt-2 px-5 py-2 rounded-full bg-primary-3 hover:bg-orange-400 text-white body-3 font-semibold transition-colors cursor-pointer"
          >
            Ver todas las ideas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map(article => (
            <InspirationCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
