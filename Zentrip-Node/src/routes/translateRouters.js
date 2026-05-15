const express = require('express');
const router = express.Router();
const { translateTexts } = require('../controllers/translateController');

router.post('/', translateTexts);

module.exports = router;
