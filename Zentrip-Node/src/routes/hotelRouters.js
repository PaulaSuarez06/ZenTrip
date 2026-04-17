const express = require('express');
//enrutador express
const router = express.Router();
const { searchHotelsController, getHotelDetailsController, getHotelPoliciesController, getHotelPhotosController, getChildrenPoliciesController, getRoomListController } = require('../controllers/hotelcontrollers');

router.get('/search', searchHotelsController);
router.get('/details', getHotelDetailsController);
router.get('/policies', getHotelPoliciesController);
router.get('/photos', getHotelPhotosController);
router.get('/children-policies', getChildrenPoliciesController);
router.get('/rooms', getRoomListController);

module.exports = router;
