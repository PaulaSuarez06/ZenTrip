import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { collection, collectionGroup, doc, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
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

    const unsubMembers = onSnapshot(q, (snapshot) => {
      const liveTripIds = new Set(snapshot.docs.map((d) => d.ref.parent.parent.id));

      // Remove subscriptions for trips no longer in the list
      Object.keys(tripUnsubsRef.current).forEach((tid) => {
        if (!liveTripIds.has(tid)) {
          const unsub = tripUnsubsRef.current[tid];
          if (typeof unsub === 'function') unsub();
          delete tripUnsubsRef.current[tid];
          setTripSummaries((prev) => { const next = { ...prev }; delete next[tid]; return next; });
        }
      });

      // Add subscriptions for new trips — all in parallel (no serial await)
      for (const tripId of liveTripIds) {
        if (tripId in tripUnsubsRef.current) continue;

        tripUnsubsRef.current[tripId] = true; // in-progress sentinel
        const key = lsKey(tripId, uid);
        const meta = { name: tripId, coverImage: null };
        let msgUnsub = null;

        const tripDocUnsub = onSnapshot(doc(db, 'trips', tripId), (tripSnap) => {
          if (!(tripId in tripUnsubsRef.current)) { tripDocUnsub(); return; }
          const d = tripSnap.exists() ? tripSnap.data() : {};
          meta.name = d.name || tripId;
          meta.coverImage = d.coverImage || null;

          if (!msgUnsub) {
            const msgQ = query(
              collection(db, 'trips', tripId, 'messages'),
              orderBy('createdAt', 'desc'),
              limit(5),
            );
            msgUnsub = onSnapshot(msgQ, (msgSnap) => {
              const docs = msgSnap.docs;
              const rawLast = docs[0] ? { id: docs[0].id, ...docs[0].data() } : null;
              const lastMessage = rawLast ? {
                ...rawLast,
                createdAt: rawLast.createdAt ?? (docs[0].metadata.hasPendingWrites ? Date.now() : null),
                mentionUids: rawLast.mentionUids ?? rawLast.mentions?.map((m) => m.uid),
                replyToUid: rawLast.replyToUid ?? rawLast.replyTo?.uid,
              } : null;
              const currentUid = uidRef.current;
              const lastMentionTs = docs.reduce((maxTs, d) => {
                const data = d.data();
                if (data.uid === currentUid) return maxTs;
                const uids = data.mentionUids ?? data.mentions?.map((m) => m.uid) ?? [];
                const replyUid = data.replyToUid ?? data.replyTo?.uid;
                if (!uids.includes(currentUid) && !uids.includes('todos') && replyUid !== currentUid) return maxTs;
                return Math.max(maxTs, toMs(data.createdAt));
              }, 0);
              setTripSummaries((prev) => ({
                ...prev,
                [tripId]: { id: tripId, name: meta.name, coverImage: meta.coverImage, lastMessage, lastMentionTs },
              }));
              setReadTimestamps((prev) => {
                if (prev[tripId] !== undefined) return prev;
                const stored = parseInt(localStorage.getItem(key) || '0', 10);
                return { ...prev, [tripId]: stored };
              });
            }, (err) => {
              console.warn(`[ChatNotif] messages listener error for trip ${tripId}:`, err);
            });
          } else {
            setTripSummaries((prev) => prev[tripId]
              ? { ...prev, [tripId]: { ...prev[tripId], name: meta.name, coverImage: meta.coverImage } }
              : prev,
            );
          }
        }, (err) => {
          console.warn(`[ChatNotif] trip doc listener error for trip ${tripId}:`, err);
        });

        tripUnsubsRef.current[tripId] = () => { tripDocUnsub(); if (msgUnsub) msgUnsub(); };
      }
    }, (err) => {
      console.warn('[ChatNotif] members listener error:', err);
    });

    return () => {
      unsubMembers();
      Object.values(tripUnsubsRef.current).forEach((fn) => { if (typeof fn === 'function') fn(); });
      tripUnsubsRef.current = {};
    };
  }, [uid]);

  const markTripChatAsRead = useCallback((tripId, ts) => {
    if (!uidRef.current) return;
    const key = lsKey(tripId, uidRef.current);
    const prev = parseInt(localStorage.getItem(key) || '0', 10);
    const newTs = Math.max(prev, ts ?? Date.now());
    if (newTs === prev) return;
    localStorage.setItem(key, newTs.toString());
    setReadTimestamps((p) => ({ ...p, [tripId]: newTs }));
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

  const isUnread = (trip) => {
    const { lastMessage } = trip;
    if (!lastMessage || lastMessage.uid === uid) return false;
    const msgTs = toMs(lastMessage.createdAt);
    if (msgTs === 0) return false;
    return msgTs > (readTimestamps[trip.id] ?? 0);
  };

  const unreadChats = Object.values(tripSummaries)
    .filter(isUnread)
    .map((trip) => ({
      tripId: trip.id,
      tripName: trip.name,
      displayName: trip.lastMessage.displayName,
      text: trip.lastMessage.text,
      createdAt: trip.lastMessage.createdAt,
    }));

  const allTripChats = Object.values(tripSummaries)
    .map((trip) => {
      const readTs = readTimestamps[trip.id] ?? 0;
      const unread = isUnread(trip);
      const mentionFromTs = (trip.lastMentionTs ?? 0) > readTs;
      const mentionFromLastMsg = unread && (
        trip.lastMessage?.mentionUids?.includes(uid) ||
        trip.lastMessage?.mentionUids?.includes('todos') ||
        trip.lastMessage?.replyToUid === uid
      );
      return {
        ...trip,
        isUnread: unread,
        hasMention: mentionFromTs || mentionFromLastMsg,
      };
    })
    .sort((a, b) => toMs(b.lastMessage?.createdAt) - toMs(a.lastMessage?.createdAt));

  const chatUnreadCount = unreadChats.length;

  return (
    <ChatNotificationContext.Provider value={{
      chatUnreadCount,
      unreadChats,
      allTripChats,
      markTripChatAsRead,
      markAllChatsAsRead,
      tripReadTimestamps: readTimestamps,
    }}>
      {children}
    </ChatNotificationContext.Provider>
  );
}

export function useChatNotifications() {
  return useContext(ChatNotificationContext);
}
