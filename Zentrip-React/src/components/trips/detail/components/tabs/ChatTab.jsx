import { useEffect, useMemo, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../../../../../context/AuthContext';
import { sendMessage } from '../../../../../services/tripService';
import { useMemberProfiles } from '../../../../../hooks/useMemberProfiles';
import ChatMessageList from '../../../../chat/ChatMessageList';

export default function ChatTab({ tripId, messages = [] }) {
  const { user, profile } = useAuth();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const displayName = profile?.displayName || profile?.firstName || user?.email || 'Usuario';
  const memberUids = useMemo(() => [...new Set(messages.map((m) => m.uid).filter(Boolean))], [messages]);
  const memberProfiles = useMemberProfiles(memberUids);

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
    <div className="bg-white rounded-2xl border border-neutral-1 flex flex-col h-[72vh] min-h-130">
      <ChatMessageList
        messages={messages}
        currentUserId={user?.uid}
        memberProfiles={memberProfiles}
        bottomRef={bottomRef}
      />
      <div className="border-t border-neutral-1 px-4 py-3 flex items-center gap-2 shrink-0">
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
