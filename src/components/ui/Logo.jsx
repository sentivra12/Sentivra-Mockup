/**
 * Logo — Sentivra brand mark
 *
 * Uses official PNG files from /public/brand/:
 *   sentivra-logo-white.png   — white mark, transparent bg (for dark surfaces)
 *   sentivra-logo-emerald.png — dark emerald mark, transparent bg (for light surfaces)
 *
 * Natural image dimensions: 873 × 593 px (width × height, landscape)
 * Aspect ratio: 873/593 ≈ 1.4722
 *
 * Props:
 *   variant   'auto'      theme-aware (white on dark, emerald on light) — default
 *             'light'     always white mark (for hard-coded dark surfaces)
 *             'full'      alias for 'light' — kept for call-site compat
 *             'dark'      always emerald mark (for hard-coded light surfaces)
 *   size      height in px                                               default: 36
 *   className extra classes on the outer <span>
 *   wordmark  false → mark only; string → override text; true/undefined → 'Sentivra'
 */

import React from 'react';

const W = 873;   // natural width
const H = 593;   // natural height

/* Pixel width for a given display height (keeps aspect ratio) */
const imgW = (h) => Math.round((h * W) / H);

export default function Logo({
  variant   = 'auto',
  size      = 36,
  className = '',
  wordmark,          // undefined | true | false | string
}) {
  const showWordmark = wordmark !== false;
  const wordmarkText = typeof wordmark === 'string' ? wordmark : 'Sentivra';

  /* ── The mark image ──────────────────────────────────────────────────── */
  const markImg = (src, alt) => (
    <img
      src={src}
      width={imgW(size)}
      height={size}
      alt={alt}
      decoding="async"
      draggable="false"
      style={{ height: size, width: imgW(size), objectFit: 'contain', flexShrink: 0 }}
    />
  );

  /* ── Wordmark text ───────────────────────────────────────────────────── */
  const wm = (colorClass) =>
    showWordmark && (
      <span
        className={`font-extrabold tracking-tight leading-none select-none ${colorClass}`}
        style={{
          fontSize : Math.round(size * 0.6),
          fontFamily: "'Plus Jakarta Sans', 'IBM Plex Sans Arabic', sans-serif",
        }}
        aria-hidden="true"
      >
        {wordmarkText}
      </span>
    );

  /* ── Wrapper ─────────────────────────────────────────────────────────── */
  const wrap = (children) => (
    <span
      className={`inline-flex items-center gap-[10px] ${className}`}
      aria-label={showWordmark ? undefined : 'Sentivra'}
      role={showWordmark ? undefined : 'img'}
    >
      {children}
    </span>
  );

  /* ── 'light' / 'full'  — always white mark (dark surface) ───────────── */
  if (variant === 'light' || variant === 'full') {
    return wrap(
      <>
        {markImg('/brand/sentivra-logo-white.png', '')}
        {wm('text-white')}
      </>
    );
  }

  /* ── 'dark'  — always emerald mark (light surface) ──────────────────── */
  if (variant === 'dark') {
    return wrap(
      <>
        {markImg('/brand/sentivra-logo-emerald.png', '')}
        {wm('text-brand-900 dark:text-white')}
      </>
    );
  }

  /* ── 'auto' (default) — CSS-toggled pair, theme-aware ───────────────── */
  // The site sets `class="dark"` on <html>; use Tailwind's dark: prefix.
  // Render both images; hide the one that doesn't match the active theme.
  return wrap(
    <>
      {/* White mark — visible in dark mode only */}
      <img
        src="/brand/sentivra-logo-white.png"
        width={imgW(size)}
        height={size}
        alt=""
        decoding="async"
        draggable="false"
        className="hidden dark:block"
        style={{ height: size, width: imgW(size), objectFit: 'contain', flexShrink: 0 }}
      />
      {/* Emerald mark — visible in light mode only */}
      <img
        src="/brand/sentivra-logo-emerald.png"
        width={imgW(size)}
        height={size}
        alt=""
        decoding="async"
        draggable="false"
        className="block dark:hidden"
        style={{ height: size, width: imgW(size), objectFit: 'contain', flexShrink: 0 }}
      />
      {/* Wordmark: white in dark, brand-900 in light */}
      {showWordmark && (
        <span
          className="font-extrabold tracking-tight leading-none select-none text-brand-900 dark:text-white"
          style={{
            fontSize : Math.round(size * 0.6),
            fontFamily: "'Plus Jakarta Sans', 'IBM Plex Sans Arabic', sans-serif",
          }}
          aria-hidden="true"
        >
          {wordmarkText}
        </span>
      )}
    </>
  );
}

/* ── Back-compat named exports ───────────────────────────────────────────
   HeroVisual, MiniStage, HomeHeroCarousel import SPMark by name.
   Redirect them to a simple img wrapper so nothing breaks.
─────────────────────────────────────────────────────────────────────────── */
export function SPMark({ size = 40 }) {
  const h = size;
  const w = imgW(h);
  /* On dark surfaces (InverseSurface, hero) always white */
  return (
    <span className="inline-flex items-center" aria-hidden="true">
      <img
        src="/brand/sentivra-logo-white.png"
        width={w}
        height={h}
        alt=""
        decoding="async"
        draggable="false"
        style={{ height: h, width: w, objectFit: 'contain' }}
      />
    </span>
  );
}
