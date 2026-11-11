import { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

/**
 * Custom hook to access language context with additional helpers
 * @returns {Object} { language, setLanguage, dir, t }
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  const { language, setLanguage } = context;
  
  // Add dir helper
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  
  // Add basic t function (placeholder - can be enhanced)
  const t = (key) => key;

  return {
    language,
    setLanguage,
    dir,
    t
  };
}
