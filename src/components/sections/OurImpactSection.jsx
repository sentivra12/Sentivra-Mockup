/**
 * OurImpactSection — Round 2: 4-state pattern
 *
 * REQUIREMENTS
 * ────────────────────────────────────────────────────────────────────────────
 * 1. Explicit 4-state handling: loading, error, empty, loaded-with-data
 * 2. Loading: stable skeleton with SAME height (CLS ~0)
 * 3. Error: hide section, console warning
 * 4. Empty: hide section (no fallback stats)
 * 5. Loaded-with-data: render real stats with animated counters
 * 6. No flash on first render
 * ────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState, useRef } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useStats } from '@/hooks/useContent';
import { resolveIcon } from '@/lib/iconResolver';
import { useReducedMotion } from '@/hooks/useMotionPreference';

/* ── Animated counter ───────────────────────────────────────────────────── */
function AnimatedStat({ value, prefix = '', suffix = '', shouldAnimate, delay = 0 }) {
  const [display, setDisplay] = useState(value); // Start with final value, not 0
  const timerRef = useRef(null);

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // If animation not triggered yet or reduced motion preferred, show final value
    if (!shouldAnimate || prefersReducedMotion) {
      setDisplay(value);
      return;
    }

    // Animate from 0 to value
    setDisplay(0); // Reset to 0 when animation starts
    
    const timeout = setTimeout(() => {
      const steps = 60;
      const duration = 1800;
      const inc = value / steps;
      let step = 0;

      timerRef.current = setInterval(() => {
        step++;
        if (step >= steps) {
          setDisplay(value);
          clearInterval(timerRef.current);
        } else {
          setDisplay(Math.floor(inc * step));
        }
      }, duration / steps);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [value, shouldAnimate, delay, prefersReducedMotion]);

  return (
    <div
      className="text-4xl md:text-5xl font-extrabold text-white"
      aria-live="polite"
      aria-atomic="true"
    >
      {prefix}
      {display}
      {suffix}
    </div>
  );
}

/* ── Skeleton ───────────────────────────────────────────────────────────── */
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="relative px-5 py-8 text-center animate-pulse">
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 rounded-full bg-white/10" />
          </div>
          <div className="mb-2 flex justify-center">
            <div className="h-12 w-24 bg-white/10 rounded" />
          </div>
          <div className="flex justify-center">
            <div className="h-4 w-32 bg-white/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function OurImpactSection() {
  const { language } = useTranslation();
  const isRTL = language === 'ar';

  // Use React Query hook instead of direct Supabase
  const {
    data: allStats = [],
    isLoading,
    isError,
    error,
  } = useStats();

  const [sectionSettings, setSectionSettings] = useState(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);

  // Filter stats for home page
  const stats = allStats.filter(
    s => !s.pages || s.pages.length === 0 || s.pages.includes('home')
  );

  // Fetch section settings (page_sections)
  useEffect(() => {
    async function fetchSectionSettings() {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data } = await supabase
          .from('page_sections')
          .select('*')
          .eq('section_key', 'our_impact')
          .eq('page', 'home')
          .eq('enabled', true)
          .single();
        if (data) setSectionSettings(data);
      } catch {
        // non-critical
      }
    }
    fetchSectionSettings();
  }, []);

  // Intersection observer for animation trigger
  useEffect(() => {
    if (!sectionRef.current || hasAnimated) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHasAnimated(true);
      },
      { threshold: 0.2 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  /* ── 4-STATE LOGIC ──────────────────────────────────────────────────────
     1. LOADING: show skeleton
     2. ERROR: hide section, log warning
     3. EMPTY: hide section
     4. LOADED WITH DATA: render stats
  ────────────────────────────────────────────────────────────────────────── */

  // State 2: ERROR
  useEffect(() => {
    if (isError) {
      console.warn('[OurImpactSection] Error loading stats:', error?.message || error);
    }
  }, [isError, error]);

  if (isError) {
    return null;
  }

  // State 1: LOADING
  if (isLoading) {
    return (
      <section
        className="py-20 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(1,18,15,1) 0%, rgba(2,35,30,1) 50%, rgba(4,52,45,1) 100%)',
        }}
        aria-busy="true"
        aria-label="Loading statistics"
      >
        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none brand-grain"
          aria-hidden="true"
        />

        {/* Sparkle glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(13,158,130,0.25) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          aria-hidden="true"
        />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Header skeleton */}
          <div className="text-center mb-14 space-y-3 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-32 mx-auto" />
            <div className="h-10 bg-white/10 rounded w-80 mx-auto" />
            <div className="h-6 bg-white/10 rounded w-96 mx-auto" />
          </div>

          {/* Stats skeleton */}
          <StatsSkeleton />
        </div>
      </section>
    );
  }

  // State 3: EMPTY
  if (stats.length === 0) {
    return null;
  }

  // State 4: LOADED WITH DATA
  return (
    <section
      ref={sectionRef}
      className="py-20 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, rgba(1,18,15,1) 0%, rgba(2,35,30,1) 50%, rgba(4,52,45,1) 100%)',
      }}
      aria-label="Our impact"
    >
      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none brand-grain"
        aria-hidden="true"
      />

      {/* Sparkle glow at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(13,158,130,0.25) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {sectionSettings && (
          <div className="text-center mb-14">
            {sectionSettings.eyebrow && (
              <p
                className="text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: 'rgba(178,240,224,0.80)' }}
              >
                {isRTL
                  ? sectionSettings.eyebrow_ar || sectionSettings.eyebrow
                  : sectionSettings.eyebrow}
              </p>
            )}
            {sectionSettings.title && (
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                {isRTL
                  ? sectionSettings.title_ar || sectionSettings.title
                  : sectionSettings.title}
              </h2>
            )}
            {sectionSettings.subtitle && (
              <p
                className="max-w-2xl mx-auto text-lg"
                style={{ color: 'rgba(178,240,224,0.60)' }}
              >
                {isRTL
                  ? sectionSettings.subtitle_ar || sectionSettings.subtitle
                  : sectionSettings.subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0">
          {stats.map((stat, index) => {
            const IconComponent = resolveIcon(stat.icon);
            const isLast = index === stats.length - 1;

            return (
              <div
                key={stat.id}
                className={`relative px-5 py-8 text-center ${
                  !isLast
                    ? isRTL
                      ? 'after:absolute after:top-1/4 after:bottom-1/4 after:left-0 after:w-px after:bg-white/10'
                      : 'after:absolute after:top-1/4 after:bottom-1/4 after:right-0 after:w-px after:bg-white/10'
                    : ''
                }`}
              >
                {/* Icon glow */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-full blur-xl opacity-70"
                      style={{ background: 'rgba(13,158,130,0.40)' }}
                      aria-hidden="true"
                    />
                    <IconComponent
                      className="w-10 h-10 relative z-10"
                      style={{ color: 'rgba(178,240,224,0.80)' }}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Animated counter */}
                <div className="mb-2">
                  <AnimatedStat
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    shouldAnimate={hasAnimated}
                    delay={index * 100}
                  />
                </div>

                <p
                  className="text-sm font-medium"
                  style={{ color: 'rgba(178,240,224,0.60)' }}
                >
                  {isRTL ? stat.label_ar || stat.label : stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
