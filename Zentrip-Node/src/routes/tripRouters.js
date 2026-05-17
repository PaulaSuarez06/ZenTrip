const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middlewares/authMiddleware');
const { getTripMembers, getUserTrips, addHotelBookingToTrip, deleteCloudinaryImage, removeMemberFromTrip, deleteTrip } = require('../controllers/tripControllers');

router.get('/my-trips', verifyFirebaseToken, getUserTrips);
router.delete('/gallery/image', verifyFirebaseToken, deleteCloudinaryImage);
router.get('/:tripId/members', verifyFirebaseToken, getTripMembers);
router.post('/:tripId/bookings/hotels', verifyFirebaseToken, addHotelBookingToTrip);
router.delete('/:tripId/members/:memberUid', verifyFirebaseToken, removeMemberFromTrip);
router.delete('/:tripId', verifyFirebaseToken, deleteTrip);

module.exports = router;
