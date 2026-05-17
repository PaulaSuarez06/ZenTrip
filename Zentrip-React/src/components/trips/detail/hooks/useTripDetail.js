import { useEffect, useState } from 'react';
import { onSnapshot, doc, collection, query, where } from 'firebase/firestore';
import { db } from '../../../../config/firebaseConfig';
import { useAuth } from '../../../../context/AuthContext';
import { getTripById, getTripMembers, getActivities, getBookings } from '../../../../services/tripService';

export function useTripDetail(tripId) {
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [members, setMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!tripId || !user?.uid) return;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      setAccessDenied(false);
      try {
        // El trip es crítico — si falla, mostramos error
        const tripData = await getTripById(tripId);
        if (!tripData) {
          setError('Viaje no encontrado.');
          return;
        }
        setTrip(tripData);

        const isCreator = user?.uid === tripData?.uid;

        // Members y activities son secundarios — no bloquean si fallan
        const [membersResult, activitiesResult, bookingsResult] = await Promise.allSettled([
          getTripMembers(tripId),
          getActivities(tripId),
          getBookings(tripId),
        ]);

        if (membersResult.status === 'fulfilled') {
          setMembers(membersResult.value);
        } else {
          // Si no es el creador y getTripMembers falla, es acceso denegado (miembro eliminado)
          if (!isCreator) {
            setAccessDenied(true);
            return;
          }
          console.warn('[useTripDetail] No se pudieron cargar los miembros:', membersResult.reason);
        }

        if (activitiesResult.status === 'fulfilled') {
          let acts = activitiesResult.value;
          if (bookingsResult.status === 'fulfilled') {
            const bkgs = bookingsResult.value;
            // Separar rutas del resto de bookings
            const routeBookings = bkgs.filter((b) => b.type === 'ruta');
            const otherBookings = bkgs.filter((b) => b.type !== 'ruta');

            acts = acts.map((act) => {
              const bk = otherBookings.find((b) => b.activityId === act.id);
              if (!bk) return act;
              const addr =
                bk.type === 'vuelo' ? (bk.destinationAddress || '') :
                bk.type === 'car'   ? (bk.pickUpAddress || '') :
                (bk.address || '');
              const extra = { bookingId: bk.id };
              if (!act.address && addr) extra.address = addr;
              if (!act.city && bk.city) extra.city = bk.city;
              if (act.lat == null && bk.lat != null) extra.lat = bk.lat;
              if (act.lng == null && bk.lng != null) extra.lng = bk.lng;
              return { ...act, ...extra };
            });
            setRoutes(routeBookings);
          }
          setActivities(acts);
        } else {
          console.warn('[useTripDetail] No se pudieron cargar las actividades:', activitiesResult.reason);
        }
      } catch (err) {
        console.error('[useTripDetail] Error al cargar el viaje:', err);
        setError('No se pudo cargar el viaje.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [tripId, user?.uid]);

  // Listener en tiempo real: si el coordinador elimina al usuario mientras está en la página
  useEffect(() => {
    if (!tripId || !user?.uid) return;
    const memberRef = doc(db, 'trips', tripId, 'members', user.uid);
    const unsub = onSnapshot(memberRef, (snap) => {
      if (snap.exists() && snap.data().invitationStatus === 'removed') {
        setAccessDenied(true);
      }
    });
    return unsub;
  }, [tripId, user?.uid]);

  // Listener en tiempo real: actualizar rutas cuando se agregan/modifican bookings
  useEffect(() => {
    if (!tripId) return;
    const bookingsRef = collection(db, 'trips', tripId, 'bookings');
    const q = query(bookingsRef, where('type', '==', 'ruta'));
    const unsub = onSnapshot(q, (snap) => {
      const routeBookings = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRoutes(routeBookings);
    });
    return unsub;
  }, [tripId]);

  // Actividades agrupadas por fecha: { 'YYYY-MM-DD': [activity, ...] }
  const activitiesByDate = (() => {
    const acc = activities.reduce((obj, act) => {
      if (!act.date) return obj;
      if (!obj[act.date]) obj[act.date] = [];
      obj[act.date].push(act);
      return obj;
    }, {});

    // Agregar rutas como actividades
    routes.forEach((route) => {
      if (!route.date) return;
      if (!acc[route.date]) acc[route.date] = [];

      // Extraer origen y destino de los waypoints
      const waypoints = route.waypoints || [];
      const origin = waypoints.length > 0 ? (typeof waypoints[0] === 'string' ? waypoints[0] : waypoints[0]?.value) : '';
      const destination = waypoints.length > 1 ? (typeof waypoints[waypoints.length - 1] === 'string' ? waypoints[waypoints.length - 1] : waypoints[waypoints.length - 1]?.value) : '';

      acc[route.date].push({
        id: route.id,
        type: 'ruta',
        name: route.name || 'Ruta guardada',
        startTime: route.departureTime || null,
        endTime: route.arrivalTime || null,
        date: route.date,
        source: 'booking',
        bookingId: route.id,
        distance: route.distance,
        duration: route.duration,
        travelMode: route.travelMode,
        origin,
        destination,
        waypoints,
      });
    });

    return acc;
  })();

  // Días del viaje: rango derivado del trip/stops + cualquier fecha de actividad existente
  const tripDays = (() => {
    const daySet = new Set();

    // Rango de fechas desde trip o stops
    let startDate = trip?.startDate || '';
    let endDate   = trip?.endDate   || '';
    if (!startDate || !endDate) {
      const stops = Array.isArray(trip?.stops) ? trip.stops : [];
      const ws = stops.filter((s) => s.startDate);
      const we = stops.filter((s) => s.endDate);
      if (!startDate && ws.length > 0) startDate = ws.map((s) => s.startDate).sort()[0];
      if (!endDate   && we.length > 0) endDate   = we.map((s) => s.endDate).sort().reverse()[0];
    }
    if (startDate && endDate) {
      const cur = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate   + 'T00:00:00');
      while (cur <= end) {
        const y = cur.getFullYear();
        const mo = String(cur.getMonth() + 1).padStart(2, '0');
        const dy = String(cur.getDate()).padStart(2, '0');
        daySet.add(`${y}-${mo}-${dy}`);
        cur.setDate(cur.getDate() + 1);
      }
    }

    // Incluir siempre fechas de actividades existentes (aunque queden fuera del rango)
    activities.forEach((act) => { if (act.date) daySet.add(act.date); });

    return [...daySet].sort();
  })();

  const refetch = async () => {
    try {
      const [activitiesResult, bookingsResult] = await Promise.allSettled([
        getActivities(tripId),
        getBookings(tripId),
      ]);

      if (activitiesResult.status === 'fulfilled') {
        let acts = activitiesResult.value;
        if (bookingsResult.status === 'fulfilled') {
          const bkgs = bookingsResult.value;
          const routeBookings = bkgs.filter((b) => b.type === 'ruta');
          const otherBookings = bkgs.filter((b) => b.type !== 'ruta');

          acts = acts.map((act) => {
            const bk = otherBookings.find((b) => b.activityId === act.id);
            if (!bk) return act;
            const addr =
              bk.type === 'vuelo' ? (bk.destinationAddress || '') :
              bk.type === 'car'   ? (bk.pickUpAddress || '') :
              (bk.address || '');
            const extra = { bookingId: bk.id };
            if (!act.address && addr) extra.address = addr;
            if (!act.city && bk.city) extra.city = bk.city;
            if (act.lat == null && bk.lat != null) extra.lat = bk.lat;
            if (act.lng == null && bk.lng != null) extra.lng = bk.lng;
            return { ...act, ...extra };
          });
          setRoutes(routeBookings);
        }
        setActivities(acts);
      }
    } catch (err) {
      console.error('[useTripDetail] Error refetching:', err);
    }
  };

  return {
    trip,
    members,
    activities,
    activitiesByDate,
    tripDays,
    loading,
    error,
    accessDenied,
    setActivities,
    setMembers,
    setRoutes,
    refetch,
  };
}
