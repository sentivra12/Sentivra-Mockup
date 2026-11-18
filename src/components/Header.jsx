import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { MobileMenu } from '@/components/MobileMenu';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hamburgerRef = useRef(null);
  const location = useLocation();
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
            ref={hamburgerRef}
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
            aria-controls="mobile-menu-panel"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Portal-based mobile menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        hamburgerRef={hamburgerRef}
      />
    </motion.header>
  );
};

export default Header;
