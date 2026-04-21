const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middlewares/authMiddleware');
const { getTripMembers, getUserTrips, addHotelBookingToTrip } = require('../controllers/tripControllers');

router.get('/my-trips', verifyFirebaseToken, getUserTrips);
router.get('/:tripId/members', verifyFirebaseToken, getTripMembers);
router.post('/:tripId/bookings/hotels', verifyFirebaseToken, addHotelBookingToTrip);

module.exports = router;
