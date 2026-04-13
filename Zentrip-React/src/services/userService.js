import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { ROUTES } from '../config/routes';
import { apiClient } from './apiClient';

const USER_COLLECTION = 'users';

async function getUserDoc(uid) {
  const ref = doc(db, USER_COLLECTION, uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { ref, data: snap.data() } : null;
}

function buildDefaultProfile(user) {
  const [firstName = '', ...rest] = (user.displayName || '').split(' ');
  const lastName = rest.join(' ');
  return {
    uid: user.uid,
    email: user.email,
    firstName,
    lastName,
    username: '',
    bio: '',
    phone: '',
    country: '',
    profilePhoto: user.photoURL || '',
    avatarColor: '',
    language: 'Español',
    currency: 'EUR €',
    tripGroupType: 'both',
    petFriendly: false,
    isProfileComplete: false,
  };
}

export async function getOrCreateUserProfile(user) {
  const existing = await getUserDoc(user.uid);

  if (!existing) {
    const profile = buildDefaultProfile(user);
    await setDoc(doc(db, USER_COLLECTION, user.uid), profile, { merge: true });
    return { profile, isNew: true };
  }

  return { profile: existing.data, isNew: false };
}

export async function getPostLoginPath(user) {
  const { profile, isNew } = await getOrCreateUserProfile(user);
  if (isNew) return ROUTES.PROFILE.SETUP;
  return profile.isProfileComplete ? ROUTES.HOME : ROUTES.PROFILE.SETUP;
}

export async function searchUsersByUsername(username, maxResults = 8) {
  const term = username.trim().toLowerCase();
  if (!term) return [];
  return apiClient.get(`/search-users?query=${encodeURIComponent(term)}&limit=${maxResults}`);
}

export async function getUserByUid(uid) {
  if (!uid) return null;
  try {
    return await apiClient.get(`/users/${encodeURIComponent(uid)}`);
  } catch {
    return null;
  }
}

export async function isUsernameUnique(username, currentUid) {
  const snap = await getDocs(
    query(collection(db, USER_COLLECTION), where('username', '==', username.trim()))
  );
  return snap.docs.length === 0 || snap.docs.every((d) => d.id === currentUid);
}

export async function isPhoneUnique(phone, currentUid) {
  const snap = await getDocs(
    query(collection(db, USER_COLLECTION), where('phone', '==', phone.trim()))
  );
  return snap.docs.length === 0 || snap.docs.every((d) => d.id === currentUid);
}

export async function searchUsersByEmail(email, maxResults = 5) {
  const term = email.trim().toLowerCase();
  if (!term) return [];
  return apiClient.get(`/search-users?query=${encodeURIComponent(term)}&limit=${maxResults}&type=email`);
}
