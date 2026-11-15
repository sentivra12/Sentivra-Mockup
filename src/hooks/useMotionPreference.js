/**
 * useMotionPreference - Single source of truth for motion settings
 * 
 * Resolution order:
 * 1. User override 'full' -> full mode
 * 2. User override 'reduced' -> calm mode
 * 3. Auto + OS reduce -> calm mode
 * 4. Auto + saveData/low-power -> full mode (but allowHeavy = false)
 * 5. Default -> full mode
 * 
 * Modes:
 * - 'full': All animations enabled
 * - 'calm': Gentle animations only (no parallax, tilt, loops, blur-ins)
 */

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sentivra-motion-preference';

export function useMotionPreference() {
  const [mode, setMode] = useState('full');
  const [reason, setReason] = useState('initializing');

  useEffect(() => {
    function resolveMotionMode() {
      // 1. Check user override (localStorage)
      const userPref = localStorage.getItem(STORAGE_KEY);
      
      if (userPref === 'full') {
        setMode('full');
        setReason('user-override-full');
        if (import.meta.env.DEV) {
          console.info('[Motion] Mode: FULL (user override)');
        }
        return 'full';
      }
      
      if (userPref === 'reduced') {
        setMode('calm');
        setReason('user-override-reduced');
        if (import.meta.env.DEV) {
          console.info('[Motion] Mode: CALM (user override)');
        }
        return 'calm';
      }

      // 2. Auto mode - check OS preference
      const osReducedMotion = 
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (osReducedMotion) {
        setMode('calm');
        setReason('os-reduced-motion');
        if (import.meta.env.DEV) {
          console.info('[Motion] Mode: CALM (OS prefers-reduced-motion)');
        }
        return 'calm';
      }

      // 3. Check performance hints (saveData doesn't change mode, just heavy flag)
      // This is handled in allowHeavy below
      
      // 4. Default: full animations
      setMode('full');
      setReason('default-full');
      if (import.meta.env.DEV) {
        console.info('[Motion] Mode: FULL (default)');
      }
      return 'full';
    }

    const resolved = resolveMotionMode();

    // Listen for OS preference changes (only matters in Auto mode)
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      const userPref = localStorage.getItem(STORAGE_KEY);
      if (!userPref || userPref === 'auto') {
        resolveMotionMode();
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    }

    // Apply to document root for CSS access
    document.documentElement.setAttribute('data-motion', resolved);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      }
    };
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        window.location.reload();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check for performance hints (affects allowHeavy, not mode)
  const saveData = 
    typeof navigator !== 'undefined' &&
    (navigator.connection?.saveData || 
     navigator.connection?.effectiveType === 'slow-2g');

  // Capabilities based on mode
  const capabilities = {
    // Heavy effects (parallax, tilt, large movement, blur-in, loops)
    // Disabled in calm mode OR if saveData is on
    allowHeavy: mode === 'full' && !saveData,
    
    // Continuous loops (marquees, orbits)
    allowLoop: mode === 'full' && !saveData,
    
    // Gentle effects (fades, soft glows, scale < 110%, slow transitions)
    allowGentle: true, // Always allowed
    
    // One-time animations (grow-once, fade-in-once, counter animation)
    allowOnce: true, // Always allowed
  };

  return {
    mode,           // 'full' | 'calm'
    reason,
    ...capabilities,
  };
}

/**
 * Drop-in replacement for framer-motion's useReducedMotion
 * Returns FALSE for calm mode (we want gentle animations)
 * Only returns true if animations should be completely disabled (never happens now)
 */
export function useReducedMotion() {
  const { mode } = useMotionPreference();
  // Return false - we always want some motion (full or calm)
  // Components will check allowHeavy/allowGentle for specifics
  return false;
}

/**
 * Set user motion preference (call from UI toggle)
 * @param {'auto' | 'full' | 'reduced'} preference
 */
export function setMotionPreference(preference) {
  if (preference === 'auto') {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, preference);
  }
  
  // Reload page to apply new preference
  window.location.reload();
}

/**
 * Get current user preference (for UI display)
 * @returns {'auto' | 'full' | 'reduced'}
 */
export function getMotionPreference() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'full') return 'full';
  if (stored === 'reduced') return 'reduced';
  return 'auto';
}
