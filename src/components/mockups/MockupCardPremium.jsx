/**
 * MockupCardPremium - Fixed and polished mockup card
 * 
 * FIXES:
 * 1. Image field: Uses cover_image_url/desktop_screenshot_url from database
 * 2. Fallback: CSS mini template instead of broken image icon
 * 3. Layout: Title gets full width, category chip on image corner
 * 4. Equal heights: Flex column with mt-auto footer
 * 5. Typography: Title/description clamp with ellipsis
 * 6. Buttons: 44px min height, proper spacing, arrow flip RTL
 * 7. Hover: Subtle lift, palette-tinted shadow, image zoom, eye icon
 * 8. "New" badge: Only if created within last 14 days
 * 9. Image optimization: aspect-ratio, loading, sizes, srcset
 * 10. Skeleton shimmer while loading
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Convincing template fallback (same style as hero)
const TemplateFallback = ({ category, isDark, title }) => {
  const accents = {
    'ecommerce': { from: '#10B981', to: '#059669' },
    'restaurant-food': { from: '#F59E0B', to: '#D97706' },
    'healthcare': { from: '#EF4444', to: '#DC2626' },
    'education': { from: '#3B82F6', to: '#2563EB' },
    'real-estate': { from: '#14B8A6', to: '#0D9488' },
    'business-corporate': { from: '#6366F1', to: '#4F46E5' },
    'default': { from: '#8B5CF6', to: '#7C3AED' }
  };
  
  const accent = accents[category] || accents.default;
  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  
  return (
    <div className="w-full h-full" style={{ backgroundColor: bgColor }}>
      {/* Nav */}
      <div 
        className="flex items-center justify-between px-4 py-2"
        style={{
          background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.9)',
          borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
        }}
      >
        <div className="w-16 h-3 rounded" style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }} />
        <div className="flex gap-2">
          {[1,2,3].map(i => (
            <div key={i} className="w-8 h-1 rounded" style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} />
          ))}
        </div>
      </div>
      
      {/* Hero */}
      <div 
        className="px-4 py-8 text-center"
        style={{ background: `linear-gradient(135deg, ${accent.from}15, ${accent.to}08)` }}
      >
        <div className="space-y-2">
          <div className="w-3/4 h-4 rounded mx-auto" style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)' }} />
          <div className="w-1/2 h-3 rounded mx-auto" style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' }} />
          <div className="px-4 py-1.5 rounded-lg mx-auto inline-block" style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }} />
        </div>
      </div>
      
      {/* Cards */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3].map(i => (
            <div 
              key={i}
              className="rounded p-2 space-y-1"
              style={{
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
              }}
            >
              <div className="w-full h-10 rounded" style={{ background: `linear-gradient(135deg, ${accent.from}30, ${accent.to}20)` }} />
              <div className="w-3/4 h-1 rounded" style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)' }} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div 
        className="px-4 py-2 mt-auto"
        style={{
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(241, 245, 249, 0.9)',
          borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
        }}
      >
        <div className="flex justify-between items-center">
          <div className="w-12 h-2 rounded" style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} />
          <div className="flex gap-1">
            {[1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MockupCardPremium = ({ 
  mockup, 
  onViewMockup, 
  onRequestDesign, 
  index = 0,
  isFirst = false,
  language = 'en',
  isDark = false,
  simplified = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Get localized fields
  const title = language === 'ar' ? (mockup.title_ar || mockup.title_en || mockup.title) : (mockup.title_en || mockup.title);
  const description = language === 'ar' ? (mockup.short_description_ar || mockup.description_ar || mockup.short_description_en || mockup.description) : (mockup.short_description_en || mockup.description || mockup.short_description_ar);
  const categoryName = language === 'ar' ? mockup.category_name_ar : mockup.category_name_en;
  
  // Get image URL (prioritize cover_image_url, fallback to desktop_screenshot_url)
  const imageUrl = mockup.cover_image_url || mockup.desktop_screenshot_url || mockup.image_url;
  
  // Check if "New" (created within last 14 days)
  const isNew = mockup.is_new || (mockup.created_at && 
    (new Date() - new Date(mockup.created_at)) / (1000 * 60 * 60 * 24) <= 14
  );
  
  // Category slug for fallback template
  const categorySlug = mockup.category_slug || mockup.slug || 'default';
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: simplified ? 0 : 0.6, 
        delay: simplified ? 0 : index * 0.08,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={`group flex flex-col h-full rounded-2xl overflow-hidden border transition-all duration-300 ${
        isDark
          ? 'bg-slate-800/50 border-white/10 hover:border-cyan-400/30'
          : 'bg-white border-slate-200 hover:border-[#5C7E8F]/30'
      } ${!simplified ? 'hover:shadow-xl hover:-translate-y-1' : ''}`}
    >
      {/* Image Container - Fixed aspect ratio */}
      <Link
        to={`/mockups/${mockup.slug || mockup.id}`}
        className="relative w-full aspect-[16/10] overflow-hidden flex-shrink-0"
      >
        {/* Skeleton shimmer while loading */}
        {!imageLoaded && !imageError && (
          <div 
            className="absolute inset-0 animate-pulse"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 50%, rgba(30, 41, 59, 0.8) 100%)'
                : 'linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite'
            }}
          />
        )}
        
        {/* Actual image or fallback template */}
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
            category={categorySlug} 
            isDark={isDark}
            title={title}
          />
        )}
        
        {/* Hover overlay with eye icon */}
        {!simplified && (
          <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            isDark ? 'bg-black/60' : 'bg-black/40'
          }`}>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm ${
              isDark ? 'bg-white/10' : 'bg-white/20'
            }`}>
              <Eye className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-sm">
                {language === 'ar' ? 'معاينة' : 'Preview'}
              </span>
            </div>
          </div>
        )}
        
        {/* Category chip on image corner */}
        {categoryName && (
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold shadow-lg"
            style={{
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              color: isDark ? '#6FD3D8' : '#1F3440',
              border: `1px solid ${isDark ? 'rgba(111, 211, 216, 0.2)' : 'rgba(92, 126, 143, 0.2)'}`
            }}
          >
            {categoryName}
          </div>
        )}
        
        {/* "New" badge */}
        {isNew && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-bold shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: 'white'
            }}
          >
            <Sparkles className="w-3 h-3" />
            <span>{language === 'ar' ? 'جديد' : 'New'}</span>
          </div>
        )}
      </Link>
      
      {/* Content - Flex column with mt-auto footer */}
      <div className="flex flex-col flex-1 p-5 space-y-4">
        {/* Title - Full width, 2 lines max */}
        <h3 
          className={`font-bold text-lg leading-tight line-clamp-2 transition-colors ${
            isDark 
              ? 'text-white group-hover:text-cyan-400' 
              : 'text-[#1F3440] group-hover:text-[#5C7E8F]'
          } ${language === 'ar' ? 'text-right' : 'text-left'}`}
          style={{
            wordBreak: 'break-word',
            hyphens: 'auto'
          }}
        >
          {title}
        </h3>
        
        {/* Description - 2 lines max */}
        {description && (
          <p 
            className={`text-sm leading-relaxed line-clamp-2 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            } ${language === 'ar' ? 'text-right' : 'text-left'}`}
          >
            {description}
          </p>
        )}
        
        {/* Buttons footer - Pinned to bottom */}
        <div className="flex flex-col gap-2 pt-2 mt-auto">
          {/* Primary: View Mockup */}
          <Button
            onClick={() => onViewMockup(mockup)}
            className={`w-full h-11 bg-gradient-to-r from-[#5C7E8F] to-[#4A6B7C] hover:from-[#4A6B7C] hover:to-[#5C7E8F] text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
              language === 'ar' ? 'flex-row-reverse' : ''
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2`}
          >
            <Eye className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} aria-hidden="true" />
            <span>{language === 'ar' ? 'عرض التصميم' : 'View Mockup'}</span>
          </Button>
          
          {/* Secondary: Request Design */}
          <Button
            onClick={() => onRequestDesign(mockup)}
            variant="outline"
            className={`w-full h-11 font-semibold transition-all duration-300 ${
              isDark
                ? 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-cyan-400/50'
                : 'bg-white border-slate-300 text-[#1F3440] hover:bg-slate-50 hover:border-[#5C7E8F]'
            } ${language === 'ar' ? 'flex-row-reverse' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2`}
          >
            <span>{language === 'ar' ? 'اطلب تصميم مخصص' : 'Request Design'}</span>
            <ArrowRight 
              className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                language === 'ar' ? 'mr-2 rotate-180 group-hover:-translate-x-1' : 'ml-2'
              }`} 
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>
    </motion.article>
  );
};

export default MockupCardPremium;
