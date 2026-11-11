/**
 * Premium Hero Section - Cinematic Dark Hero
 * Features:
 * - Deep slate background with video as visual element
 * - Directional reading scrim for text contrast
 * - Compact glass trust chips
 * - Premium typography optimized for readability
 * - Video with color grading and overlays
 * - Bilingual support (EN/AR) with RTL-aware scrim
 * - Dashboard-controlled video visibility and overlay strength
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslation } from '../../i18n/useTranslation';
import * as LucideIcons from 'lucide-react';

const PremiumHero = ({ hero, trustBadges = [] }) => {
  const { t, language } = useTranslation();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  // Dashboard-controlled settings with defaults
  const showVideo = hero?.show_background_video !== false; // default true
  const overlayStrength = hero?.overlay_strength ?? 80; // 0-100, default 80
  
  // Detect reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Animation variants that respect reduced motion
  const fadeInUp = prefersReducedMotion 
    ? { opacity: 1, y: 0 } // Final state immediately
    : { opacity: 0, y: 20 }; // Animated initial state
  
  const fadeInUpAnimate = { opacity: 1, y: 0 };

  // Video playback with reduced motion and save-data support
  useEffect(() => {
    if (!showVideo || prefersReducedMotion || videoError) return;
    if (!videoRef.current) return;
    
    // Check for save-data
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && connection.saveData) {
      setVideoError(true);
      return;
    }

    const video = videoRef.current;
    video.muted = true;
    
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.warn('[Hero] Video autoplay failed:', error.message);
          setVideoError(false); // Keep trying with manual play button
        });
    }
  }, [showVideo, prefersReducedMotion, videoError]);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.muted = true;
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setVideoError(true));
    }
  };

  const scrollToContent = () => {
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    window.scrollTo({
      top: viewportHeight * 0.85,
      behavior: 'smooth'
    });
  };

  // Icon resolver
  const getIcon = (iconName) => {
    if (!iconName || typeof iconName !== 'string') return LucideIcons.Sparkles;
    const Icon = LucideIcons[iconName];
    return Icon || LucideIcons.Sparkles;
  };

  // Calculate overlay opacity from dashboard strength (0-100 → 0.35-0.50)
  const overlayOpacity = 0.35 + (overlayStrength / 100) * 0.15;

  // Get trust chips (max 3)
  const trustChips = (trustBadges || []).slice(0, 3);

  return (
    <section className="relative min-h-[calc(100svh-80px)] lg:min-h-[clamp(640px,85vh,900px)] flex items-center overflow-hidden bg-hero-deep">
      {/* L0: Video Layer */}
      {showVideo && (hero?.video_url || hero?.video_webm_url || hero?.video_poster_url) && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Video or Poster */}
          {!prefersReducedMotion && (hero?.video_url || hero?.video_webm_url) ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={hero?.video_poster_url}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ 
                objectPosition: language === 'ar' ? '30% center' : '70% center',
                filter: 'brightness(0.88) saturate(0.92)'
              }}
              onError={() => setVideoError(true)}
            >
              {hero?.video_webm_url && <source src={hero.video_webm_url} type="video/webm" />}
              {hero?.video_url && <source src={hero.video_url} type="video/mp4" />}
            </video>
          ) : (
            <img 
              src={hero?.video_poster_url} 
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ 
                objectPosition: language === 'ar' ? '30% center' : '70% center',
                filter: 'brightness(0.88) saturate(0.92)'
              }}
            />
          )}
          
          {/* L1: Deep color grade overlay */}
          <div 
            className="absolute inset-0 bg-hero-grade" 
            style={{ opacity: overlayOpacity }}
          />
          
          {/* L2: Directional reading scrim (text side) */}
          <div 
            className="absolute inset-0"
            style={{
              background: language === 'ar' 
                ? 'linear-gradient(to left, rgba(11, 23, 30, 0.94) 0%, rgba(11, 23, 30, 0.86) 35%, rgba(11, 23, 30, 0.45) 65%, rgba(11, 23, 30, 0.12) 100%)'
                : 'linear-gradient(to right, rgba(11, 23, 30, 0.94) 0%, rgba(11, 23, 30, 0.86) 35%, rgba(11, 23, 30, 0.45) 65%, rgba(11, 23, 30, 0.12) 100%)'
            }}
          />
          
          {/* Mobile vertical scrim */}
          <div 
            className="absolute inset-0 lg:hidden"
            style={{
              background: 'linear-gradient(to bottom, rgba(11, 23, 30, 0.92) 0%, rgba(11, 23, 30, 0.78) 45%, rgba(11, 23, 30, 0.62) 70%, rgba(11, 23, 30, 0.35) 100%)'
            }}
          />
          
          {/* L3: Vignette + cyan glow */}
          <div className="absolute inset-0 bg-hero-vignette" />
          <div 
            className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none`}
            style={{
              background: 'radial-gradient(circle, rgba(111, 211, 216, 0.22) 0%, rgba(111, 211, 216, 0.08) 40%, transparent 70%)',
              filter: 'blur(80px)'
            }}
          />
          
          {/* L4: Grain/noise + dot grid */}
          <div className="absolute inset-0 opacity-[0.045] mix-blend-overlay pointer-events-none hero-grain" />
          <div 
            className="absolute inset-0 opacity-[0.02]" 
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(212, 221, 226, 0.4) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)',
              maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)'
            }}
          />
        </div>
      )}
      
      {/* No-video fallback: deep slate with subtle gradients */}
      {(!showVideo || (!hero?.video_url && !hero?.video_webm_url && !hero?.video_poster_url)) && (
        <div className="absolute inset-0 bg-gradient-to-br from-hero-deep via-[#0F1E26] to-hero-deep">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 start-0 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />
            <div className="absolute bottom-0 end-0 w-[400px] h-[400px] rounded-full bg-hero-accent/25 blur-[100px]" />
          </div>
        </div>
      )}

      
      {/* L5: Content */}
      <div className="relative z-30 w-full py-24 md:py-32 lg:py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Eyebrow pill */}
            <motion.div
              initial={fadeInUp}
              animate={fadeInUpAnimate}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.1 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-hero-pill-bg backdrop-blur-md border border-hero-pill-border text-hero-frost shadow-lg">
                <span className="w-2 h-2 rounded-full bg-hero-accent shadow-[0_0_8px_rgba(111,211,216,0.8)] animate-pulse" />
                {hero?.badge_text || t('hero.badge')}
              </span>
            </motion.div>
            
            {/* Headline */}
            <motion.h1
              initial={fadeInUp}
              animate={fadeInUpAnimate}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.7, delay: 0.2 }}
              className={`text-hero-headline font-bold leading-[1.05] tracking-tight mb-6 ${language === 'ar' ? 'leading-[1.4]' : ''}`}
              style={{ 
                fontFamily: 'Space Grotesk, system-ui, sans-serif',
                fontSize: 'clamp(40px, 6vw, 76px)',
                maxWidth: '100%',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {hero?.headline || t('hero.defaultHeadline')}
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p
              initial={fadeInUp}
              animate={fadeInUpAnimate}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.7, delay: 0.35 }}
              className="text-hero-frost text-lg md:text-xl leading-relaxed mb-10 max-w-[56ch]"
              style={{
                lineHeight: 1.6,
                textShadow: '0 2px 24px rgba(0,0,0,0.35)'
              }}
            >
              {hero?.subheadline || t('hero.defaultSubheadline')}
            </motion.p>
            
            {/* CTAs */}
            <motion.div
              initial={fadeInUp}
              animate={fadeInUpAnimate}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.7, delay: 0.5 }}
              className={`flex flex-col sm:flex-row gap-4 mb-8 ${language === 'ar' ? 'sm:flex-row-reverse' : ''}`}
            >
              <Button 
                size="lg" 
                className="min-h-[48px] bg-white hover:bg-hero-frost text-hero-deep font-semibold shadow-xl hover:shadow-2xl hover:shadow-hero-accent/20 transition-all duration-300 group px-6"
                asChild
              >
                <a href={hero?.cta_primary_link || '/#contact'}>
                  <span className="flex items-center gap-2">
                    {hero?.cta_primary_text || t('hero.ctaPrimary')}
                    <motion.span
                      animate={{ 
                        x: language === 'ar' ? [-2, -6, -2] : [2, 6, 2] 
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className={language === 'ar' ? 'rotate-180' : ''}
                    >
                      →
                    </motion.span>
                  </span>
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="min-h-[48px] bg-hero-pill-bg hover:bg-hero-pill-bg/80 backdrop-blur-md border border-hero-pill-border text-white hover:text-hero-frost transition-all duration-300 px-6"
                asChild
              >
                <a href={hero?.cta_secondary_link || '/#services'}>
                  {hero?.cta_secondary_text || t('hero.ctaSecondary')}
                </a>
              </Button>
            </motion.div>
            
            {/* Trust chips (slim inline) */}
            {trustChips.length > 0 && (
              <motion.div
                initial={fadeInUp}
                animate={fadeInUpAnimate}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.7, delay: 0.65 }}
                className="flex flex-wrap gap-3"
              >
                {trustChips.map((chip, index) => {
                  const ChipIcon = getIcon(chip.icon);
                  return (
                    <div
                      key={chip.id}
                      className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-hero-chip-bg backdrop-blur-md border border-hero-chip-border text-hero-frost text-sm group hover:border-hero-accent/30 transition-all duration-300"
                    >
                      <ChipIcon className="w-4 h-4 text-hero-accent flex-shrink-0" />
                      <span className="font-semibold whitespace-nowrap">{chip.title}</span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Video control button (bottom corner) */}
      {showVideo && !prefersReducedMotion && !videoError && (hero?.video_url || hero?.video_webm_url) && (
        <button
          onClick={toggleVideo}
          className="absolute bottom-6 end-6 z-40 w-11 h-11 rounded-full bg-hero-pill-bg hover:bg-hero-pill-bg/80 backdrop-blur-md border border-hero-pill-border flex items-center justify-center transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hero-accent focus-visible:ring-offset-2 focus-visible:ring-offset-hero-deep"
          aria-label={isPlaying ? t('hero.pauseVideo') : t('hero.playVideo')}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-hero-frost" />
          ) : (
            <Play className={`w-4 h-4 text-hero-frost ${language === 'ar' ? '' : 'ms-0.5'}`} />
          )}
        </button>
      )}
      
      {/* Scroll indicator */}
      {!prefersReducedMotion && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          onClick={scrollToContent}
          className="hidden lg:flex absolute bottom-8 start-1/2 -translate-x-1/2 z-40 flex-col items-center gap-2 text-hero-frost/70 hover:text-hero-frost transition-colors duration-300 group"
          aria-label={t('hero.scrollDown')}
        >
          <span className="text-xs font-medium uppercase tracking-wider">
            {t('hero.scrollDown')}
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-9 rounded-full border-2 border-current flex items-start justify-center pt-1.5"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-1 rounded-full bg-current"
            />
          </motion.div>
        </motion.button>
      )}
      
      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
    </section>
  );
};

export default PremiumHero;
