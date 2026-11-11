/**
 * ScrollProgress Component
 * Shows a thin progress bar at the top of the page indicating scroll progress
 * Premium feel like Medium, Linear, and Stripe
 */

import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  
  // Smooth spring animation
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500 origin-left z-[100]"
      style={{ scaleX }}
    />
  );
};

export default ScrollProgress;
