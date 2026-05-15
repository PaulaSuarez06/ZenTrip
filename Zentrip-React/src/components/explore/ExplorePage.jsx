import { useEffect, useState, useMemo, useRef } from 'react';
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

const READING_TIME_OPTIONS = [
  { key: 'short',  label: '≤ 5 min' },
  { key: 'medium', label: '5–10 min' },
  { key: 'long',   label: '> 10 min' },
];

function matchesReadingTime(article, filter) {
  const t = article.readingTime ?? 0;
  if (filter === 'short')  return t <= 5;
  if (filter === 'medium') return t > 5 && t <= 10;
  if (filter === 'long')   return t > 10;
  return true;
}

function getCreatedAtMs(article) {
  const c = article.createdAt;
  if (!c) return 0;
  if (typeof c.toDate === 'function') return c.toDate().getTime();
  if (typeof c.seconds === 'number') return c.seconds * 1000;
  return new Date(c).getTime();
}

export default function ExplorePage() {
  const [articles, setArticles]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [query, setQuery]               = useState('');
  const [filterOpen, setFilterOpen]     = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [readingTime, setReadingTime]   = useState(null);
  const [sortOrder, setSortOrder]       = useState('default');

  const panelRef  = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    getInspirations().then(data => {
      setArticles(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!filterOpen) return;
    const handleClickOutside = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [filterOpen]);

  const availableCategories = useMemo(() => {
    const seen = new Set(articles.map(a => a.category));
    return CATEGORY_CONFIG.filter(c => seen.has(c.key));
  }, [articles]);

  const activeFilterCount =
    (activeCategory ? 1 : 0) +
    (readingTime ? 1 : 0) +
    (sortOrder !== 'default' ? 1 : 0);

  const filtered = useMemo(() => {
    let result = articles;

    if (activeCategory) {
      result = result.filter(a => a.category === activeCategory);
    }
    if (readingTime) {
      result = result.filter(a => matchesReadingTime(a, readingTime));
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
    if (sortOrder === 'recent') {
      result = [...result].sort((a, b) => getCreatedAtMs(b) - getCreatedAtMs(a));
    }

    return result;
  }, [articles, activeCategory, readingTime, query, sortOrder]);

  const hasActiveFilters = activeFilterCount > 0 || !!query.trim();

  function clearAllFilters() {
    setQuery('');
    setActiveCategory(null);
    setReadingTime(null);
    setSortOrder('default');
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-8">

      {/* Cabecera */}
      <div className="mb-10">
        <p className="body-3 font-semibold text-primary-3 uppercase tracking-wide mb-1">¿Y SI...?</p>
        <h1 className="title-h2-desktop text-secondary-5">Explora ideas para tu próximo viaje</h1>
        <p className="body-2 text-neutral-4 mt-1">Ideas, rutas y experiencias para que no pares de soñar</p>
      </div>

      {/* Barra de búsqueda + botón filtrar */}
      <div className="relative flex gap-3 mb-6">
        {/* Input búsqueda */}
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-3 w-5 h-5 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
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

        {/* Botón filtrar */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setFilterOpen(prev => !prev)}
          className={`relative shrink-0 flex items-center gap-2 px-5 py-3.5 rounded-full border body-2-semibold transition-all cursor-pointer shadow-sm ${
            activeFilterCount > 0
              ? 'bg-primary-1 border-primary-3 text-primary-3'
              : 'bg-white border-neutral-2 text-neutral-5 hover:border-primary-3 hover:text-primary-3'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 9h10M10 14h4" />
          </svg>
          Filtrar
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary-3 text-white text-[10px] font-bold flex items-center justify-center shadow">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Panel de filtros desplegable */}
      {filterOpen && (
        <div
          ref={panelRef}
          className="mb-6 bg-white border border-neutral-2 rounded-2xl shadow-lg p-6 flex flex-col gap-6"
        >
          {/* Tipo de viaje */}
          <div>
            <p className="body-3 font-semibold text-neutral-5 uppercase tracking-wide mb-3">Tipo de viaje</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-1.5 rounded-full body-3 font-semibold transition-all cursor-pointer border ${
                  !activeCategory
                    ? 'bg-primary-3 text-white border-primary-3'
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
                      ? 'bg-primary-3 text-white border-primary-3'
                      : 'bg-white border-neutral-2 text-neutral-5 hover:border-primary-3 hover:text-primary-3'
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tiempo de lectura */}
          <div>
            <p className="body-3 font-semibold text-neutral-5 uppercase tracking-wide mb-3">Tiempo de lectura</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setReadingTime(null)}
                className={`px-4 py-1.5 rounded-full body-3 font-semibold transition-all cursor-pointer border ${
                  !readingTime
                    ? 'bg-primary-3 text-white border-primary-3'
                    : 'bg-white border-neutral-2 text-neutral-5 hover:border-primary-3 hover:text-primary-3'
                }`}
              >
                Cualquiera
              </button>
              {READING_TIME_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setReadingTime(readingTime === opt.key ? null : opt.key)}
                  className={`px-4 py-1.5 rounded-full body-3 font-semibold transition-all cursor-pointer border ${
                    readingTime === opt.key
                      ? 'bg-primary-3 text-white border-primary-3'
                      : 'bg-white border-neutral-2 text-neutral-5 hover:border-primary-3 hover:text-primary-3'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ordenar por */}
          <div>
            <p className="body-3 font-semibold text-neutral-5 uppercase tracking-wide mb-3">Ordenar por</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'default', label: 'Relevancia' },
                { key: 'recent',  label: '✦ Más recientes' },
              ].map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSortOrder(opt.key)}
                  className={`px-4 py-1.5 rounded-full body-3 font-semibold transition-all cursor-pointer border ${
                    sortOrder === opt.key
                      ? 'bg-primary-3 text-white border-primary-3'
                      : 'bg-white border-neutral-2 text-neutral-5 hover:border-primary-3 hover:text-primary-3'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer del panel */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-1">
            <button
              type="button"
              onClick={clearAllFilters}
              className="body-3 text-neutral-4 hover:text-neutral-6 transition-colors cursor-pointer"
            >
              Limpiar filtros
            </button>
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="px-5 py-2 rounded-full bg-primary-3 hover:bg-orange-400 text-white body-3 font-semibold transition-colors cursor-pointer"
            >
              Ver resultados
            </button>
          </div>
        </div>
      )}

      {/* Contador de resultados + limpiar */}
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
              onClick={clearAllFilters}
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
            Prueba con otra palabra clave o cambia los filtros
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
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
