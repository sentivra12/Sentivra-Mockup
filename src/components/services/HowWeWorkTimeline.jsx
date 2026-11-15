/**
 * HowWeWorkTimeline - Interactive timeline with scroll-triggered animations
 * 
 * Features:
 * - Horizontal timeline (desktop) / vertical (mobile)
 * - Connector line draws on scroll
 * - Step nodes light up in sequence
 * - Small animated visual per step (blueprint -> code -> rocket)
 * - Admin-editable content (EN/AR)
 * - Full RTL, dark mode, a11y, reduced-motion
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useMotionPreference';
import { Search, Code, Rocket, Pencil, Terminal, CheckCircle } from 'lucide-react';
import InverseSurface from '@/components/ui/InverseSurface';
import SectionHeader from '@/components/ui/SectionHeader';

export default function HowWeWorkTimeline({ language = 'en', dir = 'ltr' }) {
  const shouldReduceMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(-1);
  const timelineRef = useRef(null);
  const isInView = useInView(timelineRef, { once: false, margin: '-100px' });
  
  // Steps data
  const steps = [
    {
      id: 'understand',
      icon: Search,
      visualIcon: Pencil,
      title: language === 'ar' ? 'نفهم احتياجاتك' : 'Understand Your Needs',
      description: language === 'ar' 
        ? 'نستمع بعناية لأهدافك ونحلل متطلباتك بدقة لضمان فهم شامل لرؤيتك'
        : 'We listen carefully to your goals and analyze your requirements precisely to ensure comprehensive understanding of your vision',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'develop',
      icon: Code,
      visualIcon: Terminal,
      title: language === 'ar' ? 'نصمم ونطور' : 'Design & Develop',
      description: language === 'ar' 
        ? 'نبني الحل البرمجي باستخدام أفضل التقنيات والممارسات الهندسية المتقدمة'
        : 'We build the software solution using best-in-class technologies and advanced engineering practices',
      color: 'from-cyan-500 to-teal-500'
    },
    {
      id: 'launch',
      icon: Rocket,
      visualIcon: CheckCircle,
      title: language === 'ar' ? 'نطلق وندعم' : 'Launch & Support',
      description: language === 'ar' 
        ? 'نضمن إطلاقاً ناجحاً مع دعم مستمر وتحديثات دورية لنجاح مشروعك'
        : 'We ensure successful launch with continuous support and regular updates for your project success',
      color: 'from-teal-500 to-green-500'
    }
  ];
  
  // Trigger step activation on scroll
  useEffect(() => {
    if (!isInView || shouldReduceMotion) {
      if (isInView) setActiveStep(steps.length - 1);
      return;
    }
    
    const timers = steps.map((_, index) => 
      setTimeout(() => {
        setActiveStep(index);
      }, index * 800)
    );
    
    return () => timers.forEach(clearTimeout);
  }, [isInView, shouldReduceMotion, steps.length]);
  
  const eyebrowText = language === 'ar' ? 'عمليتنا' : 'OUR PROCESS';
  const headingText = language === 'ar' ? 'كيف نعمل معك' : 'How We Work With You';
  const descriptionText = language === 'ar'
    ? 'منهجية واضحة ومنظمة تضمن نجاح مشروعك من البداية حتى الإطلاق'
    : 'A clear and organized methodology ensuring your project success from start to launch';
  
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-frost-soft dark:bg-surface">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
        backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
        backgroundSize: '64px 64px'
      }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <SectionHeader
            eyebrow={eyebrowText}
            heading={headingText}
            description={descriptionText}
            align="center"
            language={language}
            className="mb-16"
          />
          
          {/* Timeline */}
          <div ref={timelineRef} className="relative">
            {/* Desktop: Horizontal */}
            <div className="hidden md:block">
              {/* Connector line */}
              <div className="absolute top-16 left-0 right-0 h-0.5 bg-border">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-accent to-success-text"
                  initial={{ width: '0%' }}
                  animate={isInView && !shouldReduceMotion ? { width: '100%' } : {}}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                />
              </div>
              
              {/* Steps */}
              <div className={`grid grid-cols-3 gap-8 ${dir === 'rtl' ? 'rtl' : ''}`}>
                {steps.map((step, index) => (
                  <TimelineStep
                    key={step.id}
                    step={step}
                    index={index}
                    isActive={index <= activeStep}
                    isHorizontal={true}
                    shouldReduceMotion={shouldReduceMotion}
                    language={language}
                    dir={dir}
                  />
                ))}
              </div>
            </div>
            
            {/* Mobile: Vertical */}
            <div className="md:hidden space-y-8">
              {/* Connector line */}
              <div className={`absolute top-0 bottom-0 w-0.5 bg-border ${dir === 'rtl' ? 'right-6' : 'left-6'}`}>
                <motion.div
                  className="w-full bg-gradient-to-b from-brand-accent to-success-text"
                  initial={{ height: '0%' }}
                  animate={isInView && !shouldReduceMotion ? { height: '100%' } : {}}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                />
              </div>
              
              {/* Steps */}
              {steps.map((step, index) => (
                <TimelineStep
                  key={step.id}
                  step={step}
                  index={index}
                  isActive={index <= activeStep}
                  isHorizontal={false}
                  shouldReduceMotion={shouldReduceMotion}
                  language={language}
                  dir={dir}
                />
              ))}
            </div>
          </div>
        </div>
    </section>
  );
}

