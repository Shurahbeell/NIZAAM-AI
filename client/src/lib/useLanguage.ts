import { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, getNestedValue } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export function useLanguageProvider() {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language;
      // Validate that the saved language is valid
      if (saved && ['en', 'ur', 'ru'].includes(saved)) {
        return saved;
      }
    }
    // Default to English
    localStorage.removeItem('language');
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    // Update document lang attribute and direction
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    if (['en', 'ur', 'ru'].includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem('language', lang);
      // Immediately update document direction
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    }
  };

  const t = (key: string): string => {
    const translationObj = translations[language];
    return getNestedValue(translationObj, key);
  };

  const dir = language === 'ur' ? 'rtl' : 'ltr';

  return {
    language,
    setLanguage,
    t,
    dir,
  };
}
