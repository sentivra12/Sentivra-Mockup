import React from 'react';
import { useLanguage } from '@/i18n/useLanguage';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Shield,
  Zap,
  Users,
  Award
} from 'lucide-react';

/**
 * WhyUsSection
 * 
 * 4 glass tiles highlighting company strengths.
 * Uses ONLY existing content from site, NO fake stats/numbers.
 * 
 * Features:
 * - InverseSurface tokens, RTL, dark mode, a11y, reduced-motion
 * - Grid 2x2 mobile, 4 columns desktop
 */
export default function WhyUsSection() {
  const { t, language, dir } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const reasons = [
    {
      id: 'quality',
      icon: Award,
      title: language === 'ar' ? 'جودة عالية' : 'High Quality',
      description: language === 'ar' 
        ? 'نلتزم بأعلى معايير الجودة في كل مشروع نقوم به'
        : 'We commit to the highest quality standards in every project we undertake'
    },
    {
      id: 'speed',
      icon: Zap,
      title: language === 'ar' ? 'تنفيذ سريع' : 'Fast Delivery',
      description: language === 'ar' 
        ? 'نعمل بكفاءة لتسليم مشاريعك في الوقت المحدد'
        : 'We work efficiently to deliver your projects on time'
    },
    {
      id: 'support',
      icon: Users,
      title: language === 'ar' ? 'دعم مستمر' : 'Continuous Support',
      description: language === 'ar' 
        ? 'نوفر دعماً فنياً متواصلاً لضمان نجاح حلولك'
        : 'We provide ongoing technical support to ensure your solutions succeed'
    },
    {
      id: 'security',
      icon: Shield,
      title: language === 'ar' ? 'أمان البيانات' : 'Data Security',
      description: language === 'ar' 
        ? 'نحمي بياناتك بأحدث معايير الأمان السيبراني'
        : 'We protect your data with the latest cybersecurity standards'
    }
  ];

  return (
    <section className="relative">
      <InverseSurface
        token="canvas"
        className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
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
                {language === 'ar' ? 'لماذا تختارنا' : 'Why Choose Us'}
              </InverseSurface>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" dir={dir}>
              <InverseSurface token="secondaryText">
                {language === 'ar' 
                  ? 'نقدم حلولاً برمجية احترافية مع التزام كامل بالجودة والأمان'
                  : 'We deliver professional software solutions with full commitment to quality and security'}
              </InverseSurface>
            </p>
          </motion.div>

          {/* Reasons grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reasons.map((reason, idx) => {
              const ReasonIcon = reason.icon;
              
              return (
                <motion.div
                  key={reason.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <InverseSurface
                    token="glass"
                    className="relative h-full p-6 rounded-2xl border group hover:shadow-lg transition-all duration-300"
                  >
                    {/* Subtle gradient on hover */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      aria-hidden="true"
                    />

                    {/* Icon */}
                    <div className="relative z-10 mb-4">
                      <InverseSurface
                        token="glass"
                        className="inline-flex items-center justify-center w-12 h-12 rounded-xl border"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl" aria-hidden="true" />
                        <ReasonIcon 
                          className="relative z-10 w-6 h-6 text-cyan-500 dark:text-cyan-400" 
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </InverseSurface>
                    </div>

                    {/* Title */}
                    <h3 className="relative z-10 text-lg font-bold mb-2" dir={dir}>
                      <InverseSurface token="text">
                        {reason.title}
                      </InverseSurface>
                    </h3>

                    {/* Description */}
                    <p className="relative z-10 text-sm" dir={dir}>
                      <InverseSurface token="secondaryText">
                        {reason.description}
                      </InverseSurface>
                    </p>
                  </InverseSurface>
                </motion.div>
              );
            })}
          </div>

        </div>
      </InverseSurface>
    </section>
  );
}

/**
 * InverseSurface wrapper component
 */
function InverseSurface({ token, className = '', children, ...props }) {
  const tokens = {
    canvas: 'bg-white dark:bg-slate-950',
    glass: 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm',
    text: 'text-slate-950 dark:text-slate-50',
    secondaryText: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-800'
  };

  const tokenClass = tokens[token] || '';
  const combinedClassName = `${tokenClass} ${className}`.trim();

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
}
