import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import StatCounter from '@/components/ui/StatCounter';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

const WhyChooseUsBand = ({ stats = [], label, title, description, ctaButton }) => {
  const { language } = useTranslation();
  
  // Fallbacks for missing content (development warnings)
  const isDev = import.meta.env.DEV;
  
  const safeLabel = label || (isDev ? '[Missing: label]' : '');
  const safeTitle = title || (isDev ? '[Missing: title]' : '');
  const safeDescription = description || (isDev ? '[Missing: description]' : '');
  const safeCtaButton = ctaButton?.label ? ctaButton : null;
  
  // Log warnings in development
  if (isDev) {
    if (!label) console.warn('[WhyChooseUsBand] Missing prop: label');
    if (!title) console.warn('[WhyChooseUsBand] Missing prop: title');
    if (!description) console.warn('[WhyChooseUsBand] Missing prop: description');
    if (ctaButton && !ctaButton.label) console.warn('[WhyChooseUsBand] CTA button has no label');
  }
  
  return (
    <section className="relative py-20 md:py-28 bg-frost-soft dark:bg-surface overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
        backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
        backgroundSize: '64px 64px'
      }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {safeLabel && (
            <span className={`inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4 ${isDev && !label ? 'bg-red-500/20 px-2 py-1 rounded' : ''}`}>
              {safeLabel}
            </span>
          )}
          {safeTitle && (
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-primary-deep dark:text-white mb-6 ${isDev && !title ? 'text-red-400' : ''}`}>
              {safeTitle}
            </h2>
          )}
          {safeDescription && (
            <p className={`text-lg text-text-muted dark:text-slate-400 max-w-3xl mx-auto mb-8 ${isDev && !description ? 'text-red-300' : ''}`}>
              {safeDescription}
            </p>
          )}
          {safeCtaButton && (
            <a href={safeCtaButton.href} onClick={safeCtaButton.onClick}>
              <Button 
                size="lg" 
                className={`bg-primary hover:bg-primary-strong text-white px-8 py-6 text-lg rounded-lg group ${language === 'ar' ? 'flex-row-reverse' : ''}`}
              >
                {safeCtaButton.label}
                <ArrowRight className={`h-5 w-5 ${language === 'ar' ? 'mr-2 group-hover:-translate-x-1 rotate-180' : 'ml-2 group-hover:translate-x-1'} transition-transform`} />
              </Button>
            </a>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <StatCounter
                value={stat.value}
                suffix={stat.suffix}
                icon={stat.icon}
                label={stat.label}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsBand;
