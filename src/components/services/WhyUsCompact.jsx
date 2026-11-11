/**
 * WhyUsCompact - Compact 4 glass tiles with animated icons
 * NO fake stats, real content only
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Lightbulb, Award, Target, Users } from 'lucide-react';
import InverseSurface from '@/components/ui/InverseSurface';
import SectionHeader from '@/components/ui/SectionHeader';
import { RevealStagger } from '@/components/ui/Reveal';

export default function WhyUsCompact({ language = 'en', dir = 'ltr' }) {
  const shouldReduceMotion = useReducedMotion();
  
  // Real content only - from existing About page concepts
  const reasons = [
    {
      id: 'innovation',
      icon: Lightbulb,
      title: language === 'ar' ? 'الابتكار والإبداع' : 'Innovation & Creativity',
      description: language === 'ar' 
        ? 'نستخدم أحدث التقنيات لبناء حلول مبتكرة تميز عملك'
        : 'We leverage cutting-edge technologies to build innovative solutions that set your business apart',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'quality',
      icon: Award,
      title: language === 'ar' ? 'الجودة والتميز' : 'Quality & Excellence',
      description: language === 'ar' 
        ? 'نلتزم بأعلى معايير الجودة في كل مرحلة من مراحل التطوير'
        : 'We commit to the highest quality standards at every development stage',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'focus',
      icon: Target,
      title: language === 'ar' ? 'التركيز على النجاح' : 'Focus on Success',
      description: language === 'ar' 
        ? 'نجاح مشروعك هو هدفنا الأساسي في كل ما نقوم به'
        : 'Your project success is our primary goal in everything we do',
      gradient: 'from-cyan-500 to-teal-500'
    },
    {
      id: 'partnership',
      icon: Users,
      title: language === 'ar' ? 'شراكة طويلة الأمد' : 'Long-Term Partnership',
      description: language === 'ar' 
        ? 'نبني علاقات طويلة الأمد مع عملائنا قائمة على الثقة والنمو المشترك'
        : 'We build long-term relationships with our clients based on trust and mutual growth',
      gradient: 'from-teal-500 to-green-500'
    }
  ];
  
  const eyebrowText = language === 'ar' ? 'لماذا نحن' : 'WHY US';
  const headingText = language === 'ar' ? 'لماذا تختار Sentivra' : 'Why Choose Sentivra';
  const descriptionText = language === 'ar'
    ? 'نجمع بين الخبرة التقنية والفهم العميق لاحتياجات الأعمال لتقديم حلول استثنائية'
    : 'We combine technical expertise with deep business understanding to deliver exceptional solutions';
  
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
            className="mb-12"
          />
          
          {/* Tiles Grid */}
          <RevealStagger staggerDelay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {reasons.map((reason, index) => (
                <WhyUsTile
                  key={reason.id}
                  reason={reason}
                  index={index}
                  shouldReduceMotion={shouldReduceMotion}
                  language={language}
                  dir={dir}
                />
              ))}
            </div>
          </RevealStagger>
        </div>
    </section>
  );
}

/**
 * WhyUsTile - Individual reason tile with animated icon
 */
function WhyUsTile({ reason, index, shouldReduceMotion, language, dir }) {
  const ReasonIcon = reason.icon;
  
  return (
    <div>
      <InverseSurface
        token="glass"
        className="relative h-full p-6 rounded-2xl border group hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        {/* Gradient on hover */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${reason.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
          aria-hidden="true"
        />
        
        {/* Animated icon */}
        <div className="relative z-10 mb-4">
          <motion.div
            animate={shouldReduceMotion ? {} : {
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
          >
            <InverseSurface
              token="glass"
              className="inline-flex items-center justify-center w-14 h-14 rounded-xl border"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${reason.gradient} opacity-10 rounded-xl group-hover:opacity-20 transition-opacity`} aria-hidden="true" />
              <ReasonIcon 
                className="relative z-10 w-7 h-7 text-cyan-500 dark:text-cyan-400" 
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </InverseSurface>
          </motion.div>
        </div>
        
        {/* Title */}
        <h3 className="relative z-10 text-lg font-bold mb-2 text-primary-deep dark:text-white" dir={dir}>
          {reason.title}
        </h3>
        
        {/* Description */}
        <p className="relative z-10 text-sm leading-relaxed text-text-muted dark:text-slate-400" dir={dir}>
          {reason.description}
        </p>
      </InverseSurface>
    </div>
  );
}
