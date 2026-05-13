import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useChatUI } from '../../../context/ChatUIContext';
import { useChatNotifications } from '../../../context/ChatNotificationContext';
import { usePrivateChat } from '../../../context/PrivateChatContext';
import { ROUTES } from '../../../config/routes';
import UserAvatar from '../../ui/UserAvatar';

function formatTime(value) {
  if (!value) return '';
  const date = value?.toDate ? value.toDate() : value?.seconds ? new Date(value.seconds * 1000) : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-ES', { timeStyle: 'short' }).format(date);
}

function toMs(val) {
  if (!val) return 0;
  if (typeof val.toMillis === 'function') return val.toMillis();
  if (val.seconds) return val.seconds * 1000;
  if (typeof val === 'number') return val;
  return 0;
}

export default function ChatMessagePanel({ onClose }) {
  const { openChat, openPrivateChat, activeChatTripId } = useChatUI();
  const { allTripChats, unreadChats, markTripChatAsRead, markAllChatsAsRead } = useChatNotifications();
  const {
    pendingRequests, accept, reject,
    unreadPrivateChats, markPrivateChatAsRead,
    allPrivateChats, markAllPrivateChatsAsRead,
  } = usePrivateChat();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isOnMessagesPage = pathname === ROUTES.MESSAGES;
  const isInTripChat = activeChatTripId !== null;
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [onClose]);

  const selectInMessagesPage = (chatData) => {
    navigate(ROUTES.MESSAGES, { state: { selectChat: chatData } });
    onClose();
  };

  const handleGoToChat = (tripId, tripName) => {
    markTripChatAsRead(tripId);
    if (isOnMessagesPage || isInTripChat) {
      selectInMessagesPage({ id: tripId, name: tripName, type: 'group' });
    } else {
      openChat(tripId, tripName, 'group');
      onClose();
    }
  };

  const handleGoToPrivateChat = (chat) => {
    markPrivateChatAsRead(chat.id);
    if (isOnMessagesPage || isInTripChat) {
      selectInMessagesPage({ id: chat.id, name: chat.otherUser?.displayName, type: 'private', otherUser: chat.otherUser });
    } else {
      openPrivateChat(chat.id, chat.otherUser?.displayName, chat.otherUser);
      onClose();
    }
  };

  const handleMarkAll = () => {
    markAllChatsAsRead();
    markAllPrivateChatsAsRead();
    onClose();
  };

  const allChats = [
    ...allTripChats
      .filter((t) => t.lastMessage)
      .map((t) => ({
        key: `group_${t.id}`,
        type: 'group',
        id: t.id,
        name: t.name,
        isUnread: t.isUnread,
        lastMessage: t.lastMessage,
        coverImage: t.coverImage || null,
        otherUser: null,
        sortTs: toMs(t.lastMessage?.createdAt),
      })),
    ...allPrivateChats
      .filter((c) => c.lastMessage)
      .map((c) => ({
        key: `private_${c.id}`,
        type: 'private',
        id: c.id,
        name: c.otherUser?.displayName,
        isUnread: c.isUnread,
        lastMessage: c.lastMessage,
        otherUser: c.otherUser,
        sortTs: toMs(c.lastMessage?.createdAt),
      })),
  ].sort((a, b) => b.sortTs - a.sortTs);

  const hasUnread = unreadChats.length > 0 || unreadPrivateChats.length > 0;

  return (
    <div
      ref={panelRef}
      className="fixed left-2 right-2 top-20 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80 rounded-2xl border border-secondary-1 shadow-lg z-50 overflow-hidden"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(8px)' }}
    >
      <div className="px-4 py-3 border-b border-neutral-1 flex items-center justify-between">
        <span className="body-2-semibold text-secondary-5">Mensajes</span>
        <div className="flex items-center gap-3">
          {hasUnread && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="body-3 text-neutral-3 hover:text-primary-3 transition-colors cursor-pointer"
            >
              Marcar todo leído
            </button>
          )}
          <button
            type="button"
            onClick={() => { navigate(ROUTES.MESSAGES); onClose(); }}
            className="body-3 text-primary-3 hover:text-primary-4 font-medium transition-colors cursor-pointer"
          >
            Ver todos
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto p-3 flex flex-col gap-2">
        {/* Solicitudes de chat pendientes */}
        {pendingRequests.length > 0 && (
          <>
            <p className="text-[11px] font-semibold text-neutral-4 uppercase tracking-wide px-1 mt-1">
              Solicitudes ({pendingRequests.length})
            </p>
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-secondary-1 border border-secondary-2">
                <UserAvatar
                  src={req.fromProfilePhoto}
                  fullName={req.fromDisplayName}
                  sizeClass="w-8 h-8"
                  initialsClass="text-[10px] text-white font-bold"
                  backgroundClass="bg-neutral-3"
                />
                <div className="flex-1 min-w-0">
                  <p className="body-3 font-semibold text-secondary-5 truncate">{req.fromDisplayName}</p>
                  <p className="text-[11px] text-neutral-4">Quiere chatear contigo</p>
                </div>
                <button
                  type="button"
                  onClick={() => accept(req.id, req.fromUid)}
                  className="px-2.5 py-1 rounded-full bg-primary-3 text-white text-[11px] font-semibold hover:bg-primary-4 transition-colors shrink-0"
                >
                  Aceptar
                </button>
                <button
                  type="button"
                  onClick={() => reject(req.id)}
                  className="px-2.5 py-1 rounded-full bg-neutral-2 text-neutral-5 text-[11px] font-semibold hover:bg-neutral-3 transition-colors shrink-0"
                >
                  Rechazar
                </button>
              </div>
            ))}
          </>
        )}

        {pendingRequests.length > 0 && allChats.length > 0 && (
          <div className="border-t border-neutral-1 my-1" />
        )}

        {/* All chats — unread highlighted, read shown muted */}
        {allChats.map((chat) => {
          const handleClick = () => chat.type === 'group'
            ? handleGoToChat(chat.id, chat.name)
            : handleGoToPrivateChat(chat);

          return (
            <button
              key={chat.key}
              type="button"
              onClick={handleClick}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all cursor-pointer ${
                chat.isUnread
                  ? 'border border-secondary-2 bg-secondary-1 hover:brightness-95'
                  : 'border border-neutral-1 bg-white hover:bg-neutral-1'
              }`}
            >
              <div className="flex items-start gap-3">
                {chat.type === 'private' ? (
                  <UserAvatar
                    src={chat.otherUser?.profilePhoto}
                    backgroundColor={chat.otherUser?.avatarColor}
                    fullName={chat.name}
                    sizeClass="w-8 h-8"
                    initialsClass="text-[10px] text-white font-bold"
                    backgroundClass="bg-neutral-3"
                  />
                ) : chat.coverImage ? (
                  <img src={chat.coverImage} alt={chat.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-secondary-2 flex items-center justify-center text-base shrink-0">💬</span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`body-3 font-semibold truncate ${chat.isUnread ? 'text-secondary-5' : 'text-neutral-5'}`}>
                      {chat.name}
                    </p>
                    {formatTime(chat.lastMessage?.createdAt) && (
                      <span className="text-[11px] text-neutral-3 shrink-0">{formatTime(chat.lastMessage.createdAt)}</span>
                    )}
                  </div>
                  <p className={`body-3 leading-snug mt-0.5 overflow-hidden line-clamp-2 wrap-anywhere ${
                    chat.isUnread ? 'text-neutral-5' : 'text-neutral-3'
                  }`}>
                    {chat.type === 'group' ? (
                      <>
                        <span className="font-semibold text-neutral-7">{chat.lastMessage?.displayName}: </span>
                        {chat.lastMessage?.text}
                      </>
                    ) : chat.lastMessage?.text}
                  </p>
                </div>
                {chat.isUnread && (
                  <span className="w-2 h-2 rounded-full bg-primary-3 shrink-0 mt-1.5" />
                )}
              </div>
            </button>
          );
        })}

        {allChats.length === 0 && pendingRequests.length === 0 && (
          <div className="py-8 text-center">
            <p className="body-2-semibold text-secondary-5">Sin mensajes nuevos</p>
            <p className="body-3 text-neutral-3 mt-1">Estás al día con todos los chats</p>
          </div>
        )}
      </div>
    </div>
  );
}