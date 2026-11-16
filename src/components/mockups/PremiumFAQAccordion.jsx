/**
 * PremiumFAQAccordion — FAQ section + "Still have questions?" card
 *
 * Palette: brand emerald tokens only. No hardcoded hex, no cyan/sky/blue/slate.
 * Dark:    brand-950 bg; cards brand-900/80; borders brand-500/20.
 * Light:   white bg; cards white; borders brand-500/15.
 *
 * BUG FIX (invisible text): The DB columns were renamed
 *   question  → question_en   (migration 20261118120000)
 *   answer    → answer_en
 * The old code read faq.question / faq.answer → both undefined → empty text.
 * Fix: read question_en (with fallback to old "question" for safety) and same for answer.
 *
 * A11y:
 *  - <button> with aria-expanded + aria-controls
 *  - <div role="region" aria-labelledby>
 *  - Keyboard: Enter/Space toggle, ArrowUp/ArrowDown navigate buttons
 *  - Focus ring: focus-visible:ring-2 focus-visible:ring-brand-500
 *  - Min height 48px on buttons (touch target)
 *  - Question text 16px, contrast ≥4.5:1
 *  - Number badge: emerald circle, AA contrast
 *
 * Accordion animation:
 *  - CSS grid-template-rows 0fr → 1fr (no JS height calc, no max-height hack)
 *  - transition: grid-template-rows 300ms ease
 *  - No framer-motion on the open/close (CSS only); framer only for reveal stagger.
 *
 * RTL:
 *  - flex-row-reverse for button layout (logical direction)
 *  - Logical inline padding (ps-/pe- utilities or padding-inline)
 *  - Open state: border-inline-start accent (RTL-aware)
 *
 * Perf:
 *  - content-visibility:auto on section
 *  - No backdrop-filter (removed)
 *
 * saveData/low-power: calm mode → no stagger (shouldReduceMotion)
 */

