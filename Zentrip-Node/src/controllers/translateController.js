async function translateTexts(req, res, next) {
  try {
    const { texts, target, source = 'es' } = req.body;

    if (!texts || !Array.isArray(texts) || texts.length === 0 || !target) {
      return res.status(400).json({ error: 'Se requieren texts (array) y target (idioma).' });
    }

    if (target === source) {
      return res.json({ translations: texts });
    }

    const key = process.env.GOOGLE_TRANSLATE_KEY;
    if (!key) {
      return res.status(500).json({ error: 'GOOGLE_TRANSLATE_KEY no configurada en el servidor.' });
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${key}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: texts, target, source, format: 'text' }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Error en Google Translate.' });
    }

    const translations = data.data.translations.map((t) => t.translatedText);
    res.json({ translations });
  } catch (err) {
    next(err);
  }
}

module.exports = { translateTexts };
