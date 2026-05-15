import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Traduce un array de strings al idioma actual.
 * Devuelve los textos traducidos (o los originales mientras carga).
 *
 * @param {string[]} texts - Array de strings a traducir
 * @returns {string[]} - Array traducido (mismo orden)
 */
export function useTranslatedContent(texts) {
  const { language, translate } = useLanguage();
  const [translated, setTranslated] = useState(texts);
  const prevLang = useRef(language);

  useEffect(() => {
    if (language === 'es') {
      setTranslated(texts);
      return;
    }
    let cancelled = false;
    translate(texts).then((result) => {
      if (!cancelled) setTranslated(result);
    }).catch(() => {
      if (!cancelled) setTranslated(texts);
    });
    return () => { cancelled = true; };
  }, [language, JSON.stringify(texts)]);

  return translated;
}
