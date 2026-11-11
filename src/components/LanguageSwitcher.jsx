import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { motion } from 'framer-motion';

const LanguageSwitcher = ({ className = '', variant = 'compact' }) => {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  if (variant === 'text') {
    // Simple text toggle for mobile menu
    return (
      <button
        onClick={toggleLanguage}
        className={`flex items-center gap-3 px-4 py-3 text-base font-medium transition-colors hover:text-primary rounded-lg hover:bg-color-surface ${className}`}
        aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
      >
        <Globe className="w-5 h-5" />
        <span>{language === 'en' ? 'العربية' : 'English'}</span>
      </button>
    );
  }

  // Compact variant for desktop nav (matches ThemeToggle style)
  return (
    <div className={`relative inline-flex items-center gap-0.5 p-0.5 bg-color-surface rounded-lg border border-color-border ${className}`}>
      <button
        onClick={() => setLanguage('en')}
        className={`
          relative z-10 flex items-center justify-center px-2.5 h-9 rounded-md text-xs font-semibold
          transition-colors duration-200
          ${
            language === 'en'
              ? 'text-color-text'
              : 'text-color-text-muted hover:text-color-text hover:bg-color-surface-raised/50'
          }
        `}
        aria-label="Switch to English"
        aria-pressed={language === 'en'}
      >
        EN
        {language === 'en' && (
          <motion.div
            layoutId="language-indicator"
            className="absolute inset-0 bg-color-background rounded-md border border-color-border-strong shadow-sm"
            style={{ zIndex: -1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </button>
      <button
        onClick={() => setLanguage('ar')}
        className={`
          relative z-10 flex items-center justify-center px-2.5 h-9 rounded-md text-xs font-semibold
          transition-colors duration-200
          ${
            language === 'ar'
              ? 'text-color-text'
              : 'text-color-text-muted hover:text-color-text hover:bg-color-surface-raised/50'
          }
        `}
        aria-label="Switch to Arabic"
        aria-pressed={language === 'ar'}
      >
        عربي
        {language === 'ar' && (
          <motion.div
            layoutId="language-indicator"
            className="absolute inset-0 bg-color-background rounded-md border border-color-border-strong shadow-sm"
            style={{ zIndex: -1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </button>
    </div>
  );
};

export default LanguageSwitcher;
