/**
 * HowItWorksStrip - Round 6: Conversion-focused 3-step process
 * 
 * Features:
 * - 3 steps with icons and animated connector line
 * - Line draws itself once on scroll (IntersectionObserver)
 * - Staged reveal: line first, then steps in stagger
 * - Neutral copy, NO timelines/prices/promises
 * - Admin-editable content (falls back to defaults)
 * - RTL support, dark mode, reduced-motion, a11y
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Search, Palette, Rocket } from 'lucide-react';

const defaultSteps = {
  en: [
    {
      icon: Search,
      title: 'Choose a Design',
      description: 'Browse our collection and select a design that fits your business'
    },
    {
      icon: Palette,
      title: 'We Customize It',
      description: 'We adapt it to your brand, content, and specific requirements'
    },
    {
      icon: Rocket,
      title: 'We Launch It',
      description: 'Get a fully working website ready for your visitors'
    }
  ],
  ar: [
    {
      icon: Search,
      title: 'اختر التصميم',
      description: 'تصفح مجموعتنا واختر تصميماً يناسب عملك'
    },
    {
      icon: Palette,
      title: 'نخصصه لك',
      description: 'نكيفه مع علامتك التجارية ومحتواك ومتطلباتك المحددة'
    },
    {
      icon: Rocket,
      title: 'نطلقه لك',
      description: 'احصل على موقع يعمل بالكامل جاهز لزوارك'
    }
  ]
};

const HowItWorksStrip = ({ 
  steps: customSteps, 
  language = 'en', 
  isDark = false 
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [lineProgress, setLineProgress] = useState(0);
  const sectionRef = useRef(null);
  const lineRef = useRef(null);
  
  // Use custom steps if provided, otherwise use defaults
  const steps = customSteps || defaultSteps[language];
  
  // IntersectionObserver for staged reveal
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
            
            // Animate line progress
            let progress = 0;
            const duration = 1500; // 1.5s
            const interval = 16; // ~60fps
            const increment = (100 / duration) * interval;
            
            const timer = setInterval(() => {
              progress += increment;
              if (progress >= 100) {
                progress = 100;
                clearInterval(timer);
              }
              setLineProgress(progress);
            }, interval);
            
            return () => clearInterval(timer);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '-50px'
      }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, [shouldReduceMotion, isVisible]);
  
  return (
    <section
      ref={sectionRef}
      className={`py-16 lg:py-20 ${isDark ? 'bg-slate-900/50' : 'bg-slate-50/50'}`}
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
            {language === 'ar' ? 'كيف نعمل' : 'How It Works'}
          </span>
          <h2 
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${
              isDark ? 'text-white' : 'text-[#1F3440]'
            }`}
            style={{ textWrap: 'balance' }}
          >
            {language === 'ar' ? 'عملية بسيطة' : 'Simple Process'}
          </h2>
        </motion.div>
        
        {/* Steps with Connector Line */}
        <div className="relative">
          {/* Connector Line (hidden on mobile) */}
          <div 
            className={`hidden lg:block absolute top-20 ${
              language === 'ar' ? 'right-[16.666%] left-[16.666%]' : 'left-[16.666%] right-[16.666%]'
            } h-0.5 overflow-hidden`}
            style={{ 
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
            }}
            aria-hidden="true"
          >
            {/* Animated Progress Line */}
            <motion.div
              ref={lineRef}
              className="h-full"
              style={{
                width: `${lineProgress}%`,
                background: isDark
                  ? 'linear-gradient(90deg, #6FD3D8, #5C7E8F)'
                  : 'linear-gradient(90deg, #5C7E8F, #6FD3D8)',
                transformOrigin: language === 'ar' ? 'right' : 'left'
              }}
            />
          </div>
          
          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              
              return (
                <motion.div
                  key={index}
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ 
                    duration: 0.6, 
                    delay: shouldReduceMotion ? 0 : 0.3 + index * 0.15 
                  }}
                  className="relative text-center"
                >
                  {/* Icon Circle */}
                  <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 mx-auto">
                    {/* Background Glow */}
                    <div 
                      className="absolute inset-0 rounded-full blur-xl opacity-30"
                      style={{
                        background: isDark
                          ? 'linear-gradient(135deg, #6FD3D8, #5C7E8F)'
                          : 'linear-gradient(135deg, #5C7E8F, #6FD3D8)'
                      }}
                      aria-hidden="true"
                    />
                    
                    {/* Icon Container */}
                    <div 
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center border-2 backdrop-blur-sm ${
                        isDark
                          ? 'bg-slate-800/50 border-cyan-400/30'
                          : 'bg-white/80 border-[#5C7E8F]/30'
                      }`}
                      style={{
                        boxShadow: isDark
                          ? '0 8px 32px rgba(111, 211, 216, 0.15)'
                          : '0 8px 32px rgba(92, 126, 143, 0.15)'
                      }}
                    >
                      <Icon 
                        className={`w-8 h-8 ${
                          isDark ? 'text-cyan-400' : 'text-[#5C7E8F]'
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                    
                    {/* Step Number Badge */}
                    <div 
                      className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isDark
                          ? 'bg-cyan-400 text-slate-900'
                          : 'bg-[#5C7E8F] text-white'
                      }`}
                      style={{
                        boxShadow: isDark
                          ? '0 4px 12px rgba(111, 211, 216, 0.3)'
                          : '0 4px 12px rgba(92, 126, 143, 0.3)'
                      }}
                    >
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 
                    className={`text-xl font-bold mb-3 ${
                      isDark ? 'text-white' : 'text-[#1F3440]'
                    }`}
                    style={{ textWrap: 'balance' }}
                  >
                    {step.title}
                  </h3>
                  
                  {/* Description */}
                  <p 
                    className={`text-base leading-relaxed ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                    style={{ textWrap: 'balance' }}
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
