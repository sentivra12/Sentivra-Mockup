/**
 * ScrollProgressBar - Thin progress line under navbar
 * Shows page scroll progress
 */

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setIsVisible(latest > 0.01);
    });
    
    return () => unsubscribe();
  }, [scrollYProgress]);
  
  if (shouldReduceMotion) return null;
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 origin-left"
      style={{ 
        scaleX,
        opacity: isVisible ? 1 : 0
      }}
      transition={{ opacity: { duration: 0.2 } }}
    />
  );
}
