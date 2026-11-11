import React from 'react';
import { useLanguage } from '@/i18n/useLanguage';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Search,
  Code,
  Rocket
} from 'lucide-react';

/**
 * HowWeWorkStrip
 * 
 * Compact horizontal strip showing 3 work process steps:
 * 1. Understand (Search icon)
 * 2. Design & Develop (Code icon)
 * 3. Launch & Support (Rocket icon)
 * 
 * Features:
 * - Connected by dashed line
 * - InverseSurface tokens, RTL, dark mode, a11y, reduced-motion
 */
export default function HowWeWorkStrip() {
  const { t, language, dir } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    {
      id: 'understand',
      icon: Search,
      title: language === 'ar' ? 'نفهم احتياجاتك' : 'Understand Your Needs',
      description: language === 'ar' 
        ? 'نستمع لأهدافك ونحلل متطلباتك بدقة'
        : 'We listen to your goals and analyze your requirements precisely'
    },
    {
      id: 'develop',
      icon: Code,
      title: language === 'ar' ? 'نصمم ونطور' : 'Design & Develop',
      description: language === 'ar' 
        ? 'نبني الحل البرمجي باستخدام أفضل التقنيات'
        : 'We build the solution using best-in-class technologies'
    },
    {
      id: 'launch',
      icon: Rocket,
      title: language === 'ar' ? 'نطلق وندعم' : 'Launch & Support',
      description: language === 'ar' 
        ? 'نضمن إطلاق ناجح ودعم مستمر'
        : 'We ensure successful launch and continuous support'
    }
  ];

  return (
    <section className="relative">
      <InverseSurface
        token="subtleCanvas"
        className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
      >
        <div className="max-w-7xl mx-auto">
          
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
                {language === 'ar' ? 'كيف نعمل' : 'How We Work'}
              </InverseSurface>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" dir={dir}>
              <InverseSurface token="secondaryText">
                {language === 'ar' 
                  ? 'نتبع منهجية واضحة لضمان نجاح مشروعك'
                  : 'We follow a clear methodology to ensure your project success'}
              </InverseSurface>
            </p>
          </motion.div>

          {/* Steps */}
          <div className="relative max-w-5xl mx-auto">
            {/* Connection line (desktop only) */}
            <div className="hidden md:block absolute top-16 left-0 right-0 h-[2px]" aria-hidden="true">
              <InverseSurface
                token="border"
                className="absolute inset-0"
                style={{
                  backgroundImage: 'linear-gradient(to right, currentColor 8px, transparent 8px)',
                  backgroundSize: '16px 2px',
                  backgroundRepeat: 'repeat-x'
                }}
              />
            </div>

            {/* Steps grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className="relative"
                  >
                    {/* Step card */}
                    <div className="relative z-10">
                      {/* Icon circle */}
                      <div className="flex justify-center mb-4">
                        <InverseSurface
                          token="glass"
                          className="relative w-16 h-16 rounded-full border flex items-center justify-center"
                        >
                          {/* Glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full" aria-hidden="true" />
                          
                          <StepIcon 
                            className="relative z-10 w-7 h-7 text-cyan-500 dark:text-cyan-400" 
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                        </InverseSurface>
                      </div>

                      {/* Step number badge */}
                      <div className="flex justify-center mb-3">
                        <InverseSurface
                          token="glass"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full border text-sm font-bold text-cyan-600 dark:text-cyan-400"
                        >
                          {idx + 1}
                        </InverseSurface>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-center mb-2" dir={dir}>
                        <InverseSurface token="text">
                          {step.title}
                        </InverseSurface>
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-center" dir={dir}>
                        <InverseSurface token="secondaryText">
                          {step.description}
                        </InverseSurface>
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </InverseSurface>
    </section>
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
    border: 'border-slate-300 dark:border-slate-700'
  };

  const tokenClass = tokens[token] || '';
  const combinedClassName = `${tokenClass} ${className}`.trim();

  return (
    <div className={combinedClassName} style={style} {...props}>
      {children}
    </div>
  );
}
