import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { motion } from 'framer-motion';

/**
 * LanguageSwitcher
 *
 * Props:
 *   variant   'compact' | 'text'   default: 'compact'
 *   heroMode  boolean               default: false
 *     When true: brand-glass style (transparent, white text, brand-teal active).
 *     When false: original surface-bg style.
 *
 * Shared component change: heroMode prop added with default false.
 */
const LanguageSwitcher = ({ className = '', variant = 'compact', heroMode = false }) => {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => setLanguage(language === 'en' ? 'ar' : 'en');

  if (variant === 'text') {
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

  /* ── Compact variant ─────────────────────────────────────────────── */

  const baseBtn = (lang) => {
    const isActive = language === lang;
    if (heroMode) {
      return [
        'relative z-10 flex items-center justify-center px-2 h-8 rounded-md text-xs font-semibold',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
        isActive ? 'text-white' : 'text-white/50 hover:text-white/80',
      ].join(' ');
    }
    return [
      'relative z-10 flex items-center justify-center px-2.5 h-9 rounded-md text-xs font-semibold',
      'transition-colors duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
      isActive ? 'text-color-text' : 'text-color-text-muted hover:text-color-text hover:bg-color-surface-raised/50',
    ].join(' ');
  };

  const wrapperCls = heroMode
    ? `relative inline-flex items-center ${className}`
    : `relative inline-flex items-center gap-0.5 p-0.5 bg-color-surface rounded-lg border border-color-border ${className}`;

  const indicatorLayoutId = heroMode ? 'language-indicator-hero' : 'language-indicator';

  const ActiveBg = heroMode
    ? <motion.div
        layoutId={indicatorLayoutId}
        className="absolute inset-0 rounded-md"
        style={{ background:'rgba(13,158,130,0.30)', border:'1px solid rgba(13,158,130,0.50)', zIndex:-1 }}
        transition={{ type:'spring', stiffness:400, damping:30 }}
      />
    : <motion.div
        layoutId={indicatorLayoutId}
        className="absolute inset-0 bg-color-background rounded-md border border-color-border-strong shadow-sm"
        style={{ zIndex:-1 }}
        transition={{ type:'spring', stiffness:400, damping:30 }}
      />;

  return (
    <div className={wrapperCls}>
      {['en', 'ar'].map(lang => {
        const isActive = language === lang;
        return (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={baseBtn(lang)}
            aria-label={lang === 'en' ? 'Switch to English' : 'Switch to Arabic'}
            aria-pressed={isActive}
          >
            {lang === 'en' ? 'EN' : 'عربي'}
            {isActive && ActiveBg}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
