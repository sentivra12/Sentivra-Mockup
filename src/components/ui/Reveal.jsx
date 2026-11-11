/**
 * Reveal - Shared scroll-triggered reveal animation
 * Used across all pages for consistent staged reveals
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function Reveal({ 
  children, 
  delay = 0,
  direction = 'up', // up, down, left, right, scale, fade
  className = '',
  once = true,
  margin = '-50px'
}) {
  const shouldReduceMotion = useReducedMotion();
  
  // If reduced motion is preferred, render without motion wrapper
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }
  
  const variants = {
    up: {
      initial: { opacity: 0, y: 40 },
      whileInView: { opacity: 1, y: 0 }
    },
    down: {
      initial: { opacity: 0, y: -40 },
      whileInView: { opacity: 1, y: 0 }
    },
    left: {
      initial: { opacity: 0, x: 40 },
      whileInView: { opacity: 1, x: 0 }
    },
    right: {
      initial: { opacity: 0, x: -40 },
      whileInView: { opacity: 1, x: 0 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.8 },
      whileInView: { opacity: 1, scale: 1 }
    },
    fade: {
      initial: { opacity: 0 },
      whileInView: { opacity: 1 }
    }
  };
  
  const selectedVariant = variants[direction] || variants.up;
  
  return (
    <motion.div
      initial={selectedVariant.initial}
      whileInView={selectedVariant.whileInView}
      viewport={{ once, margin }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.22, 1, 0.36, 1] // ease-out-expo
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * RevealStagger - For staggered children reveals
 */
export function RevealStagger({ 
  children, 
  staggerDelay = 0.1,
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }
  
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
