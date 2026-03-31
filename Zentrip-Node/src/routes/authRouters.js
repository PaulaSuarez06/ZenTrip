const express = require('express');
const router = express.Router();
const { verifyRecaptcha } = require('../middlewares/recaptchaMiddleware');

// POST /api/auth/verify-recaptcha
// El frontend envía el token antes de hacer login con Firebase
router.post('/verify-recaptcha', verifyRecaptcha, (req, res) => {
  res.json({ success: true });
});

module.exports = router;
