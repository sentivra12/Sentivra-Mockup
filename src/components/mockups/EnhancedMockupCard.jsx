import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Star, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import MockupFallbackScreen from './MockupFallbackScreen';
import { useTranslation } from '@/i18n/useTranslation';
import { useAllPageContent } from '@/hooks/useContent';

/**
 * EnhancedMockupCard - Premium mockup card with browser frame
 * 
 * Features:
 * - Browser window frame with dots and address bar
 * - Scroll preview on hover (if full-page screenshot exists)
 * - Mobile overlay on hover
 * - Badges (New, Popular, Featured)
 * - Designed fallback when image missing
 * - Quick view button
 * - Price display (optional)
 */
const EnhancedMockupCard = ({ 
  mockup, 
  category,
  onViewMockup,
  delay = 0 
}) => {
  const { language } = useTranslation();
  const isRTL = language === 'ar';
  const { data: pageContent = [] } = useAllPageContent('mockups');
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Helper function to get content by key
  const getContent = (key) => {
    const content = pageContent.find(c => c.content_key === key);
    return content ? (isRTL ? content.content_ar : content.content_en) : key;
  };
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!mockup) return null;

  // Get bilingual content
  const title = isRTL ? (mockup.title_ar || mockup.title) : (mockup.title_en || mockup.title);
  const description = isRTL 
    ? (mockup.short_description_ar || mockup.short_description) 
    : (mockup.short_description_en || mockup.short_description);
  const categoryName = isRTL ? category?.name_ar : category?.name_en;

  // Determine which image to show
  const screenshot = mockup.desktop_screenshot_url || mockup.cover_image_url || mockup.image_url;
  const hasImage = screenshot && !imageError;
  const hasFullPageScreenshot = !!mockup.full_page_screenshot_url;

  // Badges
  const badges = [];
  if (mockup.is_new) badges.push({ text: getContent('mockups-badge-new'), icon: Sparkles, color: 'bg-green-500' });
  if (mockup.is_popular) badges.push({ text: getContent('mockups-badge-popular'), icon: TrendingUp, color: 'bg-orange-500' });
  if (mockup.is_featured) badges.push({ text: getContent('mockups-badge-featured'), icon: Star, color: 'bg-purple-500' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewMockup && onViewMockup(mockup)}
    >
      <div className="bg-color-background rounded-xl overflow-hidden shadow-card hover:shadow-dropdown transition-all duration-300 border border-frost hover:border-primary/30">
        {/* Browser Frame */}
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-2">
          {/* Browser top bar */}
          <div className="bg-white/90 dark:bg-gray-900/90 rounded-t-lg p-2 mb-1 flex items-center gap-2">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            </div>
            
            {/* Address bar */}
            <div className="flex-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-text-muted flex items-center gap-2">
              <ExternalLink className="w-3 h-3" />
              <span className="truncate">{mockup.slug || 'preview'}</span>
            </div>
          </div>

          {/* Viewport (screenshot) */}
          <div className="relative aspect-[16/10] bg-white dark:bg-gray-900 rounded-b-lg overflow-hidden">
            {hasImage ? (
              <>
                <img
                  src={hasFullPageScreenshot && isHovered ? mockup.full_page_screenshot_url : screenshot}
                  alt={title}
                  loading="lazy"
                  className={`w-full h-full object-cover object-top transition-all duration-700 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  } ${hasFullPageScreenshot && isHovered ? 'animate-scroll-preview' : ''}`}
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
                category={mockup.category || categoryName}
                title={title}
                type="desktop"
              />
            )}

            {/* Mobile overlay on hover (if mobile screenshot exists) */}
            {mockup.mobile_screenshot_url && isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: isRTL ? -20 : 20, y: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                className={`absolute bottom-4 ${isRTL ? 'left-4' : 'right-4'} w-20 shadow-2xl rounded-2xl overflow-hidden border-2 border-gray-800`}
              >
                <img
                  src={mockup.mobile_screenshot_url}
                  alt={`${title} - mobile`}
                  className="w-full h-auto"
                />
              </motion.div>
            )}

            {/* Quick view button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <div className="px-6 py-3 bg-white/95 dark:bg-gray-900/95 rounded-lg shadow-xl font-semibold text-primary-deep dark:text-white">
                {getContent('mockups-card-view')}
              </div>
            </motion.div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} flex flex-col gap-2`}>
              {badges.map((badge, i) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={i}
                    className={`${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{badge.text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Card content */}
        <div className="p-5">
          {/* Category pill */}
          {categoryName && (
            <span 
              className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3"
              style={{
                backgroundColor: `${category?.color}20`,
                color: category?.color || '#3b82f6'
              }}
            >
              {categoryName}
            </span>
          )}

          {/* Title */}
          <h3 className="text-xl font-bold text-primary-deep dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>

          {/* Description */}
          <p className="text-text-muted text-sm leading-relaxed mb-4 line-clamp-2">
            {description}
          </p>

          {/* Price (optional) */}
          {mockup.price && mockup.price > 0 && (
            <div className="text-primary font-bold mb-3">
              {getContent('mockups-card-starting-from')} ${mockup.price}
            </div>
          )}

          {/* Actions */}
          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link 
              to={`/mockups/${mockup.slug}`}
              className="flex-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
                {getContent('mockups-card-view')}
              </button>
            </Link>
            <Link 
              to={`/contact?design=${mockup.slug}`}
              className="flex-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="w-full px-4 py-2 bg-frost-soft text-primary-deep dark:text-white hover:bg-frost transition-colors rounded-lg text-sm font-medium">
                {getContent('mockups-card-request')}
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll preview animation */}
      <style>{`
        @keyframes scroll-preview {
          0% { transform: translateY(0); }
          100% { transform: translateY(-60%); }
        }
        .animate-scroll-preview {
          animation: scroll-preview 3s ease-in-out forwards;
        }
      `}</style>
    </motion.div>
  );
};

export default EnhancedMockupCard;
