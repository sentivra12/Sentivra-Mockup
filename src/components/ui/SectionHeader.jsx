/**
 * SectionHeader — SP brand edition
 * Eyebrow chip with SparkleInline, heading, description.
 * Always reaches final visible state (reduced-motion safe).
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useMotionPreference';
import { SparkleInline } from './Sparkle';

export default function SectionHeader({
  eyebrow,
  heading,
  description,
  align      = 'center',
  maxWidth   = '60ch',
  className  = '',
  children,
  language   = 'en',
}) {
  const shouldReduceMotion = useReducedMotion();
  const isRTL = language === 'ar';

  const initial  = shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 };
  const animate  = { opacity: 1, y: 0 };
  const noMotion = { duration: 0 };

  const alignClass =
    align === 'center' ? 'text-center mx-auto' :
    align === 'left'   ? (isRTL ? 'text-right' : 'text-left') :
                         (isRTL ? 'text-left'  : 'text-right');

  return (
    <div className={`${alignClass} ${className}`} style={{ maxWidth }}>

      {eyebrow && (
        <motion.div
          initial={initial}
          whileInView={animate}
          viewport={{ once: true, margin: '-50px' }}
          transition={shouldReduceMotion ? noMotion : { duration: 0.5 }}
          className="mb-4"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 dark:bg-brand-400/15 text-brand-700 dark:text-brand-300 border border-brand-500/20 dark:border-brand-400/25">
            <SparkleInline size={12} />
            {eyebrow}
          </span>
        </motion.div>
      )}

      {heading && (
        <motion.h2
          initial={initial}
          whileInView={animate}
          viewport={{ once: true, margin: '-50px' }}
          transition={shouldReduceMotion ? noMotion : { duration: 0.55, delay: 0.08 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 text-brand-900 dark:text-white"
          style={{
            letterSpacing: language === 'ar' ? '0' : '-0.025em',
            fontWeight: 800,
          }}
        >
          {heading}
        </motion.h2>
      )}

      {description && (
        <motion.p
          initial={initial}
          whileInView={animate}
          viewport={{ once: true, margin: '-50px' }}
          transition={shouldReduceMotion ? noMotion : { duration: 0.55, delay: 0.16 }}
          className="text-lg leading-relaxed text-brand-700/70 dark:text-brand-300/70"
        >
          {description}
        </motion.p>
      )}

      {children && (
        <motion.div
          initial={initial}
          whileInView={animate}
          viewport={{ once: true, margin: '-50px' }}
          transition={shouldReduceMotion ? noMotion : { duration: 0.55, delay: 0.24 }}
          className="mt-6"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
