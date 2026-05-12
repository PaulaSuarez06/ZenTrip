import { useEffect, useRef } from 'react';
import { useChatUI } from '../../../context/ChatUIContext';

function formatTime(value) {
  if (!value) return '';
  const date = value?.toDate ? value.toDate() : value?.seconds ? new Date(value.seconds * 1000) : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-ES', { timeStyle: 'short' }).format(date);
}


export default function ChatMessagePanel({ onClose, unreadChats, markTripChatAsRead, markAllChatsAsRead }) {
  const { openChat } = useChatUI();
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

  const handleGoToChat = (tripId, tripName) => {
    markTripChatAsRead(tripId);
    openChat(tripId, tripName);
    onClose();
  };

  const handleMarkAll = () => {
    markAllChatsAsRead();
    onClose();
  };

  return (
    <div
      ref={panelRef}
      className="fixed left-2 right-2 top-20 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80 rounded-2xl border border-secondary-1 shadow-lg z-50 overflow-hidden"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(8px)' }}
    >
      <div className="px-4 py-3 border-b border-neutral-1 flex items-center justify-between">
        <span className="body-2-semibold text-secondary-5">Mensajes</span>
        {unreadChats.length > 0 && (
          <button
            type="button"
            onClick={handleMarkAll}
            className="body-3 text-neutral-3 hover:text-primary-3 transition-colors cursor-pointer"
          >
            Marcar todo como leído
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto p-3 flex flex-col gap-2">
        {unreadChats.length === 0 ? (
          <div className="py-8 text-center">
            <p className="body-2-semibold text-secondary-5">Sin mensajes nuevos</p>
            <p className="body-3 text-neutral-3 mt-1">Estás al día con todos los chats</p>
          </div>
        ) : (
          unreadChats.map((chat) => (
            <button
              key={chat.tripId}
              type="button"
              onClick={() => handleGoToChat(chat.tripId, chat.tripName)}
              className="w-full text-left px-4 py-3 rounded-xl border border-secondary-2 bg-secondary-1 hover:brightness-95 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">💬</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="body-3 font-semibold text-secondary-5 truncate">{chat.tripName}</p>
                    {formatTime(chat.createdAt) && (
                      <span className="text-[11px] text-neutral-3 shrink-0">{formatTime(chat.createdAt)}</span>
                    )}
                  </div>
                  <p className="body-3 text-neutral-5 leading-snug mt-0.5 overflow-hidden line-clamp-2 wrap-anywhere">
                    <span className="font-semibold text-neutral-7">{chat.displayName}: </span>
                    {chat.text}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
