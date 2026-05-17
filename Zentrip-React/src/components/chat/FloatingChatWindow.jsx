import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, Minus, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { sendMessage, subscribeToMessages, subscribeToTripMembers } from '../../services/tripService';
import { sendPrivateMessage, subscribeToPrivateMessages } from '../../services/privateChatService';
import { ROUTES } from '../../config/routes';
import { useMemberProfiles } from '../../hooks/useMemberProfiles';
import { useChatScroll } from '../../hooks/useChatScroll';
import { useChatInput } from '../../hooks/useChatInput';
import { useUnreadSinceTs } from '../../hooks/useUnreadSinceTs';
import ChatMessageList from './ChatMessageList';
import MentionPicker from './MentionPicker';
import UserAvatar from '../ui/UserAvatar';

export default function FloatingChatWindow({ chat, minimized, onClose, onToggleMinimize, mobile = false }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [tripMembers, setTripMembers] = useState([]);
  const containerRef = useRef(null);

  const isGroup = chat.type === 'group';

  const { unreadSinceTs, markRead } = useUnreadSinceTs(chat.id, isGroup);

  // Al cambiar de chat: reinicia mensajes
  useEffect(() => {
    setMessages([]);
    const unsub = isGroup
      ? subscribeToMessages(chat.id, setMessages)
      : subscribeToPrivateMessages(chat.id, setMessages);
    return unsub;
  }, [chat.id, isGroup]);

  useEffect(() => {
    if (!isGroup) { setTripMembers([]); return; }
    return subscribeToTripMembers(chat.id, setTripMembers);
  }, [chat.id, isGroup]);

  useChatScroll({
    chatId: chat.id,
    messages,
    unreadSinceTs,
    containerRef,
    minimized,
    onAfterScroll: markRead,
    currentUserId: user?.uid,
  });

  const displayName = profile?.displayName || profile?.firstName || user?.email || 'Usuario';
  const memberUids = useMemo(() => [...new Set(messages.map((m) => m.uid).filter(Boolean))], [messages]);
  const memberProfiles = useMemberProfiles(memberUids);

  const mentionMembers = useMemo(() => {
    if (!isGroup) return [];
    return tripMembers
      .filter((m) => m.uid && m.uid !== user?.uid)
      .map((m) => ({ uid: m.uid, displayName: m.displayName || m.firstName || m.name || m.email || 'Usuario' }));
  }, [tripMembers, user?.uid, isGroup]);

  const { text, sending, replyTo, setReplyTo, mentionQuery, inputRef,
    handleTextChange, handleMentionSelect, handleSend, handleKeyDown,
  } = useChatInput({
    isGroup,
    onSend: async (trimmed, reply, chatMentions) => {
      if (isGroup) await sendMessage(chat.id, user.uid, displayName, trimmed, reply, chatMentions);
      else await sendPrivateMessage(chat.id, user.uid, displayName, trimmed, reply);
    },
  });

  const handleExpand = () => {
    navigate(ROUTES.MESSAGES);
    onClose();
  };

  return (
    <div
      className={`${mobile ? 'w-full' : 'w-80'} rounded-t-2xl border border-neutral-2 shadow-2xl flex flex-col overflow-hidden transition-all`}
      style={{
        height: minimized ? 'auto' : mobile ? '70vh' : '480px',
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
            containerRef={containerRef}
            onReply={setReplyTo}
            unreadSinceTs={unreadSinceTs}
            isGroup={isGroup}
          />
          <div className="relative shrink-0">
            {isGroup && mentionQuery !== null && mentionMembers.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 z-10 mx-2 mb-1">
                <MentionPicker
                  query={mentionQuery}
                  members={mentionMembers}
                  onSelect={handleMentionSelect}
                  compact
                />
              </div>
            )}
            {replyTo && (
              <div className="px-3 py-1.5 border-t border-neutral-1 flex items-center gap-2">
                <div className="w-0.5 self-stretch bg-primary-3 rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-primary-3 truncate">{replyTo.displayName}</p>
                  <p className="text-[10px] text-neutral-4 truncate">{replyTo.text}</p>
                </div>
                <button type="button" onClick={() => setReplyTo(null)} className="text-neutral-3 hover:text-neutral-5 shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="border-t border-neutral-1 px-3 py-2.5 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={handleTextChange}
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
          </div>
        </>
      )}
    </div>
  );
}