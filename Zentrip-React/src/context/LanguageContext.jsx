import { createContext, useContext, useState, useCallback } from 'react';
import { translateTexts } from '../services/translationService';

export const LANGUAGES = [
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'is', label: 'Íslenska',  flag: '🇮🇸' },
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('es');

  const translate = useCallback(
    (texts, source = 'es') => translateTexts(texts, language, source),
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
