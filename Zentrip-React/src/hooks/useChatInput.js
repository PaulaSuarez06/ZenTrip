import { useRef, useState } from 'react';

/**
 * Gestiona el estado y los handlers del campo de texto del chat:
 * texto, envío, respuesta, menciones y atajos de teclado.
 *
 * @param {boolean}  isGroup  - Si el chat es grupal (habilita menciones con @).
 * @param {Function} onSend   - async (text, replyTo, mentions) => void — servicio de envío.
 */
export function useChatInput({ isGroup = true, onSend }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [mentions, setMentions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionStartIdx, setMentionStartIdx] = useState(-1);
  const inputRef = useRef(null);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);
    if (!isGroup) { setMentionQuery(null); return; }
    const cursor = e.target.selectionStart ?? val.length;
    const beforeCursor = val.slice(0, cursor);
    const lastAt = beforeCursor.lastIndexOf('@');
    if (lastAt >= 0) {
      const afterAt = beforeCursor.slice(lastAt + 1);
      if (!afterAt.includes(' ')) {
        setMentionQuery(afterAt);
        setMentionStartIdx(lastAt);
        return;
      }
    }
    setMentionQuery(null);
  };

  const handleMentionSelect = (member) => {
    const tag = member.uid === 'todos' ? 'todos' : member.displayName;
    const endIdx = mentionStartIdx + 1 + (mentionQuery?.length ?? 0);
    const newText = `${text.slice(0, mentionStartIdx)}@${tag} ${text.slice(endIdx)}`;
    setText(newText);
    setMentionQuery(null);
    setMentionStartIdx(-1);
    setMentions((prev) => prev.some((m) => m.uid === member.uid) ? prev : [...prev, { uid: member.uid, displayName: tag }]);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    const currentReply = replyTo;
    const currentMentions = mentions;
    setReplyTo(null);
    setMentions([]);
    setMentionQuery(null);
    try {
      await onSend(trimmed, currentReply, currentMentions);
      setText('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (mentionQuery !== null && e.key === 'Escape') { e.preventDefault(); setMentionQuery(null); return; }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return {
    text, sending,
    replyTo, setReplyTo,
    mentions, mentionQuery,
    inputRef,
    handleTextChange, handleMentionSelect, handleSend, handleKeyDown,
  };
}