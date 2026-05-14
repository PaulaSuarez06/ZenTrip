import { addDoc, collection, deleteDoc, doc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export const buildPrivateChatId = (uid1, uid2) => [uid1, uid2].sort().join('_');

export async function sendChatRequest(fromUid, toUid, fromDisplayName, fromProfilePhoto = '', message = '') {
  const chatId = buildPrivateChatId(fromUid, toUid);

  // Query by fromUid (provable by the security rule: fromUid == auth.uid), filter chatId client-side
  const reqSnap = await getDocs(query(collection(db, 'chatRequests'), where('fromUid', '==', fromUid)));
  const pending = reqSnap.docs.find((d) => d.data().chatId === chatId && d.data().status === 'pending');
  if (pending) return { status: 'pending', requestId: pending.id };

  // Check if chat already exists
  const chatSnap = await getDocs(query(collection(db, 'privateChats'), where('participants', 'array-contains', fromUid)));
  if (chatSnap.docs.some((d) => d.data().participants.includes(toUid))) return { status: 'exists', chatId };

  const docRef = await addDoc(collection(db, 'chatRequests'), {
    fromUid, toUid, fromDisplayName, fromProfilePhoto, chatId,
    status: 'pending',
    ...(message ? { message } : {}),
    createdAt: serverTimestamp(),
  });
  return { status: 'requested', requestId: docRef.id };
}

export async function cancelChatRequest(requestId) {
  await deleteDoc(doc(db, 'chatRequests', requestId));
}

export async function acceptChatRequest(requestId, fromUid, toUid, fromDisplayName = '', message = '') {
  const chatId = buildPrivateChatId(fromUid, toUid);
  const ts = Date.now();
  await setDoc(doc(db, 'privateChats', chatId), {
    participants: [fromUid, toUid],
    createdAt: serverTimestamp(),
    lastMessage: message ? { uid: fromUid, displayName: fromDisplayName, text: message, createdAt: ts } : null,
    ...(message ? { introMessage: { uid: fromUid, displayName: fromDisplayName, text: message, createdAt: ts } } : {}),
  });
  await updateDoc(doc(db, 'chatRequests', requestId), { status: 'accepted' });
  return chatId;
}

export async function rejectChatRequest(requestId) {
  await updateDoc(doc(db, 'chatRequests', requestId), { status: 'rejected' });
}

export async function sendPrivateMessage(chatId, uid, displayName, text, replyTo = null) {
  await addDoc(collection(db, 'privateChats', chatId, 'messages'), {
    uid, displayName, text,
    ...(replyTo ? { replyTo } : {}),
    createdAt: serverTimestamp(),
  });
  updateDoc(doc(db, 'privateChats', chatId), {
    lastMessage: {
      uid, displayName, text, createdAt: Date.now(),
      ...(replyTo ? { replyToUid: replyTo.uid } : {}),
    },
  }).catch(() => {});
}

export function subscribeToPrivateMessages(chatId, callback) {
  let msgs = [];
  let intro = null;

  const emit = () => {
    callback(intro ? [{ id: 'intro', ...intro, isIntro: true }, ...msgs] : msgs);
  };

  const unsubMsg = onSnapshot(
    query(collection(db, 'privateChats', chatId, 'messages'), orderBy('createdAt', 'asc')),
    (snap) => { msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() })); emit(); },
  );

  const unsubChat = onSnapshot(doc(db, 'privateChats', chatId), (snap) => {
    intro = snap.exists() ? (snap.data().introMessage || null) : null;
    emit();
  });

  return () => { unsubMsg(); unsubChat(); };
}

export function subscribeToUserPrivateChats(uid, callback) {
  const q = query(collection(db, 'privateChats'), where('participants', 'array-contains', uid));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export function subscribeToIncomingRequests(uid, callback) {
  // Single where clause — no composite index needed; filter status client-side
  const q = query(collection(db, 'chatRequests'), where('toUid', '==', uid));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((r) => r.status === 'pending'));
  });
}

export async function fetchOutgoingPendingRequests(fromUid) {
  const snap = await getDocs(query(collection(db, 'chatRequests'), where('fromUid', '==', fromUid)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((r) => r.status === 'pending');
}

export async function searchUsers(term, currentUid) {
  if (!term || term.length < 2) return [];
  const lower = term.toLowerCase();
  const snap = await getDocs(query(collection(db, 'users'), limit(100)));
  return snap.docs
    .map((d) => ({ uid: d.id, ...d.data() }))
    .filter((u) => u.uid !== currentUid)
    .filter((u) => {
      const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      return name.includes(lower) || (u.username || '').toLowerCase().includes(lower);
    })
    .slice(0, 10);
}
