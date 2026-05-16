import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from './AuthContext';
import { acceptChatRequest, rejectChatRequest, subscribeToIncomingRequests, subscribeToUserPrivateChats } from '../services/privateChatService';

const PrivateChatContext = createContext(null);

const lsKey = (chatId, uid) => `zentrp_pchat_${chatId}_${uid}`;

function toMs(val) {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val.toMillis === 'function') return val.toMillis();
  if (val.seconds) return val.seconds * 1000;
  return 0;
}

export function PrivateChatProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const uidRef = useRef(uid);
  uidRef.current = uid;

  const [privateChats, setPrivateChats] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [otherProfiles, setOtherProfiles] = useState({});
  const [readTimestamps, setReadTimestamps] = useState({});
  const profileUnsubsRef = useRef({});

  useEffect(() => {
    if (!uid) {
      setPrivateChats([]);
      setPendingRequests([]);
      setReadTimestamps({});
      Object.values(profileUnsubsRef.current).forEach((fn) => fn());
      profileUnsubsRef.current = {};
      return;
    }

    const unsubChats = subscribeToUserPrivateChats(uid, (chats) => {
      setPrivateChats(chats);

      // Init read timestamps from localStorage for new chats
      setReadTimestamps((prev) => {
        const next = { ...prev };
        chats.forEach((chat) => {
          if (next[chat.id] === undefined) {
            next[chat.id] = parseInt(localStorage.getItem(lsKey(chat.id, uid)) || '0', 10);
          }
        });
        return next;
      });

      chats.forEach((chat) => {
        const otherUid = chat.participants?.find((p) => p !== uid);
        if (!otherUid || profileUnsubsRef.current[otherUid]) return;
        profileUnsubsRef.current[otherUid] = onSnapshot(doc(db, 'users', otherUid), (snap) => {
          if (!snap.exists()) return;
          const d = snap.data();
          setOtherProfiles((prev) => ({
            ...prev,
            [otherUid]: {
              displayName: `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.username || 'Usuario',
              profilePhoto: d.profilePhoto || '',
              avatarColor: d.avatarColor || '',
            },
          }));
        });
      });
    });

    const unsubRequests = subscribeToIncomingRequests(uid, setPendingRequests);

    return () => {
      unsubChats();
      unsubRequests();
      Object.values(profileUnsubsRef.current).forEach((fn) => fn());
      profileUnsubsRef.current = {};
    };
  }, [uid]);

  const markPrivateChatAsRead = useCallback((chatId, ts) => {
    if (!uidRef.current) return;
    const key = lsKey(chatId, uidRef.current);
    const prev = parseInt(localStorage.getItem(key) || '0', 10);
    const newTs = Math.max(prev, ts ?? Date.now());
    if (newTs === prev) return;
    localStorage.setItem(key, newTs.toString());
    setReadTimestamps((p) => ({ ...p, [chatId]: newTs }));
  }, []);

  const accept = useCallback(async (requestId, fromUid, fromDisplayName, message) => {
    if (!uid) return;
    return acceptChatRequest(requestId, fromUid, uid, fromDisplayName, message);
  }, [uid]);

  const reject = useCallback(async (requestId) => rejectChatRequest(requestId), []);

  const chatsWithProfiles = privateChats.map((chat) => {
    const otherUid = chat.participants?.find((p) => p !== uid) || '';
    return {
      ...chat,
      otherUid,
      otherUser: otherProfiles[otherUid] || { displayName: 'Usuario', profilePhoto: '', avatarColor: '' },
    };
  });

  const isPrivateUnread = (chat) => {
    const { lastMessage } = chat;
    if (!lastMessage || lastMessage.uid === uid) return false;
    const msgTs = toMs(lastMessage.createdAt);
    if (msgTs === 0) return false;
    return msgTs > (readTimestamps[chat.id] ?? 0);
  };

  const unreadPrivateChats = chatsWithProfiles.filter(isPrivateUnread);

  const allPrivateChats = chatsWithProfiles
    .map((chat) => ({
      ...chat,
      isUnread: isPrivateUnread(chat),
      hasMention: isPrivateUnread(chat) && chat.lastMessage?.replyToUid === uid,
    }))
    .sort((a, b) => toMs(b.lastMessage?.createdAt) - toMs(a.lastMessage?.createdAt));

  const markAllPrivateChatsAsRead = useCallback(() => {
    if (!uidRef.current) return;
    const ts = Date.now();
    privateChats.forEach((chat) => {
      localStorage.setItem(lsKey(chat.id, uidRef.current), ts.toString());
    });
    setReadTimestamps((prev) => {
      const next = { ...prev };
      privateChats.forEach((chat) => { next[chat.id] = ts; });
      return next;
    });
  }, [privateChats]);

  return (
    <PrivateChatContext.Provider value={{
      privateChats: chatsWithProfiles,
      pendingRequests,
      pendingCount: pendingRequests.length,
      unreadPrivateChats,
      unreadPrivateCount: unreadPrivateChats.length,
      allPrivateChats,
      markPrivateChatAsRead,
      markAllPrivateChatsAsRead,
      accept,
      reject,
      privateReadTimestamps: readTimestamps,
    }}>
      {children}
    </PrivateChatContext.Provider>
  );
}

export function usePrivateChat() {
  return useContext(PrivateChatContext);
}
