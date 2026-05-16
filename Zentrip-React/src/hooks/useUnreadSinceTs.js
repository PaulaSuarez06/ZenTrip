import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChatNotifications } from '../context/ChatNotificationContext';
import { usePrivateChat } from '../context/PrivateChatContext';

export function useUnreadSinceTs(chatId, isGroup) {
  const { user } = useAuth();
  const { tripReadTimestamps, markTripChatAsRead } = useChatNotifications();
  const { privateReadTimestamps, markPrivateChatAsRead } = usePrivateChat();

  const [unreadSinceTs, setUnreadSinceTs] = useState(-1);
  // Máximo ts que hemos marcado nosotros en esta sesión.
  // El watcher solo actúa si otra superficie leyó MÁS allá de este valor.
  const sessionMaxRead = useRef(0);

  useEffect(() => {
    if (!user?.uid || !chatId) return;
    const key = isGroup
      ? `zentrp_chat_${chatId}_${user.uid}`
      : `zentrp_pchat_${chatId}_${user.uid}`;
    const stored = parseInt(localStorage.getItem(key) || '0', 10);
    setUnreadSinceTs(stored);
    // Fijar sessionMaxRead ANTES de marcar para que el watcher lo ignore
    sessionMaxRead.current = Math.max(sessionMaxRead.current, Date.now());
    if (isGroup) markTripChatAsRead(chatId);
    else markPrivateChatAsRead(chatId);
    return () => {
      sessionMaxRead.current = Math.max(sessionMaxRead.current, Date.now());
      if (isGroup) markTripChatAsRead(chatId);
      else markPrivateChatAsRead(chatId);
    };
  }, [chatId, isGroup, user?.uid]);

  // Sincroniza solo cuando OTRA superficie ha leído más allá de lo que leímos nosotros
  const ctxTs = isGroup ? tripReadTimestamps?.[chatId] : privateReadTimestamps?.[chatId];
  useEffect(() => {
    if (ctxTs === undefined || ctxTs <= sessionMaxRead.current) return;
    setUnreadSinceTs((prev) => (prev === -1 ? -1 : Math.max(prev, ctxTs)));
  }, [ctxTs]);

  const markRead = useCallback((ts) => {
    sessionMaxRead.current = Math.max(sessionMaxRead.current, ts);
    if (isGroup) markTripChatAsRead(chatId, ts);
    else markPrivateChatAsRead(chatId, ts);
  }, [chatId, isGroup, markTripChatAsRead, markPrivateChatAsRead]);

  return { unreadSinceTs, markRead };
}
