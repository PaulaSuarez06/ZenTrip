import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Globe, User, Search, X } from 'lucide-react';
import { getCommunityPosts, getSavedPosts, getUserCommunityPosts, unpublishPost } from '../../services/communityService';
import { useAuth } from '../../context/AuthContext';
import CommunityCard from './CommunityCard';
import CommentsModal from './CommentsModal';
import { ROUTES } from '../../config/routes';

function PostGrid({ posts, loading, skeletonCount = 8, onCommentClick, onDelete, emptyNode }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="bg-neutral-1 rounded-2xl h-72 animate-pulse" />
        ))}
      </div>
    );
  }
  if (posts.length === 0) return emptyNode;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {posts.map((post) => (
        <CommunityCard key={post.id} post={post} onCommentClick={onCommentClick} onDelete={onDelete} />
      ))}
    </div>
  );
}

const TABS = [
  { key: 'explore', label: 'Itinerarios', icon: Globe },
  { key: 'saved',   label: 'Guardados',   icon: Bookmark },
  { key: 'mine',    label: 'Mis publicaciones', icon: User },
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
  const [savedLoaded, setSavedLoaded] = useState(false);
  const [mineLoaded, setMineLoaded] = useState(false);
  const [commentPost, setCommentPost] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getCommunityPosts(40).then((data) => {
      setPosts(data);
      setLoadingExplore(false);
    }).catch(() => setLoadingExplore(false));
  }, []);

  useEffect(() => {
    if (activeTab !== 'saved' || savedLoaded || !user) return;
    setLoadingSaved(true);
    getSavedPosts(user.uid).then((data) => {
      setSavedPosts(data);
      setLoadingSaved(false);
      setSavedLoaded(true);
    }).catch(() => setLoadingSaved(false));
  }, [activeTab, savedLoaded, user]);

  useEffect(() => {
    if (activeTab !== 'mine' || mineLoaded || !user) return;
    setLoadingMine(true);
    getUserCommunityPosts(user.uid).then((data) => {
      setMyPosts(data);
      setLoadingMine(false);
      setMineLoaded(true);
    }).catch(() => setLoadingMine(false));
  }, [activeTab, mineLoaded, user]);

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

  const visibleTabs = user ? TABS : TABS.filter((t) => t.key === 'explore');

  return (
    <div className="px-6 sm:px-10 lg:px-16 pb-16">
      {/* Header */}
      <div className="pt-10 pb-6">
        <p className="body-3 font-semibold text-primary-3 uppercase tracking-wide mb-1">Comunidad</p>
        <h1 className="title-h1-desktop text-secondary-5">Itinerarios de viajeros</h1>
        <p className="body-2 text-neutral-4 mt-2">
          Descubre itinerarios reales creados por personas como tú. Inspírate, guarda y comenta los viajes que más te llamen.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-neutral-1">
        {visibleTabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 body-3 font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? 'border-primary-3 text-primary-3'
                : 'border-transparent text-neutral-4 hover:text-neutral-5'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Explorar tab */}
      {activeTab === 'explore' && (
        <>
          <div className="mb-6 bg-secondary-5 rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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

          {/* Buscador */}
          <div className="mb-6 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por destino o usuario..."
              className="w-full pl-9 pr-9 py-2 border border-neutral-2 rounded-full body-3 text-neutral-5 placeholder:text-neutral-3 focus:outline-none focus:border-primary-3 transition-colors bg-white"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-3 hover:text-neutral-5">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <PostGrid
            posts={filteredPosts}
            loading={loadingExplore}
            onCommentClick={(p) => setCommentPost(p)}
            emptyNode={
              search ? (
                <div className="flex flex-col items-center gap-3 py-24 text-center">
                  <Search className="w-12 h-12 text-neutral-2" />
                  <p className="title-h3-desktop text-neutral-5">Sin resultados para «{search}»</p>
                  <button type="button" onClick={() => setSearch('')} className="body-3 text-primary-3 hover:underline">Limpiar búsqueda</button>
                </div>
              ) : (
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
              )
            }
          />
        </>
      )}

      {/* Guardados tab */}
      {activeTab === 'saved' && (
        <PostGrid
          posts={savedPosts}
          loading={loadingSaved}
          skeletonCount={4}
          onCommentClick={(p) => setCommentPost(p)}
          emptyNode={
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <Bookmark className="w-16 h-16 text-neutral-2" />
              <p className="title-h3-desktop text-neutral-5">Aún no has guardado nada</p>
              <p className="body-2 text-neutral-4">Pulsa el icono de marcador en cualquier viaje para guardarlo aquí.</p>
              <button
                type="button"
                onClick={() => setActiveTab('explore')}
                className="mt-2 bg-primary-3 hover:bg-orange-400 text-white body-2-semibold px-6 py-2.5 rounded-full transition-colors"
              >
                Explorar viajes
              </button>
            </div>
          }
        />
      )}

      {/* Mis publicaciones tab */}
      {activeTab === 'mine' && (
        <>
          {!user ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <User className="w-16 h-16 text-neutral-2" />
              <p className="title-h3-desktop text-neutral-5">Inicia sesión para ver tus publicaciones</p>
            </div>
          ) : (
            <PostGrid
              posts={myPosts}
              loading={loadingMine}
              skeletonCount={4}
              onCommentClick={(p) => setCommentPost(p)}
              onDelete={handleDelete}
              emptyNode={
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
              }
            />
          )}
        </>
      )}

      {commentPost && (
        <CommentsModal post={commentPost} onClose={() => setCommentPost(null)} />
      )}
    </div>
  );
}
