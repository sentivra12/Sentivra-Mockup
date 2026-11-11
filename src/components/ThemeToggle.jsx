import { useTheme } from '../theme/useTheme';
import { useTranslation } from '../i18n/useTranslation';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * ThemeToggle - Compact theme switcher (Light / Dark / System)
 * Premium design inspired by Linear and Stripe
 */
export function ThemeToggle({ className = '' }) {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const themes = [
    { value: 'light', icon: Sun, label: t('theme.light') },
    { value: 'dark', icon: Moon, label: t('theme.dark') },
    { value: 'system', icon: Monitor, label: t('theme.system') },
  ];

  return (
    <div className={`relative inline-flex items-center gap-0.5 p-0.5 bg-color-surface rounded-lg border border-color-border ${className}`}>
      {themes.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`
              relative z-10 flex items-center justify-center w-9 h-9 rounded-md
              transition-colors duration-200
              ${
                isActive
                  ? 'text-color-text'
                  : 'text-color-text-muted hover:text-color-text hover:bg-color-surface-raised/50'
              }
            `}
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
