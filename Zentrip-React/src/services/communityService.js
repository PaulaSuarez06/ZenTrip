import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const POSTS_COL = 'community_posts';
const COMMENTS_COL = 'comments';

// Sanitize bookings: keep only non-sensitive fields
function sanitizeBookings(bookings = []) {
  const result = [];
  for (const b of bookings) {
    if (b.segments?.length > 0) {
      result.push({
        bookingType: 'vuelo',
        isRoundTrip: b.isRoundTrip ?? false,
        segments: b.segments.map((seg) => ({
          departureCity: seg.departureAirport?.cityName ?? '',
          departureCode: seg.departureAirport?.code ?? '',
          arrivalCity: seg.arrivalAirport?.cityName ?? '',
          arrivalCode: seg.arrivalAirport?.code ?? '',
          date: seg.departureTime ? seg.departureTime.slice(0, 10) : '',
        })),
        passengerCount: Array.isArray(b.passengers) ? b.passengers.length : null,
      });
    } else if (b.hotelName) {
      result.push({
        bookingType: 'hotel',
        hotelName: b.hotelName,
        checkIn: b.checkIn ?? null,
        checkOut: b.checkOut ?? null,
        nights: b.nights ?? null,
        pricePerNight: b.pricePerNight ?? null,
        totalPrice: b.totalPrice ?? null,
        currency: b.currency ?? null,
      });
    } else if (b.activityName) {
      result.push({
        bookingType: 'actividad',
        activityName: b.activityName,
        address: b.address ?? null,
        rating: b.rating ?? null,
        price: b.price ?? null,
        currency: b.currency ?? null,
        duration: b.duration ?? null,
        date: b.date ?? null,
        persons: (b.adults ?? 0) + (b.children ?? 0) || null,
      });
    } else if (b.restaurantName) {
      result.push({
        bookingType: 'restaurante',
        restaurantName: b.restaurantName,
        address: b.address ?? null,
        rating: b.rating ?? null,
        priceLevel: b.priceLevel ?? null,
        date: b.date ?? null,
        persons: (b.adults ?? 0) + (b.children ?? 0) || null,
      });
    } else if (b.carName) {
      result.push({
        bookingType: 'coche',
        carName: b.carName,
        supplierName: b.supplierName ?? null,
        pickUpDate: b.pickUpDate ?? null,
        dropOffDate: b.dropOffDate ?? null,
        days: b.days ?? null,
        pricePerDay: b.pricePerDay ?? null,
        totalPrice: b.totalPrice ?? null,
        currency: b.currency ?? null,
      });
    }
  }
  return result;
}

// Sanitize activities: strip notes, receipts, bookingId — only keep public fields
function sanitizeActivities(activities = []) {
  return activities.map(({ id, name, type, city, startTime, endTime, date }) => ({
    id: id ?? null,
    name: name ?? '',
    type: type ?? '',
    city: city ?? '',
    startTime: startTime ?? '',
    endTime: endTime ?? '',
    date: date ?? '',
  }));
}

export async function publishTrip({ trip, members, activities, userId, userProfile, options }) {
  const {
    title,
    coverImage: optionsCoverImage = null,
    shareGallery = false,
    galleryImages = [],
    shareBudget = false,
    totalBudget = null,
    shareLuggage = false,
    luggageScopeAll = false,
    luggageCategories = [],
    personalLuggageCategories = [],
    expenseSummary = null,
    shareBookings = false,
    rawBookings = [],
  } = options;

  const acceptedMembers = (members || []).filter(
    (m) => m.invitationStatus === 'accepted' || !m.invitationStatus
  );

  const sanitized = sanitizeActivities(activities);

  const post = {
    tripId: trip.id,
    userId,
    username:
      userProfile?.username ||
      userProfile?.firstName ||
      userProfile?.displayName ||
      'Viajero',
    userAvatar: userProfile?.profilePhoto || null,
    userAvatarColor: userProfile?.avatarColor || null,

    title,
    destination: trip.destination || '',
    origin: trip.origin || '',
    coverImage: optionsCoverImage ?? trip.coverImage ?? null,
    startDate: trip.startDate || null,
    endDate: trip.endDate || null,
    days: (() => {
      if (!trip.startDate || !trip.endDate) return null;
      const s = new Date(trip.startDate + 'T00:00:00');
      const e = new Date(trip.endDate + 'T00:00:00');
      return Math.round((e - s) / 86400000) + 1;
    })(),
    participantCount: acceptedMembers.length,

    shareGallery,
    galleryImages: shareGallery ? galleryImages.slice(0, 20) : [],
    shareBudget,
    totalBudget: shareBudget ? totalBudget : null,
    budgetCurrency: shareBudget ? (trip.currency || null) : null,
    shareLuggage,
    luggageScopeAll: shareLuggage ? Boolean(luggageScopeAll) : false,
    luggageCategories: shareLuggage ? luggageCategories : [],
    personalLuggageCategories: (shareLuggage && luggageScopeAll) ? personalLuggageCategories : [],

    itinerary: sanitized,
    expenseSummary: shareBudget ? (expenseSummary || null) : null,
    shareBookings,
    bookings: shareBookings ? sanitizeBookings(rawBookings) : [],

    likes: 0,
    likedBy: [],
    commentsCount: 0,
    savedBy: [],

    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, POSTS_COL), post);
  return ref.id;
}

