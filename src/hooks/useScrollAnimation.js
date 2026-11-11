/**
 * Custom React hooks for smooth scroll animations
 * Provides scroll-triggered animations, parallax effects, and progress tracking
 */

import { useEffect, useState, useRef } from 'react';
import { useScroll, useTransform, useSpring, useInView } from 'framer-motion';

/**
 * Track scroll progress for the entire page
 * @returns {Object} { scrollY, scrollYProgress }
 */
export const useScrollProgress = () => {
  const { scrollY, scrollYProgress } = useScroll();
  
  // Smooth spring animation for scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return { scrollY, scrollYProgress: smoothProgress };
};

/**
 * Create parallax effect for elements
 * @param {number} offset - Parallax offset multiplier (default: 50)
 * @returns {Object} Framer Motion style object
 */
export const useParallax = (offset = 50) => {
  const ref = useRef(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollY, [0, 1000], [0, offset]);
  const smoothY = useSpring(y, {
    stiffness: 100,
    damping: 30
  });

  return { ref, y: smoothY };
};

/**
 * Fade in element when it comes into view
 * @param {Object} options - Animation options
 * @returns {Object} { ref, isInView, controls }
 */
export const useFadeInOnScroll = (options = {}) => {
  const {
    threshold = 0.1,
    triggerOnce = true,
    margin = "-100px"
  } = options;

  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: triggerOnce,
    amount: threshold,
    margin
  });

  return { ref, isInView };
};

/**
 * Track if user is scrolling up or down
 * @returns {Object} { isScrollingDown, lastScrollY }
 */
export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState('down');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      if (Math.abs(scrollY - lastScrollY) < 10) {
        ticking = false;
        return;
      }

      setScrollDirection(scrollY > lastScrollY ? 'down' : 'up');
      setLastScrollY(scrollY);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY]);

  return {
    isScrollingDown: scrollDirection === 'down',
    isScrollingUp: scrollDirection === 'up',
    lastScrollY
  };
};

/**
 * Reveal animation variants for Framer Motion
 */
export const fadeInUpVariants = {
  hidden: { 
    opacity: 0, 
    y: 40 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] // Custom easing
    }
  }
};

export const fadeInVariants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

export const scaleInVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const slideInVariants = (direction = 'left') => {
  const directions = {
    left: { x: -40 },
    right: { x: 40 },
    up: { y: -40 },
    down: { y: 40 }
  };

  return {
    hidden: { 
      opacity: 0, 
      ...directions[direction]
    },
    visible: { 
      opacity: 1, 
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
};

/**
 * Stagger children animation
 */
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

/**
 * Page transition variants
 */
export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

/**
 * Smooth scroll to element with offset
 * @param {string} targetId - Element ID to scroll to
 * @param {number} offset - Offset from top (default: 80 for header)
 */
export const smoothScrollTo = (targetId, offset = 80) => {
  const element = document.getElementById(targetId);
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
};

/**
 * Hook to detect if element is near viewport
 * Useful for lazy loading or preloading
 * @param {number} threshold - Distance from viewport (default: 200px)
 * @returns {Object} { ref, isNearViewport }
 */
export const useIsNearViewport = (threshold = 200) => {
  const ref = useRef(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNear(entry.isIntersecting);
      },
      {
        rootMargin: `${threshold}px`
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return { ref, isNearViewport: isNear };
};

export default {
  useScrollProgress,
  useParallax,
  useFadeInOnScroll,
  useScrollDirection,
  fadeInUpVariants,
  fadeInVariants,
  scaleInVariants,
  slideInVariants,
  staggerContainerVariants,
  staggerItemVariants,
  pageTransitionVariants,
  smoothScrollTo,
  useIsNearViewport
};
