import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Users, Calendar, Heart, MessageCircle, Bookmark,
  Settings, Eye, ChevronLeft, Trash2,
} from 'lucide-react';
import { getCommunityPostById, toggleLike, toggleSave, unpublishPost, recordPostView } from '../../services/communityService';
import CommentsModal from './CommentsModal';
import EditPostVisibilityModal from './EditPostVisibilityModal';
import UserAvatar from '../ui/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/routes';
import { TripContentTabs, SummarySidebar } from '../shared/SharedTripContent';
import { useLanguage } from '../../context/LanguageContext';
import { buildDateHelpers } from '../../utils/localeDate';
import { timeAgo, getTripDays, normalizeGallery } from './utils/postHelpers';
import CopyLinkButton from './components/CopyLinkButton';
import GuestBanner from './components/GuestBanner';

export default function CommunityPostPublic() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const { formatRange } = useMemo(() => buildDateHelpers(language), [language]);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState(0);
  const [likedBy, setLikedBy] = useState([]);
  const [savedBy, setSavedBy] = useState([]);
  const [viewedBy, setViewedBy] = useState([]);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('itinerario');
  const [showEditVisibility, setShowEditVisibility] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getCommunityPostById(postId).then((data) => {
      if (!data) { setNotFound(true); setLoading(false); return; }
      setPost(data);
      setLikes(data.likes ?? 0);
      setLikedBy(data.likedBy ?? []);
      setSavedBy(data.savedBy ?? []);
      setViewedBy(data.viewedBy ?? []);
      setLoading(false);
    }).catch(() => { setNotFound(true); setLoading(false); });
  }, [postId]);

  useEffect(() => {
    if (!postId || !user?.uid || !post?.userId) return;
    if (user.uid === post.userId) return;
    recordPostView(postId, user.uid);
    setViewedBy((prev) => prev.includes(user.uid) ? prev : [...prev, user.uid]);
  }, [postId, user?.uid, post?.userId]);

  const isLiked = user ? likedBy.includes(user.uid) : false;
  const isSaved = user ? savedBy.includes(user.uid) : false;
  const isOwner = user ? user.uid === post?.userId : false;

  async function handleLike() {
    if (!user || likeLoading) return;
    setLikeLoading(true);
    const nowLiked = !isLiked;
    setLikedBy((prev) => nowLiked ? [...prev, user.uid] : prev.filter((id) => id !== user.uid));
    setLikes((prev) => prev + (nowLiked ? 1 : -1));
    try { await toggleLike(post.id, user.uid, profile); }
    catch {
      setLikedBy((prev) => nowLiked ? prev.filter((id) => id !== user.uid) : [...prev, user.uid]);
      setLikes((prev) => prev + (nowLiked ? -1 : 1));
    }
    finally { setLikeLoading(false); }
  }

  function handleVisibilitySaved(updates) {
    setPost((prev) => ({ ...prev, ...updates }));
  }

  async function handleDeletePost() {
    setDeleting(true);
    try {
      await unpublishPost(post.id);
      navigate(ROUTES.COMMUNITY);
    } catch {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function handleSave() {
    if (!user || saveLoading) return;
    setSaveLoading(true);
    const nowSaved = !isSaved;
    setSavedBy((prev) => nowSaved ? [...prev, user.uid] : prev.filter((id) => id !== user.uid));
    try { await toggleSave(post.id, user.uid, profile); }
    catch { setSavedBy((prev) => nowSaved ? prev.filter((id) => id !== user.uid) : [...prev, user.uid]); }
    finally { setSaveLoading(false); }
  }

  const { tripDays, activitiesByDate, galleryPhotos } = useMemo(() => {
    if (!post) return { tripDays: [], activitiesByDate: {}, galleryPhotos: [] };
    const tripDays = getTripDays(post.startDate, post.endDate);
    const activitiesByDate = (post.itinerary ?? []).reduce((acc, act) => {
      const d = act.date || 'sin-fecha';
      if (!acc[d]) acc[d] = [];
      acc[d].push(act);
      return acc;
    }, {});
    return { tripDays, activitiesByDate, galleryPhotos: normalizeGallery(post.galleryImages) };
  }, [post]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col gap-4 animate-pulse">
        <div className="h-5 w-16 bg-neutral-1 rounded" />
        <div className="bg-white rounded-2xl border border-neutral-1 overflow-hidden">
          <div className="w-full h-64 sm:h-80 bg-neutral-1" />
          <div className="px-5 sm:px-8 py-5 flex flex-col gap-4">
            <div className="h-8 w-2/3 bg-neutral-1 rounded" />
            <div className="h-4 w-1/2 bg-neutral-1 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-32 gap-4 text-center">
        <MapPin className="w-16 h-16 text-neutral-2" />
        <p className="title-h3-desktop text-neutral-5">Publicación no encontrada</p>
        <p className="body-2 text-neutral-4">Este viaje ya no está disponible o el enlace es incorrecto.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-2 bg-primary-3 hover:bg-orange-400 text-white body-2-semibold px-6 py-2.5 rounded-full transition-colors"
        >
          Ir al inicio
        </button>
      </div>
    );
  }

  const dateLabel = formatRange(post.startDate, post.endDate);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4">
      {/* Back button — solo visible si hay sesión */}
      {user && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 body-3 text-neutral-4 hover:text-secondary-5 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver
        </button>
      )}

      {/* Header card — cover image flush at top, then content */}
      <div className="bg-white rounded-2xl overflow-hidden border border-neutral-1 shadow-sm">
        {post.coverImage ? (
          <div className="relative w-full h-64 sm:h-80">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 pb-5">
              <h1 className="title-h2-desktop text-white leading-tight drop-shadow-sm">{post.title}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {post.destination && (
                  <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white body-3 font-semibold px-3 py-1 rounded-full">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {post.destination}{post.origin && ` · desde ${post.origin}`}
                  </span>
                )}
                {dateLabel && (
                  <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white body-3 font-semibold px-3 py-1 rounded-full">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    {dateLabel}{post.days ? ` · ${post.days} días` : ''}
                  </span>
                )}
                {post.participantCount > 0 && (
                  <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white body-3 font-semibold px-3 py-1 rounded-full">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    {post.participantCount} {post.participantCount === 1 ? 'persona' : 'personas'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-5 sm:px-8 pt-6 pb-4">
            <h1 className="title-h2-desktop text-secondary-5 leading-tight">{post.title}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              {post.destination && (
                <span className="flex items-center gap-1.5 bg-neutral-1 text-neutral-5 body-3 font-semibold px-3 py-1.5 rounded-full">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-primary-3" />
                  {post.destination}{post.origin && ` · desde ${post.origin}`}
                </span>
              )}
              {dateLabel && (
                <span className="flex items-center gap-1.5 bg-neutral-1 text-neutral-5 body-3 font-semibold px-3 py-1.5 rounded-full">
                  <Calendar className="w-3.5 h-3.5 shrink-0 text-primary-3" />
                  {dateLabel}{post.days ? ` · ${post.days} días` : ''}
                </span>
              )}
              {post.participantCount > 0 && (
                <span className="flex items-center gap-1.5 bg-neutral-1 text-neutral-5 body-3 font-semibold px-3 py-1.5 rounded-full">
                  <Users className="w-3.5 h-3.5 shrink-0 text-primary-3" />
                  {post.participantCount} {post.participantCount === 1 ? 'persona' : 'personas'}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="px-5 sm:px-8 py-4 sm:py-5 flex flex-col gap-3 border-t border-neutral-1">
          {/* Author + action buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <UserAvatar
                src={post.userAvatar}
                fullName={post.username}
                sizeClass="w-9 h-9"
                backgroundColor={post.userAvatarColor}
                initialsClass="text-xs text-white font-bold"
                backgroundClass={post.userAvatarColor ? '' : 'bg-primary-3'}
              />
              <div>
                <p className="body-3 font-semibold text-secondary-5">@{post.username}</p>
                <p className="text-[11px] text-neutral-3">{timeAgo(post.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {user && (
                <>
                  <button
                    type="button"
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 body-3 px-3 py-1.5 rounded-full border transition-colors ${
                      isLiked ? 'bg-red-50 border-red-300 text-red-500' : 'border-neutral-2 text-neutral-5 hover:bg-neutral-1'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                    <span>{likes}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowComments(true)}
                    className="flex items-center gap-1.5 body-3 px-3 py-1.5 rounded-full border border-neutral-2 text-neutral-5 hover:bg-neutral-1 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.commentsCount ?? 0}</span>
                  </button>
                  {!isOwner && (
                    <button
                      type="button"
                      onClick={handleSave}
                      className={`flex items-center gap-1.5 body-3 px-3 py-1.5 rounded-full border transition-colors ${
                        isSaved ? 'bg-primary-1 border-primary-2 text-primary-3' : 'border-neutral-2 text-neutral-5 hover:bg-neutral-1'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-primary-3' : ''}`} />
                      {isSaved ? 'Guardado' : 'Guardar'}
                    </button>
                  )}
                </>
              )}
              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowEditVisibility(true)}
                    title="Editar visibilidad del viaje compartido"
                    className="flex items-center gap-1.5 body-3 font-semibold px-3 py-1.5 rounded-full border border-neutral-2 text-neutral-5 hover:bg-neutral-1 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Editar visibilidad
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    title="Borrar publicación (el viaje no se elimina)"
                    className="flex items-center gap-1.5 body-3 font-semibold px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Borrar publicación
                  </button>
                </>
              )}
              <span className="flex items-center gap-1.5 body-3 px-3 py-1.5 rounded-full border border-neutral-2 text-neutral-4">
                <Eye className="w-4 h-4" />
                {viewedBy.length}
              </span>
              <CopyLinkButton postId={post.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Guest banner */}
      {!user && <GuestBanner postId={postId} />}

      {/* Content: sidebar + tabs */}
      <div className="flex gap-4 items-start">
        <SummarySidebar data={post} />
        <div className="flex-1 min-w-0">
          <TripContentTabs
            data={post}
            tripDays={tripDays}
            activitiesByDate={activitiesByDate}
            galleryPhotos={galleryPhotos}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>


      {showComments && <CommentsModal post={post} onClose={() => setShowComments(false)} />}
      {showEditVisibility && (
        <EditPostVisibilityModal
          post={post}
          onClose={() => setShowEditVisibility(false)}
          onSaved={handleVisibilitySaved}
        />
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setShowDeleteConfirm(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="body-bold text-secondary-5">¿Borrar publicación?</p>
                <p className="body-3 text-neutral-4 mt-1">Se eliminará de la comunidad y de los guardados de otros usuarios. Tu viaje en ZenTrip no se borrará.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 border border-neutral-2 text-neutral-5 body-3 font-semibold py-2.5 rounded-full hover:bg-neutral-1 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white body-3 font-semibold py-2.5 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Borrando...</> : 'Sí, borrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
