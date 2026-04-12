const { searchHotels } = require('../services/external/hotelService');

const searchHotelsController = async (req, res) => {
  const {
    destId,
    destType,
    checkinDate,
    checkoutDate,
    adultsNumber,
    roomNumber,
    locale,
    currency,
    orderBy,
    pageNumber,
  } = req.query;

  if (!destId || !checkinDate || !checkoutDate) {
    return res.status(400).json({ error: 'destId, checkinDate y checkoutDate son obligatorios.' });
  }

  const hotels = await searchHotels({
    destId,
    destType,
    checkinDate,
    checkoutDate,
    adultsNumber,
    roomNumber,
    locale,
    currency,
    orderBy,
    pageNumber,
  });

  res.json(hotels);
};

module.exports = { searchHotelsController };
