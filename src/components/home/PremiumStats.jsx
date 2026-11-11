/**
 * Premium Stats Section - Stripe/Linear Quality
 * Features:
 * - Animated counters with scroll trigger
 * - Glass morphism background
 * - Gradient accents
 * - Premium spacing and typography
 * - Bilingual support with Bidi component for numbers
 */

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import AnimatedCounter from '../AnimatedCounter';
import { useTranslation } from '../../i18n/useTranslation';
import * as LucideIcons from 'lucide-react';

const PremiumStatCard = ({ stat, index }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  // Resolve icon name to component
  const IconComponent = stat.icon && LucideIcons[stat.icon] ? LucideIcons[stat.icon] : null;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      className="relative group"
    >
      {/* Gradient glow on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-2xl blur-lg"
      />

      {/* Card Content */}
      <div className="relative bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-gray-700/50 p-8 transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-xl group-hover:shadow-primary/5">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl" />
        
        {/* Animated gradient accent */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.2
          }}
          className="absolute top-0 start-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl pointer-events-none"
        />

        <div className="relative space-y-3">
          {/* Icon (if available) */}
          {IconComponent && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 flex items-center justify-center border border-primary/30 mb-4 group-hover:scale-110 transition-transform duration-300"
            >
              <IconComponent className="w-7 h-7 text-primary dark:text-primary-strong" />
            </motion.div>
          )}

          {/* Number */}
          <div className="text-5xl md:text-6xl font-bold mb-2" style={{
            background: 'linear-gradient(135deg, var(--color-foreground) 0%, var(--color-primary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            <AnimatedCounter 
              value={stat.value} 
              suffix={stat.suffix || ''} 
              duration={2}
            />
          </div>

          {/* Label */}
          <div className="text-base font-semibold text-muted-foreground">
            {stat.label}
          </div>

          {/* Optional description */}
          {stat.description && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              whileHover={{ opacity: 1, height: 'auto' }}
              className="text-sm text-muted-foreground/80 leading-relaxed overflow-hidden"
            >
              {stat.description}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const PremiumStats = ({ stats = [] }) => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-200px" });

  // Default stats if none provided
  const defaultStats = [
    { id: 1, value: 150, suffix: '+', label: t('home.stats.projectsCompleted') || 'Projects Completed' },
    { id: 2, value: 50, suffix: '+', label: t('home.stats.happyClients') || 'Happy Clients' },
    { id: 3, value: 95, suffix: '%', label: t('home.stats.satisfaction') || 'Client Satisfaction' },
    { id: 4, value: 10, suffix: '+', label: t('home.stats.yearsExperience') || 'Years Experience' },
  ];

  const displayStats = stats.length > 0 ? stats : defaultStats;

  return (
    <section 
      ref={sectionRef}
      className="py-32 bg-gradient-to-b from-background to-surface relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
        backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
        backgroundSize: '64px 64px'
      }} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative"
      >
        {/* Section Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-strong border border-primary/20">
            {t('home.stats.label') || 'Our Impact'}
          </span>
        </motion.div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 ${
          displayStats.length === 5 
            ? 'lg:grid-cols-5' 
            : displayStats.length === 4 
            ? 'lg:grid-cols-4' 
            : displayStats.length === 3 
            ? 'lg:grid-cols-3' 
            : 'lg:grid-cols-2'
        }`}>
          {displayStats.map((stat, index) => (
            <PremiumStatCard
              key={stat.id}
              stat={stat}
              index={index}
            />
          ))}
        </div>

        {/* Optional: Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        />
      </motion.div>
    </section>
  );
};

export default PremiumStats;
