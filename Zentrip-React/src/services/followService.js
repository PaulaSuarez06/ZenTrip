import { doc, setDoc, deleteDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const COL = 'follows';

function docId(followerId, followedId) {
  return `${followerId}_${followedId}`;
}

export async function followUser(followerId, followedId) {
  await setDoc(doc(db, COL, docId(followerId, followedId)), {
    followerId,
    followedId,
    createdAt: new Date().toISOString(),
  });
}

export async function unfollowUser(followerId, followedId) {
  await deleteDoc(doc(db, COL, docId(followerId, followedId)));
}

export async function getFollowingIds(userId) {
  const q = query(collection(db, COL), where('followerId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data().followedId);
}
