const axios = require('axios');

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

const verifyRecaptcha = async (req, res, next) => {
  const { recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ error: 'Token de reCAPTCHA no proporcionado.' });
  }

  try {
    const { data } = await axios.post(RECAPTCHA_VERIFY_URL, null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: recaptchaToken,
      },
    });

    if (!data.success) {
      return res.status(400).json({ error: 'reCAPTCHA inválido. Inténtalo de nuevo.' });
    }

    next();
  } catch (error) {
    console.error('Error al verificar reCAPTCHA:', error.message);
    res.status(500).json({ error: 'Error al verificar reCAPTCHA.' });
  }
};

module.exports = { verifyRecaptcha };
