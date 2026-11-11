/**
 * PremiumFAQAccordion - Round 6: Glass accordion with search and anchor links
 * 
 * Features:
 * - Premium glass cards with smooth height animation (grid-template-rows 0fr -> 1fr)
 * - Animated plus/chevron icon
 * - One open at a time (first open by default)
 * - Numbered items
 * - Anchor links (#faq-1) that open the item
 * - Two-column balanced layout on desktop (CSS grid, equal heights)
 * - Search or "Still have questions?" card
 * - Full a11y: buttons with aria-expanded, aria-controls, region roles, keyboard
 * - Staged reveal with stagger
 * - RTL, dark mode, reduced-motion
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, MessageCircle, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PremiumFAQAccordion = ({ 
  faqs = [], 
  language = 'en', 
  isDark = false,
  siteSettings = null
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState(0); // First open by default
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  
  // Handle anchor links (#faq-1)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#faq-')) {
      const index = parseInt(hash.replace('#faq-', '')) - 1;
      if (index >= 0 && index < faqs.length) {
        setOpenIndex(index);
        setTimeout(() => {
          document.getElementById(hash.slice(1))?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      }
    }
  }, [faqs.length]);
  
  // IntersectionObserver for staged reveal
  useEffect(() => {
    if (shouldReduceMotion) {
      setIsVisible(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-50px'
      }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, [shouldReduceMotion]);
  
  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };
  
  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle(index);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % faqs.length;
      document.getElementById(`faq-button-${nextIndex}`)?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + faqs.length) % faqs.length;
      document.getElementById(`faq-button-${prevIndex}`)?.focus();
    }
  };
  
  // Split FAQs into two columns for desktop
  const midpoint = Math.ceil(faqs.length / 2);
  const leftFaqs = faqs.slice(0, midpoint);
  const rightFaqs = faqs.slice(midpoint);
  
  if (faqs.length === 0) return null;
  
  return (
    <section 
      ref={sectionRef}
      className={`py-16 lg:py-20 ${isDark ? 'bg-[#0A1525]' : 'bg-white'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span 
            className={`inline-block text-xs font-bold uppercase tracking-wider mb-3 ${
              isDark ? 'text-cyan-400' : 'text-[#5C7E8F]'
            }`}
          >
            {language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
          </span>
          <h2 
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-[#1F3440]'
            }`}
            style={{ textWrap: 'balance' }}
          >
            {language === 'ar' ? 'الأسئلة المتكررة' : 'Frequently Asked Questions'}
          </h2>
          <p 
            className={`text-base sm:text-lg max-w-3xl mx-auto ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {language === 'ar'
              ? 'اعثر على إجابات للأسئلة الشائعة حول تصاميمنا الجاهزة وعملية التخصيص'
              : 'Find answers to common questions about our ready-made designs and customization process'}
          </p>
        </motion.div>
        
        {/* FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Left Column */}
          <div className="space-y-4">
            {leftFaqs.map((faq, index) => {
              const globalIndex = index;
              const isOpen = openIndex === globalIndex;
              const question = language === 'ar' 
                ? (faq.question_ar || faq.question) 
                : faq.question;
              const answer = language === 'ar' 
                ? (faq.answer_ar || faq.answer) 
                : faq.answer;
              
              return (
                <motion.div
                  key={faq.id || index}
                  id={`faq-${globalIndex + 1}`}
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ 
                    duration: 0.5, 
                    delay: shouldReduceMotion ? 0 : globalIndex * 0.1 
                  }}
                  className={`rounded-2xl border backdrop-blur-sm overflow-hidden transition-all duration-300 ${
                    isDark
                      ? 'bg-slate-800/30 border-white/10 hover:border-cyan-400/30'
                      : 'bg-white/80 border-slate-200 hover:border-[#5C7E8F]/30'
                  }`}
                  style={{
                    boxShadow: isOpen
                      ? isDark
                        ? '0 8px 32px rgba(111, 211, 216, 0.15)'
                        : '0 8px 32px rgba(92, 126, 143, 0.15)'
                      : 'none'
                  }}
                >
                  {/* Question Button */}
                  <button
                    id={`faq-button-${globalIndex}`}
                    onClick={() => handleToggle(globalIndex)}
                    onKeyDown={(e) => handleKeyDown(e, globalIndex)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-content-${globalIndex}`}
                    className={`w-full px-6 py-5 flex items-start gap-4 text-left transition-colors ${
                      language === 'ar' ? 'flex-row-reverse text-right' : ''
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2`}
                  >
                    {/* Number Badge */}
                    <span 
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                        isOpen
                          ? isDark
                            ? 'bg-cyan-400 text-slate-900'
                            : 'bg-[#5C7E8F] text-white'
                          : isDark
                            ? 'bg-white/5 text-slate-400'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {globalIndex + 1}
                    </span>
                    
                    {/* Question Text */}
                    <span 
                      className={`flex-1 font-semibold text-base leading-snug ${
                        isDark ? 'text-white' : 'text-[#1F3440]'
                      }`}
                      style={{ textWrap: 'balance' }}
                    >
                      {question}
                    </span>
                    
                    {/* Icon */}
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      {isOpen ? (
                        <Minus 
                          className={`w-5 h-5 ${
                            isDark ? 'text-cyan-400' : 'text-[#5C7E8F]'
                          }`}
                          aria-hidden="true"
                        />
                      ) : (
                        <Plus 
                          className={`w-5 h-5 ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}
                          aria-hidden="true"
                        />
                      )}
                    </motion.div>
                  </button>
                  
                  {/* Answer Content with smooth height animation */}
                  <div
                    id={`faq-content-${globalIndex}`}
                    role="region"
                    aria-labelledby={`faq-button-${globalIndex}`}
                    className="grid transition-all duration-300 ease-in-out"
                    style={{
                      gridTemplateRows: isOpen ? '1fr' : '0fr'
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className={`px-6 pb-6 ${language === 'ar' ? 'pr-18' : 'pl-18'}`}>
                        <p 
                          className={`text-base leading-relaxed ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          {answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Right Column */}
          <div className="space-y-4">
            {rightFaqs.map((faq, index) => {
              const globalIndex = midpoint + index;
              const isOpen = openIndex === globalIndex;
              const question = language === 'ar' 
                ? (faq.question_ar || faq.question) 
                : faq.question;
              const answer = language === 'ar' 
                ? (faq.answer_ar || faq.answer) 
                : faq.answer;
              
              return (
                <motion.div
                  key={faq.id || globalIndex}
                  id={`faq-${globalIndex + 1}`}
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ 
                    duration: 0.5, 
                    delay: shouldReduceMotion ? 0 : globalIndex * 0.1 
                  }}
                  className={`rounded-2xl border backdrop-blur-sm overflow-hidden transition-all duration-300 ${
                    isDark
                      ? 'bg-slate-800/30 border-white/10 hover:border-cyan-400/30'
                      : 'bg-white/80 border-slate-200 hover:border-[#5C7E8F]/30'
                  }`}
                  style={{
                    boxShadow: isOpen
                      ? isDark
                        ? '0 8px 32px rgba(111, 211, 216, 0.15)'
                        : '0 8px 32px rgba(92, 126, 143, 0.15)'
                      : 'none'
                  }}
                >
                  <button
                    id={`faq-button-${globalIndex}`}
                    onClick={() => handleToggle(globalIndex)}
                    onKeyDown={(e) => handleKeyDown(e, globalIndex)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-content-${globalIndex}`}
                    className={`w-full px-6 py-5 flex items-start gap-4 text-left transition-colors ${
                      language === 'ar' ? 'flex-row-reverse text-right' : ''
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2`}
                  >
                    <span 
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                        isOpen
                          ? isDark
                            ? 'bg-cyan-400 text-slate-900'
                            : 'bg-[#5C7E8F] text-white'
                          : isDark
                            ? 'bg-white/5 text-slate-400'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {globalIndex + 1}
                    </span>
                    
                    <span 
                      className={`flex-1 font-semibold text-base leading-snug ${
                        isDark ? 'text-white' : 'text-[#1F3440]'
                      }`}
                      style={{ textWrap: 'balance' }}
                    >
                      {question}
                    </span>
                    
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      {isOpen ? (
                        <Minus 
                          className={`w-5 h-5 ${
                            isDark ? 'text-cyan-400' : 'text-[#5C7E8F]'
                          }`}
                          aria-hidden="true"
                        />
                      ) : (
                        <Plus 
                          className={`w-5 h-5 ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}
                          aria-hidden="true"
                        />
                      )}
                    </motion.div>
                  </button>
                  
                  <div
                    id={`faq-content-${globalIndex}`}
                    role="region"
                    aria-labelledby={`faq-button-${globalIndex}`}
                    className="grid transition-all duration-300 ease-in-out"
                    style={{
                      gridTemplateRows: isOpen ? '1fr' : '0fr'
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className={`px-6 pb-6 ${language === 'ar' ? 'pr-18' : 'pl-18'}`}>
                        <p 
                          className={`text-base leading-relaxed ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          {answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {/* "Still have questions?" Card */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.5, 
                delay: shouldReduceMotion ? 0 : faqs.length * 0.1 
              }}
              className={`rounded-2xl border backdrop-blur-sm p-8 text-center ${
                isDark
                  ? 'bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-white/10'
                  : 'bg-gradient-to-br from-white/80 to-slate-50/80 border-slate-200'
              }`}
            >
              <MessageCircle 
                className={`w-12 h-12 mx-auto mb-4 ${
                  isDark ? 'text-cyan-400' : 'text-[#5C7E8F]'
                }`}
              />
              <h3 
                className={`text-xl font-bold mb-3 ${
                  isDark ? 'text-white' : 'text-[#1F3440]'
                }`}
              >
                {language === 'ar' ? 'لا تزال لديك أسئلة؟' : 'Still have questions?'}
              </h3>
              <p 
                className={`text-sm mb-6 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {language === 'ar'
                  ? 'نحن هنا للمساعدة. تواصل معنا مباشرة'
                  : 'We\'re here to help. Get in touch directly'}
              </p>
              <Button
                onClick={() => window.location.href = '/contact'}
                className={`w-full rounded-xl ${
                  isDark
                    ? 'bg-cyan-400 text-slate-900 hover:bg-cyan-300'
                    : 'bg-[#5C7E8F] text-white hover:bg-[#4A6B7C]'
                }`}
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
