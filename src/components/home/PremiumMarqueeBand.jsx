/**
 * Premium Marquee Band - Striking dual-row brand marquee
 * Features:
 * - Two rows moving in opposite directions at different speeds
 * - Row 1: Large display text with gradient/outlined style
 * - Row 2: Smaller text with icons
 * - Deep slate band with grid, glow, grain effects
 * - Gentle skew (-1.5deg) for dynamic feel
 * - Edge fade masks, pause on hover/focus
 * - Accessible: pause/play button, reduced-motion fallback
 * - RTL-aware: reverses direction in Arabic
 * - Content from database (marquee_items table)
 */

import { useState, useEffect, useRef } from 'react';
import { Pause, Play } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { useMarqueeItems } from '../../hooks/useContent';
import { resolveIcon } from '../../lib/iconResolver';

const PremiumMarqueeBand = () => {
  const { language } = useTranslation();
  const isRTL = language === 'ar';
  
  // Fetch marquee items by row
  const { data: row1Items = [] } = useMarqueeItems(1);
  const { data: row2Items = [] } = useMarqueeItems(2);
  
  const [isPaused, setIsPaused] = useState(false);
  const [focusedRow, setFocusedRow] = useState(null);
  
  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Duplicate items for seamless infinite loop (3x for smooth animation)
  const duplicatedRow1 = prefersReducedMotion ? row1Items : [...row1Items, ...row1Items, ...row1Items];
  const duplicatedRow2 = prefersReducedMotion ? row2Items : [...row2Items, ...row2Items, ...row2Items];

  // Don't render if no items - AFTER all hooks
  if (row1Items.length === 0 && row2Items.length === 0) {
    return null;
  }

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  return (
    <section 
      className="relative overflow-hidden bg-marquee-deep py-12 md:py-16"
      style={{ transform: 'rotate(-1.5deg) scale(1.02)', transformOrigin: 'center' }}
      onMouseEnter={() => !prefersReducedMotion && setIsPaused(true)}
      onMouseLeave={() => !prefersReducedMotion && setIsPaused(false)}
    >
      {/* Background effects */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Noise grain texture */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px'
          }}
        />
        
        {/* Radial glow */}
        <div className="absolute inset-0 bg-radial-gradient from-marquee-glow/5 via-transparent to-transparent" />
      </div>

      {/* Content wrapper to counteract parent skew */}
      <div style={{ transform: 'rotate(1.5deg)' }} className="relative">
        {/* Row 1: Large display text */}
        {row1Items.length > 0 && (
          <div className="relative mb-8 md:mb-12">
            {/* Edge fade masks */}
            {!prefersReducedMotion && (
              <>
                <div 
                  className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
                  style={{
                    background: isRTL 
                      ? 'linear-gradient(to left, transparent, var(--marquee-deep))' 
                      : 'linear-gradient(to right, transparent, var(--marquee-deep))'
                  }}
                />
                <div 
                  className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
                  style={{
                    background: isRTL 
                      ? 'linear-gradient(to right, transparent, var(--marquee-deep))' 
                      : 'linear-gradient(to left, transparent, var(--marquee-deep))'
                  }}
                />
              </>
            )}

            {/* Scrolling container */}
            <div
              className={`flex gap-12 md:gap-16 ${prefersReducedMotion ? 'flex-wrap justify-center' : ''}`}
              style={!prefersReducedMotion ? {
                animation: isPaused || focusedRow === 1 ? 'none' : `marquee-${isRTL ? 'rtl' : 'ltr'}-slow 45s linear infinite`,
                width: 'fit-content',
                willChange: 'transform'
              } : {}}
              onFocus={() => setFocusedRow(1)}
              onBlur={() => setFocusedRow(null)}
              role="list"
              aria-label="Brand highlights"
            >
              {duplicatedRow1.map((item, index) => (
                <div
                  key={`row1-${item.id}-${index}`}
                  className="flex-shrink-0 group"
                  role="listitem"
                  aria-hidden={!prefersReducedMotion && index >= row1Items.length}
                >
                  <span 
                    className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight
                      bg-gradient-to-r from-marquee-text via-marquee-accent to-marquee-text bg-clip-text text-transparent
                      group-hover:from-marquee-accent group-hover:to-marquee-accent transition-all duration-500"
                    style={{
                      textShadow: '0 0 40px rgba(143, 179, 196, 0.3)',
                      WebkitTextStroke: '1px rgba(143, 179, 196, 0.3)'
                    }}
                  >
                    {isRTL ? item.text_ar : item.text_en}
                  </span>
                  
                  {/* Separator (S logo mark would go here - using • for now) */}
                  {index < duplicatedRow1.length - 1 && (
                    <span className="inline-block mx-8 text-marquee-accent text-3xl opacity-40">•</span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Visually hidden list for screen readers */}
            {!prefersReducedMotion && (
              <ul className="sr-only">
                {row1Items.map((item) => (
                  <li key={`sr-row1-${item.id}`}>
                    {isRTL ? item.text_ar : item.text_en}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Row 2: Smaller text with icons */}
        {row2Items.length > 0 && (
          <div className="relative">
            {/* Edge fade masks */}
            {!prefersReducedMotion && (
              <>
                <div 
                  className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
                  style={{
                    background: isRTL 
                      ? 'linear-gradient(to left, transparent, var(--marquee-deep))' 
                      : 'linear-gradient(to right, transparent, var(--marquee-deep))'
                  }}
                />
                <div 
                  className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
                  style={{
                    background: isRTL 
                      ? 'linear-gradient(to right, transparent, var(--marquee-deep))' 
                      : 'linear-gradient(to left, transparent, var(--marquee-deep))'
                  }}
                />
              </>
            )}

            {/* Scrolling container (opposite direction) */}
            <div
              className={`flex gap-8 md:gap-10 items-center ${prefersReducedMotion ? 'flex-wrap justify-center' : ''}`}
              style={!prefersReducedMotion ? {
                animation: isPaused || focusedRow === 2 ? 'none' : `marquee-${isRTL ? 'ltr' : 'rtl'}-fast 60s linear infinite`,
                width: 'fit-content',
                willChange: 'transform'
              } : {}}
              onFocus={() => setFocusedRow(2)}
              onBlur={() => setFocusedRow(null)}
              role="list"
              aria-label="Services and values"
            >
              {duplicatedRow2.map((item, index) => {
                const IconComponent = item.icon_name ? resolveIcon(item.icon_name) : null;
                
                return (
                  <div
                    key={`row2-${item.id}-${index}`}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full
                      bg-marquee-chip border border-marquee-chip-border
                      hover:bg-marquee-chip-hover hover:border-marquee-accent/30 transition-all duration-300"
                    role="listitem"
                    aria-hidden={!prefersReducedMotion && index >= row2Items.length}
                  >
                    {IconComponent && (
                      <IconComponent className="w-4 h-4 text-marquee-accent flex-shrink-0" strokeWidth={2} />
                    )}
                    <span className="text-base md:text-lg font-medium text-marquee-text whitespace-nowrap">
                      {isRTL ? item.text_ar : item.text_en}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Visually hidden list for screen readers */}
            {!prefersReducedMotion && (
              <ul className="sr-only">
                {row2Items.map((item) => (
                  <li key={`sr-row2-${item.id}`}>
                    {isRTL ? item.text_ar : item.text_en}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Pause/Play button (only when animation is active) */}
        {!prefersReducedMotion && (row1Items.length > 0 || row2Items.length > 0) && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={handlePauseToggle}
              className="p-2 rounded-full bg-marquee-chip/80 border border-marquee-chip-border
                hover:bg-marquee-chip-hover hover:border-marquee-accent/30 transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-marquee-accent focus:ring-offset-2 focus:ring-offset-marquee-deep"
              aria-label={isPaused ? 'Play marquee animation' : 'Pause marquee animation'}
              aria-pressed={isPaused}
            >
              {isPaused ? (
                <Play className="w-5 h-5 text-marquee-accent" fill="currentColor" />
              ) : (
                <Pause className="w-5 h-5 text-marquee-accent" fill="currentColor" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes marquee-ltr-slow {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }

        @keyframes marquee-rtl-slow {
          from { transform: translateX(0); }
          to { transform: translateX(33.333%); }
        }
        
        @keyframes marquee-ltr-fast {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }

        @keyframes marquee-rtl-fast {
          from { transform: translateX(0); }
          to { transform: translateX(33.333%); }
        }
      `}</style>
    </section>
  );
};

export default PremiumMarqueeBand;
