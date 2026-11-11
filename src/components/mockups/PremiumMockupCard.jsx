/**
 * PremiumMockupCard - Round 4: Clickable cards with live website links
 * 
 * FEATURES:
 * - Whole card is clickable (opens live_url or details page)
 * - Browser frame with domain URL bar
 * - CSS template fallback for missing images
 * - Equal heights, proper hover states
 * - "Visit Website" or "View Details" based on live_url presence
 * - "Request Design" secondary button
 * - Category, Featured, New badges
 * - Tags (max 3)
 * - Fixed aspect ratio 16/10
 * - Skeleton shimmer while loading
 * - RTL support, dark mode, reduced motion
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowRight, Sparkles, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// CSS Template Fallback (when image is missing/broken)
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
      {/* Nav */}
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
      
      {/* Hero */}
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
      
      {/* Cards */}
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

const PremiumMockupCard = ({
  mockup,
  onRequestDesign,
  index = 0,
  isFirst = false,
  language = 'en',
  isDark = false,
  simplified = false
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
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
  
  // Extract domain from live_url for display
  let domain = null;
  if (mockup.live_url) {
    try {
      domain = new URL(mockup.live_url).hostname.replace('www.', '');
    } catch (e) {
      // Invalid URL, ignore
      domain = null;
    }
  }
  
  // Check if "New" (created within last 14 days or has is_new flag)
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
  
  // Handle primary action (whole card click)
  const handleCardClick = (e) => {
    // Don't trigger if clicking on buttons
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
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: simplified ? 0 : 0.6, 
        delay: simplified ? 0 : Math.min(index * 0.08, 0.4),
        ease: [0.16, 1, 0.3, 1]
      }}
      onClick={handleCardClick}
      className={`group flex flex-col h-full rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 ${
        isDark
          ? 'bg-slate-800/50 border-white/10 hover:border-cyan-400/30 hover:shadow-2xl hover:shadow-cyan-400/10'
          : 'bg-white border-slate-200 hover:border-[#5C7E8F]/30 hover:shadow-2xl hover:shadow-[#5C7E8F]/10'
      } ${!simplified ? 'hover:-translate-y-1' : ''}`}
      style={{ minHeight: '400px' }}
    >
      {/* Image Container with Browser Frame */}
      <div className="relative w-full flex-shrink-0 bg-slate-900">
        {/* Browser Chrome */}
        <div className={`flex items-center justify-between px-3 py-2 ${
          isDark ? 'bg-slate-950' : 'bg-slate-800'
        }`}>
          {/* Dots */}
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          
          {/* URL Bar */}
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
        
        {/* Screenshot Area - Fixed Aspect Ratio 16/10 */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-900">
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
              src={imageUrl}
              alt={title}
              loading={isFirst ? 'eager' : 'lazy'}
              fetchpriority={isFirst ? 'high' : 'auto'}
              decoding="async"
              width="800"
              height="500"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover object-top transition-all duration-500 ${
                !simplified ? 'group-hover:scale-105' : ''
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          ) : (
            <TemplateFallback 
              category={mockup.category || categoryName} 
              isDark={isDark}
              domain={domain}
            />
          )}
          
          {/* Hover Overlay */}
          {!simplified && (
            <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isDark ? 'bg-black/70' : 'bg-black/50'
            }`}>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm ${
                isDark ? 'bg-white/10' : 'bg-white/20'
              }`}>
                {primaryIcon && <primaryIcon className="w-4 h-4 text-white" />}
                <span className="text-white font-semibold text-sm">
                  {hasLiveUrl ? (language === 'ar' ? 'فتح الموقع' : 'Open Site') : (language === 'ar' ? 'عرض' : 'View')}
                </span>
              </div>
            </div>
          )}
          
          {/* Badges on Image */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
            {/* Category Badge */}
            {categoryName && (
              <div className="px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-bold"
                style={{
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.95)',
                  color: isDark ? '#6FD3D8' : '#1F3440',
                  border: `1px solid ${isDark ? 'rgba(111, 211, 216, 0.2)' : 'rgba(92, 126, 143, 0.2)'}`
                }}
              >
                {categoryName}
              </div>
            )}
            
            {/* Right Badges */}
            <div className="flex flex-col gap-2">
              {mockup.is_featured && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md text-xs font-bold"
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
                <div className="flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md text-xs font-bold"
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
      
      {/* Content - Flex Column with Footer Pinned */}
      <div className="flex flex-col flex-1 p-5 space-y-3">
        {/* Title - Full Width, 2 Lines */}
        <h3 
          className={`font-bold text-lg leading-snug line-clamp-2 transition-colors ${
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
        
        {/* Description - 2 Lines */}
        {description && (
          <p 
            className={`text-sm leading-relaxed line-clamp-2 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            } ${language === 'ar' ? 'text-right' : 'text-left'}`}
          >
            {description}
          </p>
        )}
        
        {/* Tags - Max 3 */}
        {tags.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${language === 'ar' ? 'justify-end' : ''}`}>
            {tags.map((tag, i) => (
              <span 
                key={i}
                className={`px-2 py-0.5 rounded text-xs font-medium ${
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
        <div className="flex-1 min-h-[8px]" />
        
        {/* Buttons Footer - Pinned to Bottom */}
        <div className="flex gap-2 pt-2" style={{ minHeight: '44px' }}>
          {/* Primary Button - Visit Website / View Details */}
          <Button
            onClick={handleCardClick}
            className={`flex-1 h-11 bg-gradient-to-r from-[#5C7E8F] to-[#4A6B7C] hover:from-[#4A6B7C] hover:to-[#5C7E8F] text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
              language === 'ar' ? 'flex-row-reverse' : ''
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2`}
            style={{ whiteSpace: 'nowrap' }}
            aria-label={`${primaryLabel} - ${title}${hasLiveUrl ? ` (${language === 'ar' ? 'يفتح في علامة تبويب جديدة' : 'opens in new tab'})` : ''}`}
          >
            {primaryIcon && <primaryIcon className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} aria-hidden="true" />}
            <span>{primaryLabel}</span>
          </Button>
          
          {/* Secondary Button - Request Design (Icon Only with Tooltip) */}
          <Button
            onClick={handleRequestClick}
            variant="outline"
            className={`h-11 w-11 p-0 flex items-center justify-center font-semibold transition-all duration-300 ${
              isDark
                ? 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-cyan-400/50'
                : 'bg-white border-slate-300 text-[#1F3440] hover:bg-slate-50 hover:border-[#5C7E8F]'
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2`}
            aria-label={`${language === 'ar' ? 'اطلب تصميم مخصص' : 'Request custom design'} - ${title}`}
            title={language === 'ar' ? 'اطلب تصميم مخصص' : 'Request custom design'}
          >
            <ArrowRight 
              className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
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

export default PremiumMockupCard;
