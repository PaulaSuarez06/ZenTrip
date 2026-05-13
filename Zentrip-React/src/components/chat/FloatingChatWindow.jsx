import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, Minus, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChatNotifications } from '../../context/ChatNotificationContext';
import { usePrivateChat } from '../../context/PrivateChatContext';
import { sendMessage, subscribeToMessages } from '../../services/tripService';
import { sendPrivateMessage, subscribeToPrivateMessages } from '../../services/privateChatService';
import { ROUTES } from '../../config/routes';
import { useMemberProfiles } from '../../hooks/useMemberProfiles';
import ChatMessageList from './ChatMessageList';
import UserAvatar from '../ui/UserAvatar';

export default function FloatingChatWindow({ chat, minimized, onClose, onToggleMinimize }) {
  const { user, profile } = useAuth();
  const { markTripChatAsRead } = useChatNotifications();
  const { markPrivateChatAsRead } = usePrivateChat();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const isGroup = chat.type === 'group';

  useEffect(() => {
    const unsub = isGroup
      ? subscribeToMessages(chat.id, setMessages)
      : subscribeToPrivateMessages(chat.id, setMessages);
    return unsub;
  }, [chat.id, isGroup]);

  useEffect(() => {
    if (minimized) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (isGroup) markTripChatAsRead(chat.id);
    else markPrivateChatAsRead(chat.id);
  }, [messages.length, minimized, chat.id, isGroup, markTripChatAsRead, markPrivateChatAsRead]);

  const displayName = profile?.displayName || profile?.firstName || user?.email || 'Usuario';
  const memberUids = useMemo(() => [...new Set(messages.map((m) => m.uid).filter(Boolean))], [messages]);
  const memberProfiles = useMemberProfiles(memberUids);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      if (isGroup) await sendMessage(chat.id, user.uid, displayName, trimmed);
      else await sendPrivateMessage(chat.id, user.uid, displayName, trimmed);
      setText('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleExpand = () => {
    navigate(ROUTES.MESSAGES);
    onClose();
  };

  return (
    <div
      className="w-80 rounded-t-2xl border border-neutral-2 shadow-2xl flex flex-col overflow-hidden transition-all"
      style={{
        height: minimized ? 'auto' : '480px',
        backgroundColor: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 bg-secondary-5 text-white cursor-pointer shrink-0"
        onClick={onToggleMinimize}
      >
        <div className="flex items-center gap-2 min-w-0">
          {!isGroup && chat.otherUser && (
            <UserAvatar
              src={chat.otherUser.profilePhoto}
              backgroundColor={chat.otherUser.avatarColor}
              fullName={chat.name}
              sizeClass="w-6 h-6"
              initialsClass="text-[9px] text-white font-bold"
              backgroundClass="bg-neutral-4"
            />
          )}
          <span className="body-3 font-semibold truncate">
            {isGroup ? `💬 ${chat.name}` : chat.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={handleExpand} className="hover:opacity-70 transition-opacity p-0.5" title="Abrir en mensajes">
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
          <ChatMessageList
            messages={messages}
            currentUserId={user?.uid}
            memberProfiles={memberProfiles}
            compact
            bottomRef={bottomRef}
          />
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