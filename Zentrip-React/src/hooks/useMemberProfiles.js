import { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export function useMemberProfiles(uids = []) {
  const [profiles, setProfiles] = useState({});
  const key = useMemo(() => [...new Set(uids.filter(Boolean))].sort().join(','), [uids]);

  useEffect(() => {
    const uniqueUids = key ? key.split(',') : [];
    if (uniqueUids.length === 0) return;

    const unsubs = uniqueUids.map((uid) =>
      onSnapshot(doc(db, 'users', uid), (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        setProfiles((prev) => ({
          ...prev,
          [uid]: {
            profilePhoto: data.profilePhoto || '',
            avatarColor: data.avatarColor || '',
          },
        }));
      }),
    );

    return () => unsubs.forEach((fn) => fn());
  }, [key]);

  return profiles;
}
