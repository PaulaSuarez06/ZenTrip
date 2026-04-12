const express = require('express');
//enrutador express
const router = express.Router();
const { searchHotelsController } = require('../controllers/hotelcontrollers');

router.get('/search', searchHotelsController);

module.exports = router;
