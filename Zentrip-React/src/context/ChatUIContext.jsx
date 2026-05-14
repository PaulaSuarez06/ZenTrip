import { createContext, useCallback, useContext, useState } from 'react';

const ChatUIContext = createContext(null);

const MAX_OPEN = 3;

export function ChatUIProvider({ children }) {
  const [openChats, setOpenChats] = useState([]);
  const [activeChatTripId, setActiveChatTripIdState] = useState(null);

  const openChat = useCallback((id, name, type = 'group', otherUser = null, coverImage = null) => {
    setOpenChats((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing) return prev.map((c) => c.id === id ? { ...c, minimized: false } : c);
      const trimmed = prev.length >= MAX_OPEN ? prev.slice(1) : prev;
      return [...trimmed, { id, name, type, otherUser, coverImage, minimized: false }];
    });
  }, []);

  const openPrivateChat = useCallback((id, name, otherUser) => {
    openChat(id, name, 'private', otherUser);
  }, [openChat]);

  const closeChat = useCallback((id) => {
    setOpenChats((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const toggleMinimize = useCallback((id) => {
    setOpenChats((prev) =>
      prev.map((c) => c.id === id ? { ...c, minimized: !c.minimized } : c),
    );
  }, []);

  const setActiveChatTrip = useCallback((tripId) => {
    setActiveChatTripIdState(tripId);
  }, []);

  return (
    <ChatUIContext.Provider value={{ openChats, openChat, openPrivateChat, closeChat, toggleMinimize, activeChatTripId, setActiveChatTrip }}>
      {children}
    </ChatUIContext.Provider>
  );
}

export function useChatUI() {
  return useContext(ChatUIContext);
}