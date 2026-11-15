import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isScrolled, setIsScrolled]         = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location   = useLocation();
  const [activeHash, setActiveHash] = useState('');
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  
  // Detect if current page has a light hero (for proper navbar contrast)
  // Home page (/) has dark hero, services/mockups/about have light heroes in light theme
  const hasLightHero = ['/services', '/mockups', '/about'].some(path => 
    location.pathname.startsWith(path)
  );

  /* ── Scroll state ───────────────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Hash tracking ──────────────────────────────────────────────────── */
  useEffect(() => {
    setActiveHash(location.hash);
  }, [location.hash]);

  /* ── Body scroll-lock when mobile menu open ─────────────────────────── */
  useEffect(() => {
    const bar = window.innerWidth - document.documentElement.clientWidth;
    if (isMobileMenuOpen) {
      document.body.style.overflow    = 'hidden';
      document.body.style.paddingRight = `${bar}px`;
    } else {
      document.body.style.overflow    = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow    = '';
      document.body.style.paddingRight = '';
    };
  }, [isMobileMenuOpen]);

  /* ── Esc closes menu ────────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) setIsMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMobileMenuOpen]);

  const navItems = [
    { name: t('nav.home'),     path: '/',        exact: true },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.mockups'),  path: '/mockups'  },
    { name: t('nav.about'),    path: '/about'    },
  ];

  const handleNavClick = (e, path) => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      if (location.pathname === '/') {
        e.preventDefault();
        const id  = path.split('#')[1];
        const el  = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', path);
          setActiveHash(`#${id}`);
        }
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/90 dark:bg-brand-950/90 backdrop-blur-md shadow-md shadow-brand-900/10 border-b border-brand-100/60 dark:border-brand-800/40'
          : 'bg-transparent',
      ].join(' ')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center h-[68px] md:h-[64px] ${isRTL ? 'flex-row-reverse' : ''}`}>

          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link
            to="/"
            onClick={(e) => handleNavClick(e, '/')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-lg"
            aria-label="Sentivra home"
          >
            {/* Light theme with light hero: always use full variant (dark)
                Light theme with dark hero: light variant when not scrolled, full when scrolled
                Dark theme: always use light variant (white) */}
            {isScrolled ? (
              <Logo variant="full" size={38} />
            ) : hasLightHero ? (
              <Logo variant="full" size={38} />
            ) : (
              <Logo variant="light" size={38} />
            )}
          </Link>

          {/* ── Desktop Nav ──────────────────────────────────────────── */}
          <nav
            className={`hidden md:flex items-center gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}
            aria-label="Main navigation"
          >
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
                    'relative text-sm font-semibold transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-sm',
                    isActive
                      ? 'text-brand-600 dark:text-brand-400'
                      : isScrolled
                        ? 'text-brand-800 dark:text-brand-200 hover:text-brand-600 dark:hover:text-brand-400'
                        : hasLightHero
                          ? 'text-brand-800 hover:text-brand-600' // Light hero: dark text always
                          : 'text-white/90 hover:text-white', // Dark hero: white text
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.name}
                  {/* Active indicator — brand teal underline */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-600"
                    />
                  )}
                </Link>
              );
            })}

            {/* Controls group — brand-glass when over the hero (not scrolled) */}
            <div className={`flex items-center gap-1.5 ${isRTL ? 'mr-4' : 'ml-4'}`}>
              {/* Wrap ThemeToggle and LanguageSwitcher in a glass container on the dark hero */}
              <div
                className={[
                  'flex items-center gap-1 p-0.5 rounded-lg transition-all duration-300',
                  isScrolled
                    ? '' // let each component use its own bg (white surface)
                    : hasLightHero
                      ? 'bg-brand-50/80 border border-brand-100 backdrop-blur-md' // Light hero: brand-tinted glass
                      : 'bg-white/10 border border-white/15 backdrop-blur-md', // Dark hero: white glass
                ].join(' ')}
              >
                <ThemeToggle heroMode={!isScrolled && !hasLightHero} />
                <div className={`w-px h-5 mx-0.5 ${hasLightHero && !isScrolled ? 'bg-brand-200' : 'bg-white/20'}`} aria-hidden="true" />
                <LanguageSwitcher variant="compact" heroMode={!isScrolled && !hasLightHero} />
              </div>
            </div>

            {/* CTA */}
            <Link to="/contact">
              <Button
                size="sm"
                className="shadow-sm hover:shadow-glow-sm"
              >
                {t('nav.contactUs')}
                <svg
                  className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </Link>
          </nav>

          {/* ── Mobile hamburger ────────────────────────────────────── */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={[
              'md:hidden p-3 rounded-xl transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              isScrolled
                ? 'text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/40'
                : hasLightHero
                  ? 'text-brand-700 hover:bg-brand-50' // Light hero: dark icon
                  : 'text-white hover:bg-white/10', // Dark hero: white icon
            ].join(' ')}
            aria-label={isMobileMenuOpen ? t('common.closeMenu') : t('common.openMenu')}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-brand-900/90 backdrop-blur-md z-40"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              id="mobile-menu"
              initial={{ x: isRTL ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '-100%' : '100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
              className={[
                'md:hidden fixed top-0 bottom-0 w-full max-w-sm',
                'bg-white dark:bg-brand-950',
                'z-50 shadow-xl overflow-y-auto',
                isRTL ? 'left-0' : 'right-0',
              ].join(' ')}
              role="dialog"
              aria-modal="true"
              aria-label={t('common.mobileNavigation')}
            >
              {/* Panel header */}
              <div className={`flex justify-between items-center p-5 border-b border-brand-100 dark:border-brand-800 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Logo variant="full" size={32} />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label={t('common.closeMenu')}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Nav links */}
              <nav className="p-5 space-y-1" aria-label="Mobile navigation">
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
                        'flex items-center px-4 py-3.5 rounded-xl text-base font-semibold transition-colors',
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                          : 'text-brand-800 dark:text-brand-200 hover:bg-brand-50 dark:hover:bg-brand-900/30',
                        isRTL ? 'flex-row-reverse' : '',
                      ].join(' ')}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Controls + CTA */}
              <div className="p-5 border-t border-brand-100 dark:border-brand-800 space-y-4">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm font-medium text-brand-700 dark:text-brand-300">{t('theme.title')}</span>
                  <ThemeToggle />
                </div>
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm font-medium text-brand-700 dark:text-brand-300">{t('language.title')}</span>
                  <LanguageSwitcher variant="compact" />
                </div>
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block">
                  <Button size="lg" className="w-full shadow-md">
                    {t('nav.contactUs')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
