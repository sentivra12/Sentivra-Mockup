/**
 * PageTransition Component
 * Wraps page content with smooth enter/exit animations
 * Provides consistent transitions across all pages
 */

import React from 'react';
import { motion } from 'framer-motion';
import { pageTransitionVariants } from '../hooks/useScrollAnimation';

const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitionVariants}
      className={className}
      style={{ minHeight: '100vh', opacity: 1 }} // Fallback: ensure visible even if animation fails
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
