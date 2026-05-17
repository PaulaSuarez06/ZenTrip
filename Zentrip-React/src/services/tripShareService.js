import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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

function nullify(v) { return v ?? null; }

function extractTime(v) {
  if (!v) return null;
  if (typeof v === 'string' && v.includes('T')) return v.split('T')[1].slice(0, 5);
  return v;
}

function sanitizeBookings(bookings = []) {
  return bookings.map((b) => {
    if (b.bookingType === 'vuelo' || b.segments?.length > 0) {
      return {
        bookingType: 'vuelo',
        isRoundTrip: b.isRoundTrip ?? false,
        totalPrice: nullify(b.totalPrice),
        currency: b.currency || '',
        passengerCount: b.passengerCount ?? 0,
        segments: (b.segments ?? []).map((s) => ({
          departureCode: s.departureCode || s.departureAirport?.code || '',
          departureCity: s.departureCity || s.departureAirport?.cityName || s.departureAirport?.city || '',
          departureAirportName: s.departureAirport?.name || '',
          arrivalCode: s.arrivalCode || s.arrivalAirport?.code || '',
          arrivalCity: s.arrivalCity || s.arrivalAirport?.cityName || s.arrivalAirport?.city || '',
          arrivalAirportName: s.arrivalAirport?.name || '',
          departureTime: extractTime(s.departureTime),
          arrivalTime: extractTime(s.arrivalTime),
          date: nullify(s.date),
          flightNumber: nullify(s.flightNumber),
          airline: nullify(s.airline),
          carriers: s.carriers ? s.carriers.map((c) => ({ name: c.name || '' })) : null,
        })),
      };
    }
    if (b.hotelName) return { bookingType: 'hotel', hotelName: b.hotelName, checkIn: nullify(b.checkIn), checkOut: nullify(b.checkOut), nights: nullify(b.nights), totalPrice: nullify(b.totalPrice), currency: b.currency || '' };
    if (b.activityName) return { bookingType: 'actividad', activityName: b.activityName, date: nullify(b.date), persons: nullify(b.persons), price: nullify(b.price), currency: b.currency || '', duration: nullify(b.duration), rating: nullify(b.rating), address: nullify(b.address) };
    if (b.restaurantName) return { bookingType: 'restaurante', restaurantName: b.restaurantName, date: nullify(b.date), persons: nullify(b.persons), rating: nullify(b.rating), address: nullify(b.address) };
    if (b.carName) return { bookingType: 'coche', carName: b.carName, supplierName: nullify(b.supplierName), pickUpDate: nullify(b.pickUpDate), dropOffDate: nullify(b.dropOffDate), days: nullify(b.days), totalPrice: nullify(b.totalPrice), currency: b.currency || '' };
    return null;
  }).filter(Boolean);
}

export async function upsertTripShare(trip, activities, memberCount, options = {}) {
  const {
    shareTitle = '', coverImage = null,
    shareGallery = false, galleryImages = [],
    shareBudget = false, totalBudget = null, budgetCurrency = '', expenseSummary = null,
    shareLuggage = false, luggageCategories = [], personalLuggageCategories = [], luggageScopeAll = false,
    shareBookings = false, rawBookings = [],
  } = options;

  const sanitizedItinerary = (activities || []).map((a) => ({
    id: a.id || '',
    name: a.name || '',
    type: a.type || 'actividad',
    date: a.date || null,
    startTime: a.startTime || null,
    endTime: a.endTime || null,
    city: a.city || null,
  }));

  const data = {
    tripId: trip.id,
    tripName: trip.name || '',
    shareTitle: shareTitle || trip.name || '',
    destination: trip.destination || '',
    origin: trip.origin || '',
    startDate: trip.startDate || null,
    endDate: trip.endDate || null,
    coverImage: coverImage || trip.coverImage || null,
    currency: trip.currency || '',
    participantCount: memberCount || 0,
    itinerary: sanitizedItinerary,
    shareGallery,
    galleryImages: shareGallery ? galleryImages : [],
    shareBudget,
    totalBudget: shareBudget ? totalBudget : null,
    budgetCurrency: shareBudget ? budgetCurrency : '',
    expenseSummary: shareBudget ? expenseSummary : null,
    shareLuggage,
    luggageCategories: shareLuggage ? luggageCategories : [],
    personalLuggageCategories: shareLuggage && luggageScopeAll ? personalLuggageCategories : [],
    luggageScopeAll: shareLuggage ? luggageScopeAll : false,
    shareBookings,
    bookings: shareBookings ? sanitizeBookings(rawBookings) : [],
    updatedAt: serverTimestamp(),
  };

  const q = query(collection(db, SHARES_COL), where('tripId', '==', trip.id));
  const snap = await getDocs(q);

  if (!snap.empty) {
    const existing = snap.docs[0];
    await updateDoc(doc(db, SHARES_COL, existing.id), data);
    return existing.id;
  }

  const docRef = await addDoc(collection(db, SHARES_COL), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
}

export async function revokeTripShare(tripId) {
  const q = query(collection(db, SHARES_COL), where('tripId', '==', tripId));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

export async function getTripShare(shareId) {
  const snap = await getDoc(doc(db, SHARES_COL, shareId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
