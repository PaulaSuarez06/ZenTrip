import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { collection, collectionGroup, doc, getDoc, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from './AuthContext';

const ChatNotificationContext = createContext(null);

const lsKey = (tripId, uid) => `zentrp_chat_${tripId}_${uid}`;

function toMs(createdAt) {
  if (!createdAt) return 0;
  if (typeof createdAt === 'number') return createdAt;
  if (typeof createdAt.toMillis === 'function') return createdAt.toMillis();
  if (createdAt.seconds) return createdAt.seconds * 1000;
  return 0;
}

export function ChatNotificationProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const uidRef = useRef(uid);
  uidRef.current = uid;

  // tripId -> { id, name, lastMessage: { uid, displayName, text, createdAt } | null }
  const [tripSummaries, setTripSummaries] = useState({});
  const [readTimestamps, setReadTimestamps] = useState({});
  const tripUnsubsRef = useRef({});

  useEffect(() => {
    if (!uid) {
      Object.values(tripUnsubsRef.current).forEach((fn) => fn());
      tripUnsubsRef.current = {};
      setTripSummaries({});
      setReadTimestamps({});
      return;
    }

    const q = query(
      collectionGroup(db, 'members'),
      where('uid', '==', uid),
      where('invitationStatus', '==', 'accepted'),
    );

    const unsubMembers = onSnapshot(q, async (snapshot) => {
      const liveTripIds = new Set(snapshot.docs.map((d) => d.ref.parent.parent.id));

      // Remove subscriptions for trips no longer in the list
      Object.keys(tripUnsubsRef.current).forEach((tid) => {
        if (!liveTripIds.has(tid)) {
          tripUnsubsRef.current[tid]();
          delete tripUnsubsRef.current[tid];
          setTripSummaries((prev) => { const next = { ...prev }; delete next[tid]; return next; });
        }
      });

      // Add subscriptions for new trips
      for (const tripId of liveTripIds) {
        if (tripUnsubsRef.current[tripId]) continue;

        const key = lsKey(tripId, uid);

        // Get trip name once (doesn't change often)
        let tripName = tripId;
        try {
          const tripSnap = await getDoc(doc(db, 'trips', tripId));
          if (tripSnap.exists()) tripName = tripSnap.data().name || tripId;
        } catch { /* keep default */ }

        // Subscribe to last message in the messages subcollection
        const msgQ = query(
          collection(db, 'trips', tripId, 'messages'),
          orderBy('createdAt', 'desc'),
          limit(1),
        );

        const msgUnsub = onSnapshot(msgQ, (msgSnap) => {
          const msgDoc = msgSnap.docs[0];
          const lastMessage = msgDoc ? { id: msgDoc.id, ...msgDoc.data() } : null;

          setTripSummaries((prev) => ({
            ...prev,
            [tripId]: { id: tripId, name: tripName, lastMessage },
          }));

          setReadTimestamps((prev) => {
            if (prev[tripId] !== undefined) return prev;
            const stored = parseInt(localStorage.getItem(key) || '0', 10);
            return { ...prev, [tripId]: stored };
          });
        }, (err) => {
          console.warn(`[ChatNotif] messages listener error for trip ${tripId}:`, err);
        });

        tripUnsubsRef.current[tripId] = msgUnsub;
      }
    }, (err) => {
      console.warn('[ChatNotif] members listener error:', err);
    });

    return () => {
      unsubMembers();
      Object.values(tripUnsubsRef.current).forEach((fn) => fn());
      tripUnsubsRef.current = {};
    };
  }, [uid]);

  const markTripChatAsRead = useCallback((tripId) => {
    if (!uidRef.current) return;
    const ts = Date.now();
    localStorage.setItem(lsKey(tripId, uidRef.current), ts.toString());
    setReadTimestamps((prev) => ({ ...prev, [tripId]: ts }));
  }, []);

  const markAllChatsAsRead = useCallback(() => {
    if (!uidRef.current) return;
    const ts = Date.now();
    setTripSummaries((prev) => {
      Object.keys(prev).forEach((tripId) => {
        localStorage.setItem(lsKey(tripId, uidRef.current), ts.toString());
      });
      return prev;
    });
    setReadTimestamps((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((tripId) => { next[tripId] = ts; });
      return next;
    });
  }, []);

  const unreadChats = Object.values(tripSummaries)
    .filter((trip) => {
      const { lastMessage } = trip;
      if (!lastMessage) return false;
      if (lastMessage.uid === uid) return false;
      const msgTs = toMs(lastMessage.createdAt);
      if (msgTs === 0) return false;
      const lastRead = readTimestamps[trip.id] ?? 0;
      return msgTs > lastRead;
    })
    .map((trip) => ({
      tripId: trip.id,
      tripName: trip.name,
      displayName: trip.lastMessage.displayName,
      text: trip.lastMessage.text,
      createdAt: trip.lastMessage.createdAt,
    }));

  const chatUnreadCount = unreadChats.length;

  return (
    <ChatNotificationContext.Provider value={{
      chatUnreadCount,
      unreadChats,
      markTripChatAsRead,
      markAllChatsAsRead,
    }}>
      {children}
    </ChatNotificationContext.Provider>
  );
}

export function useChatNotifications() {
  return useContext(ChatNotificationContext);
}
