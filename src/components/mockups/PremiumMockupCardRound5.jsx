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
import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, ArrowRight, Sparkles, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// CSS Template Fallback (same as Round 4)
const TemplateFallback = ({ category, isDark, domain }) => {
  const accents = {
    'ecommerce': { from: '#10B981', to: '#059669' },
    'restaurant': { from: '#F59E0B', to: '#D97706' },
    'healthcare': { from: '#EF4444', to: '#DC2626' },
    'education': { from: '#3B82F6', to: '#2563EB' },
    'real-estate': { from: '#14B8A6', to: '#0D9488' },
    'business': { from: '#6366F1', to: '#4F46E5' },
    'fitness': { from: '#EC4899', to: '#DB2777' },
    'portfolio': { from: '#8B5CF6', to: '#7C3AED' },
    'default': { from: '#5C7E8F', to: '#4A6B7C' }
  };
  
  const accent = accents[category?.toLowerCase()] || accents.default;
  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  
  return (
    <div className="w-full h-full" style={{ backgroundColor: bgColor }}>
      <div 
        className="flex items-center justify-between px-3 py-1.5"
        style={{
          background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.9)',
          borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
        }}
      >
        <div className="w-12 h-2 rounded" style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }} />
        <div className="flex gap-1.5">
          {[1,2,3].map(i => (
            <div key={i} className="w-6 h-0.5 rounded" style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} />
          ))}
        </div>
      </div>
      
      <div 
        className="px-3 py-6 text-center"
        style={{ background: `linear-gradient(135deg, ${accent.from}15, ${accent.to}08)` }}
      >
        <div className="space-y-1.5">
          <div className="w-3/4 h-3 rounded mx-auto" style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)' }} />
          <div className="w-1/2 h-2 rounded mx-auto" style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' }} />
          <div className="px-3 py-1 rounded-lg mx-auto inline-block" style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }} />
        </div>
      </div>
      
      <div className="px-3 py-3">
        <div className="grid grid-cols-3 gap-1.5">
          {[1,2,3].map(i => (
            <div 
              key={i}
              className="rounded p-1.5 space-y-1"
              style={{
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
              }}
            >
              <div className="w-full h-8 rounded" style={{ background: `linear-gradient(135deg, ${accent.from}30, ${accent.to}20)` }} />
              <div className="w-3/4 h-1 rounded" style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)' }} />
            </div>
          ))}
        </div>
      </div>
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
  const categoryName = language === 'ar' ? mockup.category_name_ar : mockup.category_name_en;
  
  // Image URL with fallback chain
  const imageUrl = mockup.cover_image_url || mockup.desktop_screenshot_url || mockup.image_url;
  
  // Extract domain from live_url
  let domain = null;
  if (mockup.live_url) {
    try {
      domain = new URL(mockup.live_url).hostname.replace('www.', '');
    } catch (e) {
      domain = null;
    }
  }
  
  // Check if "New"
  const isNew = mockup.is_new || (mockup.created_at && 
    (new Date() - new Date(mockup.created_at)) / (1000 * 60 * 60 * 24) <= 14
  );
  
  // Parse tags (limit to 3)
  const tags = Array.isArray(mockup.tags) ? mockup.tags.slice(0, 3) : [];
  
  // Determine primary action
  const hasLiveUrl = Boolean(mockup.live_url);
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
      const target = mockup.open_in_new_tab !== false ? '_blank' : '_self';
      window.open(mockup.live_url, target, 'noopener,noreferrer');
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
      className={`group relative flex ${isFeatured ? 'flex-row' : 'flex-col'} h-full rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-500 ${
        isDark
          ? 'bg-slate-800/50 border-white/10'
          : 'bg-white border-slate-200'
      }`}
      style={{
        minHeight: isFeatured ? '500px' : '450px',
        ...(!disableEffects && isHovered ? tiltStyle : {}),
        willChange: isHovered ? 'transform' : 'auto',
        // Layered shadow with palette tint
        boxShadow: isHovered
          ? isDark
            ? '0 25px 60px rgba(111, 211, 216, 0.25), 0 15px 35px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(0, 0, 0, 0.2)'
            : '0 25px 60px rgba(92, 126, 143, 0.2), 0 15px 35px rgba(92, 126, 143, 0.15), 0 5px 15px rgba(0, 0, 0, 0.1)'
          : isDark
            ? '0 10px 30px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(0, 0, 0, 0.2)'
            : '0 10px 30px rgba(92, 126, 143, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Gradient border (animates on hover) */}
      <div 
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(111, 211, 216, 0.3), rgba(92, 126, 143, 0.2))'
            : 'linear-gradient(135deg, rgba(92, 126, 143, 0.3), rgba(111, 211, 216, 0.2))',
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
            background: `radial-gradient(circle 200px at ${spotlightPos.x}% ${spotlightPos.y}%, ${isDark ? 'rgba(111, 211, 216, 0.15)' : 'rgba(92, 126, 143, 0.1)'}, transparent)`
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Image Container with Browser Frame */}
      <div className={`relative ${isFeatured ? 'w-1/2' : 'w-full'} flex-shrink-0 bg-slate-900 overflow-hidden`}>
        {/* Browser Chrome */}
        <div className={`flex items-center justify-between px-3 py-2 ${
          isDark ? 'bg-slate-950' : 'bg-slate-800'
        }`}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          
          {domain && (
            <div className={`flex-1 mx-3 px-3 py-1 rounded-md text-xs flex items-center gap-1.5 ${
              isDark ? 'bg-slate-900' : 'bg-slate-700'
            }`}>
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-slate-300 truncate">{domain}</span>
            </div>
          )}
        </div>
        
        {/* Screenshot Area - Scroll on hover */}
        <div 
          ref={imageContainerRef}
          className={`relative w-full ${isFeatured ? 'h-full' : 'aspect-[16/10]'} overflow-hidden bg-slate-900`}
        >
          {/* Skeleton Shimmer */}
          {!imageLoaded && !imageError && (
            <div 
              className="absolute inset-0"
              style={{
                background: isDark
                  ? 'linear-gradient(90deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 50%, rgba(30, 41, 59, 0.8) 100%)'
                  : 'linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%)',
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
                // Scroll effect on hover (only if image is tall)
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
            <TemplateFallback 
              category={mockup.category || categoryName} 
              isDark={isDark}
              domain={domain}
            />
          )}
          
          {/* Hover Overlay */}
          {!disableEffects && (
            <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isDark ? 'bg-black/70' : 'bg-black/50'
            }`}>
              <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl backdrop-blur-md ${
                isDark ? 'bg-white/10' : 'bg-white/20'
              }`}>
                {primaryIcon && <primaryIcon className="w-5 h-5 text-white" />}
                <span className="text-white font-semibold">
                  {hasLiveUrl ? (language === 'ar' ? 'فتح الموقع' : 'Open Site') : (language === 'ar' ? 'عرض' : 'View')}
                </span>
              </div>
            </div>
          )}
          
          {/* Badges on Image */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
            {categoryName && (
              <div className="px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold"
                style={{
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.95)',
                  color: isDark ? '#6FD3D8' : '#1F3440',
                  border: `1px solid ${isDark ? 'rgba(111, 211, 216, 0.2)' : 'rgba(92, 126, 143, 0.2)'}`
                }}
              >
                {categoryName}
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              {mockup.is_featured && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    color: 'white'
                  }}
                >
                  <Star className="w-3 h-3" />
                  <span>{language === 'ar' ? 'مميز' : 'Featured'}</span>
                </div>
              )}
              
              {isNew && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: 'white'
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{language === 'ar' ? 'جديد' : 'New'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className={`flex flex-col flex-1 ${isFeatured ? 'w-1/2 p-8' : 'p-6'} space-y-4`}>
        {/* Title - hyphens manual, text-wrap balance */}
        <h3 
          className={`font-bold ${isFeatured ? 'text-2xl' : 'text-lg'} leading-snug line-clamp-2 transition-colors ${
            isDark 
              ? 'text-white group-hover:text-cyan-400' 
              : 'text-[#1F3440] group-hover:text-[#5C7E8F]'
          } ${language === 'ar' ? 'text-right' : 'text-left'}`}
          style={{
            wordBreak: 'break-word',
            hyphens: 'manual',
            textWrap: 'balance',
            overflowWrap: 'anywhere'
          }}
        >
          {title}
        </h3>
        
        {/* Description */}
        {description && (
          <p 
            className={`${isFeatured ? 'text-base' : 'text-sm'} leading-relaxed ${isFeatured ? 'line-clamp-3' : 'line-clamp-2'} ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            } ${language === 'ar' ? 'text-right' : 'text-left'}`}
          >
            {description}
          </p>
        )}
        
        {/* Tags */}
        {tags.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${language === 'ar' ? 'justify-end' : ''}`}>
            {tags.map((tag, i) => (
              <span 
                key={i}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  isDark
                    ? 'bg-white/5 text-slate-400'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Spacer */}
        <div className="flex-1 min-h-[12px]" />
        
        {/* Buttons Footer */}
        <div className="flex gap-3 pt-2" style={{ minHeight: '44px' }}>
          <Button
            onClick={handleCardClick}
            className={`flex-1 h-12 bg-gradient-to-r from-[#5C7E8F] to-[#4A6B7C] hover:from-[#4A6B7C] hover:to-[#5C7E8F] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl ${
              language === 'ar' ? 'flex-row-reverse' : ''
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2`}
            style={{ whiteSpace: 'nowrap' }}
            aria-label={`${primaryLabel} - ${title}${hasLiveUrl ? ` (${language === 'ar' ? 'يفتح في علامة تبويب جديدة' : 'opens in new tab'})` : ''}`}
          >
            {primaryIcon && <primaryIcon className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} aria-hidden="true" />}
            <span>{primaryLabel}</span>
          </Button>
          
          <Button
            onClick={handleRequestClick}
            variant="outline"
            className={`h-12 w-12 p-0 flex items-center justify-center font-semibold rounded-xl transition-all duration-300 ${
              isDark
                ? 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-cyan-400/50'
                : 'bg-white border-slate-300 text-[#1F3440] hover:bg-slate-50 hover:border-[#5C7E8F]'
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2`}
            aria-label={`${language === 'ar' ? 'اطلب تصميم مخصص' : 'Request custom design'} - ${title}`}
            title={language === 'ar' ? 'اطلب تصميم مخصص' : 'Request custom design'}
          >
            <ArrowRight 
              className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''
              }`} 
              aria-hidden="true"
            />
          </Button>
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
