import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';
import { useSiteSettings } from '@/hooks/useContent';

// WhatsApp SVG icon
const WhatsAppIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const WhatsAppButton = () => {
  // ALL HOOKS FIRST - before any conditional returns
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);
  const { t, language } = useTranslation();
  const { data: siteSettings } = useSiteSettings();
  const isRTL = language === 'ar';

  // Get WhatsApp number from site settings
  const phoneNumber = siteSettings?.whatsapp_number?.replace(/\D/g, '') || '';
  const message = language === 'ar' 
    ? 'مرحباً، أود معرفة المزيد عن خدماتكم.'
    : 'Hello! I would like to know more about your services.';

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 300px
      setIsVisible(window.scrollY > 300);

      // Check if near footer (adjust button position to avoid overlap)
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

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide if no WhatsApp number is set - AFTER all hooks
  if (!phoneNumber) return null;

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
            y: isNearFooter ? -100 : 0 // Move up when footer/CTA is visible
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, type: 'spring' }}
          className={`fixed z-40 ${isRTL ? 'left-4 md:left-6' : 'right-4 md:right-6'}`}
          style={{ 
            bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' // Safe area + 24px
          }}
        >
          <button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative bg-green-500 hover:bg-green-600 text-white rounded-full w-12 h-12 md:w-14 md:h-14 shadow-lg hover:shadow-dropdown transition-all duration-300 flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
            aria-label={t('common.whatsappAria') || 'Chat on WhatsApp'}
          >
            <WhatsAppIcon className="h-6 w-6 md:h-7 md:w-7" />
            
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden whitespace-nowrap font-medium text-sm hidden md:block absolute right-full mr-3 bg-green-600 px-3 py-2 rounded-lg shadow-lg"
                >
                  {t('common.whatsappChat') || 'Chat on WhatsApp'}
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


