import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

/**
 * ScrollToTop
 * - Appears only after 400px of scroll (was 300) so it doesn't sit on top of card buttons
 * - Fixed position: right-4, bottom safe-area + 24px
 * - z-30 — below modals (z-200) and dialogs, above normal content
 * - When footer enters the viewport the button lifts by its own height + gap
 *   (uses translateY, not repositioning, so it never clips behind the footer)
 * - Page-level padding (page-with-scroll-top class in index.css) ensures the last
 *   card's buttons are never obscured at rest
 */
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [liftUp, setLiftUp]       = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.pageYOffset;

      // Show after 400px
      setIsVisible(scrollY > 400);

      // Lift when footer is about to enter the viewport bottom-half
      const footer = document.querySelector('footer');
      if (footer) {
        const rect = footer.getBoundingClientRect();
        setLiftUp(rect.top < window.innerHeight + 80);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          key="scroll-top"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            // Lift above footer when it scrolls into view
            y: liftUp ? -72 : 0,
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed right-4 md:right-6 z-30
                     bg-primary hover:bg-primary-strong text-white
                     w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg
                     flex items-center justify-center
                     transition-colors duration-200
                     focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-primary focus-visible:ring-offset-2"
          style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
          aria-label="Scroll to top"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronUp size={24} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
