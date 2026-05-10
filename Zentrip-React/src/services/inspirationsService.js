import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const COL = 'inspirations';

export async function getInspirations() {
  const snap = await getDocs(query(collection(db, COL), where('active', '==', true)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllInspirations() {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getInspirationById(id) {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createInspiration(data) {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    active: data.active ?? true,
    createdAt: new Date(),
  });
  return ref.id;
}

export async function updateInspiration(id, data) {
  await updateDoc(doc(db, COL, id), data);
}

export async function deleteInspiration(id) {
  await deleteDoc(doc(db, COL, id));
}
