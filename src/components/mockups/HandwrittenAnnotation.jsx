import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';

/**
 * HandwrittenAnnotation - Handwritten note with animated arrow
 * Uses self-hosted handwriting fonts (Caveat for EN, Aref Ruqaa for AR)
 * Arrow animates once with stroke-dasharray
 */
const HandwrittenAnnotation = ({ text, className = '' }) => {
  const { language } = useTranslation();
  const isRTL = language === 'ar';

  // Font family based on language
  const fontFamily = isRTL 
    ? "'Aref Ruqaa', 'Marhey', cursive" 
    : "'Caveat', cursive";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 1 }}
      className={`hidden xl:block absolute pointer-events-none ${className}`}
      style={{ fontFamily }}
    >
      <div className={`relative text-2xl font-bold text-primary ${isRTL ? 'rotate-[5deg]' : 'rotate-[-5deg]'}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          {text.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        {/* Animated arrow */}
        <svg 
          className={`absolute ${isRTL ? '-left-8 top-8' : '-right-8 -bottom-2'} w-20 h-20`}
          viewBox="0 0 100 100"
          style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}
        >
          {/* Arrow path */}
          <motion.path
            d="M 10 50 Q 30 20, 50 40 T 90 30"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 1.2, ease: 'easeInOut' }}
          />
          {/* Arrow head */}
          <motion.path
            d="M 85 25 L 90 30 L 85 35"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 2.5 }}
          />
        </svg>
      </div>
    </motion.div>
  );
};

export default HandwrittenAnnotation;
