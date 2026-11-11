import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/i18n/useLanguage';
import { motion, useReducedMotion } from 'framer-motion';
import { Plus, Minus, Link as LinkIcon } from 'lucide-react';

/**
 * ServicesFAQAccordion
 * 
 * Premium FAQ accordion with:
 * - Numbered items
 * - One open at a time (first open by default)
 * - Smooth height animation using grid-template-rows (0fr → 1fr)
 * - Anchor links (#faq-1, #faq-2, etc.)
 * - Keyboard support (Enter/Space to toggle, Tab navigation)
 * - InverseSurface tokens, RTL, dark mode, a11y, reduced-motion
 * 
 * Fetches FAQs from database with page_key='services'
 */
export default function ServicesFAQAccordion({ faqs = [] }) {
  const { t, language, dir } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState(0); // First open by default

  // Handle hash navigation on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#faq-')) {
      const index = parseInt(hash.replace('#faq-', '')) - 1;
      if (index >= 0 && index < faqs.length) {
        setOpenIndex(index);
        // Scroll to item after a brief delay
        setTimeout(() => {
          document.getElementById(hash.substring(1))?.scrollIntoView({ 
            behavior: shouldReduceMotion ? 'auto' : 'smooth',
            block: 'center'
          });
        }, 100);
      }
    }
  }, [faqs.length, shouldReduceMotion]);

  const toggleItem = (index) => {
    // If clicking the open item, close it (or keep it open - spec says "one open at a time" which could mean always one open)
    // I'll interpret as: clicking open item closes it, clicking closed item opens it and closes others
    setOpenIndex(openIndex === index ? -1 : index);
  };

  if (faqs.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      <InverseSurface
        token="subtleCanvas"
        className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
      >
        <div className="max-w-4xl mx-auto">
          
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3" dir={dir}>
              <InverseSurface token="text">
                {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
              </InverseSurface>
            </h2>
            <p className="text-lg" dir={dir}>
              <InverseSurface token="secondaryText">
                {language === 'ar' 
                  ? 'إجابات على أهم الأسئلة حول خدماتنا'
                  : 'Answers to the most common questions about our services'}
              </InverseSurface>
            </p>
          </motion.div>

          {/* FAQ list */}
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const faqId = `faq-${index + 1}`;
              const question = language === 'ar' && faq.question_ar ? faq.question_ar : faq.question_en || faq.question;
              const answer = language === 'ar' && faq.answer_ar ? faq.answer_ar : faq.answer_en || faq.answer;

              return (
                <FAQItem
                  key={faq.id || index}
                  id={faqId}
                  number={index + 1}
                  question={question}
                  answer={answer}
                  isOpen={isOpen}
                  onToggle={() => toggleItem(index)}
                  dir={dir}
                  language={language}
                  shouldReduceMotion={shouldReduceMotion}
                />
              );
            })}
          </div>

        </div>
      </InverseSurface>
    </section>
  );
}

/**
 * FAQItem component
 * Uses grid-template-rows for smooth height animation
 */
function FAQItem({ 
  id, 
  number, 
  question, 
  answer, 
  isOpen, 
  onToggle, 
  dir, 
  language,
  shouldReduceMotion 
}) {
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Measure content height for animation
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [answer, isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.4, delay: number * 0.05 }}
      id={id}
      className="scroll-mt-24"
    >
      <InverseSurface
        token="glass"
        className="rounded-2xl border overflow-hidden"
      >
        {/* Question button */}
        <button
          onClick={onToggle}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-controls={`${id}-content`}
          className="w-full text-left p-6 flex items-start gap-4 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors group"
        >
          {/* Number badge */}
          <div className="flex-shrink-0">
            <InverseSurface
              token="glass"
              className="w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm text-cyan-600 dark:text-cyan-400"
            >
              {number}
            </InverseSurface>
          </div>

          {/* Question text */}
          <div className="flex-1 min-w-0" dir={dir}>
            <h3 className="text-lg font-bold pr-4" style={{ wordBreak: 'normal', overflowWrap: 'break-word' }}>
              <InverseSurface token="text">
                {question}
              </InverseSurface>
            </h3>
          </div>

          {/* Toggle icon */}
          <div className="flex-shrink-0 mt-1">
            {isOpen ? (
              <Minus 
                className="w-5 h-5 text-cyan-600 dark:text-cyan-400 transition-transform group-hover:scale-110" 
                strokeWidth={2}
                aria-hidden="true"
              />
            ) : (
              <Plus 
                className="w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform group-hover:scale-110" 
                strokeWidth={2}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Anchor link icon (visible on hover) */}
          <a
            href={`#${id}`}
            onClick={(e) => {
              e.stopPropagation();
              // Update URL without triggering navigation
              window.history.replaceState(null, '', `#${id}`);
            }}
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
            aria-label={language === 'ar' ? 'رابط مباشر' : 'Direct link'}
            tabIndex={-1}
          >
            <LinkIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" strokeWidth={1.5} aria-hidden="true" />
          </a>
        </button>

        {/* Answer panel - animated with grid-template-rows */}
        <div
          id={`${id}-content`}
          className="grid transition-all"
          style={{
            gridTemplateRows: isOpen ? '1fr' : '0fr',
            transitionDuration: shouldReduceMotion ? '0ms' : '300ms',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div className="overflow-hidden">
            <div ref={contentRef} className="px-6 pb-6 pl-20" dir={dir}>
              <InverseSurface 
                token="secondaryText" 
                className="text-base leading-relaxed"
                style={{ wordBreak: 'normal', overflowWrap: 'break-word' }}
              >
                {answer}
              </InverseSurface>
            </div>
          </div>
        </div>
      </InverseSurface>
    </motion.div>
  );
}

/**
 * InverseSurface wrapper component
 */
function InverseSurface({ token, className = '', children, style, ...props }) {
  const tokens = {
    subtleCanvas: 'bg-slate-50/50 dark:bg-slate-900/30',
    glass: 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm',
    text: 'text-slate-950 dark:text-slate-50',
    secondaryText: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-800'
  };

  const tokenClass = tokens[token] || '';
  const combinedClassName = `${tokenClass} ${className}`.trim();

  return (
    <div className={combinedClassName} style={style} {...props}>
      {children}
    </div>
  );
}
