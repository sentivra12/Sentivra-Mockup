/**
 * Sparkle — four-point star SVG accent
 *
 * Use sparingly: eyebrow chips, key headline words, dividers,
 * hero stage, loaders. Pulses when motion is allowed; static otherwise.
 *
 * Props:
 *   size       — px size of the SVG bounding box   default: 20
 *   color      — fill color                        default: 'currentColor'
 *   glow       — show soft bloom halo              default: true
 *   animate    — override motion (undefined = auto from prefers-reduced-motion)
 *   className  — extra classes
 */

import React from 'react';
import { useReducedMotion } from '@/hooks/useMotionPreference';

let _id = 0;
const uid = () => `sp-${++_id}`;

export default function Sparkle({
  size      = 20,
  color     = 'currentColor',
  glow      = true,
  animate,
  className = '',
  style     = {},
}) {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = animate !== undefined ? animate : !shouldReduceMotion;

  const filterId = React.useRef(uid()).current;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={[
        'inline-block flex-shrink-0',
        shouldAnimate ? 'animate-sparkle-pulse' : '',
        className,
      ].join(' ')}
      style={style}
    >
      <defs>
        {glow && (
          <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Soft glow bloom */}
      {glow && (
        <ellipse
          cx="12" cy="12"
          rx="6" ry="6"
          fill={color}
          opacity="0.20"
          filter={`url(#${filterId})`}
        />
      )}

      {/* Four-point star — same construction as logo sparkle */}
      <path
        d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * SparkleInline — tiny sparkle for use inside text (eyebrows, chips).
 * Aligns to text baseline.
 */
export function SparkleInline({ size = 14, className = '' }) {
  return (
    <Sparkle
      size={size}
      color="var(--brand-500)"
      glow={false}
      className={`align-middle -mt-0.5 ${className}`}
    />
  );
}