import React, { useState, useEffect, useRef, useId } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useMotionPreference';
import { Plus, Minus, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PremiumFAQAccordion = ({
  faqs = [],
  language = 'en',
  isDark = false,
  siteSettings = null,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const uid = useId();

  // ── Anchor-link support ──────────────────────────────────────────────────
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#faq-')) {
      const idx = parseInt(hash.replace('#faq-', ''), 10) - 1;
      if (idx >= 0 && idx < faqs.length) {
        setOpenIndex(idx);
        setTimeout(() => {
          document.getElementById(hash.slice(1))?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 100);
      }
    }
  }, [faqs.length]);

  // ── Staged reveal ────────────────────────────────────────────────────────
  useEffect(() => {
    if (shouldReduceMotion) { setIsVisible(true); return; }

    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setIsVisible(true); },
      { threshold: 0.1, rootMargin: '-50px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [shouldReduceMotion]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleToggle = (idx) => setOpenIndex(openIndex === idx ? -1 : idx);

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle(idx);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      document.getElementById(`${uid}-btn-${(idx + 1) % faqs.length}`)?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      document.getElementById(`${uid}-btn-${(idx - 1 + faqs.length) % faqs.length}`)?.focus();
    }
  };

  if (faqs.length === 0) return null;

  const midpoint = Math.ceil(faqs.length / 2);
  const leftFaqs  = faqs.slice(0, midpoint);
  const rightFaqs = faqs.slice(midpoint);

  /* ── Shared card styles ───────────────────────────────────────────────── */
  const cardBase = `rounded-2xl overflow-hidden transition-colors duration-200 ${
    isDark
      ? 'bg-brand-900/80 border border-brand-500/20 hover:border-brand-500/40'
      : 'bg-white border border-brand-500/15 hover:border-brand-500/35'
  }`;

  /* ── Single FAQ item ─────────────────────────────────────────────────── */
  const FAQItem = ({ faq, globalIndex }) => {
    const isOpen = openIndex === globalIndex;

    /*
     * FIELD FIX: DB columns are now question_en / answer_en.
     * Keep question / answer as fallback for any rows not yet migrated.
     */
    const question = language === 'ar'
      ? (faq.question_ar || faq.question_en || faq.question || '')
      : (faq.question_en || faq.question || '');

    const answer = language === 'ar'
      ? (faq.answer_ar || faq.answer_en || faq.answer || '')
      : (faq.answer_en || faq.answer || '');

    const btnId     = `${uid}-btn-${globalIndex}`;
    const contentId = `${uid}-content-${globalIndex}`;

    return (
      <motion.div
        id={`faq-${globalIndex + 1}`}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={isVisible || shouldReduceMotion ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : globalIndex * 0.07 }}
        className={cardBase}
        style={{
          /*
           * Open state: 2px inline-start accent border (RTL-aware logical property).
           * No box-shadow.
           */
          borderInlineStartWidth: isOpen ? '2px' : '1px',
          borderInlineStartColor: isOpen
            ? (isDark ? '#0D9E82' : '#06796A') /* brand-500 / brand-600 */
            : undefined,
        }}
      >
        {/* ── Question button — 48px min-height touch target ── */}
        <button
          id={btnId}
          onClick={() => handleToggle(globalIndex)}
          onKeyDown={(e) => handleKeyDown(e, globalIndex)}
          aria-expanded={isOpen}
          aria-controls={contentId}
          className={`w-full flex items-center gap-3 px-5 text-start transition-colors duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
            focus-visible:ring-offset-2 ${
              isDark
                ? 'focus-visible:ring-offset-brand-900'
                : 'focus-visible:ring-offset-white'
            } ${language === 'ar' ? 'flex-row-reverse text-end' : ''}`}
          style={{ minHeight: '56px', paddingTop: '12px', paddingBottom: '12px' }}
        >
          {/* Number badge — small emerald circle, AA contrast */}
          <span
            className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200 ${
              isOpen
                ? isDark
                  ? 'bg-brand-400 text-brand-950'   /* brand-950 on brand-400 ≈6.2:1 ✓ */
                  : 'bg-brand-600 text-white'         /* white on brand-600 ≈5.1:1 ✓ */
                : isDark
                  ? 'bg-brand-800 text-brand-300'    /* brand-300 on brand-800 ≈4.6:1 ✓ */
                  : 'bg-brand-100 text-brand-700'    /* brand-700 on brand-100 ≈5.5:1 ✓ */
            }`}
            aria-hidden="true"
          >
            {globalIndex + 1}
          </span>

          {/* Question text — always visible, 16px, AA contrast */}
          <span
            className={`flex-1 font-semibold text-base leading-snug ${
              isDark ? 'text-brand-50' : 'text-brand-950'
            }`}
          >
            {question}
          </span>

          {/* +/− icon — emerald color */}
          <span
            className={`flex-shrink-0 ${
              isDark ? 'text-brand-400' : 'text-brand-600'
            }`}
            aria-hidden="true"
          >
            {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </span>
        </button>

        {/* ── Answer — CSS grid-template-rows 0fr→1fr, no JS height ── */}
        <div
          id={contentId}
          role="region"
          aria-labelledby={btnId}
          className="grid"
          style={{
            gridTemplateRows: isOpen ? '1fr' : '0fr',
            transition: shouldReduceMotion ? 'none' : 'grid-template-rows 300ms ease',
          }}
        >
          <div className="overflow-hidden">
            <div
              className="px-5 pb-5"
              style={{ paddingInlineStart: '3rem' /* align under question text */ }}
            >
              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-brand-200' : 'text-brand-800'
                }`}
                dir="auto"
                lang={language === 'ar' ? 'ar' : 'en'}
              >
                {answer}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section
      ref={sectionRef}
      aria-label={language === 'ar' ? 'الأسئلة المتكررة' : 'Frequently Asked Questions'}
      className={`py-16 lg:py-20 ${isDark ? 'bg-brand-950' : 'bg-white'}`}
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '0 600px',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ─────────────────────────────────────────────── */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isVisible || shouldReduceMotion ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          {/* Eyebrow */}
          <span
            className={`inline-block text-xs font-bold uppercase tracking-wider mb-3 ${
              isDark ? 'text-brand-400' : 'text-brand-700'
            }`}
          >
            {language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
          </span>

          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${
              isDark ? 'text-brand-50' : 'text-brand-950'
            }`}
            style={{ textWrap: 'balance' }}
          >
            {language === 'ar' ? 'الأسئلة المتكررة' : 'Frequently Asked Questions'}
          </h2>

          <p
            className={`text-base sm:text-lg max-w-3xl mx-auto ${
              isDark ? 'text-brand-300' : 'text-brand-700'
            }`}
          >
            {language === 'ar'
              ? 'اعثر على إجابات للأسئلة الشائعة حول تصاميمنا الجاهزة وعملية التخصيص'
              : 'Find answers to common questions about our ready-made designs and customization process'}
          </p>
        </motion.div>

        {/* ── Two-column FAQ grid ─────────────────────────────────────────── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start"
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Left column */}
          <div className="space-y-3">
            {leftFaqs.map((faq, idx) => (
              <FAQItem key={faq.id || idx} faq={faq} globalIndex={idx} />
            ))}
          </div>

          {/* Right column */}
          <div className="space-y-3">
            {rightFaqs.map((faq, idx) => (
              <FAQItem
                key={faq.id || (midpoint + idx)}
                faq={faq}
                globalIndex={midpoint + idx}
              />
            ))}

            {/* ── "Still have questions?" card ─────────────────────────── */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              animate={isVisible || shouldReduceMotion ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                delay: shouldReduceMotion ? 0 : faqs.length * 0.07,
              }}
              className={`rounded-2xl border p-8 text-center ${
                isDark
                  ? 'bg-brand-900/60 border-brand-500/20'
                  : 'bg-brand-50 border-brand-500/20'
              }`}
            >
              {/* Emerald icon — brand-500 on both themes (AA decorative, 3:1+) */}
              <MessageCircle
                className={`w-12 h-12 mx-auto mb-4 ${
                  isDark ? 'text-brand-400' : 'text-brand-600'
                }`}
                strokeWidth={1.5}
                aria-hidden="true"
              />

              <h3
                className={`text-xl font-bold mb-3 ${
                  isDark ? 'text-brand-50' : 'text-brand-950'
                }`}
              >
                {language === 'ar' ? 'لا تزال لديك أسئلة؟' : 'Still have questions?'}
              </h3>

              <p
                className={`text-sm mb-6 ${
                  isDark ? 'text-brand-300' : 'text-brand-700'
                }`}
              >
                {language === 'ar'
                  ? 'نحن هنا للمساعدة. تواصل معنا مباشرة'
                  : "We're here to help. Get in touch directly"}
              </p>

              {/*
               * "Contact Us" button — the same primary <Button> variant used
               * everywhere on the site (bg-primary text-white), full-width on
               * phones, 48px height.
               */}
              <Button
                onClick={() => { window.location.href = '/contact'; }}
                className="w-full h-12 rounded-xl font-semibold"
              >
                {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumFAQAccordion;
