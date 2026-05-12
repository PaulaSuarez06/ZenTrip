import { useChatUI } from '../../context/ChatUIContext';
import FloatingChatWindow from './FloatingChatWindow';

export default function FloatingChatContainer() {
  const { openChats, closeChat, toggleMinimize } = useChatUI();

  if (openChats.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-4 z-50 flex items-end gap-3 pointer-events-none">
      {openChats.map((chat) => (
        <div key={chat.tripId} className="pointer-events-auto">
          <FloatingChatWindow
            tripId={chat.tripId}
            tripName={chat.tripName}
            minimized={chat.minimized}
            onClose={() => closeChat(chat.tripId)}
            onToggleMinimize={() => toggleMinimize(chat.tripId)}
          />
        </div>
      ))}
    </div>
  );
}
