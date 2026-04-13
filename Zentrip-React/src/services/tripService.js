import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
import { apiClient } from './apiClient';

export async function createTrip(uid, form) {
  const { members, ...tripData } = form;
  const tripPayload = {
    uid,
    name: tripData.name || '',
    origin: tripData.origin || '',
    destination: tripData.destination || '',
    startDate: tripData.startDate || '',
    endDate: tripData.endDate || '',
    currency: tripData.currency || '',
    budget: tripData.budget || '',
    hasPet: Boolean(tripData.hasPet),
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'trips'), tripPayload);

  const memberRef = doc(db, 'trips', docRef.id, 'members', uid);
  try {
    await setDoc(memberRef, {
      uid,
      email: auth.currentUser?.email || '',
      role: 'coordinator',
      invitationStatus: 'accepted',
      acceptedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.warn('No se pudo guardar el creador en members:', error);
  }

  for (const member of (members || [])) {
    if (!member?.uid) continue;
    const invitedRef = doc(db, 'trips', docRef.id, 'members', member.uid);
    try {
      await setDoc(invitedRef, {
        uid: member.uid,
        email: member.email || '',
        name: member.name || '',
        username: member.username || '',
        avatar: member.avatar || '',
        role: 'member',
        invitationStatus: member.invitationStatus || 'pending',
      }, { merge: true });
    } catch {
      // No bloquear la creación del viaje si falla la escritura de un miembro.
    }
  }

  return docRef.id;
}

export async function saveTripDraft(uid, form) {
  const { members, ...tripData } = form;
  const payload = {
    uid,
    isDraft: true,
    name: tripData.name || '',
    origin: tripData.origin || '',
    destination: tripData.destination || '',
    startDate: tripData.startDate || '',
    endDate: tripData.endDate || '',
    currency: tripData.currency || '',
    budget: tripData.budget || '',
    hasPet: Boolean(tripData.hasPet),
    members: members || [],
    formSnapshot: form,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'trips'), payload);
  return docRef.id;
}

export async function deleteTrip(tripId) {
  await deleteDoc(doc(db, 'trips', tripId));
}

export async function getUserTrips(uid) {
  const snapshot = await getDocs(query(collection(db, 'trips'), where('uid', '==', uid)));
  const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

export async function sendTripInvitations(payload) {
  return apiClient.post('/invitations/send', payload);
}

export async function getTripPublicInvitePreview() {
  return apiClient.get('/invitations/public-link/preview');
}

export async function getTripPublicInviteLink(tripId, preferredToken = '') {
  return apiClient.post('/invitations/public-link', { tripId, preferredToken });
}
