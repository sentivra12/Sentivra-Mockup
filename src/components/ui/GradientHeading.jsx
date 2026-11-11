/**
 * GradientHeading - Shared gradient text with shimmer effect
 * Consistent across all pages
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function GradientHeading({ 
  children, 
  className = '',
  shimmer = true,
  underline = false,
  language = 'en'
}) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <span className={`relative inline-block ${className}`}>
      <span 
        className={`bg-gradient-to-r from-slate-600 via-cyan-500 to-slate-600 dark:from-slate-300 dark:via-cyan-400 dark:to-slate-300 bg-clip-text text-transparent ${
          shimmer && !shouldReduceMotion ? 'bg-[length:200%_100%] animate-shimmer' : ''
        }`}
        style={{
          animation: shimmer && !shouldReduceMotion ? 'shimmer 3s linear infinite' : 'none'
        }}
      >
        {children}
      </span>
      
      {underline && !shouldReduceMotion && (
        <svg
          className="absolute -bottom-2 left-0 w-full h-3 text-cyan-500/40 dark:text-cyan-400/40 pointer-events-none"
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
            transition={{ duration: 1.2, delay: 0.5, ease: 'easeInOut' }}
          />
        </svg>
      )}
      
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </span>
  );
}
