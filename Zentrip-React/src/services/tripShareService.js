import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const SHARES_COL = 'trip_shares';
const REQUESTS_COL = 'trip_share_requests';
const NOTIFS_COL = 'notifications';

// ── Permission requests ──────────────────────────────────────────────────────

export async function getSharePermissionStatus(tripId, userId) {
  const q = query(
    collection(db, REQUESTS_COL),
    where('tripId', '==', tripId),
    where('requesterId', '==', userId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return { status: 'not_requested', requestId: null };
  return { status: snap.docs[0].data().status, requestId: snap.docs[0].id };
}

export async function requestSharePermission({ tripId, tripName, creatorId, requesterId, requesterName, requesterAvatar, requesterAvatarColor }) {
  const reqRef = await addDoc(collection(db, REQUESTS_COL), {
    tripId,
    tripName,
    creatorId,
    requesterId,
    requesterName,
    requesterAvatar: requesterAvatar || null,
    requesterAvatarColor: requesterAvatarColor || null,
    status: 'pending',
    requestedAt: serverTimestamp(),
    respondedAt: null,
  });

  await addDoc(collection(db, NOTIFS_COL), {
    recipientUid: creatorId,
    type: 'share_request',
    tripId,
    tripName,
    requesterId,
    requesterName,
    requesterAvatar: requesterAvatar || null,
    requesterAvatarColor: requesterAvatarColor || null,
    shareRequestId: reqRef.id,
    read: false,
    createdAt: serverTimestamp(),
  });

  return reqRef.id;
}

export async function approveShareRequest({ shareRequestId, requesterId, tripId, tripName }) {
  await updateDoc(doc(db, REQUESTS_COL, shareRequestId), {
    status: 'approved',
    respondedAt: serverTimestamp(),
  });
  await addDoc(collection(db, NOTIFS_COL), {
    recipientUid: requesterId,
    type: 'share_approved',
    tripId,
    tripName,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function denyShareRequest({ shareRequestId, requesterId, tripId, tripName }) {
  await updateDoc(doc(db, REQUESTS_COL, shareRequestId), {
    status: 'denied',
    respondedAt: serverTimestamp(),
  });
  await addDoc(collection(db, NOTIFS_COL), {
    recipientUid: requesterId,
    type: 'share_denied',
    tripId,
    tripName,
    read: false,
    createdAt: serverTimestamp(),
  });
}

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
