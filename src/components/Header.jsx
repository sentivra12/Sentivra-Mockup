import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [activeHash, setActiveHash] = useState('');
  const { t, language } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setActiveHash(location.hash);
  }, [location.hash]);

  // Body scroll lock when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isMobileMenuOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  const navItems = [
    { name: t('nav.home'), path: '/', exact: true },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.mockups'), path: '/mockups' },
    { name: t('nav.about'), path: '/about' },
  ];

  const handleNavClick = (e, path) => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    
    // Handle hash links on home page
    if (path.startsWith('/#')) {
      if (location.pathname === '/') {
        e.preventDefault();
        const targetId = path.split('#')[1];
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', path);
          setActiveHash(`#${targetId}`);
        }
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-color-background/95 dark:bg-gray-900/95 backdrop-blur-md shadow-card dark:shadow-lg' : 'bg-color-background dark:bg-gray-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-16">
          <Link to="/" className={`flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md ${language === 'ar' ? 'space-x-reverse' : ''} space-x-3`}>
            <img 
              src="/sentivra-logo.svg" 
              alt="Sentivra Logo" 
              className="h-10 w-10 md:h-8 md:w-8"
              width="40"
              height="40"
            />
            <span className="s-logo text-2xl font-bold text-primary-deep dark:text-primary-foreground">
              <span className="text-primary dark:text-primary-strong">S</span>entivra
            </span>
          </Link>

          <nav className={`hidden md:flex items-center ${language === 'ar' ? 'space-x-reverse' : ''} space-x-6`}>
            {navItems.map((item) => {
              // Exact match for Home (/), startsWith for other pages
              const isActive = item.exact 
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item.path)}
                  className={`relative text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm ${
                    isActive
                      ? 'text-primary dark:text-primary-strong'
                      : 'text-text-muted dark:text-gray-300 hover:text-primary dark:hover:text-primary-strong'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary dark:bg-primary-strong"
                      layoutId="underline"
                    />
                  )}
                </Link>
              );
            })}
            
            {/* Control Group */}
            <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : ''} space-x-2 ${language === 'ar' ? 'mr-4' : 'ml-4'}`}>
              <ThemeToggle />
              <LanguageSwitcher variant="compact" />
            </div>
            
            <Link to="/contact">
              <button className="bg-primary hover:bg-primary-strong text-white px-5 py-2 rounded-lg font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 inline-flex items-center gap-2 shadow-sm hover:shadow-md">
                {t('nav.contactUs')}
                <svg className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </Link>
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 rounded-md text-text-muted dark:text-gray-300 hover:text-primary dark:hover:text-primary-strong hover:bg-frost-soft dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={isMobileMenuOpen ? t('common.closeMenu') : t('common.openMenu')}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Full-Screen Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden fixed inset-0 bg-primary-deep/95 backdrop-blur-md z-40"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
              />

              {/* Menu Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="md:hidden fixed top-0 right-0 bottom-0 w-full max-w-sm bg-color-background dark:bg-gray-900 z-50 shadow-dropdown overflow-y-auto"
                role="dialog"
                aria-modal="true"
                aria-label={t('common.mobileNavigation')}
              >
                {/* Menu Header */}
                <div className="flex justify-between items-center p-6 border-b border-frost dark:border-gray-700">
                  <Link 
                    to="/" 
                    className={`flex items-center ${language === 'ar' ? 'space-x-reverse' : ''} space-x-3`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <img 
                      src="/sentivra-logo.svg" 
                      alt="Sentivra Logo" 
                      className="h-10 w-10"
                      width="40"
                      height="40"
                    />
                    <span className="text-2xl font-bold text-primary-deep dark:text-primary-foreground">
                      <span className="text-primary dark:text-primary-strong">S</span>entivra
                    </span>
                  </Link>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-md text-text-muted dark:text-gray-300 hover:text-primary dark:hover:text-primary-strong hover:bg-frost-soft dark:hover:bg-gray-800 transition-colors"
                    aria-label={t('common.closeMenu')}
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Menu Items */}
                <nav className="p-6 space-y-1">
                  {navItems.map((item) => {
                    const isHashLink = item.path.startsWith('/#');
                    const hash = isHashLink ? item.path.substring(1) : '';
                    const isActive = isHashLink
                      ? (activeHash === hash) || (item.path === '/#home' && activeHash === '')
                      : location.pathname === item.path;
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={(e) => handleNavClick(e, item.path)}
                        className={`block px-4 py-4 text-lg font-medium transition-colors duration-200 rounded-xl ${
                          isActive
                            ? 'text-primary dark:text-primary-strong bg-frost-soft dark:bg-gray-800'
                            : 'text-text-muted dark:text-gray-300 hover:text-primary dark:hover:text-primary-strong hover:bg-frost-soft dark:hover:bg-gray-800'
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                {/* Menu Footer CTA */}
                <div className="p-6 border-t border-frost dark:border-gray-700 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-color-text-muted">{t('theme.title')}</span>
                    <ThemeToggle />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-color-text-muted">{t('language.title')}</span>
                    <LanguageSwitcher variant="compact" />
                  </div>
                  <Link 
                    to="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full"
                  >
                    <button className="w-full bg-primary hover:bg-primary-strong text-white px-6 py-4 rounded-xl font-medium transition-colors duration-200 inline-flex items-center justify-center gap-2 text-lg shadow-sm hover:shadow-md">
                      {t('nav.contactUs')}
                      <svg className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;

