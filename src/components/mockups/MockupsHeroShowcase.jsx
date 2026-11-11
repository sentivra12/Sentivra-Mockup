import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import DeviceFrame from './DeviceFrame';
import MockupFallbackScreen from './MockupFallbackScreen';
import { useTranslation } from '@/i18n/useTranslation';

/**
 * MockupsHeroShowcase - Premium device showcase with auto-cycling mockup previews
 * 
 * Features:
 * - 3D-tilted device frames (laptop, tablet, phone)
 * - Auto-cycling mockup screenshots (~3.5s intervals)
 * - Pointer-based parallax on desktop
 * - Pause on hover/focus
 * - Progress dots and pause/play control
 * - Designed fallback when images missing
 * - Respects prefers-reduced-motion
 * - RTL support
 */
const MockupsHeroShowcase = ({ mockups = [], className = '' }) => {
  const { language } = useTranslation();
  const isRTL = language === 'ar';
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Pointer-based tilt (disabled for reduced motion)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], isRTL ? [5, -5] : [-5, 5]);

  // Get active mockups (published only)
  const activeMockups = mockups.filter(m => m.is_active);
  const displayMockups = activeMockups.length > 0 ? activeMockups.slice(0, 6) : [];
  const hasMockups = displayMockups.length > 0;

  // Auto-cycle mockups
  useEffect(() => {
    if (!isPlaying || isHovered || !hasMockups || prefersReducedMotion.current) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayMockups.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isPlaying, isHovered, hasMockups, displayMockups.length]);

  // Handle pointer move for parallax
  const handlePointerMove = (e) => {
    if (prefersReducedMotion.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handlePointerLeave = () => {
    if (prefersReducedMotion.current) return;
    mouseX.set(0);
    mouseY.set(0);
  };

  const currentMockup = hasMockups ? displayMockups[currentIndex] : null;
  const nextMockup = hasMockups ? displayMockups[(currentIndex + 1) % displayMockups.length] : null;
  const mobileIndex = hasMockups ? (currentIndex + 2) % displayMockups.length : 0;
  const mobileMockup = hasMockups ? displayMockups[mobileIndex] : null;

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Showcase Stage */}
      <motion.div
        className="relative w-full h-full flex items-center justify-center perspective-[2000px]"
        style={{
          rotateX: prefersReducedMotion.current ? 0 : rotateX,
          rotateY: prefersReducedMotion.current ? 0 : rotateY,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        {/* Laptop Frame (Center, main focus) */}
        <motion.div
          className="relative z-30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <DeviceFrame
            type="laptop"
            mockup={currentMockup}
            className="w-[600px] max-w-[90vw] md:w-[700px] lg:w-[800px]"
            animate={!prefersReducedMotion.current}
          />
        </motion.div>

        {/* Tablet Frame (Overlapping left/right) */}
        <motion.div
          className={`absolute z-20 top-1/4 ${isRTL ? 'right-0 md:right-[-50px]' : 'left-0 md:left-[-50px]'} hidden md:block`}
          initial={{ opacity: 0, x: isRTL ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <DeviceFrame
            type="tablet"
            mockup={nextMockup}
            className="w-[280px] lg:w-[320px]"
            animate={!prefersReducedMotion.current}
          />
        </motion.div>

        {/* Phone Frame (Overlapping opposite side) */}
        <motion.div
          className={`absolute z-20 bottom-1/4 ${isRTL ? 'left-0 md:left-[-30px]' : 'right-0 md:right-[-30px]'} hidden md:block`}
          initial={{ opacity: 0, x: isRTL ? -100 : 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <DeviceFrame
            type="mobile"
            mockup={mobileMockup}
            className="w-[160px] lg:w-[180px]"
            animate={!prefersReducedMotion.current}
          />
        </motion.div>

        {/* Floating gradient orbs (decorative) */}
        {!prefersReducedMotion.current && (
          <>
            <motion.div
              className="absolute top-[10%] left-[10%] w-32 h-32 rounded-full bg-primary/20 blur-3xl -z-10"
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-[15%] right-[15%] w-40 h-40 rounded-full bg-cyan-400/20 blur-3xl -z-10"
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}
      </motion.div>

      {/* Progress Dots & Controls */}
      {hasMockups && displayMockups.length > 1 && (
        <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 flex items-center gap-4">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {displayMockups.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-primary'
                    : 'bg-primary/30 hover:bg-primary/50'
                }`}
                aria-label={`Go to mockup ${index + 1}`}
              />
            ))}
          </div>

          {/* Pause/Play Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-primary" />
            ) : (
              <Play className="w-4 h-4 text-primary" />
            )}
          </button>
        </div>
      )}

      {/* Mobile: Show single device below text on mobile */}
      <div className="md:hidden mt-12">
        <DeviceFrame
          type="mobile"
          mockup={currentMockup}
          className="w-[280px] mx-auto"
          animate={false}
        />
        
        {/* Mobile progress dots */}
        {hasMockups && displayMockups.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {displayMockups.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-6 bg-primary'
                    : 'bg-primary/30'
                }`}
                aria-label={`Go to mockup ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MockupsHeroShowcase;