export async function getCommunityPosts(limitCount = 20) {
  // No composite index needed: filter status in JS after fetching by date
  const q = query(
    collection(db, POSTS_COL),
    orderBy('createdAt', 'desc'),
    limit(limitCount * 2)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => p.status !== 'hidden')
    .slice(0, limitCount);
}

export async function getCommunityPostById(postId) {
  const snap = await getDoc(doc(db, POSTS_COL, postId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getUserCommunityPosts(userId) {
  // Uses orderBy(createdAt) — same auto-indexed field as getCommunityPosts — then
  // filters by userId in JS. Avoids composite-index / security-rule issues that
  // can silently block a plain where('userId', '==', ...) query.
  const q = query(
    collection(db, POSTS_COL),
    orderBy('createdAt', 'desc'),
    limit(400)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => p.userId === userId);
}

export async function toggleLike(postId, userId) {
  const ref = doc(db, POSTS_COL, postId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const liked = (snap.data().likedBy || []).includes(userId);
  await updateDoc(ref, {
    likedBy: liked ? arrayRemove(userId) : arrayUnion(userId),
    likes: increment(liked ? -1 : 1),
  });
  return !liked;
}

export async function toggleSave(postId, userId) {
  const ref = doc(db, POSTS_COL, postId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const saved = (snap.data().savedBy || []).includes(userId);
  await updateDoc(ref, {
    savedBy: saved ? arrayRemove(userId) : arrayUnion(userId),
  });
  return !saved;
}

export async function addComment(postId, userId, userProfile, text) {
  const comment = {
    userId,
    username:
      userProfile?.username ||
      userProfile?.firstName ||
      userProfile?.displayName ||
      'Viajero',
    userAvatar: userProfile?.profilePhoto || null,
    userAvatarColor: userProfile?.avatarColor || null,
    text: text.trim(),
    createdAt: serverTimestamp(),
  };
  await addDoc(collection(db, POSTS_COL, postId, COMMENTS_COL), comment);
  await updateDoc(doc(db, POSTS_COL, postId), { commentsCount: increment(1) });
}

export async function getComments(postId) {
  const q = query(
    collection(db, POSTS_COL, postId, COMMENTS_COL),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getSavedPosts(userId) {
  const q = query(
    collection(db, POSTS_COL),
    where('savedBy', 'array-contains', userId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => p.status !== 'hidden')
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

export async function unpublishPost(postId) {
  await deleteDoc(doc(db, POSTS_COL, postId));
}

export async function incrementPostView(postId) {
  const key = `zt_v_${postId}`;
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, '1');
  try {
    await updateDoc(doc(db, POSTS_COL, postId), { viewCount: increment(1) });
  } catch {
    // non-critical
  }
}

export async function updatePostVisibility(postId, { shareGallery, galleryImages, shareBudget, totalBudget, budgetCurrency, shareLuggage, luggageScopeAll, luggageCategories, personalLuggageCategories }) {
  await updateDoc(doc(db, POSTS_COL, postId), {
    shareGallery,
    galleryImages: shareGallery ? galleryImages.slice(0, 20) : [],
    shareBudget,
    totalBudget: shareBudget ? totalBudget : null,
    budgetCurrency: shareBudget ? budgetCurrency : null,
    shareLuggage,
    luggageScopeAll: shareLuggage ? Boolean(luggageScopeAll) : false,
    luggageCategories: shareLuggage ? luggageCategories : [],
    personalLuggageCategories: (shareLuggage && luggageScopeAll) ? personalLuggageCategories : [],
    updatedAt: serverTimestamp(),
  });
}
