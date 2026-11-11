import { useContext } from 'react';
import { LanguageContext } from './LanguageContext';
import en from './locales/en.json';
import ar from './locales/ar.json';

const translations = { en, ar };

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }

  const { language, setLanguage } = context;

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];
    let found = true;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        found = false;
        break;
      }
    }

    // If not found in current language, try English
    if (!found || value === undefined) {
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing translation key: "${key}" in language: "${language}"`);
      }
      
      // Fallback to English
      value = translations.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object') {
          value = value[fallbackKey];
        } else {
          // Not found in English either - return with visible warning in dev
          if (import.meta.env.DEV) {
            console.error(`[i18n] Missing translation key in ALL languages: "${key}"`);
            // Return a visible warning in dev mode
            return `⚠️[${key}]`;
          }
          return key;
        }
      }
    }

    // Apply parameter interpolation (e.g., {year}, {name})
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return value || key;
  };

  return { t, language, setLanguage };
};
