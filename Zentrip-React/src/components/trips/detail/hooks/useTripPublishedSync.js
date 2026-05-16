import { useEffect, useRef } from 'react';
import { onSnapshot, doc, collection } from 'firebase/firestore';
import { db } from '../../../../config/firebaseConfig';
import { syncPublishedPost } from '../../../../services/communityService';

const DEBOUNCE_MS = 3000;
const INIT_GUARD_MS = 600; // tiempo para que los snapshots iniciales no disparen la sincronización

export function useTripPublishedSync(tripId, communityPostId) {
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!tripId || !communityPostId) return;

    let initialized = false;
    const initTimer = setTimeout(() => { initialized = true; }, INIT_GUARD_MS);

    function scheduleSync() {
      if (!initialized) return;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => syncPublishedPost(tripId), DEBOUNCE_MS);
    }

    const unsubs = [
      onSnapshot(doc(db, 'trips', tripId), scheduleSync),
      onSnapshot(collection(db, 'trips', tripId, 'activities'), scheduleSync),
      onSnapshot(collection(db, 'trips', tripId, 'bookings'), scheduleSync),
      onSnapshot(collection(db, 'trips', tripId, 'luggageGroup'), scheduleSync),
      onSnapshot(collection(db, 'trips', tripId, 'luggage'), scheduleSync),
      onSnapshot(collection(db, 'trips', tripId, 'members'), scheduleSync),
    ];

    return () => {
      clearTimeout(initTimer);
      clearTimeout(debounceRef.current);
      unsubs.forEach((u) => u());
    };
  }, [tripId, communityPostId]);
}
