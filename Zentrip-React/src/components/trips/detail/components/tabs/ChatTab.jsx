import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../../../../../context/AuthContext';
import { sendMessage, subscribeToMessages } from '../../../../../services/tripService';

export default function ChatTab({ tripId }) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeToMessages(tripId, setMessages);
    return unsub;
  }, [tripId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  return (
    <div className="bg-white rounded-2xl border border-neutral-1 flex flex-col h-150">
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-4 body-3">
            <span className="text-4xl mb-2">💬</span>
            <p>Sé el primero en escribir algo</p>
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.uid === user?.uid;
          const time = msg.createdAt?.toDate?.()
            ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-0.5 max-w-[70%] ${isOwn ? 'self-end items-end' : 'self-start items-start'}`}
            >
              {!isOwn && (
                <span className="text-xs text-neutral-4 font-medium px-1">{msg.displayName}</span>
              )}
              <div
                className={`px-4 py-2.5 rounded-2xl body-3 wrap-break-word ${
                  isOwn
                    ? 'bg-primary-3 text-white rounded-tr-sm'
                    : 'bg-neutral-1 text-neutral-7 rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>
              {time && (
                <span className="text-[11px] text-neutral-3 px-1">{time}</span>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-neutral-1 px-4 py-3 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
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
      </div>
    </div>
  );
}
