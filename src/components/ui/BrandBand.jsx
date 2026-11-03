import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BrandBand = ({ withArrows = false }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = React.useRef(null);

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
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6 text-primary" />
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
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6 text-primary" />
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


