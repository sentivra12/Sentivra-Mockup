/**
 * GradientHeading — SP brand edition
 * Brand-teal → emerald gradient text fill with optional wavy underline.
 * Solid-colour fallback via text-brand-700 for forced-colors / no clip.
 * Shimmer animation only when motion is allowed.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useMotionPreference';

export default function GradientHeading({
  children,
  className  = '',
  shimmer    = true,
  underline  = false,
  language   = 'en',
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <span className={`relative inline-block ${className}`}>
      <span
        className={[
          // Gradient text — brand teal → deep emerald
          'bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700',
          'dark:from-brand-400 dark:via-brand-500 dark:to-brand-600',
          'bg-clip-text text-transparent',
          // Fallback: if bg-clip-text is unsupported the text-brand-700 shows
          'text-brand-700',
          // Shimmer animation
          shimmer && !shouldReduceMotion
            ? 'bg-[length:200%_100%] animate-shimmer'
            : '',
        ].filter(Boolean).join(' ')}
      >
        {children}
      </span>

      {/* Wavy underline */}
      {underline && (
        <svg
          className="absolute -bottom-2 left-0 w-full h-3 pointer-events-none"
          viewBox="0 0 300 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {shouldReduceMotion ? (
            <path
              d="M2 6C50 3,100 8,150 5C200 2,250 7,298 5"
              stroke="#0D9E82"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.5"
            />
          ) : (
            <motion.path
              d="M2 6C50 3,100 8,150 5C200 2,250 7,298 5"
              stroke="#0D9E82"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 1.1, delay: 0.4, ease: 'easeInOut' }}
            />
          )}
        </svg>
      )}
    </span>
  );
}
