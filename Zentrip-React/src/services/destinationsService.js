import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export async function getActiveDestinations() {
  const snap = await getDocs(query(collection(db, 'destinations'), where('active', '==', true)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
