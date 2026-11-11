import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

const BrandBand = ({ withArrows = false }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = React.useRef(null);
  const { t, language } = useTranslation();

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

  if (withArrows) {
    return (
      <div className="bg-gradient-to-r from-frost to-frost-soft py-6 relative">
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
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex items-center mx-8">
                    <span className="s-logo text-3xl font-bold text-primary">
                      Sentivra
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
    <div className="bg-gradient-to-r from-frost to-frost-soft py-6 overflow-hidden">
      <div className="flex animate-scroll whitespace-nowrap">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="flex items-center mx-8">
            <span className="s-logo text-3xl font-bold text-primary">
              Sentivra
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandBand;


