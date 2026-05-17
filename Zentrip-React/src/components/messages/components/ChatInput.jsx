import { Send, X } from 'lucide-react';
import MentionPicker from '../../chat/MentionPicker';

export default function ChatInput({
  isGroup,
  isRemovedFromTrip,
  cannotMessage,
  mentionQuery,
  mentionMembers,
  onMentionSelect,
  replyTo,
  onClearReply,
  text,
  sending,
  inputRef,
  onTextChange,
  onKeyDown,
  onSend,
}) {
  return (
    <div className="relative shrink-0">
      {isGroup && mentionQuery !== null && mentionMembers.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 z-10 mx-4 mb-1">
          <MentionPicker
            query={mentionQuery}
            members={mentionMembers}
            onSelect={onMentionSelect}
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
          <button type="button" onClick={onClearReply} className="text-neutral-3 hover:text-neutral-5 transition-colors shrink-0">
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
              onChange={onTextChange}
              onKeyDown={onKeyDown}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-neutral-1 rounded-full px-4 py-2.5 body-3 text-neutral-7 placeholder:text-neutral-3 outline-none focus:ring-2 focus:ring-primary-1"
            />
            <button
              type="button"
              onClick={onSend}
              disabled={!text.trim() || sending}
              className="w-10 h-10 rounded-full bg-primary-3 text-white flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-primary-4 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
