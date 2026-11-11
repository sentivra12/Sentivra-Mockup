import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

/**
 * CategoryFilter - Responsive category filter
 * Desktop: Sticky sidebar with full labels
 * Mobile: Horizontal scrollable chips
 * 
 * Features:
 * - Shows "All" + active categories with count badges
 * - Animated active indicator
 * - Keyboard arrow support (desktop)
 * - Proper focus states
 * - Full RTL support
 * 
 * Props:
 * @param {Array} categories - [{id, slug, name_en, name_ar, icon, count}]
 * @param {String} activeCategory - Currently active slug ('all' or category slug)
 * @param {Function} onCategoryChange - Callback(slug)
 */
const CategoryFilter = ({ categories = [], activeCategory = 'all', onCategoryChange }) => {
  const { language } = useTranslation();
  const isRTL = language === 'ar';
  const activeRef = useRef(null);

  // Get icon component
  const getIcon = (iconName) => {
    const Icon = LucideIcons[iconName];
    return Icon || LucideIcons.Layers;
  };

  // Add "All" option
  const allOption = {
    id: 'all',
    slug: 'all',
    name_en: 'All Services',
    name_ar: 'كل الخدمات',
    icon: 'Layers',
    count: categories.reduce((sum, cat) => sum + (cat.count || 0), 0),
  };

  const allCategories = [allOption, ...categories];

  // Keyboard navigation (desktop only)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (window.innerWidth < 1024) return; // Desktop only
      
      const currentIndex = allCategories.findIndex(cat => cat.slug === activeCategory);
      
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const direction = e.key === 'ArrowDown' ? 1 : -1;
        const newIndex = (currentIndex + direction + allCategories.length) % allCategories.length;
        onCategoryChange(allCategories[newIndex].slug);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCategory, allCategories, onCategoryChange]);

  // Scroll active item into view (mobile)
  useEffect(() => {
    if (activeRef.current && window.innerWidth < 1024) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeCategory]);

  return (
    <>
      {/* Desktop: Sticky Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24">
          <div className="bg-color-background rounded-2xl shadow-card border border-frost p-2 space-y-1">
            {allCategories.map((category, index) => {
              const isActive = activeCategory === category.slug;
              const Icon = getIcon(category.icon);
              const name = isRTL ? category.name_ar : category.name_en;

              return (
                <motion.button
                  key={category.slug}
                  ref={isActive ? activeRef : null}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => onCategoryChange(category.slug)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-left
                    ${isRTL ? 'flex-row-reverse text-right' : ''}
                    ${isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                      : 'text-text-muted hover:bg-frost-soft hover:text-primary-deep'
                    }
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                    min-h-[44px]
                  `}
                  aria-current={isActive ? 'true' : 'false'}
                >
                  <Icon 
                    className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-primary'}`} 
                    strokeWidth={2}
                  />
                  <span className="font-semibold text-sm flex-1">{name}</span>
                  
                  {/* Count badge */}
                  {category.count > 0 && (
                    <span 
                      className={`
                        px-2 py-0.5 rounded-full text-xs font-bold
                        ${isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-frost text-text-muted'
                        }
                      `}
                    >
                      {category.count}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Helper text */}
          <p className="mt-4 px-4 text-xs text-text-muted">
            {isRTL 
              ? 'استخدم ↑ ↓ للتنقل بين الفئات'
              : 'Use ↑ ↓ to navigate categories'
            }
          </p>
        </div>
      </div>

      {/* Mobile: Horizontal Scrollable Chips */}
      <div className="lg:hidden mb-8 -mx-4 px-4">
        <div 
          className={`flex gap-3 overflow-x-auto scrollbar-hide pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {allCategories.map((category, index) => {
            const isActive = activeCategory === category.slug;
            const Icon = getIcon(category.icon);
            const name = isRTL ? category.name_ar : category.name_en;

            return (
              <motion.button
                key={category.slug}
                ref={isActive ? activeRef : null}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => onCategoryChange(category.slug)}
                className={`
                  flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 border-2
                  ${isRTL ? 'flex-row-reverse' : ''}
                  ${isActive 
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' 
                    : 'bg-color-background border-frost text-text-muted hover:border-primary/30 hover:text-primary-deep'
                  }
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                  min-h-[44px]
                `}
                aria-current={isActive ? 'true' : 'false'}
              >
                <Icon 
                  className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-primary'}`} 
                  strokeWidth={2}
                />
                <span className="font-semibold text-sm whitespace-nowrap">{name}</span>
                
                {/* Count badge */}
                {category.count > 0 && (
                  <span 
                    className={`
                      px-1.5 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center
                      ${isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-frost text-text-muted'
                      }
                    `}
                  >
                    {category.count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CategoryFilter;
