import { useEffect, useRef, useState } from 'react';
import { Users } from 'lucide-react';
import UserAvatar from '../ui/UserAvatar';
import FloatingChatWindow from './FloatingChatWindow';

const SIZE = 56;
const MARGIN = 10;
const DRAG_THRESHOLD = 6;

export default function MobileChatBubble({ chats, onClose }) {
  const chat = chats[chats.length - 1];
  const [pos, setPos] = useState(() => ({
    x: window.innerWidth - SIZE - MARGIN,
    y: window.innerHeight - 180,
  }));
  const [expanded, setExpanded] = useState(false);
  const drag = useRef(null);
  const lastChatId = useRef(null);

  // When a new chat is opened, close the previous and auto-expand
  useEffect(() => {
    if (!chat) return;
    if (chat.id !== lastChatId.current) {
      chats.slice(0, -1).forEach((c) => onClose(c.id));
      lastChatId.current = chat.id;
      setExpanded(true);
    }
  }, [chat?.id]);

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { ox: e.clientX - pos.x, oy: e.clientY - pos.y, moved: false };
  };

  const onPointerMove = (e) => {
    if (!drag.current) return;
    const nx = e.clientX - drag.current.ox;
    const ny = e.clientY - drag.current.oy;
    if (!drag.current.moved && (Math.abs(nx - pos.x) > DRAG_THRESHOLD || Math.abs(ny - pos.y) > DRAG_THRESHOLD)) {
      drag.current.moved = true;
    }
    setPos({
      x: Math.max(MARGIN, Math.min(window.innerWidth - SIZE - MARGIN, nx)),
      y: Math.max(72, Math.min(window.innerHeight - SIZE - 80, ny)),
    });
  };

  const onPointerUp = () => {
    if (!drag.current) return;
    const wasTap = !drag.current.moved;
    drag.current = null;
    // Snap to nearest side edge
    setPos((p) => ({
      x: p.x + SIZE / 2 < window.innerWidth / 2 ? MARGIN : window.innerWidth - SIZE - MARGIN,
      y: p.y,
    }));
    if (wasTap) setExpanded((v) => !v);
  };

  const isGroup = chat.type === 'group';

  return (
    <>
      <div
        className={`fixed z-50 touch-none select-none ${expanded ? 'invisible pointer-events-none' : ''}`}
        style={{ left: pos.x, top: pos.y }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
          <div className="relative">
            <div className="w-14 h-14 rounded-full shadow-xl border-2 border-white overflow-hidden bg-secondary-2 flex items-center justify-center cursor-grab active:cursor-grabbing">
              {isGroup ? (
                chat.coverImage
                  ? <img src={chat.coverImage} alt={chat.name} className="w-full h-full object-cover" />
                  : <Users className="w-6 h-6 text-secondary-4" />
              ) : (
                <UserAvatar
                  src={chat.otherUser?.profilePhoto}
                  backgroundColor={chat.otherUser?.avatarColor}
                  fullName={chat.name}
                  sizeClass="w-14 h-14"
                  initialsClass="text-base text-white font-bold"
                  backgroundClass="bg-neutral-3"
                />
              )}
            </div>
          </div>
      </div>

      {expanded && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <FloatingChatWindow
            chat={chat}
            minimized={false}
            onClose={() => { onClose(chat.id); setExpanded(false); }}
            onToggleMinimize={() => setExpanded(false)}
            mobile
          />
        </div>
      )}
    </>
  );
}