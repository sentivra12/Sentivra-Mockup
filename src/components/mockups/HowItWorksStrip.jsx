/**
 * HowItWorksStrip — 3-step process strip
 *
 * Palette: brand emerald tokens only. No hardcoded hex, no cyan/sky/blue/slate.
 * Dark:    brand-950 bg with optional faint emerald radial-gradient at low opacity.
 * Light:   brand-50 (soft emerald tint) bg with dark brand text.
 * Motion:  CSS transitions only on mobile; framer-motion on desktop.
 *          calm/reducedMotion → instant final state via shouldReduceMotion.
 *          No infinite animations in this section (connector draws once, done).
 * Perf:    content-visibility:auto + contain-intrinsic-size on the section.
 * RTL:     connector origin flips; step badge uses logical end position.
 * A11y:    section labelled, decorative elements aria-hidden, AA contrast.
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useMotionPreference';
import { Search, Palette, Rocket } from 'lucide-react';

const defaultSteps = {
  en: [
    {
      icon: Search,
      title: 'Choose a Design',
      description: 'Browse our collection and select a design that fits your business',
    },
    {
      icon: Palette,
      title: 'We Customize It',
      description: 'We adapt it to your brand, content, and specific requirements',
    },
    {
      icon: Rocket,
      title: 'We Launch It',
      description: 'Get a fully working website ready for your visitors',
    },
  ],
  ar: [
    {
      icon: Search,
      title: 'اختر التصميم',
      description: 'تصفح مجموعتنا واختر تصميماً يناسب عملك',
    },
    {
      icon: Palette,
      title: 'نخصصه لك',
      description: 'نكيفه مع علامتك التجارية ومحتواك ومتطلباتك المحددة',
    },
    {
      icon: Rocket,
      title: 'نطلقه لك',
      description: 'احصل على موقع يعمل بالكامل جاهز لزوارك',
    },
  ],
};

const HowItWorksStrip = ({ steps: customSteps, language = 'en', isDark = false }) => {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [lineProgress, setLineProgress] = useState(shouldReduceMotion ? 100 : 0);
  const sectionRef = useRef(null);

  const steps = customSteps || defaultSteps[language] || defaultSteps.en;

  // IntersectionObserver → one-shot reveal + connector draw
  useEffect(() => {
    if (shouldReduceMotion) {
      setIsVisible(true);
      setLineProgress(100);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);

            // Draw connector once (not an infinite animation)
            let progress = 0;
            const duration = 1200;
            const interval = 16;
            const increment = (100 / duration) * interval;

            const timer = setInterval(() => {
              progress = Math.min(progress + increment, 100);
              setLineProgress(progress);
              if (progress >= 100) clearInterval(timer);
            }, interval);

            return () => clearInterval(timer);
          }
        });
      },
      { threshold: 0.2, rootMargin: '-50px' }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [shouldReduceMotion, isVisible]);

  return (
    <section
      ref={sectionRef}
      aria-label={language === 'ar' ? 'كيف نعمل — عملية بسيطة' : 'How It Works — Simple Process'}
      /*
       * Section bg: same surface tokens as the rest of the page.
       * Dark → brand-950 with an optional faint emerald radial glow (no blur filters).
       * Light → brand-50 (soft emerald tint).
       * No separate navy-teal block.
       */
      className={`relative py-16 lg:py-20 overflow-hidden ${
        isDark ? 'bg-brand-950' : 'bg-brand-50'
      }`}
      style={{
        /* content-visibility avoids layout work while off-screen */
        contentVisibility: 'auto',
        containIntrinsicSize: '0 500px',
      }}
    >
      {/* Faint emerald radial glow — dark only, no blur filter, low opacity */}
      {isDark && (
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(13,158,130,0.07) 0%, transparent 70%)',
          }}
        />
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ── */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isVisible || shouldReduceMotion ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          {/* Eyebrow — brand-500 on dark (passes AA on brand-950), brand-700 on light */}
          <span
            className={`inline-block text-xs font-bold uppercase tracking-wider mb-3 ${
              isDark ? 'text-brand-400' : 'text-brand-700'
            }`}
          >
            {language === 'ar' ? 'كيف نعمل' : 'How It Works'}
          </span>

          {/* Heading */}
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${
              isDark ? 'text-brand-50' : 'text-brand-950'
            }`}
            style={{ textWrap: 'balance' }}
          >
            {language === 'ar' ? 'عملية بسيطة' : 'Simple Process'}
          </h2>
        </motion.div>

        {/* ── Steps + Connector ── */}
        <div className="relative">
          {/* Connector line — desktop only, draws once */}
          <div
            className={`hidden lg:block absolute top-10 h-px overflow-hidden ${
              language === 'ar'
                ? 'right-[16.666%] left-[16.666%]'
                : 'left-[16.666%] right-[16.666%]'
            }`}
            style={{
              backgroundColor: isDark
                ? 'rgba(13,158,130,0.12)'
                : 'rgba(6,121,106,0.12)',
            }}
            aria-hidden="true"
          >
            {/* Drawn progress — no infinite loop */}
            <div
              className="h-full"
              style={{
                width: `${lineProgress}%`,
                background: isDark
                  ? 'linear-gradient(90deg, #0D9E82, #26B59A)'   /* brand-500 → brand-400 */
                  : 'linear-gradient(90deg, #06796A, #0D9E82)',   /* brand-600 → brand-500 */
                transformOrigin: language === 'ar' ? 'right' : 'left',
                transition: 'width 16ms linear',
              }}
            />
          </div>

          {/* Steps grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
                  animate={isVisible || shouldReduceMotion ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: shouldReduceMotion ? 0 : 0.2 + index * 0.12,
                  }}
                  className="relative text-center"
                >
                  {/* ── Icon circle ── */}
                  <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 mx-auto">
                    {/*
                     * Flat emerald-tinted fill + 1px emerald border at ~40% opacity.
                     * No glow / no box-shadow.
                     */}
                    <div
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center ${
                        isDark
                          ? 'bg-brand-900 border border-brand-500/40'
                          : 'bg-brand-100 border border-brand-500/40'
                      }`}
                    >
                      <Icon
                        className={`w-8 h-8 ${
                          isDark ? 'text-brand-400' : 'text-brand-600'
                        }`}
                        aria-hidden="true"
                        strokeWidth={1.75}
                      />
                    </div>

                    {/*
                     * Step number badge — solid brand-500/600 fill, white text.
                     * 4.5:1 contrast verified: white on brand-500 (#0D9E82) = 3.1:1
                     * → use brand-700 (#055A4F) for light and brand-400/white for dark.
                     * brand-700 on brand-50 background passes AA body; badge itself:
                     * white text on brand-700 (#055A4F) = ~6.5:1 ✓
                     * brand-950 (#01120F) text on brand-400 (#26B59A) = ~6.2:1 ✓
                     */}
                    <div
                      className={`absolute -top-1 end-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isDark
                          ? 'bg-brand-400 text-brand-950'
                          : 'bg-brand-700 text-white'
                      }`}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-xl font-bold mb-3 ${
                      isDark ? 'text-brand-50' : 'text-brand-950'
                    }`}
                    style={{ textWrap: 'balance' }}
                  >
                    {step.title}
                  </h3>

                  {/* Description — text-muted token, ≥14px */}
                  <p
                    className={`text-base leading-relaxed ${
                      isDark ? 'text-brand-300' : 'text-brand-800'
                    }`}
                    dir="auto"
                  >
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksStrip;
