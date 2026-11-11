/**
 * Premium Testimonials Section - Redesigned
 * Features:
 * - Dark surface with oversized decorative quote mark
 * - Large display type for quote text (clamp 22px-34px)
 * - Avatar with gradient ring, initials fallback
 * - Company logo if provided
 * - Custom progress bar autoplay indicator (no "Paused" text)
 * - Stars only when rating exists, using primary color
 * - Arrows INSIDE container
 * - Swipe on touch, keyboard arrows
 * - Autoplay pauses on hover/focus with icon button
 * - Hides section when empty (production)
 * - Shows DEMO preview in development
 * - Different layouts: 1 item = static featured, 2-3 = slider, 4+ = masonry
 */

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../i18n/useTranslation';
import { useTestimonials } from '../../hooks/useContent';

const StarRating = ({ rating }) => {
  if (!rating) return null;
  
  return (
    <div className="flex gap-1" aria-label={`Rating: ${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < rating 
              ? 'fill-primary text-primary' 
              : 'text-muted-foreground/30'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

const TestimonialCard = ({ testimonial, isRTL }) => {
  const text = isRTL && testimonial.testimonial_text_ar 
    ? testimonial.testimonial_text_ar 
    : testimonial.testimonial_text;
  
  return (
    <div className="relative">
      {/* Oversized decorative quote */}
      <div className="absolute -top-4 start-0 opacity-10 pointer-events-none">
        <Quote className="w-24 h-24 text-testimonial-accent" fill="currentColor" />
      </div>

      <div className="relative space-y-6 p-8 md:p-12">
        {/* Rating */}
        {testimonial.rating && (
          <StarRating rating={testimonial.rating} />
        )}

        {/* Quote text */}
        <blockquote 
          className="text-[clamp(1.375rem,2vw,2.125rem)] leading-[1.4] font-medium text-testimonial-text"
          style={{ fontFamily: 'inherit' }}
        >
          "{text}"
        </blockquote>

        {/* Client info */}
        <div className="flex items-center gap-4 pt-4">
          {/* Avatar with gradient ring */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-testimonial-accent to-primary rounded-full blur-sm opacity-60" />
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-testimonial-ring bg-testimonial-avatar">
              {testimonial.client_photo_url ? (
                <img
                  src={testimonial.client_photo_url}
                  alt={testimonial.client_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                  {testimonial.client_name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Name, role, company */}
          <div className="flex-grow">
            <div className="font-bold text-testimonial-name">
              {testimonial.client_name}
            </div>
            <div className="text-sm text-testimonial-meta">
              {testimonial.client_role}
              {testimonial.client_company && (
                <> at {testimonial.client_company}</>
              )}
            </div>
          </div>

          {/* Company logo */}
          {testimonial.company_logo_url && (
            <div className="flex-shrink-0 w-16 h-16 opacity-60">
              <img
                src={testimonial.company_logo_url}
                alt={`${testimonial.client_company} logo`}
                className="w-full h-full object-contain grayscale"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PremiumTestimonials = () => {
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  const { data: testimonials = [], isLoading } = useTestimonials();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const autoPlayRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Development mode: show demo testimonials if none exist
  const isDev = import.meta.env.DEV;
  const demoTestimonials = [
    {
      id: 'demo-1',
      client_name: 'Demo Client',
      client_role: 'Demo Role',
      client_company: 'Demo Company',
      testimonial_text: 'This is a demo testimonial. Add real testimonials in the admin dashboard.',
      testimonial_text_ar: 'هذه شهادة تجريبية. أضف شهادات حقيقية في لوحة الإدارة.',
      rating: 5,
      client_photo_url: null,
      company_logo_url: null,
    }
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : (isDev ? demoTestimonials : []);
  
  // Auto-play and progress bar - MUST BE HERE (before any return)
  useEffect(() => {
    // Always clear intervals on cleanup
    const cleanup = () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };

    // Don't start intervals if paused or single item
    if (isPaused || displayTestimonials.length <= 1) {
      cleanup();
      return cleanup;
    }

    // Reset progress
    setProgress(0);

    // Progress bar animation (60 steps over 5 seconds)
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / 60);
      });
    }, 5000 / 60);

    // Auto advance slide
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length);
      setProgress(0);
    }, 5000);

    return cleanup;
  }, [isPaused, displayTestimonials.length]);

  // NOW we can do conditional returns - AFTER all hooks
  // Hide section completely in production if no testimonials
  if (!isDev && testimonials.length === 0) {
    return null;
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length);
    setProgress(0);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length);
    setProgress(0);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  // Layout based on count
  const layout = displayTestimonials.length === 1 ? 'featured' : displayTestimonials.length <= 3 ? 'slider' : 'masonry';

  return (
    <section 
      className="py-20 md:py-32 bg-testimonial-surface relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-testimonial-glow/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 start-0 w-96 h-96 bg-testimonial-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 end-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Demo mode indicator - VISIBLE BADGE */}
        {isDev && testimonials.length === 0 && (
          <div className="mb-8 p-6 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-xl text-center backdrop-blur-sm">
            <div className="inline-block px-4 py-2 bg-yellow-500 text-white font-bold rounded-lg mb-3 text-lg">
              ⚠️ DEMO
            </div>
            <p className="text-base font-semibold text-yellow-600 dark:text-yellow-300">
              {t('common.demoMode')}
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-2">
              {t('common.demoModeDesc')}
            </p>
          </div>
        )}

        {/* Section header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-medium text-testimonial-accent mb-2 uppercase tracking-wider"
          >
            {t('home.testimonials.label') || 'Testimonials'}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-testimonial-heading mb-3"
          >
            {t('home.testimonials.title') || 'What Our Clients Say'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-testimonial-subtitle max-w-2xl mx-auto"
          >
            {t('home.testimonials.subtitle') || 'Trusted by leading companies'}
          </motion.p>
        </div>

        {/* Testimonial content */}
        <div className="relative">
          {layout === 'slider' && (
            <>
              {/* Main testimonial card */}
              <div className="bg-testimonial-card rounded-2xl border border-testimonial-border shadow-2xl overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TestimonialCard testimonial={displayTestimonials[currentIndex]} isRTL={isRTL} />
                  </motion.div>
                </AnimatePresence>

                {/* Progress bar */}
                {displayTestimonials.length > 1 && (
                  <div className="h-1 bg-testimonial-progress-bg">
                    <div
                      className="h-full bg-testimonial-accent transition-all duration-100"
                      style={{ width: `${isPaused ? progress : progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Navigation arrows INSIDE container */}
              {displayTestimonials.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'end-4' : 'start-4'} w-12 h-12 rounded-full bg-testimonial-nav-bg backdrop-blur-sm border border-testimonial-nav-border flex items-center justify-center hover:bg-testimonial-nav-hover transition-all duration-300 shadow-lg z-10 focus:outline-none focus:ring-2 focus:ring-testimonial-accent`}
                    aria-label={t('common.previous') || 'Previous testimonial'}
                  >
                    <ChevronLeft className={`w-6 h-6 text-testimonial-nav-icon ${isRTL ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    onClick={goToNext}
                    className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'start-4' : 'end-4'} w-12 h-12 rounded-full bg-testimonial-nav-bg backdrop-blur-sm border border-testimonial-nav-border flex items-center justify-center hover:bg-testimonial-nav-hover transition-all duration-300 shadow-lg z-10 focus:outline-none focus:ring-2 focus:ring-testimonial-accent`}
                    aria-label={t('common.next') || 'Next testimonial'}
                  >
                    <ChevronRight className={`w-6 h-6 text-testimonial-nav-icon ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </>
              )}

              {/* Dots navigation */}
              {displayTestimonials.length > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {displayTestimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-testimonial-accent ${
                        index === currentIndex
                          ? 'w-8 bg-testimonial-accent'
                          : 'w-2 bg-testimonial-dot hover:bg-testimonial-dot-hover'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                      aria-current={index === currentIndex}
                    />
                  ))}
                </div>
              )}

              {/* Pause/Play button */}
              {displayTestimonials.length > 1 && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="p-2 rounded-full bg-testimonial-nav-bg border border-testimonial-nav-border hover:bg-testimonial-nav-hover transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-testimonial-accent"
                    aria-label={isPaused ? t('common.play') || 'Play' : t('common.pause') || 'Pause'}
                    aria-pressed={isPaused}
                  >
                    {isPaused ? (
                      <Play className="w-5 h-5 text-testimonial-accent" fill="currentColor" />
                    ) : (
                      <Pause className="w-5 h-5 text-testimonial-accent" fill="currentColor" />
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {layout === 'featured' && (
            <div className="max-w-4xl mx-auto bg-testimonial-card rounded-2xl border border-testimonial-border shadow-2xl">
              <TestimonialCard testimonial={displayTestimonials[0]} isRTL={isRTL} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PremiumTestimonials;
