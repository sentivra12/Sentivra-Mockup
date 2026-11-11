import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      // 1. Check URL parameter (?lang=ar or ?lang=en)
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang && ['en', 'ar'].includes(urlLang)) {
        // Store it for future visits
        localStorage.setItem('language', urlLang);
        // Clean URL (optional)
        if (window.history && window.history.replaceState) {
          urlParams.delete('lang');
          const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
          window.history.replaceState({}, '', newUrl);
        }
        return urlLang;
      }
      
      // 2. Check localStorage
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage && ['en', 'ar'].includes(savedLanguage)) {
        return savedLanguage;
      }
      
      // 3. Detect from browser
      if (navigator.language.startsWith('ar')) {
        return 'ar';
      }
      
      // 4. Default to English
      return 'en';
    } catch (error) {
      console.error('LanguageProvider: Error reading localStorage:', error);
      return 'en';
    }
  });

  const setLanguage = (newLanguage) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Update HTML attributes
    document.documentElement.lang = newLanguage;
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
  };

  // Set initial HTML attributes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
