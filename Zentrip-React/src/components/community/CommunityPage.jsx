import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Globe, User, Search, X, Users, ChevronLeft } from 'lucide-react';
import { getCommunityPosts, getSavedPosts, getUserCommunityPosts, unpublishPost } from '../../services/communityService';
import { getFollowingIds } from '../../services/followService';
import { useAuth } from '../../context/AuthContext';
import CommunityCard from './CommunityCard';
import CommentsModal from './CommentsModal';
import { ROUTES } from '../../config/routes';

const RECENT_MS = 60 * 24 * 60 * 60 * 1000;

function CardGrid({ posts, onCommentClick, onDelete, followingIds, onFollowChange, onPostUpdate }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {posts.map((post) => (
        <CommunityCard
          key={post.id}
          post={post}
          onCommentClick={onCommentClick}
          onDelete={onDelete}
          followingIds={followingIds}
          onFollowChange={onFollowChange}
          onPostUpdate={onPostUpdate}
        />
      ))}
    </div>
  );
}

function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-neutral-1 rounded-2xl h-72 animate-pulse" />
      ))}
    </div>
  );
}

const TABS = [
  { key: 'explore', label: 'Itinerarios', icon: Globe },
  { key: 'saved', label: 'Guardados', icon: Bookmark },
  { key: 'mine', label: 'Mis publicaciones', icon: User },
];

