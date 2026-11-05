import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

const WhatsAppButton = ({ phoneNumber = '201558952126', message = 'Hello! I would like to know more about your services.' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 300px
      setIsVisible(window.scrollY > 300);

      // Check if near footer (adjust button position)
      const footer = document.querySelector('footer');
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // If footer is visible in viewport, move button up
        setIsNearFooter(footerRect.top < windowHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            y: isNearFooter ? -80 : 0 // Move up when footer is visible
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, type: 'spring' }}
          className="fixed bottom-6 left-4 md:left-6 z-40"
        >
          <button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative bg-green-500 hover:bg-green-600 text-white rounded-full p-3 md:p-4 shadow-lg hover:shadow-dropdown transition-all duration-300 flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
            aria-label="Contact us on WhatsApp"
          >
            <MessageCircle className="h-6 w-6" />
            
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden whitespace-nowrap font-medium text-sm hidden md:block"
                >
                  Chat with us
                </motion.span>
              )}
            </AnimatePresence>

            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WhatsAppButton;


