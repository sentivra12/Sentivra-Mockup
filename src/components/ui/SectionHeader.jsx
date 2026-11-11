/**
 * SectionHeader - Shared component for consistent section headers
 * Used across mockups, services, and other pages
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function SectionHeader({
  eyebrow,
  heading,
  description,
  align = 'center',
  maxWidth = '60ch',
  className = '',
  children,
  language = 'en'
}) {
  const shouldReduceMotion = useReducedMotion();
  const isRTL = language === 'ar';
  
  // Animation variants that respect reduced motion - always render final state
  const fadeInUp = shouldReduceMotion 
    ? { opacity: 1, y: 0 }  // Final state immediately
    : { opacity: 0, y: 20 }; // Animated initial state
  
  const fadeInUpAnimate = { opacity: 1, y: 0 };
  
  const alignClass = align === 'center' ? 'text-center mx-auto' : 
                     align === 'left' ? (isRTL ? 'text-right mr-auto' : 'text-left ml-auto') :
                     align === 'right' ? (isRTL ? 'text-left ml-auto' : 'text-right mr-auto') : 'text-center mx-auto';

  return (
    <div className={`${alignClass} ${className}`} style={{ maxWidth }}>
      {eyebrow && (
        <motion.div
          initial={fadeInUp}
          whileInView={fadeInUpAnimate}
          viewport={{ once: true, margin: '-50px' }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6 }}
          className="mb-4"
        >
          <span className="inline-block font-mono text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 dark:border-cyan-400/20">
            {eyebrow}
          </span>
        </motion.div>
      )}
      
      {heading && (
        <motion.h2
          initial={fadeInUp}
          whileInView={fadeInUpAnimate}
          viewport={{ once: true, margin: '-50px' }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 text-primary-deep dark:text-white"
          style={{ 
            letterSpacing: language === 'ar' ? '0' : '-0.02em',
            fontWeight: 800 
          }}
        >
          {heading}
        </motion.h2>
      )}
      
      {description && (
        <motion.p
          initial={fadeInUp}
          whileInView={fadeInUpAnimate}
          viewport={{ once: true, margin: '-50px' }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2 }}
          className="text-lg leading-relaxed text-text-muted dark:text-slate-400"
        >
          {description}
        </motion.p>
      )}
      
      {children && (
        <motion.div
          initial={fadeInUp}
          whileInView={fadeInUpAnimate}
          viewport={{ once: true, margin: '-50px' }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.3 }}
          className="mt-6"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
