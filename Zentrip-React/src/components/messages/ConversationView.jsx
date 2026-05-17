import { useEffect, useMemo, useRef, useState } from 'react';
import { useUnreadSinceTs } from '../../hooks/useUnreadSinceTs';
import { MoreVertical, Send, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChatNotifications } from '../../context/ChatNotificationContext';
import { useChatUI } from '../../context/ChatUIContext';
import { sendMessage, subscribeToMessages, subscribeToTripMembers } from '../../services/tripService';
import { sendPrivateMessage, subscribeToPrivateMessages } from '../../services/privateChatService';
import { blockUser, subscribeToIsBlockedBy, subscribeToMyBlocks, unblockUser } from '../../services/blockService';
import { usePrivateChat } from '../../context/PrivateChatContext';
import { useMemberProfiles } from '../../hooks/useMemberProfiles';
import { useChatScroll } from '../../hooks/useChatScroll';
import { useChatInput } from '../../hooks/useChatInput';
import { ROUTES } from '../../config/routes';
import ChatMessageList from '../chat/ChatMessageList';
import MentionPicker from '../chat/MentionPicker';
import UserAvatar from '../ui/UserAvatar';

export default function ConversationView({ chat, onChatUpdate }) {
  const { user, profile } = useAuth();
  const { allTripChats } = useChatNotifications();
  const { accept, reject } = usePrivateChat();
  const { setActiveChatTrip } = useChatUI();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [tripMembers, setTripMembers] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [blockedByMe, setBlockedByMe] = useState(new Set());
  const [blockedByThem, setBlockedByThem] = useState(false);
  const containerRef = useRef(null);
  const menuRef = useRef(null);

  const isRequest = chat?.type === 'request';
  const isGroup = chat?.type === 'group';
  const otherUid = !isGroup && !isRequest ? chat?.otherUid : null;
  const isBlockedByMe = otherUid ? blockedByMe.has(otherUid) : false;
  const cannotMessage = isBlockedByMe || blockedByThem;
  const isRemovedFromTrip = isGroup && chat && !allTripChats.some((t) => t.id === chat.id);

  useEffect(() => {
    if (!chat || isRequest) return;
    setMessages([]);
    const unsub = isGroup
      ? subscribeToMessages(chat.id, setMessages)
      : subscribeToPrivateMessages(chat.id, setMessages);
    return unsub;
  }, [chat?.id, isGroup, isRequest]);

  useEffect(() => {
    if (!isGroup || !chat?.id) { setTripMembers([]); return; }
    return subscribeToTripMembers(chat.id, setTripMembers);
  }, [chat?.id, isGroup]);

  // setActiveChatTrip: marca el viaje activo para suprimir notificaciones del chat grupal
  useEffect(() => {
    if (!chat || isRequest || !isGroup) return;
    setActiveChatTrip(chat.id);
    return () => setActiveChatTrip(null);
  }, [chat?.id, isGroup, isRequest, setActiveChatTrip]);

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeToMyBlocks(user.uid, setBlockedByMe);
  }, [user?.uid]);

  useEffect(() => {
    if (!otherUid || !user?.uid) { setBlockedByThem(false); return; }
    return subscribeToIsBlockedBy(otherUid, user.uid, setBlockedByThem);
  }, [otherUid, user?.uid]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const { unreadSinceTs, markRead } = useUnreadSinceTs(!isRequest ? chat?.id : null, isGroup);

  useChatScroll({
    chatId: chat?.id,
    messages,
    unreadSinceTs,
    containerRef,
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
      if (!chat) return;
      if (isGroup) await sendMessage(chat.id, user.uid, displayName, trimmed, reply, chatMentions);
      else await sendPrivateMessage(chat.id, user.uid, displayName, trimmed, reply);
    },
  });

  const handleNavigateToTrip = () => {
    navigate(ROUTES.TRIPS.DETAIL.replace(':tripId', chat.id));
  };

  const handleToggleBlock = () => {
    if (!otherUid) return;
    setMenuOpen(false);
    if (isBlockedByMe) {
      unblockUser(user.uid, otherUid);
    } else {
      setShowBlockConfirm(true);
    }
  };

  const handleConfirmBlock = async () => {
    setShowBlockConfirm(false);
    await blockUser(user.uid, otherUid);
  };

  const handleAcceptRequest = async () => {
    const chatId = await accept(chat.id, chat.fromUid, chat.name, chat.message);
    if (chatId && onChatUpdate) {
      onChatUpdate({ id: chatId, name: chat.name, type: 'private', otherUser: chat.otherUser });
    }
  };

  const handleRejectRequest = async () => {
    await reject(chat.id);
    if (onChatUpdate) onChatUpdate(null);
  };

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-neutral-3 gap-3">
        <span className="text-5xl">💬</span>
        <p className="body-2 text-neutral-4">Selecciona una conversación</p>
      </div>
    );
  }

  if (isRequest) {
    return (
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="px-5 py-3.5 border-b border-neutral-1 flex items-center gap-3 shrink-0 bg-white">
          <UserAvatar
            src={chat.otherUser?.profilePhoto}
            backgroundColor={chat.otherUser?.avatarColor}
            fullName={chat.name}
            sizeClass="w-9 h-9"
            initialsClass="text-xs text-white font-bold"
            backgroundClass="bg-neutral-3"
          />
          <div className="min-w-0">
            <p className="body-3 font-semibold text-secondary-5 truncate">{chat.name}</p>
            <p className="text-[11px] text-neutral-3">Solicitud de chat</p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50 flex flex-col items-start justify-end p-4 gap-2">
          {chat.message ? (
            <div className="max-w-[75%] bg-neutral-1 rounded-2xl rounded-tl-sm px-4 py-2.5">
              <p className="body-3 text-neutral-7 wrap-break-word">{chat.message}</p>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center py-8">
              <p className="body-3 text-neutral-4">Ha enviado una solicitud de chat</p>
            </div>
          )}
        </div>

        <div className="border-t border-neutral-1 px-4 py-3 flex flex-col gap-2.5 shrink-0 bg-white">
          <p className="text-center text-[11px] text-neutral-3">Acepta la solicitud para poder responder</p>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={handleRejectRequest}
              className="px-8 py-2 rounded-full border border-neutral-2 body-3 font-semibold text-neutral-5 hover:bg-neutral-1 transition-colors"
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={handleAcceptRequest}
              className="px-8 py-2 rounded-full bg-primary-3 text-white body-3 font-semibold hover:bg-primary-4 transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-neutral-1 flex items-center gap-3 shrink-0 bg-white">
        {isGroup ? (
          <button
            type="button"
            onClick={handleNavigateToTrip}
            className="flex items-center gap-3 min-w-0 hover:opacity-70 transition-opacity cursor-pointer"
            title="Ver viaje"
          >
            {chat.coverImage ? (
              <img src={chat.coverImage} alt={chat.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-secondary-1 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-secondary-4" />
              </div>
            )}
            <div className="min-w-0 text-left">
              <p className="body-3 font-semibold text-secondary-5 truncate">{chat.name}</p>
              <p className="text-[11px] text-neutral-3">Chat grupal</p>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <UserAvatar
              src={chat.otherUser?.profilePhoto}
              backgroundColor={chat.otherUser?.avatarColor}
              fullName={chat.name}
              sizeClass="w-9 h-9"
              initialsClass="text-xs text-white font-bold"
              backgroundClass="bg-neutral-3"
            />
            <div className="min-w-0">
              <p className="body-3 font-semibold text-secondary-5 truncate">{chat.name}</p>
              {isBlockedByMe && <p className="text-[11px] text-red-400">Usuario bloqueado</p>}
            </div>
          </div>
        )}

        {/* 3-dots menu — solo en chats privados */}
        {!isGroup && (
          <div ref={menuRef} className="relative ml-auto shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="w-8 h-8 rounded-full hover:bg-neutral-1 flex items-center justify-center transition-colors text-neutral-4"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-neutral-1 bg-white shadow-lg z-10 py-1 overflow-hidden">
                <button
                  type="button"
                  onClick={handleToggleBlock}
                  className={`w-full text-left px-4 py-2.5 body-3 transition-colors ${
                    isBlockedByMe
                      ? 'text-neutral-6 hover:bg-neutral-1'
                      : 'text-red-500 hover:bg-red-50'
                  }`}
                >
                  {isBlockedByMe ? 'Desbloquear usuario' : 'Bloquear usuario'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages — min-h-0 is critical for flex scroll to work */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-slate-50">
        <ChatMessageList
          messages={messages}
          currentUserId={user?.uid}
          memberProfiles={memberProfiles}
          containerRef={containerRef}
          onReply={setReplyTo}
          unreadSinceTs={unreadSinceTs}
          isGroup={isGroup}
        />
      </div>

      {/* Reply + input wrapper (relative for MentionPicker absolute positioning) */}
      <div className="relative shrink-0">
        {isGroup && mentionQuery !== null && mentionMembers.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 z-10 mx-4 mb-1">
            <MentionPicker
              query={mentionQuery}
              members={mentionMembers}
              onSelect={handleMentionSelect}
            />
          </div>
        )}
        {replyTo && (
          <div className="px-4 py-2 border-t border-neutral-1 bg-white flex items-center gap-2">
            <div className="w-0.5 self-stretch bg-primary-3 rounded-full shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-primary-3 truncate">{replyTo.displayName}</p>
              <p className="text-[11px] text-neutral-4 truncate">{replyTo.text}</p>
            </div>
            <button type="button" onClick={() => setReplyTo(null)} className="text-neutral-3 hover:text-neutral-5 transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="border-t border-neutral-1 px-4 py-3 flex items-center gap-2 bg-white">
          {isRemovedFromTrip ? (
            <p className="flex-1 text-center body-3 text-neutral-3 py-1">Ya no eres miembro de este viaje</p>
          ) : cannotMessage ? (
            <p className="flex-1 text-center body-3 text-neutral-3 py-1">No puedes enviar mensajes a este usuario</p>
          ) : (
            <>
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-neutral-1 rounded-full px-4 py-2.5 body-3 text-neutral-7 placeholder:text-neutral-3 outline-none focus:ring-2 focus:ring-primary-1"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="w-10 h-10 rounded-full bg-primary-3 text-white flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-primary-4 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal confirmación de bloqueo */}
      {showBlockConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowBlockConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-1">
              <p className="body-2-semibold text-neutral-7">¿Bloquear a {chat.name}?</p>
              <p className="body-3 text-neutral-4">Esta acción hará lo siguiente:</p>
            </div>
            <ul className="flex flex-col gap-2">
              {[
                'No podrá enviarte nuevas solicitudes de chat.',
                'No podrás enviarle mensajes mientras esté bloqueado.',
                'Los mensajes anteriores no se eliminarán.',
                'Puedes desbloquearlo en cualquier momento desde este mismo chat.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-neutral-3 shrink-0" />
                  <span className="body-3 text-neutral-5">{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowBlockConfirm(false)}
                className="flex-1 py-2.5 rounded-full border border-neutral-2 body-3 font-semibold text-neutral-5 hover:bg-neutral-1 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmBlock}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white body-3 font-semibold hover:bg-red-600 transition-colors"
              >
                Bloquear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
