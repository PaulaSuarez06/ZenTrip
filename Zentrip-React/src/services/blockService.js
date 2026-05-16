import { collection, deleteDoc, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const blockDocId = (blockerUid, blockedUid) => `${blockerUid}_${blockedUid}`;

export async function blockUser(blockerUid, blockedUid) {
  await setDoc(doc(db, 'blocks', blockDocId(blockerUid, blockedUid)), {
    blockerUid,
    blockedUid,
    createdAt: serverTimestamp(),
  });
}

export async function unblockUser(blockerUid, blockedUid) {
  await deleteDoc(doc(db, 'blocks', blockDocId(blockerUid, blockedUid)));
}

export async function isBlockedBy(targetUid, myUid) {
  const snap = await getDoc(doc(db, 'blocks', blockDocId(targetUid, myUid)));
  return snap.exists();
}

export function subscribeToMyBlocks(uid, callback) {
  const q = query(collection(db, 'blocks'), where('blockerUid', '==', uid));
  return onSnapshot(q, (snap) => callback(new Set(snap.docs.map((d) => d.data().blockedUid))));
}

// Reactively tells whether `targetUid` has blocked `myUid`
export function subscribeToIsBlockedBy(targetUid, myUid, callback) {
  return onSnapshot(doc(db, 'blocks', blockDocId(targetUid, myUid)), (snap) => callback(snap.exists()));
}
