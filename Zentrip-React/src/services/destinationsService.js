import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const COL = 'destinations';

export async function getActiveDestinations() {
  const snap = await getDocs(query(collection(db, COL), where('active', '==', true)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllDestinations() {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createDestination(data) {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    active: data.active ?? true,
    createdAt: new Date(),
  });
  return ref.id;
}

export async function updateDestination(id, data) {
  await updateDoc(doc(db, COL, id), data);
}

export async function deleteDestination(id) {
  await deleteDoc(doc(db, COL, id));
}
