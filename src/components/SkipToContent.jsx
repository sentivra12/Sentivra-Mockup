import { useTranslation } from '@/i18n/useTranslation';

/**
 * SkipToContent - Accessibility link for keyboard navigation
 * Allows keyboard users to skip navigation and jump directly to main content
 * 
 * WCAG 2.1 Level A compliance: Bypass Blocks (2.4.1)
 */
export function SkipToContent() {
  const { t } = useTranslation();

  const handleSkip = (e) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleSkip}
      className="
        sr-only focus:not-sr-only
        fixed top-4 left-4 z-[9999]
        bg-primary text-white
        px-4 py-2 rounded-md
        font-medium text-sm
        focus:outline-none focus:ring-2 focus:ring-primary-strong focus:ring-offset-2
        transition-all duration-200
      "
    >
      {t('accessibility.skipToContent')}
    </a>
  );
}
