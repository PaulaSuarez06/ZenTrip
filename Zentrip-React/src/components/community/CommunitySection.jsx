import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCommunityPosts } from '../../services/communityService';
import { getFollowingIds } from '../../services/followService';
import { useAuth } from '../../context/AuthContext';
import CommunityCard from './CommunityCard';
import { ROUTES } from '../../config/routes';

function pickFour(posts) {
  const shuffled = [...posts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
}

export default function CommunitySection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState([]);

  useEffect(() => {
    getCommunityPosts(30).then((posts) => {
      setCards(pickFour(posts));
      setLoading(false);
    }).catch((err) => { console.error('[CommunitySection]', err); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!user) return;
    getFollowingIds(user.uid).then(setFollowingIds).catch((err) => console.error('[follows] Error cargando seguidos:', err));
  }, [user]);

  const handleFollowChange = useCallback((userId, isNowFollowing) => {
    setFollowingIds((prev) =>
      isNowFollowing ? [...prev, userId] : prev.filter((id) => id !== userId)
    );
  }, []);

  if (!loading && cards.length === 0) return null;

  return (
    <section className="pt-8 pb-16 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="body-3 font-semibold text-primary-3 uppercase tracking-wide mb-1">Comunidad</p>
          <h2 className="title-h2-desktop text-secondary-5">Viajes de otros viajeros</h2>
          <p className="body-2 text-neutral-4 mt-1">Descubre itinerarios reales creados por personas como tú</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.COMMUNITY)}
          className="shrink-0 mt-1 bg-primary-1 text-primary-3 hover:bg-primary-2 body-3 font-semibold px-4 py-2 rounded-full transition-colors cursor-pointer"
        >
          Ver más ideas →
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-neutral-1 rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((post) => (
            <CommunityCard
              key={post.id}
              post={post}
              followingIds={followingIds}
              onFollowChange={handleFollowChange}
            />
          ))}
        </div>
      )}

      {/* CTA banner */}
      <div className="mt-8 bg-secondary-5 rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="body-bold text-white">¿Quieres compartir tu próximo viaje?</p>
          <p className="body-3 text-white/70 mt-0.5">
            Publica tu itinerario, inspira a otros viajeros y descubre rutas reales de gente real.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.COMMUNITY)}
          className="shrink-0 bg-primary-3 hover:bg-orange-400 text-white body-3 font-semibold px-5 py-2.5 rounded-full transition-colors whitespace-nowrap"
        >
          Unirse a la comunidad →
        </button>
      </div>
    </section>
  );
}
