import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInspirations } from '../../services/inspirationsService';
import InspirationCard from './components/InspirationCard';
import { ROUTES } from '../../config/routes';

const LAST_READ_KEY = 'zt_last_read_inspiration';

function getLastReadId() {
  try {
    const raw = localStorage.getItem(LAST_READ_KEY);
    if (!raw) return null;
    const { id, readAt } = JSON.parse(raw);
    return (Date.now() - readAt) < 24 * 60 * 60 * 1000 ? id : null;
  } catch {
    return null;
  }
}

function pickFour(articles, lastReadId) {
  const shuffled = [...articles].sort(() => Math.random() - 0.5);
  if (!lastReadId) return shuffled.slice(0, 4);
  const pinned = shuffled.find(a => a.id === lastReadId);
  if (!pinned) return shuffled.slice(0, 4);
  const rest = shuffled.filter(a => a.id !== lastReadId);
  return [pinned, ...rest.slice(0, 3)];
}

export default function InspirationSection() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInspirations().then(articles => {
      if (articles.length === 0) { setLoading(false); return; }
      setCards(pickFour(articles, getLastReadId()));
      setLoading(false);
    });
  }, []);

  if (!loading && cards.length === 0) return null;

  return (
    <section className="pt-6 sm:pt-8 md:pt-10 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-10">
        <div className="flex-1">
          <p className="body-3 font-semibold text-primary-3 uppercase tracking-wide mb-2 text-xs sm:text-sm">¿Y SI...?</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl title-h2-desktop text-secondary-5 font-bold mb-1 sm:mb-2">Deja que el mundo te llame</h2>
          <p className="body-2 text-neutral-4 mt-1 sm:mt-2 text-sm sm:text-base">Ideas, rutas y experiencias para que no pares de soñar</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.EXPLORE)}
          className="w-full sm:w-auto sm:shrink-0 sm:mt-1 bg-primary-1 text-primary-3 hover:bg-primary-2 body-3 font-semibold px-4 py-2.5 sm:px-4 sm:py-2 rounded-full transition-colors whitespace-nowrap cursor-pointer text-sm sm:text-base"
        >
          Ver más ideas →
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-neutral-1 rounded-xl sm:rounded-2xl h-48 sm:h-56 md:h-64 lg:h-72 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {cards.map(article => (
            <InspirationCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}
