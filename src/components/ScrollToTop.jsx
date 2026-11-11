
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show after scrolling 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Check if near footer/CTA to avoid overlap
      const footer = document.querySelector('footer');
      const ctaSection = document.querySelector('section[class*="inverse-surface"]');
      
      if (footer || ctaSection) {
        const footerRect = footer?.getBoundingClientRect();
        const ctaRect = ctaSection?.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // If footer or CTA is visible in viewport bottom 200px, move button up
        const footerVisible = footerRect && footerRect.top < windowHeight;
        const ctaVisible = ctaRect && ctaRect.bottom > windowHeight - 200 && ctaRect.bottom < windowHeight + 200;
        
        setIsNearFooter(footerVisible || ctaVisible);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility(); // Check initial
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: isNearFooter ? -100 : 0 // Move up when footer/CTA is visible
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed right-4 md:right-6 z-40 bg-primary hover:bg-primary-strong text-white w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          style={{ 
            bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' // Safe area + 24px
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;


