import { useEffect, useRef } from 'react';

export function useChatScroll({ chatId, messages, unreadSinceTs, containerRef, minimized = false, onAfterScroll }) {
  const isFirstLoad = useRef(true);
  // true solo cuando el usuario ha scrolleado él mismo hasta estar cerca del fondo;
  // evita que el segundo snapshot de Firebase anule el scroll al divisor de no leídos
  const userNearBottom = useRef(true);

  useEffect(() => {
    isFirstLoad.current = true;
    userNearBottom.current = true;
  }, [chatId]);

  // Listener de scroll para rastrear si el usuario está voluntariamente cerca del fondo
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      userNearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [containerRef]);

  useEffect(() => {
    if (minimized || messages.length === 0 || unreadSinceTs === -1) return;
    const el = containerRef.current;
    if (!el) return;

    if (isFirstLoad.current) {
      const divider = el.querySelector('[data-unread-divider]');
      if (divider) {
        const top = divider.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
        el.scrollTop = top;
        // Tras ir al divisor, el usuario NO está en el fondo → no auto-scrollear en próximas actualizaciones
        userNearBottom.current = false;
      } else {
        el.scrollTop = el.scrollHeight;
        userNearBottom.current = true;
      }
      isFirstLoad.current = false;
    } else if (userNearBottom.current) {
      // Solo auto-scroll si el usuario estaba cerca del fondo voluntariamente
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }

    onAfterScroll?.();
  }, [messages.length, unreadSinceTs, minimized]);
}