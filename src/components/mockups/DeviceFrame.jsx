import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MockupFallbackScreen from './MockupFallbackScreen';
import { useTranslation } from '@/i18n/useTranslation';

/**
 * DeviceFrame - Renders realistic device frames (laptop, tablet, mobile)
 * 
 * Features:
 * - Realistic bezels and shadows
 * - 3D perspective tilt
 * - Slow floating animation
 * - Fallback screen when image missing
 * - Loading state
 * - Accessibility (alt text)
 */
const DeviceFrame = ({ 
  type = 'laptop', // 'laptop' | 'tablet' | 'mobile'
  mockup = null,
  className = '',
  animate = true 
}) => {
  const { language } = useTranslation();
  const isRTL = language === 'ar';
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Determine which screenshot to use based on device type
  const getScreenshot = () => {
    if (!mockup) return null;
    
    switch (type) {
      case 'laptop':
        return mockup.desktop_screenshot_url || mockup.cover_image_url || mockup.image_url;
      case 'tablet':
        return mockup.tablet_screenshot_url || mockup.desktop_screenshot_url || mockup.cover_image_url;
      case 'mobile':
        return mockup.mobile_screenshot_url || mockup.cover_image_url;
      default:
        return mockup.cover_image_url;
    }
  };

  const screenshot = getScreenshot();
  const hasImage = screenshot && !imageError;
  
  // Get mockup title
  const title = mockup 
    ? (isRTL ? (mockup.title_ar || mockup.title) : (mockup.title_en || mockup.title))
    : '';

  // Get alt text
  const getAltText = () => {
    if (!mockup) return '';
    if (type === 'laptop' && mockup.desktop_screenshot_alt_en) {
      return isRTL ? (mockup.desktop_screenshot_alt_ar || mockup.desktop_screenshot_alt_en) : mockup.desktop_screenshot_alt_en;
    }
    return `${title} - ${type} mockup`;
  };

  // Floating animation
  const floatVariants = animate ? {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  } : {};

  // Common wrapper classes
  const wrapperClass = `relative ${className}`;

  // Laptop Frame
  if (type === 'laptop') {
    return (
      <motion.div
        className={wrapperClass}
        variants={floatVariants}
        animate="animate"
      >
        {/* Laptop body */}
        <div className="relative rounded-t-2xl overflow-hidden shadow-2xl" style={{
          background: 'linear-gradient(180deg, #2d3748 0%, #1a202c 100%)',
        }}>
          {/* Top bar (camera notch) */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-gray-900 rounded-t-2xl flex items-center justify-center z-10">
            <div className="w-16 h-2 bg-gray-800 rounded-full" />
          </div>

          {/* Screen */}
          <div className="relative w-full aspect-[16/10] mt-6 mb-2 mx-2 bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-inner">
            {hasImage ? (
              <>
                <img
                  src={screenshot}
                  alt={getAltText()}
                  loading="lazy"
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-frost-soft">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </>
            ) : (
              <MockupFallbackScreen 
                category={mockup?.category}
                title={title}
                type="desktop"
              />
            )}
          </div>
        </div>

        {/* Laptop base */}
        <div className="w-full h-3 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-xl shadow-lg" />
        <div className="w-[110%] h-1 -mx-[5%] bg-gradient-to-b from-gray-600 to-gray-700 rounded-b-2xl" />
      </motion.div>
    );
  }

  // Tablet Frame
  if (type === 'tablet') {
    return (
      <motion.div
        className={wrapperClass}
        variants={floatVariants}
        animate="animate"
      >
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900 p-3">
          {/* Camera */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rounded-full z-10" />

          {/* Screen */}
          <div className="relative w-full aspect-[3/4] bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
            {hasImage ? (
              <>
                <img
                  src={screenshot}
                  alt={getAltText()}
                  loading="lazy"
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-frost-soft">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </>
            ) : (
              <MockupFallbackScreen 
                category={mockup?.category}
                title={title}
                type="tablet"
              />
            )}
          </div>

          {/* Home button */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-700 rounded-full" />
        </div>
      </motion.div>
    );
  }

  // Mobile Frame
  if (type === 'mobile') {
    return (
      <motion.div
        className={wrapperClass}
        variants={floatVariants}
        animate="animate"
      >
        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-900 p-2">
          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-3xl z-10 flex items-center justify-center">
            <div className="w-12 h-1 bg-gray-800 rounded-full" />
          </div>

          {/* Screen */}
          <div className="relative w-full aspect-[9/19.5] bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden">
            {hasImage ? (
              <>
                <img
                  src={screenshot}
                  alt={getAltText()}
                  loading="lazy"
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-frost-soft">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </>
            ) : (
              <MockupFallbackScreen 
                category={mockup?.category}
                title={title}
                type="mobile"
              />
            )}
          </div>

          {/* Power button */}
          <div className={`absolute top-24 ${isRTL ? 'left-0' : 'right-0'} w-1 h-12 bg-gray-800 rounded-${isRTL ? 'l' : 'r'}-full`} />
          
          {/* Volume buttons */}
          <div className={`absolute top-32 ${isRTL ? 'right-0' : 'left-0'} w-1 h-8 bg-gray-800 rounded-${isRTL ? 'r' : 'l'}-full`} />
          <div className={`absolute top-44 ${isRTL ? 'right-0' : 'left-0'} w-1 h-8 bg-gray-800 rounded-${isRTL ? 'r' : 'l'}-full`} />
        </div>
      </motion.div>
    );
  }

  return null;
};

export default DeviceFrame;
