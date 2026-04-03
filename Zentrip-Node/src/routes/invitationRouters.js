const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middlewares/authMiddleware');
const {
	sendTripInvitations,
	verifyInvitationToken,
	acceptInvitationHandler,
	claimMyInvitationsHandler,
	createOrGetTripPublicLinkHandler,
	getTripPublicLinkPreviewHandler,
	regenerateTripPublicLinkHandler,
	verifyTripPublicTokenHandler,
	acceptTripPublicInvitationHandler,
} = require('../controllers/invitationControllers');

router.post('/send', verifyFirebaseToken, sendTripInvitations);
router.get('/verify', verifyInvitationToken);
router.post('/accept', verifyFirebaseToken, acceptInvitationHandler);
router.post('/claim-my-invitations', verifyFirebaseToken, claimMyInvitationsHandler);
router.get('/public-link/preview', verifyFirebaseToken, getTripPublicLinkPreviewHandler);
router.post('/public-link', verifyFirebaseToken, createOrGetTripPublicLinkHandler);
router.post('/public-link/regenerate', verifyFirebaseToken, regenerateTripPublicLinkHandler);
router.get('/public-verify', verifyTripPublicTokenHandler);
router.post('/public-accept', verifyFirebaseToken, acceptTripPublicInvitationHandler);

module.exports = router;