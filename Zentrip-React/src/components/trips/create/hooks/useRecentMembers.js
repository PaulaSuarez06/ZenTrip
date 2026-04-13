import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../../../../config/firebaseConfig';
import { getUserByUid } from '../../../../services/userService';
import { MAX_RECENT_MEMBERS, normalizeRecentMembers } from '../../../../utils/members';

const RECENT_MEMBERS_KEY_PREFIX = 'zentrip:create-trip-recent-members';

function getStorageKey(uid) {
  return `${RECENT_MEMBERS_KEY_PREFIX}:${uid}`;
}

function loadFromCache(uid) {
  try {
    const raw = localStorage.getItem(getStorageKey(uid));
    return normalizeRecentMembers(raw ? JSON.parse(raw) : [], uid);
  } catch {
    return [];
  }
}

export function useRecentMembers(user) {
  const [recientes, setRecientes] = useState([]);

  // Carga inicial desde caché.
  useEffect(() => {
    if (!user?.uid) { setRecientes([]); return; }
    setRecientes(loadFromCache(user.uid));
  }, [user?.uid]);

  // Enriquece con datos de viajes anteriores vía Firestore + backend.
  useEffect(() => {
    if (!user?.uid) return;
    let active = true;

    const load = async () => {
      try {
        const tripsQuery = query(
          collection(db, 'trips'),
          where('uid', '==', user.uid),
          limit(20),
        );
        const tripsSnapshot = await getDocs(tripsQuery);
        const membersFromTrips = [];

        for (const tripDoc of tripsSnapshot.docs) {
          const membersSnapshot = await getDocs(collection(db, 'trips', tripDoc.id, 'members'));
          membersSnapshot.forEach((memberDoc) => {
            const data = memberDoc.data() || {};
            const memberUid = String(data.uid || '').trim();
            const memberEmail = String(data.email || '').trim().toLowerCase();
            if (!memberUid || memberUid === user.uid) return;
            const fullName = String(data.name || '').trim();
            const nameParts = fullName.split(/\s+/).filter(Boolean);
            membersFromTrips.push({
              id: memberUid,
              uid: memberUid,
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || '',
              email: memberEmail,
              username: String(data.username || '').trim(),
              avatar: data.avatar || data.profilePhoto || '',
            });
          });
        }

        if (!active) return;

        const cachedRecents = loadFromCache(user.uid);
        const merged = normalizeRecentMembers([...cachedRecents, ...membersFromTrips], user.uid);
        const toEnrich = merged.slice(0, MAX_RECENT_MEMBERS);

        const enriched = await Promise.all(
          toEnrich.map(async (recentMember) => {
            try {
              const profile = await getUserByUid(recentMember.uid);
              if (!profile) return recentMember;

              const fullName = String(profile.firstName ? `${profile.firstName} ${profile.lastName || ''}` : profile.name || '').trim();
              const parts = fullName.split(/\s+/).filter(Boolean);
              return {
                ...recentMember,
                firstName: parts[0] || recentMember.firstName,
                lastName: parts.slice(1).join(' ') || recentMember.lastName,
                username: profile.username || recentMember.username,
                avatar: profile.avatar || recentMember.avatar,
              };
            } catch {
              return recentMember;
            }
          }),
        );

        if (active) setRecientes(normalizeRecentMembers(enriched, user.uid));
      } catch (error) {
        console.warn('No se pudieron cargar miembros recientes:', error);
      }
    };

    load();
    return () => { active = false; };
  }, [user?.uid]);

  // Persiste en localStorage cada vez que cambian.
  useEffect(() => {
    if (!user?.uid) return;
    localStorage.setItem(
      getStorageKey(user.uid),
      JSON.stringify(normalizeRecentMembers(recientes, user.uid)),
    );
  }, [recientes, user?.uid]);

  const addToRecentMembers = (member) => {
    if (!member?.uid) return;
    setRecientes((prev) => normalizeRecentMembers([
      {
        id: member.uid,
        uid: member.uid,
        firstName: String(member.firstName || member.name || '').trim(),
        lastName: String(member.lastName || '').trim(),
        email: String(member.email || '').trim().toLowerCase(),
        username: String(member.username || '').trim(),
        avatar: member.avatar || '',
      },
      ...prev,
    ], user?.uid || ''));
  };

  return { recientes, addToRecentMembers };
}
