const axios = require('axios');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
//cabecera de la api para las peticiones
const RAPIDAPI_HOST = 'booking-com.p.rapidapi.com';
//la que utilizo para las llamadas
const BASE_URL = `https://${RAPIDAPI_HOST}/v1`;

const rapidApiHeaders = {
  'x-rapidapi-key': RAPIDAPI_KEY,
  'x-rapidapi-host': RAPIDAPI_HOST,
};

const searchHotels = async ({
  destId,
  destType = 'city',
  checkinDate,
  checkoutDate,
  adultsNumber = 1,
  roomNumber = 1,
  locale = 'es-es',
  currency = 'EUR',
  orderBy = 'popularity',
  pageNumber = 0,
}) => {
  const response = await axios.get(`${BASE_URL}/hotels/search`, {
    headers: rapidApiHeaders,
    params: {
      dest_id: destId,
      dest_type: destType,
      checkin_date: checkinDate,
      checkout_date: checkoutDate,
      adults_number: adultsNumber,
      room_number: roomNumber,
      locale,
      currency,
      order_by: orderBy,
      page_number: pageNumber,
      units: 'metric',
      filter_by_currency: currency,
    },
  });

  return response.data;
};

module.exports = { searchHotels };


//recibe los parametros ya listos, llama a booking y devuelve la respuesta
//solo hace la llamada  a la api externa