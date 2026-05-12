import { createContext, useCallback, useContext, useState } from 'react';

const ChatUIContext = createContext(null);

const MAX_OPEN = 3;

export function ChatUIProvider({ children }) {
  const [openChats, setOpenChats] = useState([]);

  const openChat = useCallback((tripId, tripName) => {
    setOpenChats((prev) => {
      const existing = prev.find((c) => c.tripId === tripId);
      if (existing) {
        return prev.map((c) => c.tripId === tripId ? { ...c, minimized: false } : c);
      }
      const trimmed = prev.length >= MAX_OPEN ? prev.slice(1) : prev;
      return [...trimmed, { tripId, tripName, minimized: false }];
    });
  }, []);

  const closeChat = useCallback((tripId) => {
    setOpenChats((prev) => prev.filter((c) => c.tripId !== tripId));
  }, []);

  const toggleMinimize = useCallback((tripId) => {
    setOpenChats((prev) =>
      prev.map((c) => c.tripId === tripId ? { ...c, minimized: !c.minimized } : c),
    );
  }, []);

  return (
    <ChatUIContext.Provider value={{ openChats, openChat, closeChat, toggleMinimize }}>
      {children}
    </ChatUIContext.Provider>
  );
}

export function useChatUI() {
  return useContext(ChatUIContext);
}
