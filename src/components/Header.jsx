import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [activeHash, setActiveHash] = useState('');

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

  const navItems = [
    { name: 'Home', path: '/#home' },
    { name: 'Services', path: '/services' },
    { name: 'Our Work', path: '/our-work' },
    { name: 'Mockups', path: '/mockups' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/blog' },
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
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-card' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/sentivra-logo.jpg" 
              alt="Sentivra Logo" 
              className="h-8 w-8 rounded-full"
            />
            <span className="s-logo text-2xl font-bold text-primary-deep">
              <span className="text-primary">S</span>entivra
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
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
                  className={`relative text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm ${
                    isActive
                      ? 'text-primary'
                      : 'text-text-muted hover:text-primary'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                      layoutId="underline"
                    />
                  )}
                </Link>
              );
            })}
            <Link to="/contact">
              <button className="bg-primary-strong text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-deep transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 inline-flex items-center gap-2">
                Contact Us
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </Link>
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-text-muted hover:text-primary hover:bg-frost"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-frost overflow-hidden"
            >
              <div className="py-4 space-y-2">
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
                      className={`block px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${
                        isActive
                          ? 'text-primary bg-frost-soft'
                          : 'text-text-muted hover:text-primary hover:bg-frost-soft'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
                <Link 
                  to="/contact"
                  className="block mx-4 mt-4"
                >
                  <button className="w-full bg-primary-strong text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-deep transition-colors duration-200 inline-flex items-center justify-center gap-2">
                    Contact Us
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;

