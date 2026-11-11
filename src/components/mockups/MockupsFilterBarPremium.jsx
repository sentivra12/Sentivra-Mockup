/**
 * MockupsFilterBarPremium - Round 5: Glass segmented bar with sliding indicator
 * 
 * Features:
 * - Glass morphism design with sliding active indicator (animated thumb)
 * - Hidden if only "All" category exists (visibleCategories.length === 1)
 * - Horizontally scrollable with edge fade on mobile
 * - Auto-scroll active pill into view
 * - Keyboard accessible (roving tabindex, arrow keys)
 * - Sticky under navbar with blur
 * - URL state (?category=slug) for shareable links
 * - Dark mode, RTL, reduced-motion support
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  LayoutGrid, Briefcase, ShoppingCart, UtensilsCrossed, Heart, 
  GraduationCap, Dumbbell, Home, User, Sparkles 
} from 'lucide-react';

// Icon mapping
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

const MockupsFilterBarPremium = ({ 
  categories = [],
  mockups = [],
  activeCategory, 
  onCategoryChange,
  language,
  isDark
}) => {
  // ALL HOOKS FIRST
  const [searchParams, setSearchParams] = useSearchParams();
  const scrollRef = useRef(null);
  const activeButtonRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const shouldReduceMotion = useReducedMotion();
  
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
  
  // Calculate mockup counts per category
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
  
  // Update sliding indicator position
  useEffect(() => {
    if (activeButtonRef.current && scrollRef.current) {
      const button = activeButtonRef.current;
      const container = scrollRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left + container.scrollLeft,
        width: buttonRect.width
      });
    }
  }, [activeCategory, visibleCategories]);
  
  // HIDE if only "All" exists - AFTER all hooks
  if (visibleCategories.length === 1) {
    return null;
  }
  
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
    <motion.div 
      initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={`sticky top-16 z-40 border-b backdrop-blur-xl transition-colors ${
        isDark 
          ? 'bg-[#0A1525]/80 border-white/5' 
          : 'bg-white/80 border-slate-200/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Glass segmented bar */}
        <div className="relative">
          {/* Left fade gradient */}
          <div 
            className={`absolute left-0 top-0 bottom-0 w-8 pointer-events-none z-10 ${
              isDark
                ? 'bg-gradient-to-r from-[#0A1525]/80 to-transparent'
                : 'bg-gradient-to-r from-white/80 to-transparent'
            }`}
          />
          
          {/* Scrollable container */}
          <div 
            ref={scrollRef}
            className="relative overflow-x-auto scrollbar-hide"
            role="tablist"
            aria-label={language === 'ar' ? 'فئات التصاميم' : 'Mockup categories'}
          >
            {/* Glass background bar */}
            <div 
              className={`relative rounded-2xl border backdrop-blur-md ${
                isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-slate-50/80 border-slate-200/50'
              }`}
              style={{
                boxShadow: isDark 
                  ? '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                  : '0 4px 20px rgba(92, 126, 143, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}
            >
              {/* Sliding indicator (animated thumb) */}
              {!shouldReduceMotion && (
                <motion.div
                  className="absolute top-1 bottom-1 rounded-xl"
                  style={{
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(111, 211, 216, 0.15), rgba(92, 126, 143, 0.15))'
                      : 'linear-gradient(135deg, rgba(92, 126, 143, 0.1), rgba(74, 107, 124, 0.1))',
                    border: `1px solid ${isDark ? 'rgba(111, 211, 216, 0.3)' : 'rgba(92, 126, 143, 0.3)'}`,
                    boxShadow: isDark
                      ? '0 2px 8px rgba(111, 211, 216, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      : '0 2px 8px rgba(92, 126, 143, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                  }}
                  animate={{
                    left: indicatorStyle.left,
                    width: indicatorStyle.width
                  }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 30 
                  }}
                />
              )}
              
              {/* Pills */}
              <div className="relative flex gap-1 p-1 min-w-max">
                {visibleCategories.map((category, index) => {
                  const isActive = activeCategory === category.slug;
                  const Icon = iconMap[category.icon] || LayoutGrid;
                  const name = language === 'ar' ? category.name_ar : category.name_en;
                  
                  return (
                    <button
                      key={category.slug}
                      ref={isActive ? activeButtonRef : null}
                      onClick={() => handleCategoryChange(category.slug)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls="mockups-grid"
                      tabIndex={isActive ? 0 : -1}
                      className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-300 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 z-10 ${
                        isActive
                          ? isDark
                            ? 'text-cyan-300 ring-cyan-400'
                            : 'text-[#1F3440] ring-[#5C7E8F]'
                          : isDark
                            ? 'text-slate-400 hover:text-slate-200'
                            : 'text-slate-600 hover:text-slate-900'
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
                            ? isDark
                              ? 'bg-cyan-400/20 text-cyan-300'
                              : 'bg-[#5C7E8F]/15 text-[#1F3440]'
                            : isDark
                              ? 'bg-white/5 text-slate-500'
                              : 'bg-slate-200/80 text-slate-600'
                        }`}
                        aria-label={`${category.count} ${language === 'ar' ? 'تصميم' : 'designs'}`}
                      >
                        {category.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Right fade gradient */}
          <div 
            className={`absolute right-0 top-0 bottom-0 w-8 pointer-events-none z-10 ${
              isDark
                ? 'bg-gradient-to-l from-[#0A1525]/80 to-transparent'
                : 'bg-gradient-to-l from-white/80 to-transparent'
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default MockupsFilterBarPremium;
