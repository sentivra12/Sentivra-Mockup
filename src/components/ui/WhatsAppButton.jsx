import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

const WhatsAppButton = ({ phoneNumber = '201558952126', message = 'Hello! I would like to know more about your services.' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 300px
      setIsVisible(window.scrollY > 300);
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
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, type: 'spring' }}
          className="fixed bottom-6 left-6 z-50"
        >
          <button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-dropdown transition-all duration-300 flex items-center gap-3"
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
                  className="overflow-hidden whitespace-nowrap font-medium text-sm"
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


