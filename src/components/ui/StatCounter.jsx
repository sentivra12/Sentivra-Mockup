import React, { useEffect, useRef, useState } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

const StatCounter = ({ value, suffix = '', icon: Icon, label, duration = 2 }) => {
  const ref = useRef(null);
  const [displayValue, setDisplayValue] = useState('0');
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Check for reduced motion preference
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (isInView) {
      if (prefersReducedMotion) {
        // If user prefers reduced motion, set value immediately
        setDisplayValue(value.toString());
      } else {
        motionValue.set(parseInt(value));
      }
    }
  }, [motionValue, isInView, value, prefersReducedMotion]);

  useEffect(() => {
    if (!prefersReducedMotion) {
      const unsubscribe = springValue.on('change', (latest) => {
        setDisplayValue(Math.floor(latest).toString());
      });
      return unsubscribe;
    }
  }, [springValue, prefersReducedMotion]);

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">
        {displayValue}{suffix}
      </div>
      <p className="text-white/80 text-sm md:text-base">{label}</p>
    </div>
  );
};

export default StatCounter;


