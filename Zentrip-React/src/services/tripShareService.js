import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const SHARES_COL = 'trip_shares';

export async function getOrCreateTripShare(trip, activities, memberCount) {
  const q = query(collection(db, SHARES_COL), where('tripId', '==', trip.id));
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;

  const sanitizedItinerary = (activities || []).map((a) => ({
    id: a.id || '',
    name: a.name || '',
    type: a.type || 'actividad',
    date: a.date || null,
    startTime: a.startTime || null,
    endTime: a.endTime || null,
    city: a.city || null,
  }));

  const docRef = await addDoc(collection(db, SHARES_COL), {
    tripId: trip.id,
    createdAt: serverTimestamp(),
    tripName: trip.name || '',
    destination: trip.destination || '',
    origin: trip.origin || '',
    startDate: trip.startDate || null,
    endDate: trip.endDate || null,
    coverImage: trip.coverImage || null,
    currency: trip.currency || '',
    participantCount: memberCount || 0,
    itinerary: sanitizedItinerary,
  });

  return docRef.id;
}

export async function getTripShare(shareId) {
  const snap = await getDoc(doc(db, SHARES_COL, shareId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
