import { useEffect, useState, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getComments, addComment } from '../../services/communityService';
import UserAvatar from '../ui/UserAvatar';

function timeAgo(timestamp) {
  if (!timestamp) return '';
  const ts = timestamp?.seconds ? timestamp.seconds * 1000 : new Date(timestamp).getTime();
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  return `hace ${Math.floor(hrs / 24)} días`;
}

export default function CommentsModal({ post, onClose }) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    getComments(post.id).then((c) => {
      setComments(c);
      setLoading(false);
    });
  }, [post.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  async function handleSend() {
    if (!text.trim() || submitting || !user) return;
    setSubmitting(true);
    const optimistic = {
      id: `tmp_${Date.now()}`,
      userId: user.uid,
      username: profile?.username || profile?.firstName || 'Tú',
      userAvatar: profile?.profilePhoto || null,
      userAvatarColor: profile?.avatarColor || null,
      text: text.trim(),
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
    };
    setComments((prev) => [...prev, optimistic]);
    setText('');
    try {
      await addComment(post.id, user.uid, profile, optimistic.text);
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-1">
          <div className="min-w-0 flex-1 pr-2">
            <p className="body-3 font-semibold text-primary-3 uppercase tracking-wide">Comentarios</p>
            <p className="body-3 text-neutral-5 font-semibold line-clamp-1">{post.title}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-neutral-1 transition-colors shrink-0">
            <X className="w-5 h-5 text-neutral-4" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-3 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!loading && comments.length === 0 && (
            <p className="text-center body-3 text-neutral-3 py-8">Sé el primero en comentar</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <UserAvatar
                src={c.userAvatar}
                fullName={c.username}
                sizeClass="w-8 h-8"
                backgroundColor={c.userAvatarColor}
                initialsClass="text-xs text-white font-bold"
                backgroundClass={c.userAvatarColor ? '' : 'bg-primary-3'}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="body-3 font-semibold text-secondary-5">@{c.username}</span>
                  <span className="text-[11px] text-neutral-3">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="body-3 text-neutral-5 mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-neutral-1 px-4 py-3 flex items-center gap-3">
          <UserAvatar
            src={profile?.profilePhoto}
            fullName={profile?.firstName || profile?.displayName}
            sizeClass="w-8 h-8"
            backgroundColor={profile?.avatarColor}
            initialsClass="text-xs text-white font-bold"
            backgroundClass={profile?.avatarColor ? '' : 'bg-primary-3'}
          />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Escribe un comentario..."
            maxLength={500}
            className="flex-1 bg-neutral-1/60 border border-neutral-2 rounded-full px-4 py-2 body-3 text-secondary-5 placeholder:text-neutral-3 focus:outline-none focus:border-primary-3 transition-colors"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || submitting}
            className="w-9 h-9 flex items-center justify-center bg-primary-3 hover:bg-orange-400 disabled:bg-neutral-2 text-white rounded-full transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
