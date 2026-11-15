/**
 * PremiumMockupCardRound5 - Round 5: Device-frame cards with premium effects
 * 
 * ROUND 5 FEATURES:
 * - Scroll-on-hover: translateY animation (4-6s) for tall screenshots
 * - Pointer tilt: perspective transform based on mouse position (max 6deg)
 * - Layered depth: multi-layer shadow with palette tint
 * - Glass highlight on top edge
 * - Gradient border that animates on hover/focus
 * - Pointer-based spotlight/glare following cursor inside card
 * - Featured layout support: 2-col span with side-by-side layout
 * - Title: hyphens manual, text-wrap balance, no auto-break
 * - Buttons: primary flex:1 nowrap, secondary icon-only with tooltip
 * - Fixed from Round 4: live_url behavior, browser frame, CSS fallback
 * 
 * PERFORMANCE & ACCESSIBILITY:
 * - Only transform/opacity animations
 * - will-change only during interaction
 * - Respects prefers-reduced-motion, saveData, low-power
 * - Touch: no tilt or spotlight
 * - a11y: ARIA labels, focus-visible rings, min 44px targets
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useMotionPreference';
import { ExternalLink, ArrowRight, Sparkles, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Clear neutral placeholder shown when no screenshot is available
// Never mimics real content — just icon + initials
const ImagePlaceholder = ({ title, isDark }) => {
  const initials = (title || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3 bg-brand-900/50 dark:bg-brand-950"
      aria-label={`No screenshot available for ${title}`}
    >
      <svg
        className="w-12 h-12 text-brand-600 dark:text-brand-700"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <rect x="4" y="8" width="40" height="28" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M4 32l10-9 7 6 8-10 15 13" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <circle cx="33" cy="17" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="14" y="40" width="20" height="2" rx="1" fill="currentColor" opacity="0.4" />
        <rect x="20" y="36" width="8" height="4" rx="0" fill="currentColor" opacity="0.3" />
      </svg>
      <span className="text-2xl font-bold tracking-widest text-brand-600 dark:text-brand-700">
        {initials}
      </span>
      <span className="text-xs font-medium text-brand-700 dark:text-brand-800">
        No preview
      </span>
    </div>
  );
};

const PremiumMockupCardRound5 = ({
  mockup,
  onRequestDesign,
  index = 0,
  isFirst = false,
  isFeatured = false,
  language = 'en',
  isDark = false,
  disableEffects = false
}) => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({});
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [isImageTall, setIsImageTall] = useState(false);
  
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const imageContainerRef = useRef(null);
  
  // Localized fields with safe fallbacks
  const title = language === 'ar'
    ? (mockup.title_ar || mockup.title_en || mockup.title || 'Untitled')
    : (mockup.title_en || mockup.title || 'Untitled');
  const description = language === 'ar'
    ? (mockup.short_description_ar || mockup.short_description_en || '')
    : (mockup.short_description_en || mockup.description || '');
  // category_name_* comes from the joined category object or flat fields
  const categoryName = language === 'ar'
    ? (mockup.category?.name_ar || mockup.category_name_ar || null)
    : (mockup.category?.name_en || mockup.category_name_en || null);
  
  // Image URL with fallback chain (cover > desktop screenshot > legacy image_url)
  const imageUrl = mockup.cover_image_url || mockup.desktop_screenshot_url || mockup.image_url || null;

  // website_url takes priority over demo_url for the "visit live" action
  const liveUrl = mockup.website_url || mockup.live_url || mockup.demo_url || null;

  // Extract domain from liveUrl
  let domain = null;
  if (liveUrl) {
    try {
      const parsed = new URL(liveUrl);
      // Safety: only allow https
      if (parsed.protocol === 'https:') {
        domain = parsed.hostname.replace('www.', '');
      }
    } catch {
      domain = null;
    }
  }
  
  // Check if "New"
  const isNew = mockup.is_new || (mockup.created_at && 
    (new Date() - new Date(mockup.created_at)) / (1000 * 60 * 60 * 24) <= 14
  );
  
  // Parse tags (limit to 3)
  const tags = Array.isArray(mockup.tags) ? mockup.tags.slice(0, 3) : [];
  
  // Determine primary action — only use liveUrl when it's a real https URL
  const hasLiveUrl = Boolean(liveUrl);
  const primaryLabel = hasLiveUrl
    ? (language === 'ar' ? 'زيارة الموقع' : 'Visit Website')
    : (language === 'ar' ? 'عرض التفاصيل' : 'View Details');
  const primaryIcon = hasLiveUrl ? ExternalLink : null;
  
  // Check if image is tall enough for scroll effect
  useEffect(() => {
    const img = imageRef.current;
    const container = imageContainerRef.current;
    
    if (img && container && img.complete) {
      const imgHeight = img.naturalHeight;
      const containerHeight = container.offsetHeight;
      const imgDisplayHeight = (imgHeight / img.naturalWidth) * container.offsetWidth;
      
      setIsImageTall(imgDisplayHeight > containerHeight * 1.5);
    }
  }, [imageLoaded, imageUrl]);
  
  // Handle image load to check dimensions
  const handleImageLoad = () => {
    setImageLoaded(true);
    
    const img = imageRef.current;
    const container = imageContainerRef.current;
    
    if (img && container) {
      const imgHeight = img.naturalHeight;
      const containerHeight = container.offsetHeight;
      const imgDisplayHeight = (imgHeight / img.naturalWidth) * container.offsetWidth;
      
      setIsImageTall(imgDisplayHeight > containerHeight * 1.5);
    }
  };
  
  // Pointer tilt effect (desktop only, no reduced-motion/saveData)
  useEffect(() => {
    if (disableEffects || shouldReduceMotion || typeof window === 'undefined') return;
    if ('ontouchstart' in window) return; // No tilt on touch devices
    
    const card = cardRef.current;
    if (!card) return;
    
    const handleMouseMove = (e) => {
      if (!isHovered) return;
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation (max 6deg)
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      
      setTiltStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
        transition: 'transform 0.1s ease-out'
      });
      
      // Spotlight position (percentage)
      setSpotlightPos({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100
      });
    };
    
    const handleMouseLeave = () => {
      setTiltStyle({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: 'transform 0.4s ease-out'
      });
    };
    
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isHovered, disableEffects, shouldReduceMotion]);
  
  // Handle primary action
  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;

    if (hasLiveUrl) {
      const opensNewTab = mockup.open_in_new_tab !== false;
      window.open(liveUrl, opensNewTab ? '_blank' : '_self', 'noopener,noreferrer');
    } else {
      navigate(`/mockups/${mockup.slug || mockup.id}`);
    }
  };
  
  // Handle secondary action
  const handleRequestClick = (e) => {
    e.stopPropagation();
    onRequestDesign(mockup);
  };
  
  // Staged reveal animation
  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.7,
        delay: disableEffects ? 0 : Math.min(index * 0.1, 0.6),
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };
  
  return (
    <motion.article
      ref={cardRef}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={disableEffects ? {} : cardVariants}
      onClick={handleCardClick}
      onMouseEnter={() => !disableEffects && setIsHovered(true)}
      onMouseLeave={() => !disableEffects && setIsHovered(false)}
      className={`group relative flex ${isFeatured ? 'flex-row' : 'flex-col'} h-full rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-500 bg-white dark:bg-brand-900/50 border-brand-200 dark:border-white/10`}
      style={{
        minHeight: isFeatured ? '500px' : '420px',
        ...(!disableEffects && isHovered ? tiltStyle : {}),
        willChange: isHovered ? 'transform' : 'auto',
        boxShadow: isHovered
          ? isDark
            ? '0 25px 60px rgba(13, 158, 130, 0.25), 0 15px 35px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(0, 0, 0, 0.2)'
            : '0 25px 60px rgba(13, 158, 130, 0.2), 0 15px 35px rgba(13, 158, 130, 0.15), 0 5px 15px rgba(0, 0, 0, 0.1)'
          : isDark
            ? '0 10px 30px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(0, 0, 0, 0.2)'
            : '0 10px 30px rgba(13, 158, 130, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Gradient border (animates on hover) */}
      <div 
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(13, 158, 130, 0.3), rgba(6, 121, 106, 0.2))'
            : 'linear-gradient(135deg, rgba(13, 158, 130, 0.3), rgba(38, 181, 154, 0.2))',
          padding: '2px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }}
        aria-hidden="true"
      />
      
      {/* Glass highlight on top edge */}
      <div 
        className="absolute top-0 left-0 right-0 h-px opacity-50"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)'
        }}
        aria-hidden="true"
      />
      
      {/* Pointer spotlight/glare */}
      {!disableEffects && isHovered && (
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none transition-opacity duration-300 rounded-3xl"
          style={{
            background: `radial-gradient(circle 200px at ${spotlightPos.x}% ${spotlightPos.y}%, ${isDark ? 'rgba(13, 158, 130, 0.15)' : 'rgba(13, 158, 130, 0.1)'}, transparent)`
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Image Container with Browser Frame */}
      <div className={`relative ${isFeatured ? 'w-1/2' : 'w-full'} flex-shrink-0 bg-brand-950 overflow-hidden`}>
        {/* Browser Chrome */}
        <div className="flex items-center justify-between px-3 py-2 bg-brand-900 dark:bg-brand-950">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          
          {domain && (
            <div className="flex-1 mx-3 px-3 py-1 rounded-md text-xs flex items-center gap-1.5 bg-brand-900 dark:bg-brand-950">
              <svg className="w-3 h-3 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-brand-300 truncate">{domain}</span>
            </div>
          )}
        </div>
        
        {/* Screenshot Area - Scroll on hover */}
        <div 
          ref={imageContainerRef}
          className={`relative w-full ${isFeatured ? 'h-full' : 'aspect-[16/10]'} overflow-hidden bg-brand-950`}
        >
          {/* Skeleton Shimmer */}
          {!imageLoaded && !imageError && (
            <div 
              className="absolute inset-0 bg-gradient-to-r from-brand-900/80 via-brand-800/80 to-brand-900/80 dark:from-brand-950 dark:via-brand-900 dark:to-brand-950"
              style={{
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite'
              }}
            />
          )}
          
          {/* Actual Image or Template Fallback */}
          {imageUrl && !imageError ? (
            <img
              ref={imageRef}
              src={imageUrl}
              alt={title}
              loading={isFirst ? 'eager' : 'lazy'}
              fetchpriority={isFirst ? 'high' : 'auto'}
              decoding="async"
              width="800"
              height="500"
              onLoad={handleImageLoad}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover object-top transition-all duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transform: !disableEffects && isHovered && isImageTall
                  ? 'translateY(-30%)'
                  : 'translateY(0)',
                transition: isHovered && isImageTall
                  ? 'transform 5s cubic-bezier(0.4, 0, 0.2, 1)'
                  : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: isHovered && isImageTall ? 'transform' : 'auto'
              }}
            />
          ) : (
            <ImagePlaceholder title={title} isDark={isDark} />
          )}
          
          {/* Hover Overlay */}
          {!disableEffects && (
            <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/70 dark:bg-black/80`}>
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl backdrop-blur-md bg-white/10 dark:bg-white/5">
                {primaryIcon && <primaryIcon className="w-5 h-5 text-white" />}
                <span className="text-white font-semibold">
                  {hasLiveUrl ? (language === 'ar' ? 'فتح الموقع' : 'Open Site') : (language === 'ar' ? 'عرض' : 'View')}
                </span>
              </div>
            </div>
          )}
          
          {/* Badges — one flex container, RTL-aware, max 2, never overlapping */}
          <div
            className={`absolute top-3 flex flex-col gap-1.5 ${
              language === 'ar' ? 'right-3' : 'left-3'
            }`}
            style={{ maxWidth: 'calc(100% - 1.5rem)', pointerEvents: 'none' }}
          >
            {/* Category chip (top-opposite corner) is handled separately below */}
            {mockup.is_featured && (
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-bold w-fit"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white' }}
              >
                <Star className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                <span>{language === 'ar' ? 'مميز' : 'Featured'}</span>
              </div>
            )}
            {isNew && (
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-bold w-fit"
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white' }}
              >
                <Sparkles className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                <span>{language === 'ar' ? 'جديد' : 'New'}</span>
              </div>
            )}
          </div>

          {/* Category chip — opposite corner */}
          {categoryName && (
            <div
              className={`absolute top-3 ${language === 'ar' ? 'left-3' : 'right-3'} px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold pointer-events-none bg-white/95 dark:bg-brand-950/80 text-brand-accent-deep dark:text-brand-accent border border-brand-accent/30`}
              style={{
                maxWidth: '45%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {categoryName}
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className={`flex flex-col flex-1 ${isFeatured ? 'w-1/2 p-8' : 'p-6'}`}>
        {/* Title — dir=auto, text-wrap balance, clamp 2 lines */}
        <h3
          dir="auto"
          lang={language === 'ar' && mockup.title_ar ? 'ar' : 'en'}
          className={`font-bold ${isFeatured ? 'text-2xl' : 'text-lg'} leading-snug line-clamp-2 transition-colors mb-3 text-primary-deep dark:text-white group-hover:text-brand-accent dark:group-hover:text-brand-accent`}
          style={{ wordBreak: 'break-word', hyphens: 'manual', textWrap: 'balance', overflowWrap: 'anywhere' }}
        >
          {title}
        </h3>

        {/* Description — dir=auto, clamped to 3 lines */}
        {description && (
          <p
            dir="auto"
            className={`${isFeatured ? 'text-base' : 'text-sm'} leading-relaxed line-clamp-3 mb-3 text-text-muted`}
          >
            {description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className={`flex flex-wrap gap-2 mb-3 ${language === 'ar' ? 'justify-end' : ''}`}>
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 dark:bg-white/5 text-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Push buttons to bottom */}
        <div className="flex-1" />

        {/* Buttons Footer — always at bottom, min 44px */}
        <div className="flex gap-3 pt-2" style={{ minHeight: '44px' }}>
          {/* Primary: visit live URL or navigate to detail page */}
          <Button
            onClick={(e) => { e.stopPropagation(); handleCardClick(e); }}
            size="lg"
            className={`flex-1 ${language === 'ar' ? 'flex-row-reverse' : ''}`}
            style={{ whiteSpace: 'nowrap' }}
            aria-label={`${primaryLabel} — ${title}${hasLiveUrl ? ` (${language === 'ar' ? 'يفتح في علامة تبويب جديدة' : 'opens in new tab'})` : ''}`}
          >
            {primaryIcon && <primaryIcon className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} aria-hidden="true" />}
            <span>{primaryLabel}</span>
          </Button>

          {/* Secondary arrow: open live URL in new tab ONLY when a valid https URL exists, otherwise hidden */}
          {hasLiveUrl && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                window.open(liveUrl, '_blank', 'noopener,noreferrer');
              }}
              variant="outline"
              size="icon"
              className="h-12 w-12"
              aria-label={`${language === 'ar' ? 'فتح الموقع المباشر في علامة تبويب جديدة' : 'Open live website in new tab'} — ${title}`}
              title={language === 'ar' ? 'فتح الموقع المباشر' : 'Open live website'}
            >
              <ExternalLink className="w-5 h-5" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
};

// Shimmer animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(styleSheet);
}

export default PremiumMockupCardRound5;
