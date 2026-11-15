/**
 * Logo — SP brand mark
 *
 * SP LOGO PLACEHOLDER — replace with official file when provided.
 * The mark is derived from the brand image: bold italic interlocked SP
 * monogram + four-point sparkle, on the emerald gradient.
 *
 * Variants:
 *   full        — gradient badge + "Sentivra" wordmark (navbar, footer)
 *   monogram    — badge only, no text (favicon, loaders, tight spaces)
 *   light       — white mark, transparent bg  (on dark/inverse surfaces)
 *   dark        — deep-emerald mark, transparent bg (on light surfaces)
 *
 * Props:
 *   variant     — 'full' | 'monogram' | 'light' | 'dark'   default: 'full'
 *   size        — badge height in px                        default: 40
 *   className   — extra classes on the wrapper
 *   wordmark    — override wordmark text                    default: 'Sentivra'
 */

import React from 'react';

/* ── The SP monogram as an inline SVG ─────────────────────────────────────
   Geometric bold italic construction matching the brand image.
   Rendered at 100×80 internal viewport; scaled via height prop.
──────────────────────────────────────────────────────────────────────────── */
const SPMark = ({ markColor = '#FFFFFF', showBg = true, size = 40 }) => {
  const bgId   = `sp-bg-${showBg ? 'grad' : 'none'}-${size}`;
  const glowId = `sp-glow-${size}`;
  const height = size;
  const width  = Math.round(size * 1.25); // 5:4 aspect

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        {/* Brand gradient — matches logo image (top-left teal → bottom-right deep) */}
        <linearGradient id={bgId} x1="0" y1="0" x2="100" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0D9E82" />
          <stop offset="55%"  stopColor="#06796A" />
          <stop offset="100%" stopColor="#044D40" />
        </linearGradient>

        {/* Sparkle soft glow */}
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feComposite  in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background rounded square */}
      {showBg && (
        <rect x="0" y="0" width="100" height="80" rx="14" fill={`url(#${bgId})`} />
      )}

      {/* ── S letter — bold italic with rounded terminals ─────────────────── */}
      {/* Top arc of S */}
      <path
        d="M62 18 C62 18 52 14 42 18 C32 22 28 30 32 36 C36 42 44 44 52 46 C60 48 66 51 64 57 C62 63 52 66 42 62"
        stroke={markColor}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* ── P letter — overlapping, offset down and right ──────────────────── */}
      <path
        d="M36 30 L36 66"
        stroke={markColor}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M36 30 C36 30 54 28 58 36 C62 44 50 50 36 48"
        stroke={markColor}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* ── Four-point sparkle (top-right of monogram) ────────────────────── */}
      {/* Soft glow bloom behind sparkle */}
      <ellipse
        cx="74" cy="20"
        rx="8" ry="8"
        fill="#B2F0E0"
        opacity="0.35"
        filter={`url(#${glowId})`}
      />
      {/* Four-point star paths */}
      <path
        d="M74 11 L75.5 18.5 L83 20 L75.5 21.5 L74 29 L72.5 21.5 L65 20 L72.5 18.5 Z"
        fill={markColor}
        opacity="0.95"
      />
    </svg>
  );
};

/* ── Main Logo component ───────────────────────────────────────────────── */
export default function Logo({
  variant  = 'full',
  size     = 40,
  className = '',
  wordmark = 'Sentivra',
}) {
  /* monogram — badge + gradient bg, no text */
  if (variant === 'monogram') {
    return (
      <span className={`inline-flex items-center ${className}`} aria-label="Sentivra logo">
        <SPMark size={size} markColor="#FFFFFF" showBg />
      </span>
    );
  }

  /* light — white mark on transparent bg (for dark surfaces) */
  if (variant === 'light') {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`} aria-label="Sentivra logo">
        <SPMark size={size} markColor="#FFFFFF" showBg={false} />
        {wordmark && (
          <span
            className="font-extrabold tracking-tight text-white"
            style={{ fontSize: size * 0.6, lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {wordmark}
          </span>
        )}
      </span>
    );
  }

  /* dark — deep-emerald mark on transparent bg (for light surfaces) */
  if (variant === 'dark') {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`} aria-label="Sentivra logo">
        <SPMark size={size} markColor="#044D40" showBg={false} />
        {wordmark && (
          <span
            className="font-extrabold tracking-tight"
            style={{
              fontSize: size * 0.6,
              lineHeight: 1,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: '#02231E',
            }}
          >
            {wordmark}
          </span>
        )}
      </span>
    );
  }

  /* full (default) — gradient badge + wordmark, theme-aware text */
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label="Sentivra logo">
      <SPMark size={size} markColor="#FFFFFF" showBg />
      {wordmark && (
        <span
          className="font-extrabold tracking-tight text-brand-900 dark:text-white"
          style={{ fontSize: size * 0.575, lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {wordmark}
        </span>
      )}
    </span>
  );
}

/* Named re-exports for convenience */
export { SPMark };