export default function CommunityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('explore');
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loadingExplore, setLoadingExplore] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loadingMine, setLoadingMine] = useState(false);
  const [commentPost, setCommentPost] = useState(null);
  const [mineError, setMineError] = useState(null);
  const [search, setSearch] = useState('');
  const [followingIds, setFollowingIds] = useState([]);

  // Load community posts on mount
  useEffect(() => {
    getCommunityPosts(40).then((data) => {
      setPosts(data);
      setLoadingExplore(false);
    }).catch(() => setLoadingExplore(false));
  }, []);

  const fetchMyPosts = useCallback(async (uid) => {
    setLoadingMine(true);
    setMineError(null);
    try {
      const data = await getUserCommunityPosts(uid);
      setMyPosts(data);
    } catch (err) {
      console.error('[Community] Error cargando mis publicaciones:', err);
      setMineError(err?.message || 'No se pudieron cargar tus publicaciones.');
    } finally {
      setLoadingMine(false);
    }
  }, []);

  // Load following IDs and own posts eagerly so banner and "mine" tab are fresh
  useEffect(() => {
    if (!user) return;
    getFollowingIds(user.uid).then(setFollowingIds).catch(console.error);
    fetchMyPosts(user.uid);
  }, [user, fetchMyPosts]);

  // Re-fetch saved posts every time user switches to that tab so new saves appear
  useEffect(() => {
    if (activeTab !== 'saved' || !user) return;
    setLoadingSaved(true);
    getSavedPosts(user.uid).then((data) => {
      setSavedPosts(data);
      setLoadingSaved(false);
    }).catch(() => setLoadingSaved(false));
  }, [activeTab, user]);

  const handleFollowChange = useCallback((userId, isNowFollowing) => {
    setFollowingIds((prev) =>
      isNowFollowing ? [...prev, userId] : prev.filter((id) => id !== userId)
    );
  }, []);

  // Sincroniza los cambios de like/save de vuelta a todas las listas para que
  // el estado sobreviva al cambio de pestaña (la card se reinicializa al remontar).
  const handlePostUpdate = useCallback((postId, updates) => {
    const patch = (list) => list.map((p) => p.id === postId ? { ...p, ...updates } : p);
    setPosts(patch);
    setMyPosts(patch);
    if ('savedBy' in updates && user && !updates.savedBy.includes(user.uid)) {
      setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
    } else {
      setSavedPosts(patch);
    }
  }, [user]);

  async function handleDelete(postId) {
    try {
      await unpublishPost(postId);
      setMyPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      // silent
    }
  }

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (p.destination && p.destination.toLowerCase().includes(q)) ||
        (p.username && p.username.toLowerCase().includes(q)) ||
        (p.title && p.title.toLowerCase().includes(q))
    );
  }, [posts, search]);

  // Recent posts from followed users (last 60 days, max 8)
  const followedRecentPosts = useMemo(() => {
    if (!followingIds.length) return [];
    const followingSet = new Set(followingIds);
    const cutoff = Date.now() - RECENT_MS;
    return filteredPosts
      .filter((p) => {
        if (!followingSet.has(p.userId)) return false;
        const ts = p.createdAt?.seconds ? p.createdAt.seconds * 1000 : new Date(p.createdAt).getTime();
        return ts > cutoff;
      })
      .slice(0, 8);
  }, [filteredPosts, followingIds]);

  // Main grid excludes posts already shown in the followed section
  const followedPostIds = useMemo(() => new Set(followedRecentPosts.map((p) => p.id)), [followedRecentPosts]);
  const mainGridPosts = useMemo(
    () => filteredPosts.filter((p) => !followedPostIds.has(p.id)),
    [filteredPosts, followedPostIds]
  );

  const visibleTabs = user ? TABS : TABS.filter((t) => t.key === 'explore');
  const hasSearch = search.trim().length > 0;
  const showCta = !user || (!loadingMine && myPosts.length === 0);

  const sharedCardProps = {
    followingIds,
    onFollowChange: handleFollowChange,
    onCommentClick: (p) => setCommentPost(p),
    onPostUpdate: handlePostUpdate,
  };

  function switchTab(key) {
    setActiveTab(key);
    setSearch('');
  }

  return (
    <div className="px-6 sm:px-10 lg:px-16 pb-16">
      {/* Back button for Community page */}
      <div className="mb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 body-3 text-neutral-4 hover:text-secondary-5 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver
        </button>
      </div>
      {/* Header */}
      <div className="pt-4 sm:pt-8 pb-4 sm:pb-6">
        <p className="body-3 font-semibold text-primary-3 uppercase tracking-wide mb-1">Comunidad</p>
        <h1 className="title-h1-desktop text-secondary-5">Itinerarios de viajeros</h1>
        <p className="body-2 text-neutral-4 mt-2 max-w-2xl">
          Descubre itinerarios reales creados por personas como tú. Inspírate, guarda y comenta los viajes que más te llamen.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-neutral-1">
        {visibleTabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => switchTab(key)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 body-3 font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? 'border-primary-3 text-primary-3'
                : 'border-transparent text-neutral-4 hover:text-neutral-5'
            }`}
          >
            <Icon className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">{label}</span>
            {key === 'mine' && user && !loadingMine && myPosts.length > 0 && (
              <span className="ml-0.5 bg-primary-1 text-primary-3 text-xs font-semibold px-1.5 py-0.5 rounded-full leading-none">
                {myPosts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search bar — visible only in explore tab */}
      {activeTab === 'explore' && (
        <div className="mb-8 relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por destino, título o usuario..."
            className="w-full pl-12 pr-10 py-3 border border-neutral-2 rounded-full body-2 text-neutral-5 placeholder:text-neutral-3 focus:outline-none focus:border-primary-3 transition-colors bg-white shadow-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-3 hover:text-neutral-5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ── Explore tab ── */}
      {activeTab === 'explore' && (
        <>
          {/* CTA banner — hidden once user has published something */}
          {showCta && (
            <div className="mb-8 bg-secondary-5 rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="body-bold text-white">¿Tienes un viaje que compartir?</p>
                <p className="body-3 text-white/70 mt-0.5">
                  Abre cualquier viaje de tu panel y pulsa «Compartir» para publicarlo en la comunidad.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(ROUTES.TRIPS.LIST)}
                className="shrink-0 bg-primary-3 hover:bg-orange-400 text-white body-3 font-semibold px-5 py-2.5 rounded-full transition-colors whitespace-nowrap"
              >
                Ir a mis viajes →
              </button>
            </div>
          )}

          {/* Followed posts section */}
          {followedRecentPosts.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-primary-3" />
                <p className="body-bold text-secondary-5">De tus seguidos</p>
                <span className="body-3 text-neutral-3 bg-neutral-1 rounded-full px-2 py-0.5">
                  {followedRecentPosts.length}
                </span>
              </div>
              <CardGrid posts={followedRecentPosts} {...sharedCardProps} />
            </section>
          )}

          {/* Main posts section */}
          {loadingExplore ? (
            <SkeletonGrid count={8} />
          ) : (() => {
            const noResults = hasSearch && mainGridPosts.length === 0 && followedRecentPosts.length === 0;

            if (noResults) {
              return (
                <div className="flex flex-col items-center gap-3 py-24 text-center">
                  <Search className="w-12 h-12 text-neutral-2" />
                  <p className="title-h3-desktop text-neutral-5">Sin resultados para «{search}»</p>
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="body-3 text-primary-3 hover:underline"
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              );
            }

            if (mainGridPosts.length === 0 && !hasSearch) {
              return (
                <div className="flex flex-col items-center gap-4 py-24 text-center">
                  <span className="text-6xl">🌍</span>
                  <p className="title-h3-desktop text-neutral-5">Aún no hay viajes publicados</p>
                  <p className="body-2 text-neutral-4">¡Sé el primero en compartir tu aventura con la comunidad!</p>
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.TRIPS.LIST)}
                    className="mt-2 bg-primary-3 hover:bg-orange-400 text-white body-2-semibold px-6 py-2.5 rounded-full transition-colors"
                  >
                    Ver mis viajes
                  </button>
                </div>
              );
            }

            return mainGridPosts.length > 0 ? (
              <>
                {followedRecentPosts.length > 0 && (
                  <p className="body-3 font-semibold text-neutral-4 mb-4">
                    {hasSearch ? 'Otros resultados' : 'Todos los itinerarios'}
                  </p>
                )}
                <CardGrid posts={mainGridPosts} {...sharedCardProps} />
              </>
            ) : null;
          })()}
        </>
      )}

      {/* ── Saved tab ── */}
      {activeTab === 'saved' && (
        loadingSaved ? (
          <SkeletonGrid count={4} />
        ) : savedPosts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <Bookmark className="w-16 h-16 text-neutral-2" />
            <p className="title-h3-desktop text-neutral-5">Aún no has guardado nada</p>
            <p className="body-2 text-neutral-4">Pulsa el icono de marcador en cualquier viaje para guardarlo aquí.</p>
            <button
              type="button"
              onClick={() => switchTab('explore')}
              className="mt-2 bg-primary-3 hover:bg-orange-400 text-white body-2-semibold px-6 py-2.5 rounded-full transition-colors"
            >
              Explorar viajes
            </button>
          </div>
        ) : (
          <CardGrid posts={savedPosts} {...sharedCardProps} />
        )
      )}

      {/* ── Mine tab ── */}
      {activeTab === 'mine' && (
        !user ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <User className="w-16 h-16 text-neutral-2" />
            <p className="title-h3-desktop text-neutral-5">Inicia sesión para ver tus publicaciones</p>
          </div>
        ) : loadingMine ? (
          <SkeletonGrid count={4} />
        ) : mineError ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <Globe className="w-16 h-16 text-neutral-2" />
            <p className="title-h3-desktop text-neutral-5">No se pudieron cargar tus publicaciones</p>
            <p className="body-3 text-neutral-3">{mineError}</p>
            <button
              type="button"
              onClick={() => fetchMyPosts(user.uid)}
              className="mt-2 bg-primary-3 hover:bg-orange-400 text-white body-2-semibold px-6 py-2.5 rounded-full transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : myPosts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <Globe className="w-16 h-16 text-neutral-2" />
            <p className="title-h3-desktop text-neutral-5">Aún no has compartido ningún viaje</p>
            <p className="body-2 text-neutral-4">Publica tu primer itinerario para que otros viajeros puedan inspirarse.</p>
            <button
              type="button"
              onClick={() => navigate(ROUTES.TRIPS.LIST)}
              className="mt-2 bg-primary-3 hover:bg-orange-400 text-white body-2-semibold px-6 py-2.5 rounded-full transition-colors"
            >
              Ir a mis viajes
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="body-3 font-semibold text-neutral-4">{myPosts.length} publicación{myPosts.length !== 1 ? 'es' : ''}</p>
              <button
                type="button"
                onClick={() => fetchMyPosts(user.uid)}
                className="body-3 text-primary-3 hover:underline"
              >
                Actualizar
              </button>
            </div>
            <CardGrid posts={myPosts} {...sharedCardProps} onDelete={handleDelete} />
          </>
        )
      )}

      {commentPost && (
        <CommentsModal post={commentPost} onClose={() => setCommentPost(null)} />
      )}
    </div>
  );
}
