import { useState, useEffect } from 'react';
import { getMotionPreference, setMotionPreference } from '../hooks/useMotionPreference';
import { useTranslation } from '../i18n/useTranslation';

/**
 * Motion settings toggle - allows users to override OS motion preferences
 * Provides three modes: Auto (follows OS), Full (always animate), Reduced (calm only)
 */
export default function MotionSettingsToggle() {
  const { t, language } = useTranslation();
  const [currentPreference, setCurrentPreference] = useState(() => getMotionPreference());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Update local state if preference changes elsewhere
    const handleStorage = () => {
      setCurrentPreference(getMotionPreference());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const options = [
    {
      value: 'auto',
      labelKey: 'motion.auto',
      descKey: 'motion.autoDesc'
    },
    {
      value: 'full',
      labelKey: 'motion.full',
      descKey: 'motion.fullDesc'
    },
    {
      value: 'reduced',
      labelKey: 'motion.reduced',
      descKey: 'motion.reducedDesc'
    }
  ];

  const handleChange = (value) => {
    setMotionPreference(value);
    setCurrentPreference(value);
    setIsOpen(false);
  };

  const currentOption = options.find(opt => opt.value === currentPreference) || options[0];

  return (
    <div className="motion-settings-toggle" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="motion-settings-button"
        aria-label={t('motion.title')}
        aria-expanded={isOpen}
      >
        <svg
          className="motion-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
        </svg>
        <span className="motion-label">
          {t(currentOption.labelKey)}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="motion-settings-backdrop"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="motion-settings-panel" role="menu">
            <h3 className="motion-settings-title">
              {t('motion.title')}
            </h3>
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleChange(option.value)}
                className={`motion-option ${currentPreference === option.value ? 'active' : ''}`}
                role="menuitemradio"
                aria-checked={currentPreference === option.value}
              >
                <div className="motion-option-content">
                  <span className="motion-option-label">
                    {t(option.labelKey)}
                  </span>
                  <span className="motion-option-desc">
                    {t(option.descKey)}
                  </span>
                </div>
                {currentPreference === option.value && (
                  <svg
                    className="motion-option-check"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
