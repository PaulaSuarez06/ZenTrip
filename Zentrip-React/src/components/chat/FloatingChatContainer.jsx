import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useChatUI } from '../../context/ChatUIContext';
import { ROUTES } from '../../config/routes';
import FloatingChatWindow from './FloatingChatWindow';
import MobileChatBubble from './MobileChatBubble';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export default function FloatingChatContainer() {
  const { openChats, closeChat, toggleMinimize, activeChatTripId } = useChatUI();
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  if (openChats.length === 0 || pathname === ROUTES.MESSAGES || activeChatTripId !== null) return null;

  if (isMobile) {
    return <MobileChatBubble chats={openChats} onClose={closeChat} />;
  }

  return (
    <div className="flex fixed bottom-0 right-4 z-50 items-end gap-3 pointer-events-none">
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