/**
 * PremiumTestimonials — Round 2: 4-state pattern, no DEMO flash
 *
 * REQUIREMENTS
 * ────────────────────────────────────────────────────────────────────────────
 * 1. Explicit 4-state handling: loading, error, empty, loaded-with-data
 * 2. Loading: stable skeleton with SAME height as final section (CLS ~0)
 * 3. Error or 404: hide section entirely, one console warning, no retries
 * 4. Empty: hide section entirely (no demo, no banner)
 * 5. Loaded-with-data: render real published testimonials only
 * 6. Demo content + banner: NEVER in production (import.meta.env.PROD)
 * 7. Demo content in DEV: only AFTER loading finished AND table is empty
 * 8. React Query cache: use staleTime + keepPreviousData to avoid flash on repeat visits
 * 9. AA contrast: subtitle 4.5:1 on dark surface
 * 10. Quote mark: inside card padding, aria-hidden
 * 11. Curved divider: fill matches next section bg exactly (no white strip/seam)
 * 12. No layout jump after first paint
 * ────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useMotionPreference';
import { useTranslation } from '@/i18n/useTranslation';
import { useTestimonials } from '@/hooks/useContent';

/* ── Star rating ─────────────────────────────────────────────────────────── */
const StarRating = ({ rating }) => {
  if (!rating) return null;
  return (
    <div className="flex gap-1" aria-label={`Rating: ${rating} out of 5`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < rating ? 'fill-brand-400 text-brand-400' : 'text-brand-800'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

/* ── Testimonial card ───────────────────────────────────────────────────── */
const TestimonialCard = ({ testimonial, isRTL }) => {
  const text = isRTL && testimonial.testimonial_text_ar
    ? testimonial.testimonial_text_ar
    : testimonial.testimonial_text;

  return (
    <div className="relative">
      {/* Quote mark — INSIDE card padding, top-left, aria-hidden */}
      <div className="absolute top-6 start-6 opacity-10 pointer-events-none" aria-hidden="true">
        <Quote className="w-16 h-16 text-brand-400" fill="currentColor" />
      </div>

      <div className="relative space-y-6 p-8 md:p-10">
        {testimonial.rating && <StarRating rating={testimonial.rating} />}

        <blockquote
          className="text-[clamp(1.125rem,1.8vw,1.75rem)] leading-[1.5] font-semibold"
          style={{ color: 'var(--color-text)' }}
          dir="auto"
        >
          "{text}"
        </blockquote>

        <div className="flex items-center gap-4 pt-3">
          {/* Avatar with brand gradient ring */}
          <div className="relative flex-shrink-0">
            <div
              className="absolute inset-0 rounded-full blur-sm opacity-70"
              style={{ background: 'linear-gradient(135deg, rgba(13,158,130,0.60), rgba(4,77,64,0.80))' }}
              aria-hidden="true"
            />
            <div
              className="relative w-14 h-14 rounded-full overflow-hidden border-2 bg-color-surface"
              style={{ borderColor: 'rgba(13,158,130,0.40)' }}
            >
              {testimonial.client_photo_url ? (
                <img
                  src={testimonial.client_photo_url}
                  alt={testimonial.client_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-brand-600 dark:text-brand-300 font-bold text-xl"
                  style={{ background: 'rgba(13,158,130,0.15)' }}
                >
                  {testimonial.client_name?.charAt(0) || '?'}
                </div>
              )}
            </div>
          </div>

          <div className="flex-grow">
            <div className="font-bold text-color-text">{testimonial.client_name}</div>
            <div className="text-sm text-color-text-muted">
              {testimonial.client_role}
              {testimonial.client_company && <> at {testimonial.client_company}</>}
            </div>
          </div>

          {testimonial.company_logo_url && (
            <div className="flex-shrink-0 w-14 h-14 opacity-50">
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

/* ── Skeleton (loading state) ───────────────────────────────────────────── */
const TestimonialSkeleton = () => (
  <div
    className="rounded-2xl border overflow-hidden"
    style={{
      background: 'var(--color-surface)',
      borderColor: 'var(--color-border)',
      minHeight: 400, // reserve height to prevent CLS
    }}
  >
    <div className="p-8 md:p-10 space-y-6 animate-pulse">
      {/* Stars skeleton */}
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-5 h-5 rounded bg-color-border" />
        ))}
      </div>

      {/* Quote skeleton */}
      <div className="space-y-3">
        <div className="h-7 bg-color-border rounded w-full" />
        <div className="h-7 bg-color-border rounded w-11/12" />
        <div className="h-7 bg-color-border rounded w-10/12" />
      </div>

      {/* Avatar + name skeleton */}
      <div className="flex items-center gap-4 pt-3">
        <div className="w-14 h-14 rounded-full bg-color-border" />
        <div className="flex-grow space-y-2">
          <div className="h-5 bg-color-border rounded w-32" />
          <div className="h-4 bg-color-border rounded w-40" />
        </div>
      </div>
    </div>
  </div>
);

/* ── Main component ─────────────────────────────────────────────────────── */
const PremiumTestimonials = () => {
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  const shouldReduceMotion = useReducedMotion();

  // React Query with staleTime to cache data for 5 minutes
  const {
    data: testimonials = [],
    isLoading,
    isError,
    error,
  } = useTestimonials();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const autoRef = useRef(null);
  const progressRef = useRef(null);

  const isProd = import.meta.env.PROD;

  // No demo/fallback data - if testimonials are empty, section will be hidden (state 3)

  /* ── ALL EFFECTS BEFORE ANY CONDITIONAL RETURNS ─────────────────────────── */

  // State 2: ERROR — log once
  useEffect(() => {
    if (isError) {
      const is404 = error?.message?.includes('PGRST') || error?.message?.includes('404');
      console.warn(
        `[PremiumTestimonials] ${is404 ? 'Table not found (404)' : 'Error loading testimonials'}:`,
        error?.message || error
      );
    }
  }, [isError, error]);

  // Auto-play effect
  useEffect(() => {
    const cleanup = () => {
      if (autoRef.current) clearInterval(autoRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
    if (isPaused || testimonials.length <= 1 || shouldReduceMotion || isLoading || isError) {
      cleanup();
      return cleanup;
    }

    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress(p => (p >= 100 ? 0 : p + 100 / 60));
    }, 5000 / 60);
    autoRef.current = setInterval(() => {
      setCurrentIndex(i => (i + 1) % testimonials.length);
      setProgress(0);
    }, 5000);
    return cleanup;
  }, [isPaused, testimonials.length, shouldReduceMotion, isLoading, isError]);

  /* ── CONDITIONAL RETURNS (AFTER ALL HOOKS) ─────────────────────────────── */

  // State 2: ERROR
  if (isError) {
    return null;
  }

  // State 1: LOADING — show skeleton
  if (isLoading) {
    return (
      <section
        className="py-20 md:py-28 relative overflow-hidden"
        style={{ background: 'var(--color-surface-raised)' }}
        aria-busy="true"
        aria-label="Loading testimonials"
      >
        {/* Background glows */}
        <div
          className="absolute top-1/4 start-0 w-80 h-80 rounded-full blur-[120px] pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(13,158,130,0.40) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-1/4 end-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(13,158,130,0.30) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section header skeleton */}
          <div className="text-center mb-14 space-y-3 animate-pulse">
            <div className="h-4 bg-color-border rounded w-24 mx-auto" />
            <div className="h-10 bg-color-border rounded w-80 mx-auto" />
            <div className="h-6 bg-color-border rounded w-96 mx-auto" />
          </div>

          {/* Testimonial skeleton */}
          <TestimonialSkeleton />
        </div>
      </section>
    );
  }

  // State 3: EMPTY
  if (testimonials.length === 0) return null;

  const count = testimonials.length;
  const layout = count === 1 ? 'featured' : 'slider';

  const goTo = (i) => {
    setCurrentIndex(i);
    setProgress(0);
  };
  const goNext = () => goTo((currentIndex + 1) % testimonials.length);
  const goPrev = () => goTo((currentIndex - 1 + testimonials.length) % testimonials.length);

  return (
    <section
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ background: 'var(--color-surface-raised)' }}
      onMouseEnter={() => !shouldReduceMotion && setIsPaused(true)}
      onMouseLeave={() => !shouldReduceMotion && setIsPaused(false)}
      aria-label="Testimonials"
    >
      {/* Curved top divider — fill matches this section's bg exactly */}
      <div
        className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
        style={{ transform: 'translateY(-99%)' }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0 48h1440V0C1440 0 1080 48 720 48S0 0 0 0v48z"
            fill="var(--color-surface-raised)"
          />
        </svg>
      </div>

      {/* Background glows */}
      <div
        className="absolute top-1/4 start-0 w-80 h-80 rounded-full blur-[120px] pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(13,158,130,0.40) 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 end-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(circle, rgba(13,158,130,0.30) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section header */}
        <div className="text-center mb-14">
          <motion.p
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? {} : { duration: 0.5 }}
            className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3"
          >
            {t('home.testimonials.label') || (language === 'ar' ? 'الشهادات' : 'Testimonials')}
          </motion.p>
          <motion.h2
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? {} : { delay: 0.08, duration: 0.5 }}
            className="text-3xl md:text-4xl font-extrabold text-color-text mb-3"
          >
            {t('home.testimonials.title') || (language === 'ar' ? 'ماذا يقول عملاؤنا' : 'What Our Clients Say')}
          </motion.h2>
          <motion.p
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? {} : { delay: 0.16, duration: 0.5 }}
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'rgba(var(--color-text-muted-rgb), 0.85)' }} // AA contrast fix: 85% opacity
          >
            {t('home.testimonials.subtitle') ||
              (language === 'ar'
                ? 'ملاحظات حقيقية من الشركات التي ساعدناها على النمو'
                : 'Real feedback from businesses we\'ve helped grow')}
          </motion.p>
        </div>

        {/* Content */}
        <div className="relative">
          {layout === 'slider' && (
            <>
              <div
                className="rounded-2xl border overflow-hidden"
                style={{
                  background: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={shouldReduceMotion ? {} : { opacity: 0, x: isRTL ? -18 : 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={shouldReduceMotion ? {} : { opacity: 0, x: isRTL ? 18 : -18 }}
                    transition={{ duration: 0.28 }}
                  >
                    <TestimonialCard testimonial={testimonials[currentIndex]} isRTL={isRTL} />
                  </motion.div>
                </AnimatePresence>

                {/* Progress bar */}
                {testimonials.length > 1 && !shouldReduceMotion && (
                  <div className="h-0.5" style={{ background: 'var(--color-border)' }}>
                    <div
                      className="h-full transition-all duration-100"
                      style={{ width: `${progress}%`, background: 'rgba(13,158,130,0.80)' }}
                    />
                  </div>
                )}
              </div>

              {/* Prev / Next */}
              {testimonials.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'end-4' : 'start-4'} w-11 h-11 rounded-full backdrop-blur-sm flex items-center justify-center shadow-lg z-10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500`}
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                    }}
                    aria-label={t('common.previous') || (language === 'ar' ? 'السابق' : 'Previous')}
                  >
                    <ChevronLeft
                      className={`w-5 h-5 text-color-text ${isRTL ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <button
                    onClick={goNext}
                    className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'start-4' : 'end-4'} w-11 h-11 rounded-full backdrop-blur-sm flex items-center justify-center shadow-lg z-10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500`}
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                    }}
                    aria-label={t('common.next') || (language === 'ar' ? 'التالي' : 'Next')}
                  >
                    <ChevronRight
                      className={`w-5 h-5 text-color-text ${isRTL ? 'rotate-180' : ''}`}
                    />
                  </button>
                </>
              )}

              {/* Dots */}
              {testimonials.length > 1 && (
                <div className="flex justify-center gap-2 mt-7">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                        i === currentIndex ? 'w-8' : 'w-2'
                      }`}
                      style={{
                        background:
                          i === currentIndex
                            ? 'rgba(13,158,130,0.80)'
                            : 'var(--color-border)',
                      }}
                      aria-label={`Go to testimonial ${i + 1}`}
                      aria-current={i === currentIndex}
                    />
                  ))}
                </div>
              )}

              {/* Pause/Play */}
              {testimonials.length > 1 && !shouldReduceMotion && (
                <div className="flex justify-center mt-5">
                  <button
                    onClick={() => setIsPaused(p => !p)}
                    className="p-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                    }}
                    aria-label={
                      isPaused
                        ? t('common.play') || (language === 'ar' ? 'تشغيل' : 'Play')
                        : t('common.pause') || (language === 'ar' ? 'إيقاف' : 'Pause')
                    }
                    aria-pressed={isPaused}
                  >
                    {isPaused ? (
                      <Play className="w-4 h-4 text-brand-600 dark:text-brand-400" fill="currentColor" />
                    ) : (
                      <Pause className="w-4 h-4 text-brand-600 dark:text-brand-400" fill="currentColor" />
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {layout === 'featured' && (
            <div
              className="max-w-4xl mx-auto rounded-2xl border"
              style={{
                background: 'var(--color-background)',
                borderColor: 'var(--color-border)',
              }}
            >
              <TestimonialCard testimonial={testimonials[0]} isRTL={isRTL} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PremiumTestimonials;
