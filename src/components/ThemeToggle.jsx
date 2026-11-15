import { useTheme } from '../theme/useTheme';
import { useTranslation } from '../i18n/useTranslation';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * ThemeToggle — compact theme switcher (Light / Dark / System)
 *
 * Props:
 *   heroMode  boolean  default false
 *     When true (over the dark hero, not scrolled), renders in
 *     brand-glass style: transparent background, white icons,
 *     active button has a brand-teal tint instead of white surface.
 *
 * Shared component change: heroMode prop added with default false —
 * all pages that don't pass it get the original appearance unchanged.
 */
export function ThemeToggle({ className = '', heroMode = false }) {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const themes = [
    { value: 'light',  icon: Sun,     label: t('theme.light')  },
    { value: 'dark',   icon: Moon,    label: t('theme.dark')   },
    { value: 'system', icon: Monitor, label: t('theme.system') },
  ];

  if (heroMode) {
    /* ── Brand-glass variant (on dark hero) ───────────────────────────── */
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        {themes.map(({ value, icon: Icon, label }) => {
          const isActive = theme === value;
          return (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={[
                'relative z-10 flex items-center justify-center w-8 h-8 rounded-md',
                'transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
                isActive
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/80',
              ].join(' ')}
              title={label}
              aria-label={label}
              aria-pressed={isActive}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={2} />
              {isActive && (
                <motion.div
                  layoutId="theme-indicator-hero"
                  className="absolute inset-0 rounded-md"
                  style={{
                    background: 'rgba(13,158,130,0.30)',
                    border: '1px solid rgba(13,158,130,0.50)',
                    zIndex: -1,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  /* ── Default variant (scrolled / light surface) ───────────────────── */
  return (
    <div className={`relative inline-flex items-center gap-0.5 p-0.5 bg-color-surface rounded-lg border border-color-border ${className}`}>
      {themes.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={[
              'relative z-10 flex items-center justify-center w-9 h-9 rounded-md',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
              isActive
                ? 'text-color-text'
                : 'text-color-text-muted hover:text-color-text hover:bg-color-surface-raised/50',
            ].join(' ')}
            title={label}
            aria-label={label}
            aria-pressed={isActive}
          >
            <Icon className="w-4 h-4" strokeWidth={2} />
            {isActive && (
              <motion.div
                layoutId="theme-indicator"
                className="absolute inset-0 bg-color-background rounded-md border border-color-border-strong shadow-sm"
                style={{ zIndex: -1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
