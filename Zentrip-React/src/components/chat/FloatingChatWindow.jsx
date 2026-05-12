import { useEffect, useRef, useState } from 'react';
import { Minus, X, Send, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChatNotifications } from '../../context/ChatNotificationContext';
import { sendMessage, subscribeToMessages } from '../../services/tripService';
import { ROUTES } from '../../config/routes';
import { buildGroups, bubbleRadius } from '../../utils/chatGroups';

export default function FloatingChatWindow({ tripId, tripName, minimized, onClose, onToggleMinimize }) {
  const { user, profile } = useAuth();
  const { markTripChatAsRead } = useChatNotifications();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeToMessages(tripId, setMessages);
    return unsub;
  }, [tripId]);

  useEffect(() => {
    if (!minimized) {
      markTripChatAsRead(tripId);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, minimized, tripId, markTripChatAsRead]);

  const displayName = profile?.displayName || profile?.firstName || user?.email || 'Usuario';

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await sendMessage(tripId, user.uid, displayName, trimmed);
      setText('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpenFull = () => {
    navigate(ROUTES.TRIPS.DETAIL.replace(':tripId', tripId), { state: { activeTab: 'chat' } });
    onClose();
  };

  const groups = buildGroups(messages);

  return (
    <div
      className="w-84 rounded-t-2xl border border-neutral-2 shadow-2xl flex flex-col overflow-hidden transition-all"
      style={{
        height: minimized ? 'auto' : '480px',
        backgroundColor: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-secondary-5 text-white cursor-pointer shrink-0"
        onClick={onToggleMinimize}
      >
        <span className="body-3 font-semibold truncate">💬 {tripName}</span>
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={handleOpenFull} className="hover:opacity-70 transition-opacity p-0.5" title="Ver chat completo">
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onToggleMinimize} className="hover:opacity-70 transition-opacity p-0.5">
            <Minus className="w-4 h-4" />
          </button>
          <button type="button" onClick={onClose} className="hover:opacity-70 transition-opacity p-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
            {groups.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-4 body-3 py-8">
                <span className="text-3xl mb-1">💬</span>
                <p className="text-center">Sé el primero en escribir</p>
              </div>
            )}
            {groups.map((group, gIdx) => {
              const isOwn = group.uid === user?.uid;
              const lastMsg = group.msgs[group.msgs.length - 1];
              const time = lastMsg.createdAt?.toDate?.()
                ? lastMsg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';
              return (
                <div
                  key={`g-${gIdx}-${group.msgs[0].id}`}
                  className={`flex flex-col max-w-[85%] ${isOwn ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  {!isOwn && (
                    <span className="text-[11px] text-neutral-4 font-medium px-1 mb-0.5">{group.displayName}</span>
                  )}
                  <div className={`flex flex-col gap-px ${isOwn ? 'items-end' : 'items-start'}`}>
                    {group.msgs.map((msg, mIdx) => {
                      const isOnly = group.msgs.length === 1;
                      const isFirst = mIdx === 0;
                      const isLast = mIdx === group.msgs.length - 1;
                      const r = bubbleRadius(isOwn, isOnly, isFirst, isLast);
                      return (
                        <div
                          key={msg.id}
                          className={`px-3 py-2 text-sm wrap-anywhere ${
                            isOwn ? `bg-primary-3 text-white ${r}` : `bg-neutral-1 text-neutral-7 ${r}`
                          }`}
                        >
                          {msg.text}
                        </div>
                      );
                    })}
                  </div>
                  {time && (
                    <span className="text-[11px] text-neutral-3 px-1 mt-0.5">{time}</span>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-neutral-1 px-3 py-2.5 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-neutral-1 rounded-full px-3 py-2 text-sm text-neutral-7 placeholder:text-neutral-3 outline-none focus:ring-2 focus:ring-primary-1"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className="w-8 h-8 rounded-full bg-primary-3 text-white flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-primary-4 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
