import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useMarqueeItems } from '@/hooks/useContent';

const BrandBand = ({ withArrows = false }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = React.useRef(null);
  const { t, language } = useTranslation();
  const { data: marqueeItems = [], isLoading } = useMarqueeItems();

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  // Hide section if no items
  if (!isLoading && marqueeItems.length === 0) {
    return null;
  }

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-frost to-frost-soft py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 w-32 bg-frost rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Get text based on language
  const getItemText = (item) => {
    return language === 'ar' ? (item.text_ar || item.text_en) : (item.text_en || item.text);
  };

  // Duplicate items for seamless scroll (need at least 12 for smooth animation)
  const displayItems = marqueeItems.length > 0 
    ? [...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems]
    : [];

  if (withArrows) {
    return (
      <div className="bg-gradient-to-r from-frost to-frost-soft dark:from-brand-950 dark:to-brand-900 py-6 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => handleScroll('left')}
              className={`absolute top-1/2 -translate-y-1/2 z-10 bg-color-background/90 hover:bg-color-background rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 ${language === 'ar' ? 'right-0' : 'left-0'}`}
              aria-label={t('common.scrollLeft')}
            >
              <ChevronLeft className={`h-6 w-6 text-primary ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>

            {/* Scrollable Container */}
            <div 
              ref={scrollRef}
              className="overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex whitespace-nowrap px-12">
                {displayItems.map((item, i) => (
                  <div key={`${item.id}-${i}`} className="flex items-center mx-8">
                    <span className="s-logo text-3xl font-bold text-primary dark:text-brand-accent" dir="auto">
                      {getItemText(item)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => handleScroll('right')}
              className={`absolute top-1/2 -translate-y-1/2 z-10 bg-color-background/90 hover:bg-color-background rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 ${language === 'ar' ? 'left-0' : 'right-0'}`}
              aria-label={t('common.scrollRight')}
            >
              <ChevronRight className={`h-6 w-6 text-primary ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Original auto-scrolling version
  return (
    <div className="bg-gradient-to-r from-frost to-frost-soft dark:from-brand-950 dark:to-brand-900 py-6 overflow-hidden">
      <div className="flex animate-scroll whitespace-nowrap">
        {displayItems.map((item, i) => (
          <div key={`${item.id}-${i}`} className="flex items-center mx-8">
            <span className="s-logo text-3xl font-bold text-primary dark:text-brand-accent" dir="auto">
              {getItemText(item)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandBand;


