import { useEffect, useState } from 'react';
import { getInspirations } from '../../services/inspirationsService';
import InspirationCard from './components/InspirationCard';

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
    <section className="pt-8 pb-16 px-16 sm:px-24 lg:px-32">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="body-3 font-semibold text-primary-3 uppercase tracking-wide mb-1">¿Y SI...?</p>
          <h2 className="title-h2-desktop text-secondary-5">Deja que el mundo te llame</h2>
          <p className="body-2 text-neutral-4 mt-1">Ideas, rutas y experiencias para que no pares de soñar</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-neutral-1 rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(article => (
            <InspirationCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}
