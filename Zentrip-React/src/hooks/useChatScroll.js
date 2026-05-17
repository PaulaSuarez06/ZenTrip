import { useEffect, useLayoutEffect, useRef } from 'react';

function toMs(createdAt) {
  if (!createdAt) return 0;
  if (typeof createdAt === 'number') return createdAt;
  if (typeof createdAt.toMillis === 'function') return createdAt.toMillis();
  if (createdAt.seconds) return createdAt.seconds * 1000;
  return 0;
}

export function useChatScroll({ chatId, messages, unreadSinceTs, containerRef, minimized = false, onAfterScroll, currentUserId }) {
  const isFirstLoad = useRef(true);
  const userNearBottom = useRef(true);
  const onAfterScrollRef = useRef(onAfterScroll);
  onAfterScrollRef.current = onAfterScroll;
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const unreadSinceTsRef = useRef(unreadSinceTs);
  unreadSinceTsRef.current = unreadSinceTs;
  const prevMessagesLengthRef = useRef(0);

  useEffect(() => {
    isFirstLoad.current = true;
    userNearBottom.current = true;
    prevMessagesLengthRef.current = 0;
  }, [chatId]);

  // Detecta si el usuario está cerca del fondo para marcar como leído al scrollear
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      const wasNear = userNearBottom.current;
      userNearBottom.current = nearBottom;
      if (nearBottom && !wasNear && messagesRef.current.length > 0) {
        const lastMsg = messagesRef.current[messagesRef.current.length - 1];
        const lastTs = Math.max(Date.now(), toMs(lastMsg.createdAt) + 1);
        onAfterScrollRef.current?.(lastTs);
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [containerRef]);

  // Posicionamiento inicial: primer mensaje no leído o fondo
  useLayoutEffect(() => {
    if (minimized || messages.length === 0 || unreadSinceTs === -1) return;
    const el = containerRef.current;
    if (!el) return;

    if (isFirstLoad.current) {
      const lastMsg = messages[messages.length - 1];
      const lastTs = Math.max(Date.now(), toMs(lastMsg?.createdAt) + 1);
      const firstUnread = el.querySelector('[data-first-unread]');
      if (firstUnread) {
        const offsetTop = firstUnread.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
        el.scrollTop = Math.max(0, offsetTop - 16);
        userNearBottom.current = false;
      } else {
        el.scrollTop = el.scrollHeight;
        userNearBottom.current = true;
      }
      isFirstLoad.current = false;
      onAfterScroll?.(lastTs);
    }
  }, [messages.length, unreadSinceTs, minimized]);

  // Auto-scroll solo cuando el propio usuario envía un mensaje nuevo (no carga histórica)
  useEffect(() => {
    const prevLength = prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;
    if (minimized || messages.length === 0 || unreadSinceTsRef.current === -1 || isFirstLoad.current) return;
    // Solo scroll para mensajes nuevos en tiempo real (diff=1), no para carga por lotes de Firebase
    if (messages.length - prevLength !== 1) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.uid !== currentUserId) return;
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    const lastTs = Math.max(Date.now(), toMs(lastMsg.createdAt) + 1);
    onAfterScroll?.(lastTs);
  }, [messages.length, minimized]);
}
