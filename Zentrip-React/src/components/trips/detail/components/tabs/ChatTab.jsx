import { useMemo, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { useAuth } from '../../../../../context/AuthContext';
import { sendMessage } from '../../../../../services/tripService';
import { useMemberProfiles } from '../../../../../hooks/useMemberProfiles';
import { useChatScroll } from '../../../../../hooks/useChatScroll';
import { useChatInput } from '../../../../../hooks/useChatInput';
import { useUnreadSinceTs } from '../../../../../hooks/useUnreadSinceTs';
import ChatMessageList from '../../../../chat/ChatMessageList';
import MentionPicker from '../../../../chat/MentionPicker';

export default function ChatTab({ tripId, messages = [], members = [] }) {
  const { user, profile } = useAuth();
  const containerRef = useRef(null);

  const { unreadSinceTs, markRead } = useUnreadSinceTs(tripId, true);

  useChatScroll({
    chatId: tripId,
    messages,
    unreadSinceTs,
    containerRef,
    onAfterScroll: markRead,
    currentUserId: user?.uid,
  });

  const displayName = profile?.displayName || profile?.firstName || user?.email || 'Usuario';
  const memberUids = useMemo(() => [...new Set(messages.map((m) => m.uid).filter(Boolean))], [messages]);
  const memberProfiles = useMemberProfiles(memberUids);

  const chatMembers = useMemo(() =>
    members
      .filter((m) => m.uid && m.uid !== user?.uid)
      .map((m) => ({ uid: m.uid, displayName: m.displayName || m.name || m.firstName || m.email || 'Usuario' })),
    [members, user?.uid]
  );

  const { text, sending, replyTo, setReplyTo, mentionQuery, inputRef,
    handleTextChange, handleMentionSelect, handleSend, handleKeyDown,
  } = useChatInput({
    isGroup: true,
    onSend: async (trimmed, reply, chatMentions) => {
      await sendMessage(tripId, user.uid, displayName, trimmed, reply, chatMentions);
    },
  });

  return (
    <div className="bg-white rounded-2xl border border-neutral-1 flex flex-col flex-1 min-h-0 overflow-hidden">
      <ChatMessageList
        messages={messages}
        currentUserId={user?.uid}
        memberProfiles={memberProfiles}
        containerRef={containerRef}
        onReply={setReplyTo}
        unreadSinceTs={unreadSinceTs}
      />
      <div className="relative shrink-0">
        {mentionQuery !== null && chatMembers.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 z-10 mx-4 mb-1">
            <MentionPicker
              query={mentionQuery}
              members={chatMembers}
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
        <div className="border-t border-neutral-1 px-4 py-3 flex items-center gap-2">
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
        </div>
      </div>
    </div>
  );
}
