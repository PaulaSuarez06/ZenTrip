import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInspirationById } from '../../services/inspirationsService';
import { ROUTES } from '../../config/routes';

const LAST_READ_KEY = 'zt_last_read_inspiration';

const CATEGORY_COLOR = {
  ROADTRIP:    'text-orange-500 bg-orange-50',
  ISLAS:       'text-emerald-600 bg-emerald-50',
  INVIERNO:    'text-blue-600 bg-blue-50',
  GASTRONOMÍA: 'text-orange-600 bg-orange-50',
  AVENTURA:    'text-amber-700 bg-amber-50',
  CIUDAD:      'text-rose-700 bg-rose-50',
  PLAYA:       'text-sky-600 bg-sky-50',
  CULTURAL:    'text-yellow-600 bg-yellow-50',
  MONTAÑA:     'text-stone-600 bg-stone-50',
  NATURALEZA:  'text-green-700 bg-green-50',
  ROMÁNTICO:   'text-pink-600 bg-pink-50',
  FAMILIA:     'text-violet-600 bg-violet-50',
  MOCHILERO:   'text-teal-600 bg-teal-50',
  LUJO:        'text-yellow-700 bg-yellow-50',
  FESTIVAL:    'text-fuchsia-600 bg-fuchsia-50',
};

export default function InspirationReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    getInspirationById(id).then(data => {
      setArticle(data);
      setLoading(false);
      if (data) {
        localStorage.setItem(LAST_READ_KEY, JSON.stringify({ id, readAt: Date.now() }));
      }
    });
  }, [id]);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) {
    return (
      <>
        <div className="fixed top-0 left-0 z-50 h-1 bg-primary-3" style={{ width: '0%' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 animate-pulse">
          <div className="h-5 sm:h-6 bg-neutral-1 rounded mb-4 sm:mb-6 w-16" />
          <div className="bg-white rounded-lg sm:rounded-t-2xl overflow-hidden border border-neutral-1">
            <div className="h-48 sm:h-72 md:h-96 bg-neutral-1" />
            <div className="px-4 sm:px-8 md:px-12 py-6 sm:py-8 flex flex-col gap-3 sm:gap-4">
              <div className="h-4 sm:h-5 bg-neutral-1 rounded w-1/4" />
              <div className="h-7 sm:h-9 bg-neutral-1 rounded w-3/4" />
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-3 sm:h-4 bg-neutral-1 rounded" />)}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-20 text-center">
        <p className="body-2 text-neutral-4 text-sm sm:text-base">Artículo no encontrado.</p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.HOME)}
          className="mt-4 text-primary-3 body-3 font-semibold hover:underline cursor-pointer text-sm sm:text-base"
        >
          ← Volver al inicio
        </button>
      </div>
    );
  }

  const colorClass = CATEGORY_COLOR[article.category] ?? 'text-primary-3 bg-primary-1';

  return (
    <>
      {/* Barra de progreso de lectura */}
      <div
        className="fixed top-0 left-0 z-50 h-1 bg-primary-3 transition-[width] duration-75"
        style={{ width: `${progress}%` }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 sm:mb-6 body-3 text-neutral-4 hover:text-secondary-5 transition-colors flex items-center gap-1 cursor-pointer"
        >
          ← Volver
        </button>

        {/* Tarjeta del artículo — imagen flush arriba, sin redondeo abajo */}
        <div className="bg-white rounded-lg sm:rounded-t-2xl overflow-hidden border border-neutral-1 shadow-sm">
          {/* Imagen de cabecera — pegada al borde del card */}
          <div className="w-full h-48 sm:h-72 md:h-96">
            <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          </div>

          {/* Contenido */}
          <div className="px-4 sm:px-8 md:px-12 py-6 sm:py-8">
            <div className="max-w-4xl ml-0 text-left">
            {/* Categoría + tiempo */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <span className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full ${colorClass}`}>
                {article.emoji} {article.category}
              </span>
              <span className="body-3 text-neutral-4 text-xs sm:text-sm">{article.readingTime} min lectura</span>
            </div>

            {/* Título */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl title-h2-desktop text-secondary-5 mb-6 sm:mb-8 md:mb-10 font-bold leading-tight">
              {article.title}
            </h1>

            {/* Cuerpo */}
            <div className="flex flex-col gap-6 sm:gap-8 md:gap-10">
              {(article.body ?? []).map((section, i) => (
                <div key={i}>
                  {section.heading && (
                    <h2 className="text-xl sm:text-2xl md:text-3xl title-h3-desktop text-secondary-5 mb-3 sm:mb-4 font-semibold">{section.heading}</h2>
                  )}
                  <div className="flex flex-col gap-3 sm:gap-4">
                    {(section.paragraphs ?? []).map((p, j) => (
                      <div
                        key={j}
                        className="body-2 text-sm sm:text-base text-neutral-5 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:mb-1"
                        dangerouslySetInnerHTML={{ __html: p }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            </div>
            {/* CTA crear viaje — full width inside card padding; button aligned to right with small gap from edge */}
            {article.destination && (
              <div className="mt-8 sm:mt-10 md:mt-14">
                <div className="p-4 sm:p-6 bg-primary-1 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="max-w-4xl w-full ml-0">
                    <p className="body-bold text-secondary-5 text-base sm:text-lg">¿Te ha inspirado?</p>
                    <p className="body-3 text-neutral-4 mt-1 text-xs sm:text-sm">Planifica tu viaje a {article.destination}</p>
                  </div>
                  <div className="w-full sm:w-auto sm:ml-auto flex justify-stretch sm:justify-end">
                    <button
                      type="button"
                      onClick={() => navigate(ROUTES.TRIPS.CREATE, { state: { prefill: { destination: article.destination } } })}
                      className="shrink-0 w-full sm:w-auto bg-primary-3 hover:bg-orange-400 text-white body-2-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-colors cursor-pointer text-sm sm:text-base"
                    >
                      Planificar viaje →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
