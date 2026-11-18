import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { useMotionPreference } from '@/hooks/useMotionPreference';

export function MobileMenu({ isOpen, onClose, hamburgerRef }) {
  const location = useLocation();
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  const closeButtonRef = useRef(null);
  const { mode } = useMotionPreference();
  
  const navItems = [
    { name: t('nav.home'), path: '/', exact: true },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.mockups'), path: '/mockups' },
    { name: t('nav.about'), path: '/about' },
  ];

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const currentScrollY = window.scrollY;
      
      document.documentElement.style.position = 'fixed';
      document.documentElement.style.top = `-${currentScrollY}px`;
      document.documentElement.style.left = '0';
      document.documentElement.style.right = '0';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Focus close button
      setTimeout(() => closeButtonRef.current?.focus(), 100);
      
      return () => {
        document.documentElement.style.position = '';
        document.documentElement.style.top = '';
        document.documentElement.style.left = '';
        document.documentElement.style.right = '';
        document.documentElement.style.overflow = '';
        document.body.style.paddingRight = '';
        window.scrollTo(0, currentScrollY);
      };
    } else {
      // Return focus to hamburger
      setTimeout(() => hamburgerRef?.current?.focus(), 100);
    }
  }, [isOpen, hamburgerRef]);

  // Esc key closes
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    
    const handleFocusTrap = (e) => {
      const panel = document.getElementById('mobile-menu-panel');
      if (!panel) return;
      
      const focusable = panel.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleFocusTrap);
    return () => document.removeEventListener('keydown', handleFocusTrap);
  }, [isOpen]);

  const handleNavClick = (e, path) => {
    onClose();
    
    if (path.startsWith('/#')) {
      if (location.pathname === '/') {
        e.preventDefault();
        const id = path.split('#')[1];
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', path);
        }
      }
    }
  };

  const animationDuration = mode === 'calm' ? 0.15 : 0.2;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animationDuration }}
            className="fixed inset-0 bg-brand-900/80 backdrop-blur-sm z-[100]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            id="mobile-menu-panel"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: animationDuration }}
            role="dialog"
            aria-modal="true"
            aria-label={t('common.mobileNavigation') || 'Mobile navigation'}
            className="fixed inset-0 z-[101] flex flex-col bg-white dark:bg-brand-950 overflow-y-auto overscroll-contain"
            style={{
              height: '100dvh',
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Top bar */}
            <div
              className={`flex items-center justify-between h-14 px-5 border-b border-brand-100 dark:border-brand-800 shrink-0 ${
                isRTL ? 'flex-row-reverse' : ''
              }`}
            >
              <Link
                to="/"
                onClick={() => { onClose(); }}
                aria-label="Sentivra home"
              >
                <Logo variant="full" size={32} />
              </Link>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="p-2 rounded-lg text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label={t('common.closeMenu') || 'Close menu'}
              >
                <X size={24} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 p-5 space-y-1" aria-label="Mobile navigation">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={(e) => handleNavClick(e, item.path)}
                    className={[
                      'flex items-center px-4 h-12 rounded-lg text-base font-semibold transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                        : 'text-brand-800 dark:text-brand-200 hover:bg-brand-50 dark:hover:bg-brand-900/30',
                      isRTL ? 'flex-row-reverse text-right' : 'text-left',
                    ].join(' ')}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Controls + CTA */}
            <div className="p-5 border-t border-brand-100 dark:border-brand-800 space-y-4 shrink-0">
              <div
                className={`flex items-center justify-between h-12 ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}
              >
                <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
                  {t('theme.title')}
                </span>
                <ThemeToggle />
              </div>
              <div
                className={`flex items-center justify-between h-12 ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}
              >
                <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
                  {t('language.title')}
                </span>
                <LanguageSwitcher variant="compact" />
              </div>
              <Link
                to="/contact"
                onClick={() => { onClose(); }}
                className="block"
              >
                <Button size="lg" className="w-full h-12 shadow-md">
                  {t('nav.contactUs')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
