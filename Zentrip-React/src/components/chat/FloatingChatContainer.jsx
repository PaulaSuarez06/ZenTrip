import { useLocation } from 'react-router-dom';
import { useChatUI } from '../../context/ChatUIContext';
import { ROUTES } from '../../config/routes';
import FloatingChatWindow from './FloatingChatWindow';

export default function FloatingChatContainer() {
  const { openChats, closeChat, toggleMinimize, activeChatTripId } = useChatUI();
  const { pathname } = useLocation();

  if (openChats.length === 0 || pathname === ROUTES.MESSAGES || activeChatTripId !== null) return null;

  return (
    <div className="fixed bottom-0 right-4 z-50 flex items-end gap-3 pointer-events-none">
      {openChats.map((chat) => (
        <div key={chat.id} className="pointer-events-auto">
          <FloatingChatWindow
            chat={chat}
            minimized={chat.minimized}
            onClose={() => closeChat(chat.id)}
            onToggleMinimize={() => toggleMinimize(chat.id)}
          />
        </div>
      ))}
    </div>
  );
}