/**
 * TimelineStep - Individual step with animated visual
 */
function TimelineStep({ step, index, isActive, isHorizontal, shouldReduceMotion, language, dir }) {
  const StepIcon = step.icon;
  const VisualIcon = step.visualIcon;
  
  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className={`relative ${isHorizontal ? 'text-center' : `flex gap-6 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}`}
    >
      {/* Node */}
      <div className={isHorizontal ? 'flex flex-col items-center' : 'flex-shrink-0'}>
        {/* Visual indicator */}
        <div className="mb-4">
          <StepVisual
            VisualIcon={VisualIcon}
            isActive={isActive}
            shouldReduceMotion={shouldReduceMotion}
            color={step.color}
          />
        </div>
        
        {/* Main icon node */}
        <motion.div
          className="relative z-10"
          animate={shouldReduceMotion ? {} : {
            scale: isActive ? 1.1 : 1
          }}
          transition={{ duration: 0.4 }}
        >
          <InverseSurface
            token="glass"
            className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
              isActive 
                ? 'border-brand-accent shadow-lg shadow-brand-accent/50' 
                : 'border-border-subtle'
            }`}
          >
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} opacity-0 transition-opacity duration-500 ${
              isActive ? 'opacity-20' : ''
            }`} />
            <StepIcon 
              className={`relative z-10 w-7 h-7 transition-colors duration-500 ${
                isActive 
                  ? 'text-brand-accent dark:text-brand-accent-muted' 
                  : 'text-text-muted/40'
              }`}
              strokeWidth={1.5}
            />
          </InverseSurface>
        </motion.div>
        
        {/* Step number */}
        <div className="mt-3">
          <span className={`font-mono text-xs font-bold transition-colors duration-500 ${
            isActive 
              ? 'text-brand-accent dark:text-brand-accent-muted' 
              : 'text-text-muted/40'
          }`}>
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className={`${isHorizontal ? 'mt-6' : 'flex-1 pt-8'}`}>
        <motion.h3
          className="text-xl font-bold mb-2"
          animate={shouldReduceMotion ? {} : {
            color: isActive ? undefined : 'var(--color-text-muted)'
          }}
          transition={{ duration: 0.5 }}
        >
          {step.title}
        </motion.h3>
        
        <motion.p
          className="text-sm leading-relaxed text-text-muted"
          animate={shouldReduceMotion ? {} : {
            opacity: isActive ? 1 : 0.6
          }}
          transition={{ duration: 0.5 }}
        >
          {step.description}
        </motion.p>
      </div>
    </motion.div>
  );
}

/**
 * StepVisual - Small animated icon per step
 */
function StepVisual({ VisualIcon, isActive, shouldReduceMotion, color }) {
  if (shouldReduceMotion) {
    return (
      <div className="w-12 h-12 rounded-lg bg-frost-soft border border-border-subtle flex items-center justify-center">
        <VisualIcon className="w-6 h-6 text-text-muted/40" />
      </div>
    );
  }
  
  return (
    <motion.div
      className="w-12 h-12 rounded-lg bg-frost-soft border border-border-subtle flex items-center justify-center overflow-hidden"
      animate={{
        borderColor: isActive ? 'rgba(6, 182, 212, 0.5)' : undefined
      }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0`}
        animate={{
          opacity: isActive ? 0.1 : 0
        }}
        transition={{ duration: 0.5 }}
      />
      <motion.div
        animate={{
          scale: isActive ? [1, 1.2, 1] : 1,
          rotate: isActive ? [0, 10, -10, 0] : 0
        }}
        transition={{
          duration: 0.6,
          times: [0, 0.3, 0.7, 1]
        }}
      >
        <VisualIcon 
          className={`w-6 h-6 transition-colors duration-500 ${
            isActive 
              ? 'text-brand-accent dark:text-brand-accent-muted' 
              : 'text-text-muted/40'
          }`}
        />
      </motion.div>
    </motion.div>
  );
}
