const { resolveDestinationByCity, searchHotels, getHotelDetails } = require('../services/external/hotelService');

const searchHotelsController = async (req, res) => {
  const {
    city,
    destId,
    searchType,
    arrivalDate,
    departureDate,
    adults,
    roomQty,
    languageCode,
    currencyCode,
    pageNumber,
  } = req.query;

  if (!city && !destId) {
    return res.status(400).json({ error: 'city o destId es obligatorio.' });
  }

  try {
    let resolvedDestId = destId;
    let destination = null;

    if (!resolvedDestId && city) {
      const resolved = await resolveDestinationByCity({ city, languageCode });
      resolvedDestId = resolved.destId;
      destination = resolved.destination;
    }

    if (!resolvedDestId) {
      return res.status(404).json({ error: `No se pudo resolver la ciudad "${city}".` });
    }

    const hotels = await searchHotels({
      destId: resolvedDestId,
      searchType,
      arrivalDate,
      departureDate,
      adults,
      roomQty,
      languageCode,
      currencyCode,
      pageNumber,
    });

    res.json({
      ...hotels,
      meta: {
        city: city || destination?.cityName || destination?.name || null,
        destination,
        destId: resolvedDestId,
      },
    });
  } catch (error) {
    const status = error.status || error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    res.status(status).json({ error: message });
  }
};

const getHotelDetailsController = async (req, res) => {
  const {
    hotelId,
    arrivalDate,
    departureDate,
    adults,
    childrenAge,
    roomQty,
    units,
    temperatureUnit,
    languageCode,
    currencyCode,
  } = req.query;

  if (!hotelId) {
    return res.status(400).json({ error: 'hotelId es obligatorio.' });
  }

  try {
    const details = await getHotelDetails({
      hotelId,
      arrivalDate,
      departureDate,
      adults,
      childrenAge,
      roomQty,
      units,
      temperatureUnit,
      languageCode,
      currencyCode,
    });

    res.json(details);
  } catch (error) {
    const status = error.status || error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    res.status(status).json({ error: message });
  }
};

module.exports = { searchHotelsController, getHotelDetailsController };
