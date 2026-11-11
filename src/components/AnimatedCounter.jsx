import React, { useEffect, useRef, useState } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';
import { Bidi } from './ui/Bidi';

const AnimatedCounter = ({ value, suffix = '', className }) => {
  const ref = useRef(null);
  // Always start with the value as a string for SSR/JS-disabled fallback
  const [displayValue, setDisplayValue] = useState(() => Intl.NumberFormat('en-US').format(value));
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 100,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    // Reset to initial value if value prop changes
    setDisplayValue(Intl.NumberFormat('en-US').format(value));
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    // Defensive: Only animate if in view and value is a number
    if (!isInView || typeof value !== 'number') return;
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(Intl.NumberFormat('en-US').format(Math.max(0, Math.floor(latest))));
    });
    return unsubscribe;
  }, [springValue, isInView, value]);

  // Defensive: Always render the value as fallback for SSR/JS-disabled/mobile issues
  return (
    <span ref={ref} className={className} aria-label={`${displayValue}${suffix}`}>
      <Bidi>{displayValue}{suffix}</Bidi>
    </span>
  );
};

export default AnimatedCounter;


