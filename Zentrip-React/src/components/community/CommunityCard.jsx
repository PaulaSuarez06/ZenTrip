import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, MapPin, Users, Calendar, Copy, Check, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toggleLike, toggleSave } from '../../services/communityService';
import { followUser, unfollowUser } from '../../services/followService';
import UserAvatar from '../ui/UserAvatar';

function useCopyLink(postId) {
  const [copied, setCopied] = useState(false);
  async function copy(e) {
    e.stopPropagation();
    const url = `${window.location.origin}/p/${postId}`;
    try { await navigator.clipboard.writeText(url); }
    catch { const el = document.createElement('textarea'); el.value = url; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return { copied, copy };
}

const MONTHS_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function timeAgo(timestamp) {
  if (!timestamp) return '';
  const ts = timestamp?.seconds ? timestamp.seconds * 1000 : new Date(timestamp).getTime();
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins || 1} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `hace ${days} día${days !== 1 ? 's' : ''}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `hace ${weeks} sem`;
  const months = Math.floor(days / 30);
  return `hace ${months} mes${months !== 1 ? 'es' : ''}`;
}

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return null;
  const parse = (d) => { const [y, m, day] = d.split('-'); return { y: +y, m: +m - 1, d: +day }; };
  if (startDate && endDate) {
    const s = parse(startDate);
    const e = parse(endDate);
    if (s.y === e.y && s.m === e.m)
      return `${s.d}-${e.d} ${MONTHS_SHORT[s.m]} ${s.y}`;
    return `${s.d} ${MONTHS_SHORT[s.m]} - ${e.d} ${MONTHS_SHORT[e.m]} ${e.y}`;
  }
  return null;
}

export default function CommunityCard({ post, onCommentClick, onDelete, followingIds = [], onFollowChange, onPostUpdate }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { copied, copy } = useCopyLink(post.id);
  const [likes, setLikes] = useState(post.likes ?? 0);
  const [likedBy, setLikedBy] = useState(post.likedBy ?? []);
  const [savedBy, setSavedBy] = useState(post.savedBy ?? []);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isLiked = user ? likedBy.includes(user.uid) : false;
  const isSaved = user ? savedBy.includes(user.uid) : false;
  const isOwner = user ? user.uid === post.userId : false;
  const dateLabel = formatDateRange(post.startDate, post.endDate);

  useEffect(() => {
    setFollowing(followingIds.includes(post.userId));
  }, [followingIds, post.userId]);

  async function handleLike(e) {
    e.stopPropagation();
    if (!user || likeLoading) return;
    setLikeLoading(true);
    const prevLikedBy = likedBy;
    const prevLikes = likes;
    const nowLiked = !isLiked;
    const newLikedBy = nowLiked ? [...prevLikedBy, user.uid] : prevLikedBy.filter((id) => id !== user.uid);
    const newLikes = prevLikes + (nowLiked ? 1 : -1);
    setLikedBy(newLikedBy);
    setLikes(newLikes);
    onPostUpdate?.(post.id, { likedBy: newLikedBy, likes: newLikes });
    try {
      await toggleLike(post.id, user.uid);
    } catch {
      setLikedBy(prevLikedBy);
      setLikes(prevLikes);
      onPostUpdate?.(post.id, { likedBy: prevLikedBy, likes: prevLikes });
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleSave(e) {
    e.stopPropagation();
    if (!user || saveLoading) return;
    setSaveLoading(true);
    const prevSavedBy = savedBy;
    const nowSaved = !isSaved;
    const newSavedBy = nowSaved ? [...prevSavedBy, user.uid] : prevSavedBy.filter((id) => id !== user.uid);
    setSavedBy(newSavedBy);
    onPostUpdate?.(post.id, { savedBy: newSavedBy });
    try {
      await toggleSave(post.id, user.uid);
    } catch {
      setSavedBy(prevSavedBy);
      onPostUpdate?.(post.id, { savedBy: prevSavedBy });
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleFollow(e) {
    e.stopPropagation();
    if (!user || followLoading) return;
    setFollowLoading(true);
    const nowFollowing = !following;
    setFollowing(nowFollowing);
    try {
      if (nowFollowing) {
        await followUser(user.uid, post.userId);
      } else {
        await unfollowUser(user.uid, post.userId);
      }
      onFollowChange?.(post.userId, nowFollowing);
    } catch (err) {
      console.error('[follows] Error al seguir/dejar de seguir:', err);
      setFollowing(!nowFollowing);
    } finally {
      setFollowLoading(false);
    }
  }

  async function handleDelete(e) {
    e.stopPropagation();
    setDeleting(true);
    try {
      await onDelete?.(post.id);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border border-neutral-1 shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer"
      onClick={() => navigate(`/p/${post.id}`)}
    >
      {/* Cover image */}
      <div className="relative h-44 overflow-hidden bg-neutral-1">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            ✈️
          </div>
        )}

        {/* Time ago badge */}
        <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          {timeAgo(post.createdAt)}
        </span>

        {/* User avatar + username + follow */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5">
          <UserAvatar
            src={post.userAvatar}
            fullName={post.username}
            sizeClass="w-7 h-7"
            backgroundColor={post.userAvatarColor}
            initialsClass="text-[10px] text-white font-bold"
            backgroundClass={post.userAvatarColor ? '' : 'bg-primary-3'}
          />
          <span className="text-white text-xs font-semibold drop-shadow truncate flex-1">@{post.username}</span>
          {user && !isOwner && (
            <button
              type="button"
              onClick={handleFollow}
              disabled={followLoading}
              className={`group shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border transition-colors ${
                following
                  ? 'bg-white/30 hover:bg-red-500/60 border-white/50 hover:border-red-400 text-white'
                  : 'bg-primary-3 border-transparent text-white'
              }`}
            >
              {following ? (
                <>
                  <span className="group-hover:hidden">Siguiendo</span>
                  <span className="hidden group-hover:inline">Dejar de seguir</span>
                </>
              ) : 'Seguir'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="body-bold text-secondary-5 leading-tight line-clamp-2">
          {post.title}
        </h3>

        <div className="flex flex-col gap-1">
          {post.destination && (
            <div className="flex items-center gap-1 body-3 text-neutral-4">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{post.destination}</span>
              {post.days && <><span>·</span><span>{post.days} días</span></>}
            </div>
          )}
          <div className="flex items-center gap-3 body-3 text-neutral-3">
            {dateLabel && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {dateLabel}
              </span>
            )}
            {post.participantCount > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {post.participantCount} {post.participantCount === 1 ? 'persona' : 'personas'}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-auto pt-2 border-t border-neutral-1">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 body-3 transition-colors ${
              isLiked ? 'text-red-500' : 'text-neutral-4 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
            <span>{likes}</span>
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onCommentClick?.(post); }}
            className="flex items-center gap-1.5 body-3 text-neutral-4 hover:text-primary-3 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.commentsCount ?? 0}</span>
          </button>

          {!isOwner && (
            <button
              type="button"
              onClick={handleSave}
              className={`flex items-center gap-1.5 body-3 transition-colors ${
                isSaved ? 'text-primary-3' : 'text-neutral-4 hover:text-primary-3'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-primary-3' : ''}`} />
              <span className="text-neutral-3">{savedBy.length > 0 ? savedBy.length : ''}</span>
            </button>
          )}

          <button
            type="button"
            onClick={copy}
            title="Copiar enlace"
            className="flex items-center gap-1 body-3 text-neutral-4 hover:text-primary-3 transition-colors ml-auto"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>

          {isOwner && onDelete && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
              title="Borrar publicación"
              className="flex items-center gap-1 body-3 text-neutral-3 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Delete confirm overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setShowDeleteConfirm(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="body-bold text-secondary-5">¿Borrar publicación?</p>
                <p className="body-3 text-neutral-4 mt-1">Se eliminará de la comunidad y de los guardados de otros usuarios. Tu viaje no se borrará.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowDeleteConfirm(false)} disabled={deleting} className="flex-1 border border-neutral-2 text-neutral-5 body-3 font-semibold py-2.5 rounded-full hover:bg-neutral-1 transition-colors disabled:opacity-50">
                Cancelar
              </button>
              <button type="button" onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white body-3 font-semibold py-2.5 rounded-full transition-colors flex items-center justify-center gap-2">
                {deleting ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Borrando...</> : 'Sí, borrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
