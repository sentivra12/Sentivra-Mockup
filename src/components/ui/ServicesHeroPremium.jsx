import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/useLanguage';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { 
  Code, 
  Smartphone, 
  Layers, 
  Database, 
  BarChart3, 
  Bot,
  Sparkles,
  ArrowRight
} from 'lucide-react';

// Map icon names to actual components
const iconMap = {
  Code,
  Smartphone,
  Layers,
  Database,
  BarChart3,
  Bot
};

/**
 * ServicesHeroPremium
 * 
 * Premium hero with:
 * - Eyebrow chip with pulsing dot
 * - Headline with gradient + shimmer + hand-drawn underline
 * - Services orbit stage (central glass card with logo, orbiting service icons, floating UI cards)
 * - InverseSurface tokens, RTL, dark mode, a11y, reduced-motion
 */
export default function ServicesHeroPremium({ services = [] }) {
  const { t, language, dir } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Active services with icons for orbit
  const activeServices = services
    .filter(s => s.is_active)
    .slice(0, 6) // Max 6 for clean orbit
    .map(s => ({
      id: s.id,
      title: language === 'ar' && s.title_ar ? s.title_ar : s.title_en || s.title,
      icon: s.icon || 'Code'
    }));

  // Floating UI cards data
  const floatingCards = [
    { 
      id: 'code',
      icon: Code,
      label: language === 'ar' ? 'كود نظيف' : 'Clean Code',
      position: { top: '15%', left: '8%', rotate: -6 },
      delay: 0
    },
    { 
      id: 'dashboard',
      icon: BarChart3,
      label: language === 'ar' ? 'لوحة التحكم' : 'Dashboard',
      position: { top: '45%', right: '5%', rotate: 4 },
      delay: 0.15
    },
    { 
      id: 'mobile',
      icon: Smartphone,
      label: language === 'ar' ? 'تطبيق جوال' : 'Mobile App',
      position: { bottom: '20%', left: '10%', rotate: -4 },
      delay: 0.3
    },
    { 
      id: 'database',
      icon: Database,
      label: language === 'ar' ? 'قاعدة بيانات' : 'Database',
      position: { bottom: '15%', right: '8%', rotate: 6 },
      delay: 0.45
    }
  ];

  return (
    <section className="relative overflow-hidden">
      <InverseSurface
        token="canvas"
        className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28"
      >
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {/* Radial gradient */}
          <InverseSurface
            token="subtleFill"
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 rounded-full blur-3xl opacity-30"
          />
          
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px'
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center">
            
            {/* Eyebrow chip with pulsing dot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <InverseSurface
                token="glass"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
              >
                {!shouldReduceMotion && (
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                )}
                <InverseSurface token="secondaryText" className="text-sm font-medium">
                  {language === 'ar' ? 'خدماتنا البرمجية' : 'Our Software Services'}
                </InverseSurface>
              </InverseSurface>
            </motion.div>

            {/* Headline with gradient + shimmer + underline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 max-w-4xl"
              style={{ 
                letterSpacing: language === 'ar' ? '0' : '-0.02em',
                lineHeight: 1.1
              }}
            >
              <InverseSurface token="text" className="inline">
                {language === 'ar' ? 'نبني ' : 'We Build '}
              </InverseSurface>
              <span className="relative inline-block">
                <span 
                  className="bg-gradient-to-r from-slate-600 via-cyan-500 to-slate-600 dark:from-slate-300 dark:via-cyan-400 dark:to-slate-300 bg-clip-text text-transparent bg-[length:200%_100%]"
                  style={{
                    animation: shouldReduceMotion ? 'none' : 'shimmer 3s linear infinite'
                  }}
                >
                  {language === 'ar' ? 'حلولاً برمجية' : 'Software Solutions'}
                </span>
                {/* Hand-drawn underline */}
                {!shouldReduceMotion && (
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-cyan-500/40 dark:text-cyan-400/40"
                    viewBox="0 0 300 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <motion.path
                      d="M2 6C50 3, 100 8, 150 5C200 2, 250 7, 298 5"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: 0.8, ease: 'easeInOut' }}
                    />
                  </svg>
                )}
              </span>
              <InverseSurface token="text" className="inline">
                {language === 'ar' ? ' تحول أعمالك' : ' That Transform Your Business'}
              </InverseSurface>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl max-w-2xl mb-12"
            >
              <InverseSurface token="secondaryText">
                {language === 'ar' 
                  ? 'من تطبيقات الويب إلى الذكاء الاصطناعي، نقدم خدمات تقنية متكاملة لتحقيق أهدافك الرقمية'
                  : 'From web applications to AI solutions, we deliver comprehensive technology services to achieve your digital goals'}
              </InverseSurface>
            </motion.p>

            {/* Services Orbit Stage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative w-full max-w-3xl aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/9] mb-8"
            >
              {/* Central glass card with logo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <InverseSurface
                  token="glass"
                  className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border flex items-center justify-center shadow-lg"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-2xl" aria-hidden="true" />
                  
                  {/* Logo placeholder - replace with actual logo */}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-500" strokeWidth={1.5} aria-hidden="true" />
                    <InverseSurface token="text" className="text-xs sm:text-sm font-bold tracking-tight">
                      Sentivra
                    </InverseSurface>
                  </div>
                </InverseSurface>
              </div>

              {/* Orbiting service icons */}
              {activeServices.length > 0 && (
                <div className="absolute inset-0">
                  {activeServices.map((service, idx) => {
                    const angle = (idx / activeServices.length) * 360;
                    const radius = 45; // percentage
                    const x = 50 + radius * Math.cos((angle - 90) * (Math.PI / 180));
                    const y = 50 + radius * Math.sin((angle - 90) * (Math.PI / 180));
                    
                    const IconComponent = iconMap[service.icon] || Code;

                    return (
                      <motion.div
                        key={service.id}
                        className="absolute"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          rotate: shouldReduceMotion ? 0 : [0, 360]
                        }}
                        transition={{
                          opacity: { duration: 0.4, delay: 0.6 + idx * 0.1 },
                          scale: { duration: 0.4, delay: 0.6 + idx * 0.1 },
                          rotate: shouldReduceMotion 
                            ? { duration: 0 }
                            : {
                                duration: 20,
                                repeat: Infinity,
                                ease: 'linear'
                              }
                        }}
                      >
                        <InverseSurface
                          token="glass"
                          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border flex items-center justify-center group hover:scale-110 transition-transform"
                          title={service.title}
                        >
                          {/* Icon glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                          
                          <IconComponent 
                            className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-500 dark:text-cyan-400 relative z-10" 
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                        </InverseSurface>

                        {/* Connection line to center */}
                        {!shouldReduceMotion && (
                          <svg
                            className="absolute top-1/2 left-1/2 w-full h-full pointer-events-none"
                            style={{
                              transform: 'translate(-50%, -50%)',
                              width: `${Math.abs(50 - x)}%`,
                              height: `${Math.abs(50 - y)}%`
                            }}
                            aria-hidden="true"
                          >
                            <motion.line
                              x1={x > 50 ? '100%' : '0%'}
                              y1={y > 50 ? '100%' : '0%'}
                              x2={x > 50 ? '0%' : '100%'}
                              y2={y > 50 ? '0%' : '100%'}
                              className="stroke-current text-cyan-500/20 dark:text-cyan-400/20"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              transition={{ duration: 0.8, delay: 0.8 + idx * 0.1 }}
                            />
                          </svg>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Floating UI cards */}
              {!shouldReduceMotion && floatingCards.map((card) => {
                const CardIcon = card.icon;
                return (
                  <motion.div
                    key={card.id}
                    className="absolute hidden lg:flex"
                    style={card.position}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      rotate: card.position.rotate
                    }}
                    transition={{
                      opacity: { duration: 0.5, delay: 1 + card.delay },
                      y: { duration: 0.5, delay: 1 + card.delay }
                    }}
                  >
                    <InverseSurface
                      token="glass"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border shadow-lg backdrop-blur-sm"
                    >
                      <CardIcon className="w-4 h-4 text-cyan-500 dark:text-cyan-400" strokeWidth={1.5} aria-hidden="true" />
                      <InverseSurface token="text" className="text-xs font-medium whitespace-nowrap">
                        {card.label}
                      </InverseSurface>
                    </InverseSurface>
                  </motion.div>
                );
              })}
            </motion.div>

          </div>
        </div>
      </InverseSurface>

      {/* Shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  );
}

/**
 * InverseSurface wrapper component
 * Maps design tokens to Tailwind classes
 */
function InverseSurface({ token, className = '', children, ...props }) {
  const tokens = {
    canvas: 'bg-white dark:bg-slate-950',
    glass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm',
    subtleFill: 'bg-cyan-500/10 dark:bg-cyan-400/10',
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
