/**
 * StickyMobileCTA Component
 * Dismissible sticky bar for mobile after scrolling past hero
 * Shows custom design request CTA
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { useThemeContext } from '@/theme/ThemeContext';
import { useAllPageContent } from '@/hooks/useContent';

const StickyMobileCTA = () => {
  const { language } = useTranslation();
  const { isDark } = useThemeContext();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Fetch sticky bar texts from dashboard
  const { data: pageContent } = useAllPageContent('mockups');
  
  const barText = language === 'ar'
    ? pageContent?.sticky_bar_text_ar || 'اطلب تصميم مخصص'
    : pageContent?.sticky_bar_text || 'Request a custom design';
  
  const ctaText = language === 'ar'
    ? pageContent?.sticky_bar_cta_ar || 'ابدأ الآن'
    : pageContent?.sticky_bar_cta || 'Get Started';
  
  useEffect(() => {
    // Check if already dismissed in this session
    const dismissed = sessionStorage.getItem('sticky_cta_dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }
    
    const handleScroll = () => {
      // Show after scrolling past hero (approx 80vh)
      const heroHeight = window.innerHeight * 0.8;
      setIsVisible(window.scrollY > heroHeight);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('sticky_cta_dismissed', 'true');
  };
  
  if (isDismissed) return null;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-0 left-0 right-0 z-40 md:hidden ${
            isDark 
              ? 'bg-gray-900/95 border-t border-white/10' 
              : 'bg-white/95 border-t border-gray-200'
          } backdrop-blur-md shadow-2xl`}
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                isDark ? 'text-white' : 'text-primary-deep'
              }`}>
                {barText}
              </p>
            </div>
            
            {/* CTA Button */}
            <Link
              to="/#contact"
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                isDark
                  ? 'bg-primary hover:bg-primary-strong text-white'
                  : 'bg-primary-strong hover:bg-primary-deep text-white'
              }`}
            >
              {ctaText}
            </Link>
            
            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
              aria-label={language === 'ar' ? 'إغلاق' : 'Dismiss'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyMobileCTA;
