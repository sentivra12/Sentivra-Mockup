/**
 * MockupsFilterBar - Premium category filter with pills
 * 
 * Features:
 * - Dynamic categories from database with counts
 * - Single-select with clear active state (not color alone)
 * - Horizontally scrollable with edge fade on mobile
 * - Auto-scroll active pill into view
 * - Keyboard accessible (roving tabindex, arrow keys)
 * - Sticky under navbar with blur
 * - URL state (?category=slug) for shareable links
 * - Hides categories with zero published mockups
 * - Never renders icon-only pills (always shows name + count)
 */

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  LayoutGrid, Briefcase, ShoppingCart, UtensilsCrossed, Heart, 
  GraduationCap, Dumbbell, Home, User, Sparkles 
} from 'lucide-react';

// Icon mapping (Lucide components)
const iconMap = {
  LayoutGrid,
  Briefcase,
  ShoppingCart,
  UtensilsCrossed,
  Heart,
  GraduationCap,
  Dumbbell,
  Home,
  User,
  Sparkles
};

const MockupsFilterBar = ({ 
  categories = [],
  mockups = [],
  activeCategory, 
  onCategoryChange,
  language,
  isDark
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const scrollRef = useRef(null);
  const activeButtonRef = useRef(null);
  
  // Safe defaults
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeMockups = Array.isArray(mockups) ? mockups : [];
  
  // Add "All" category first
  const allCategory = {
    slug: 'all',
    name_en: 'All Designs',
    name_ar: 'كل التصاميم',
    icon: 'LayoutGrid'
  };
  
  // Calculate mockup counts per category (including "All")
  const allCategories = [allCategory, ...safeCategories];
  const categoryCounts = allCategories.map(cat => ({
    ...cat,
    count: cat.slug === 'all' 
      ? safeMockups.filter(m => m.published || m.is_active).length
      : safeMockups.filter(m => {
          const mockupCategorySlug = m.category_slug || m.slug;
          return (m.published || m.is_active) && mockupCategorySlug === cat.slug;
        }).length
  }));
  
  // Filter out categories with zero mockups (except "all")
  const visibleCategories = categoryCounts.filter(cat => 
    cat.slug === 'all' || cat.count > 0
  );
  
  // Sync URL with active category
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory && urlCategory !== activeCategory) {
      const exists = visibleCategories.find(c => c.slug === urlCategory);
      if (exists) {
        onCategoryChange(urlCategory);
      }
    }
  }, [searchParams]);
  
  // Scroll active pill into view
  useEffect(() => {
    if (activeButtonRef.current && scrollRef.current) {
      const button = activeButtonRef.current;
      const container = scrollRef.current;
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollLeft = container.scrollLeft;
      
      // Check if button is out of view
      if (buttonLeft < scrollLeft) {
        container.scrollTo({ left: buttonLeft - 20, behavior: 'smooth' });
      } else if (buttonLeft + buttonWidth > scrollLeft + containerWidth) {
        container.scrollTo({ 
          left: buttonLeft + buttonWidth - containerWidth + 20, 
          behavior: 'smooth' 
        });
      }
    }
  }, [activeCategory]);
  
  const handleCategoryChange = (slug) => {
    onCategoryChange(slug);
    setSearchParams(slug === 'all' ? {} : { category: slug });
  };
  
  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight' && index < visibleCategories.length - 1) {
      e.preventDefault();
      const nextSlug = visibleCategories[index + 1].slug;
      handleCategoryChange(nextSlug);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      const prevSlug = visibleCategories[index - 1].slug;
      handleCategoryChange(prevSlug);
    }
  };
  
  return (
    <div 
      className={`sticky top-16 z-40 border-b backdrop-blur-md transition-colors ${
        isDark 
          ? 'bg-[#0A1525]/95 border-white/10' 
          : 'bg-white/95 border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Scrollable pills container with edge fade */}
        <div className="relative">
          {/* Left fade gradient */}
          <div 
            className={`absolute left-0 top-0 bottom-0 w-8 pointer-events-none z-10 ${
              isDark
                ? 'bg-gradient-to-r from-[#0A1525]/95 to-transparent'
                : 'bg-gradient-to-r from-white/95 to-transparent'
            }`}
          />
          
          {/* Scrollable container */}
          <div 
            ref={scrollRef}
            className="overflow-x-auto scrollbar-hide"
            role="tablist"
            aria-label={language === 'ar' ? 'فئات التصاميم' : 'Mockup categories'}
          >
            <div className="flex gap-3 min-w-max px-1">
              {visibleCategories.map((category, index) => {
                const isActive = activeCategory === category.slug;
                const Icon = iconMap[category.icon] || LayoutGrid;
                const name = language === 'ar' ? category.name_ar : category.name_en;
                
                return (
                  <motion.button
                    key={category.slug}
                    ref={isActive ? activeButtonRef : null}
                    onClick={() => handleCategoryChange(category.slug)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    whileTap={{ scale: 0.95 }}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="mockups-grid"
                    tabIndex={isActive ? 0 : -1}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-300 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      isActive
                        ? isDark
                          ? 'bg-gradient-to-r from-[#5C7E8F] to-[#4A6B7C] text-white shadow-lg ring-cyan-400'
                          : 'bg-gradient-to-r from-[#5C7E8F] to-[#4A6B7C] text-white shadow-lg ring-[#5C7E8F]'
                        : isDark
                          ? 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 hover:border-[#5C7E8F]/30'
                    }`}
                  >
                    {/* Icon */}
                    <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    
                    {/* Name */}
                    <span className="font-medium">{name}</span>
                    
                    {/* Count badge */}
                    <span 
                      className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : isDark
                            ? 'bg-white/10 text-slate-400'
                            : 'bg-slate-200 text-slate-600'
                      }`}
                      aria-label={`${category.count} ${language === 'ar' ? 'تصميم' : 'designs'}`}
                    >
                      {category.count}
                    </span>
                    
                    {/* Active indicator (not color alone) */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
          
          {/* Right fade gradient */}
          <div 
            className={`absolute right-0 top-0 bottom-0 w-8 pointer-events-none z-10 ${
              isDark
                ? 'bg-gradient-to-l from-[#0A1525]/95 to-transparent'
                : 'bg-gradient-to-l from-white/95 to-transparent'
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default MockupsFilterBar;
