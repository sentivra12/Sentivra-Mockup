/**
 * BrandBackground — emerald gradient + grain overlay
 *
 * Absolute layer for heroes, CTA bands, footers.
 * pointer-events:none, aria-hidden, zero CLS (pure CSS, no image requests).
 *
 * Props:
 *   className — extra classes on the wrapper
 *   grain     — grain noise overlay            default: true
 *   aurora    — drifting glow blobs            default: true
 *   grid      — faint perspective floor grid   default: false
 *   beam      — slow diagonal light-beam sweep default: false
 *   darkMode  — force deep-emerald dark style  default: false
 *              (auto in .dark class context anyway, but useful for sections
 *               that are always-dark regardless of theme)
 */

import React from 'react';
import { useReducedMotion } from '@/hooks/useMotionPreference';

export default function BrandBackground({
  className = '',
  grain     = true,
  aurora    = true,
  grid      = false,
  beam      = false,
  darkMode  = false,
}) {
  const shouldReduceMotion = useReducedMotion();
  const animate = !shouldReduceMotion;

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* ── Base gradient ───────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0D9E82 0%, #06796A 40%, #055A4F 70%, #02231E 100%)',
        }}
      />

      {/* ── Grain / noise ───────────────────────────────────────────── */}
      {grain && (
        <div
          className="absolute inset-0 mix-blend-overlay opacity-[0.06]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
          }}
        />
      )}

      {/* ── Aurora blobs ────────────────────────────────────────────── */}
      {aurora && animate && (
        <>
          <div
            className="absolute -top-1/4 -left-1/4 w-[60%] h-[60%] rounded-full blur-[120px] opacity-30 animate-pulse-slow"
            style={{ background: 'radial-gradient(circle, #26B59A 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-1/4 -right-1/4 w-[50%] h-[50%] rounded-full blur-[100px] opacity-25 animate-pulse-slow"
            style={{
              background: 'radial-gradient(circle, #055A4F 0%, transparent 70%)',
              animationDelay: '1.5s',
            }}
          />
          {/* Extra hero blob — centre-top teal highlight */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[35%] rounded-full blur-[90px] opacity-20 animate-pulse-slow"
            style={{
              background: 'radial-gradient(circle, #0D9E82 0%, transparent 70%)',
              animationDelay: '0.8s',
            }}
          />
        </>
      )}

      {/* Aurora static fallback for reduced-motion */}
      {aurora && !animate && (
        <>
          <div
            className="absolute -top-1/4 -left-1/4 w-[60%] h-[60%] rounded-full blur-[120px] opacity-20"
            style={{ background: 'radial-gradient(circle, #26B59A 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-1/4 -right-1/4 w-[50%] h-[50%] rounded-full blur-[100px] opacity-15"
            style={{ background: 'radial-gradient(circle, #055A4F 0%, transparent 70%)' }}
          />
        </>
      )}

      {/* ── Perspective floor grid ───────────────────────────────────── */}
      {grid && (
        <div
          className="absolute inset-x-0 bottom-0 h-[55%] opacity-[0.045]"
          style={{
            backgroundImage: [
              'linear-gradient(rgba(178,240,224,0.5) 1px, transparent 1px)',
              'linear-gradient(90deg, rgba(178,240,224,0.5) 1px, transparent 1px)',
            ].join(', '),
            backgroundSize: '80px 80px',
            transform: 'perspective(600px) rotateX(55deg)',
            transformOrigin: 'bottom center',
            /* Fade the grid out at top so it blends */
            WebkitMaskImage:
              'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
            maskImage:
              'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
          }}
        />
      )}

      {/* ── Diagonal light-beam sweep ────────────────────────────────── */}
      {beam && animate && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ zIndex: 1 }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              left: 0,
              width: '30%',
              height: '140%',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(178,240,224,0.07) 50%, transparent 100%)',
              animation: 'beam-sweep 8s ease-in-out 1.2s infinite',
              willChange: 'transform',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
}
