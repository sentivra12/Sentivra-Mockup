/**
 * HomeHeroMobile — phones only (≤768px)
 * Dark brand surface regardless of site theme. HEIGHT: 100svh (100vh fallback).
 *
 * Layout (flex-column, all in normal flow):
 *   clearance  — fixed header 68 + safe-area-top
 *   visual     — flex:1; sparkle row (fixed height) + text slots
 *   lockup     — logo wordmark, once, outside slides
 *   CTA        — 48px white pill
 *   controls   — 3-zone CSS grid: [wa-slot] [segments] [arrows]
 *   safe-area
 */

import React, {
  useState, useEffect, useRef, useMemo, useCallback,
} from 'react';
import { useTranslation }      from '@/i18n/useTranslation';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { useServices, useSiteSettings } from '@/hooks/useContent';
import { getHeroSlideCopy } from './heroSlideCopy';

/* ══════════════════════ TIMING ══════════════════════════════════════ */
const AUTOPLAY_MS     = 2800;
const SLIDE_LEAVE_MS  = 220;
const SLIDE_ENTER_MS  = 320;
const SPARKLE_MS      = 480;
const CALM_FADE_MS    = 180;

/* ══════════════════════ CSS injected once ═══════════════════════════ */
const CSS = `
@font-face {
  font-family: 'Cormorant Garamond';
  src: url('/fonts/cormorant-garamond-latin-700-italic.woff2') format('woff2');
  font-weight: 700; font-style: italic; font-display: swap;
  unicode-range: U+0020-007F,U+00A0-00FF,U+0100-017F,U+0180-024F,U+1E00-1EFF;
}
@font-face {
  font-family: 'Aref Ruqaa';
  src: url('/fonts/aref-ruqaa-arabic-700.woff2') format('woff2');
  font-weight: 700; font-style: normal; font-display: swap;
  unicode-range: U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF;
}

/* Root */
.hhm-root {
  height:100vh; height:100dvh; height:100svh;
  display:flex; flex-direction:column; overflow:hidden;
}

/* Slide crossfade — all slides in ONE grid cell */
.hhm-slide {
  grid-row:1; grid-column:1;
  display:flex; flex-direction:column; justify-content:flex-end;
  opacity:0; pointer-events:none; visibility:hidden;
  transition: opacity var(--slide-leave-ms) ease-out,
              transform var(--slide-leave-ms) ease-out;
}
.hhm-slide.hhm-active {
  opacity:1; pointer-events:auto; z-index:1; visibility:visible;
  transition: opacity var(--slide-enter-ms) cubic-bezier(.22,.61,.36,1),
              transform var(--slide-enter-ms) cubic-bezier(.22,.61,.36,1);
}
.hhm-slide.hhm-leaving {
  opacity:0; transform:translateY(-10px); visibility:visible;
  transition: opacity var(--slide-leave-ms) ease-out,
              transform var(--slide-leave-ms) ease-out;
}
[data-motion="calm"] .hhm-slide,
[data-motion="calm"] .hhm-slide.hhm-active,
[data-motion="calm"] .hhm-slide.hhm-leaving {
  transition: opacity var(--calm-fade-ms) ease-out;
  transform: none;
}

/* Per-element stagger */
.hhm-kw, .hhm-ttl, .hhm-dsc {
  opacity:0; transform:translateY(14px);
}
.hhm-active .hhm-kw {
  opacity:1; transform:none;
  transition: opacity var(--slide-enter-ms) cubic-bezier(.22,.61,.36,1),
              transform var(--slide-enter-ms) cubic-bezier(.22,.61,.36,1);
  transition-delay: 0ms;
}
.hhm-active .hhm-ttl {
  opacity:1; transform:none;
  transition: opacity var(--slide-enter-ms) cubic-bezier(.22,.61,.36,1),
              transform var(--slide-enter-ms) cubic-bezier(.22,.61,.36,1);
  transition-delay: 40ms;
}
.hhm-active .hhm-dsc {
  opacity:1; transform:none;
  transition: opacity var(--slide-enter-ms) cubic-bezier(.22,.61,.36,1),
              transform var(--slide-enter-ms) cubic-bezier(.22,.61,.36,1);
  transition-delay: 80ms;
}
[data-motion="calm"] .hhm-kw,
[data-motion="calm"] .hhm-ttl,
[data-motion="calm"] .hhm-dsc {
  transition: opacity var(--calm-fade-ms) ease-out;
  transform: none;
}

/* Progress bar */
@keyframes hhm-prog { from{transform:scaleX(0)} to{transform:scaleX(1)} }
.hhm-bar { transform-origin:left; transform:scaleX(0); }
.hhm-bar.hhm-fill  { animation:hhm-prog var(--autoplay-ms) linear forwards; }
.hhm-bar.hhm-pause { animation-play-state:paused; }
.hhm-bar.hhm-done  { transform:scaleX(1); animation:none; }

/* RTL bar fills right-to-left */
[dir="rtl"] .hhm-bar { transform-origin:right; }

/* Sparkle animations handled inline on SVG element (spin keyframes below) */

/* Glow drift */
@keyframes hhm-glow {
  0%,100%{ opacity:.36; transform:translateY(0) scale(1); }
  50%    { opacity:.50; transform:translateY(-8px) scale(1.1); }
}
.hhm-glow         { animation:hhm-glow 18s ease-in-out infinite; }
.hhm-glow.paused  { animation-play-state:paused; }
[data-motion="calm"] .hhm-glow { animation:none; opacity:.36; transform:none; }

/* Particles */
@keyframes hhm-far  { 0%{transform:translate3d(0,0,0)} 100%{transform:translate3d(14px,-30px,0)} }
@keyframes hhm-mid  { 0%{transform:translate3d(0,0,0)} 100%{transform:translate3d(18px,-36px,0)} }
@keyframes hhm-near { 0%{transform:translate3d(0,0,0)} 100%{transform:translate3d(-18px,38px,0)} }
@keyframes hhm-twkl { 0%,100%{opacity:var(--ob)} 50%{opacity:calc(var(--ob)*1.9)} }
.hhm-p-far  { animation:hhm-far  26s ease-in-out infinite alternate; animation-delay:-8s; }
.hhm-p-mid  { animation:hhm-mid  18s ease-in-out infinite alternate; animation-delay:-5s; }
.hhm-p-near { animation:hhm-near 12s ease-in-out infinite alternate; animation-delay:-3s; }
.hhm-p-far.paused,.hhm-p-mid.paused,.hhm-p-near.paused { animation-play-state:paused; }
[data-motion="calm"] .hhm-p-far  { animation:hhm-far  30s ease-in-out infinite alternate; animation-delay:-10s; }
[data-motion="calm"] .hhm-p-mid  { animation:hhm-mid  24s ease-in-out infinite alternate; animation-delay:-7s; }
[data-motion="calm"] .hhm-p-near { animation:hhm-near 20s ease-in-out infinite alternate; animation-delay:-5s; }
.hhm-twkl { animation:hhm-twkl 5s ease-in-out infinite; }

/* ── Sparkle spin keyframes ─────────────────────────────────────────
   Two identical pairs (a/b) so we can alternate the name on each slide
   change and force a reliable CSS animation restart.
   transform-origin is set inline on the SVG (50px 54px = viewBox center).
─────────────────────────────────────────────────────────────────────── */

/* CW (next): 0 → 360deg + scale pulse */
@keyframes hhm-spk-next-a {
  0%   { transform: rotate(0deg)   scale(1);    }
  40%  { transform: rotate(200deg) scale(1.12); }
  100% { transform: rotate(360deg) scale(1);    }
}
@keyframes hhm-spk-next-b {
  0%   { transform: rotate(0deg)   scale(1);    }
  40%  { transform: rotate(200deg) scale(1.12); }
  100% { transform: rotate(360deg) scale(1);    }
}

/* CCW (prev): 0 → -360deg + scale pulse */
@keyframes hhm-spk-prev-a {
  0%   { transform: rotate(0deg)    scale(1);    }
  40%  { transform: rotate(-200deg) scale(1.12); }
  100% { transform: rotate(-360deg) scale(1);    }
}
@keyframes hhm-spk-prev-b {
  0%   { transform: rotate(0deg)    scale(1);    }
  40%  { transform: rotate(-200deg) scale(1.12); }
  100% { transform: rotate(-360deg) scale(1);    }
}

/* Calm (reduced-motion): no rotation, tiny scale pulse only */
@keyframes hhm-spk-calm-a {
  0%,100% { transform: scale(1);    }
  50%     { transform: scale(1.04); }
}
@keyframes hhm-spk-calm-b {
  0%,100% { transform: scale(1);    }
  50%     { transform: scale(1.04); }
}

/* Glow opacity bump on slide change */
@keyframes hhm-glow-bump-a {
  0%   { opacity: 0.7; }
  35%  { opacity: 1;   }
  100% { opacity: 0.85;}
}
@keyframes hhm-glow-bump-b {
  0%   { opacity: 0.7; }
  35%  { opacity: 1;   }
  100% { opacity: 0.85;}
}
`;

let _cssInjected = false;
function injectCSS() {
  if (_cssInjected || typeof document === 'undefined') return;
  if (document.querySelector('[data-id="hhm"]')) { _cssInjected = true; return; }
  const s = document.createElement('style');
  s.dataset.id = 'hhm';
  s.textContent = CSS;
  document.head.appendChild(s);
  _cssInjected = true;
}

/* ══════════════════════ Sparkle ═════════════════════════════════════ */
const SPARKLE_D = 'M50 0 C52 30 70 47 100 50 C70 53 52 70 50 100 C48 70 30 53 0 50 C30 47 48 30 50 0 Z';

/**
 * SparkleVisual
 * Props:
 *   spinKey  — changes on every slide change (triggers animation restart)
 *   dir      — 'next' (CW +360) | 'prev' (CCW -360), already RTL-flipped by caller
 *   paused   — suspend animation when off-screen / tab hidden
 *   isCalm   — reduced-motion: no rotation, only scale pulse
 */
function SparkleVisual({ spinKey, dir, paused, isCalm }) {
  const gId = 'hhm-sg';

  /* Pick animation name. Alternating between two identical keyframe pairs
     forces the browser to restart the animation even when spinKey changes
     but dir stays the same. Even spinKey → variant 'a', odd → variant 'b'. */
  const variant = (spinKey % 2 === 0) ? 'a' : 'b';
  const animName = paused
    ? 'none'
    : isCalm
      ? `hhm-spk-calm-${variant}`
      : `hhm-spk-${dir === 'prev' ? 'prev' : 'next'}-${variant}`;

  const SPIN_DUR    = '700ms';
  const SPIN_EASE   = 'cubic-bezier(.22,.61,.36,1)';
  const CALM_DUR    = '400ms';

  return (
    /* Wrapper: NO overflow:hidden, NO background — just positions the SVG */
    <div
      className="hhm-spk-wrap"
      style={{
        position: 'relative',
        width:  'clamp(100px, 28vw, 160px)',
        height: '100%',
        maxHeight: 'inherit',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Soft radial glow — opacity bump on slide change */}
      <div
        className={`hhm-glow${paused ? ' paused' : ''}`}
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '240%', height: '240%',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(13,158,130,.22) 0%,rgba(13,158,130,.08) 40%,transparent 70%)',
          pointerEvents: 'none',
          /* Glow opacity bump uses same key/variant trick */
          animationName: paused ? 'none'
            : `hhm-glow-bump-${variant}`,
          animationDuration: isCalm ? CALM_DUR : SPIN_DUR,
          animationTimingFunction: SPIN_EASE,
          animationFillMode: 'forwards',
          animationIterationCount: 1,
        }}
      />
      {/* SVG — rotation applied here via animation */}
      <svg
        /* key forces DOM remount → clean animation start on rapid changes */
        key={`${spinKey}-${dir}`}
        style={{
          display: 'block',
          width: 'auto',
          height: '80%',
          maxHeight: '80%',
          position: 'relative',
          overflow: 'visible',
          transformOrigin: '50px 54px', /* center of viewBox (0 0 100 108) → (50,54) */
          animationName: animName,
          animationDuration: isCalm ? CALM_DUR : SPIN_DUR,
          animationTimingFunction: SPIN_EASE,
          animationFillMode: 'forwards',
          animationIterationCount: 1,
        }}
        viewBox="-2 -2 104 112"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gId} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%"   stopColor="#f2f7f5"/>
            <stop offset="50%"  stopColor="#d5dedb"/>
            <stop offset="100%" stopColor="#aeb9b6"/>
          </linearGradient>
        </defs>
        <path d={SPARKLE_D} fill={`url(#${gId})`}/>
      </svg>
    </div>
  );
}

/* ══════════════════════ Particles ═══════════════════════════════════ */
const DOTS = [
  [12,8,1.5,.45,'far'],[78,12,2,.50,'far'],[35,18,1.5,.42,'far'],
  [88,25,2,.48,'far'],[52,32,1.5,.40,'far'],[25,45,2,.52,'far'],
  [68,55,1.5,.46,'far'],[85,68,2,.50,'far'],[45,75,1.5,.44,'far'],
  [15,6,2.5,.62,'mid'],[92,15,2,.58,'mid'],[40,22,2.5,.65,'mid'],
  [62,35,2,.60,'mid'],[8,42,2.5,.68,'mid'],[75,52,2,.62,'mid'],
  [32,62,2.5,.70,'mid'],[90,72,2,.58,'mid'],[55,80,2.5,.66,'mid'],[20,85,2,.60,'mid'],
  [50,10,3,.78,'near'],[18,20,2.5,.75,'near'],[82,28,4,.85,'near'],
  [28,38,2.5,.72,'near'],[65,48,3,.80,'near'],[10,58,3.5,.82,'near'],
  [42,65,2.5,.76,'near'],[72,78,3,.84,'near'],[60,88,2.5,.74,'near'],
];
function Particles({ paused }) {
  const byLayer = { far:[], mid:[], near:[] };
  DOTS.forEach(d => byLayer[d[4]].push(d));
  const cls = (l) => `hhm-p-${l}${paused ? ' paused' : ''}`;
  return (
    <div aria-hidden="true"
      style={{ position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0 }}>
      {['far','mid','near'].map(layer => (
        <div key={layer} className={cls(layer)} style={{ position:'absolute',inset:0,willChange:'transform' }}>
          {byLayer[layer].map(([l,t,sz,op], i) => {
            const em = layer==='near' && i%3===0;
            return (
              <span key={i} className="hhm-twkl"
                style={{ '--ob':op, position:'absolute', left:`${l}%`, top:`${t}%`,
                  width:sz, height:sz, borderRadius:'50%',
                  background: em ? 'rgba(13,158,130,0.85)' : '#FFF',
                  boxShadow: em
                    ? `0 0 ${sz*1.6}px rgba(13,158,130,${op*.7})`
                    : `0 0 ${sz*1.4}px rgba(255,255,255,${op*.6})` }}/>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════ Skyline ═════════════════════════════════════ */
function CitySkyline() {
  return (
    <svg viewBox="0 0 414 80" preserveAspectRatio="none" aria-hidden="true"
      style={{ position:'absolute',bottom:0,left:0,right:0,
        width:'100%',height:'clamp(40px,7svh,68px)',
        pointerEvents:'none',zIndex:1,opacity:.9,filter:'brightness(0.7)' }}>
      <path fill="#021512" opacity="0.9"
        d="M0,80 L0,52 L10,52 L10,38 L18,38 L18,28 L26,28 L26,38 L34,38 L34,52
           L40,52 L40,42 L48,42 L48,30 L56,30 L56,20 L64,20 L64,30 L72,30 L72,42
           L78,42 L78,35 L86,35 L86,25 L94,25 L94,15 L102,15 L102,25 L110,25
           L110,35 L118,35 L118,45 L126,45 L126,32 L134,32 L134,20 L142,20
           L142,32 L150,32 L150,45 L156,45 L156,38 L164,38 L164,28 L172,28
           L172,38 L180,38 L180,52 L188,52 L188,40 L196,40 L196,22 L204,22
           L204,40 L212,40 L212,52 L218,52 L218,42 L226,42 L226,30 L234,30
           L234,42 L242,42 L242,55 L250,55 L250,38 L258,38 L258,25 L266,25
           L266,38 L274,38 L274,55 L280,55 L280,44 L288,44 L288,33 L296,33
           L296,44 L304,44 L304,56 L312,56 L312,42 L320,42 L320,28 L328,28
           L328,42 L336,42 L336,56 L344,56 L344,46 L352,46 L352,36 L360,36
           L360,46 L368,46 L368,58 L376,58 L376,48 L384,48 L384,36 L392,36
           L392,48 L400,48 L400,60 L414,60 L414,80 Z"/>
      <circle cx="62"  cy="24" r="1.2" fill="rgba(13,158,130,0.4)"/>
      <circle cx="98"  cy="18" r="1.2" fill="rgba(13,158,130,0.4)"/>
      <circle cx="200" cy="28" r="1.2" fill="rgba(13,158,130,0.4)"/>
      <circle cx="324" cy="32" r="1.2" fill="rgba(13,158,130,0.4)"/>
    </svg>
  );
}

/* ══════════════════════ AutoFit hook ════════════════════════════════
   Measures scrollWidth vs clientWidth after render and on resize.
   Scales font-size down in 0.5px steps to a floor so text fits 1 line.
   Usage: attach the returned ref to the element; pass initial/floor px.
══════════════════════════════════════════════════════════════════════ */
function useAutoFit(initialPx, floorPx, deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function fit() {
      // Reset to initial first
      el.style.fontSize = `${initialPx}px`;
      let size = initialPx;
      while (el.scrollWidth > el.clientWidth + 1 && size > floorPx) {
        size = Math.max(size - 0.5, floorPx);
        el.style.fontSize = `${size}px`;
      }
      if (el.scrollWidth > el.clientWidth + 1) {
        // eslint-disable-next-line no-console
        console.warn(`[HeroMobile] Text overflows at floor ${floorPx}px:`, el.textContent?.slice(0, 60));
      }
    }

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

/* ══════════════════════ Chevron icons ═══════════════════════════════ */
function ChevronLeft()  {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ══════════════════════ Single slide text row ═══════════════════════
   Renders keyword, headline, description each as single-line elements
   with auto-fit font scaling.
══════════════════════════════════════════════════════════════════════ */
const EN_HL_INIT = 20;    // px; CSS clamp sets initial, autoFit refines
const AR_HL_INIT = 24;
const EN_HL_FLOOR = 13;
const AR_HL_FLOOR = 14;
const EN_DESC_INIT = 14;
const AR_DESC_INIT = 14.5;
const EN_DESC_FLOOR = 13;
const AR_DESC_FLOOR = 14;

function SlideText({ slide, isRTL, isActive }) {
  // Keys for autoFit deps — re-run when text changes
  const hlDeps  = [slide.headline,    isRTL, isActive];
  const dscDeps = [slide.description, isRTL, isActive];

  const hlRef  = useAutoFit(isRTL ? AR_HL_INIT  : EN_HL_INIT,  isRTL ? AR_HL_FLOOR  : EN_HL_FLOOR,  hlDeps);
  const dscRef = useAutoFit(isRTL ? AR_DESC_INIT : EN_DESC_INIT, isRTL ? AR_DESC_FLOOR : EN_DESC_FLOOR, dscDeps);

  // Keyword font: clamp(44px, 12.5vw, 56px) — same for all slides
  const KW_LH = 1;

  // 1-line slot heights (precise, no wrapping allowed)
  const KW_H   = 'calc(56px * 1.0)';   // max keyword size × lh=1
  const HL_H   = isRTL ? '1.5em' : '1.3em'; // 1 line of headline
  const DSC_H  = '1.5em';

  const hlFont = isRTL
    ? "'Aref Ruqaa','Traditional Arabic',serif"
    : "'Cormorant Garamond',Georgia,'Times New Roman',serif";

  return (
    <>
      {/* ── KEYWORD ── fixed 1-line slot */}
      <div
        className="hhm-kw"
        data-slot="keyword"
        style={{
          flexShrink: 0,
          width: '100%',
          height: KW_H,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: isRTL ? 'flex-end' : 'flex-start',
          marginBottom: 8,
          overflow: 'hidden',
        }}
      >
        <span
          className="hhm-kw-text"
          style={{
            display: 'block',
            fontSize: 'clamp(44px, 12.5vw, 56px)',
            lineHeight: KW_LH,
            fontWeight: 700,
            fontFamily: "'Cormorant Garamond',Georgia,'Times New Roman',serif",
            color: '#eafaf5',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            /* text-align follows dir */
          }}
        >
          {slide.keyword}
        </span>
      </div>

      {/* ── HEADLINE — 1 line, auto-shrink */}
      <h2
        ref={hlRef}
        className="hhm-ttl hhm-headline"
        data-slot="headline"
        dir="auto"
        lang={isRTL ? 'ar' : 'en'}
        style={{
          flexShrink: 0,
          width: '100%',
          height: HL_H,
          margin: 0,
          marginBlockEnd: 6,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          fontSize: `${isRTL ? AR_HL_INIT : EN_HL_INIT}px`,
          fontWeight: 600,
          lineHeight: isRTL ? 1.5 : 1.3,
          color: '#FFFFFF',
          fontFamily: hlFont,
          fontStyle: isRTL ? 'normal' : 'italic',
          letterSpacing: 'normal',
          textAlign: isRTL ? 'right' : 'left',
        }}
      >
        {slide.headline}
      </h2>

      {/* ── DESCRIPTION — 1 line, auto-shrink */}
      <p
        ref={dscRef}
        className="hhm-dsc"
        data-slot="description"
        dir="auto"
        lang={isRTL ? 'ar' : 'en'}
        style={{
          flexShrink: 0,
          width: '100%',
          height: DSC_H,
          margin: 0,
          marginBlockEnd: 14,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          fontSize: `${isRTL ? AR_DESC_INIT : EN_DESC_INIT}px`,
          lineHeight: 1.5,
          color: 'rgba(255,255,255,0.72)',
          fontFamily: isRTL
            ? "'IBM Plex Sans Arabic',system-ui,sans-serif"
            : "'Plus Jakarta Sans',system-ui,sans-serif",
          letterSpacing: 'normal',
          textAlign: isRTL ? 'right' : 'left',
        }}
      >
        {slide.description}
      </p>
    </>
  );
}

/* ══════════════════════ MAIN ════════════════════════════════════════ */
export default function HomeHeroMobile({ hero }) {
  useEffect(() => { injectCSS(); }, []);

  const { language }        = useTranslation();
  const isRTL               = language === 'ar';
  const { mode }            = useMotionPreference();
  const isCalm              = mode === 'calm';

  const { data: rawServices = [] } = useServices();
  const { data: siteSettings }     = useSiteSettings();

  const whatsappNum = useMemo(
    () => (siteSettings?.whatsapp_number || '201558952126').replace(/\D/g, ''),
    [siteSettings],
  );

  /* ── Slides ──────────────────────────────────────────────────────── */
  const slides = useMemo(() => {
    const active = rawServices.filter(s => s.is_active !== false).slice(0, 6);
    if (active.length === 0) {
      const fb = getHeroSlideCopy(null, isRTL ? 'ar' : 'en');
      return [{ id:'fb', keyword: isRTL ? 'برامج' : 'SOFTWARE', ...fb }];
    }
    return active.map(s => {
      let kw = (s.slug || '').split('-')[0].toUpperCase() || s.title.split(/\s+/)[0].toUpperCase();
      kw = kw.slice(0, 7);
      const copy = getHeroSlideCopy({ ...s, keyword: kw }, isRTL ? 'ar' : 'en');
      return { id: s.id, keyword: kw, ...copy };
    });
  }, [rawServices, isRTL]);

  /* ── Carousel state ──────────────────────────────────────────────── */
  const total  = slides.length;
  const [active,  setActive]  = useState(0);
  const [leaving, setLeaving] = useState(-1);
  const [spkAlt,  setSpkAlt]  = useState(false);
  const [touching,setTouching]= useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (leaving === -1) return;
    const id = setTimeout(() => setLeaving(-1), 480);
    return () => clearTimeout(id);
  }, [leaving]);

  const sectionRef = useRef(null);
  const [inView, setInView] = useState(true);
  const [tabVis, setTabVis] = useState(true);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold:.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  useEffect(() => {
    const fn = () => setTabVis(!document.hidden);
    document.addEventListener('visibilitychange', fn);
    return () => document.removeEventListener('visibilitychange', fn);
  }, []);

  const canPlay = inView && tabVis && !touching && !focused && total > 1;

  const timerRef = useRef(null);

  /* ── Spin direction ──────────────────────────────────────────────── */
  const [spkDir, setSpkDir] = useState('next');

  useEffect(() => {
    if (!canPlay) { clearTimeout(timerRef.current); return; }
    timerRef.current = setTimeout(() => {
      setLeaving(active);
      setActive(p => (p + 1) % total);
      setSpkAlt(a => !a);
      setSpkDir('next');
    }, AUTOPLAY_MS);
    return () => clearTimeout(timerRef.current);
  }, [canPlay, total, active]);

  const goTo = useCallback((idx, dir = 'next') => {
    const next = ((idx % total) + total) % total;
    clearTimeout(timerRef.current);
    setLeaving(active);
    setActive(next);
    setSpkAlt(a => !a);
    setSpkDir(dir);
  }, [total, active]);
  const goPrev = useCallback(() => goTo(active - 1, 'prev'), [active, goTo]);
  const goNext = useCallback(() => goTo(active + 1, 'next'), [active, goTo]);

  /* Keyboard — RTL: ArrowLeft=next, ArrowRight=prev */
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'ArrowLeft')  isRTL ? goNext() : goPrev();
      if (e.key === 'ArrowRight') isRTL ? goPrev() : goNext();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [isRTL, goPrev, goNext]);

  /* Swipe — RTL: swipe-right=goNext (reveals previous in LTR logic, but reversed) */
  const swipeX = useRef(0);
  const onTouchStart = (e) => { setTouching(true);  swipeX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    setTouching(false);
    const dx = e.changedTouches[0].clientX - swipeX.current;
    if (Math.abs(dx) > 44) {
      // LTR: swipe-right=prev, swipe-left=next. RTL: mirrored.
      (dx > 0 ? (isRTL ? goNext : goPrev) : (isRTL ? goPrev : goNext))();
    }
  };

  /* ── Design tokens ───────────────────────────────────────────────── */
  const EM   = '#0D9E82';
  const FONT = "'Plus Jakarta Sans','IBM Plex Sans Arabic',system-ui,sans-serif";
  const paused = !inView || !tabVis;

  /* WA slot width = 56px button + 12px gap = 68px */
  const WA_SLOT = 68;

  return (
    <section
      ref={sectionRef}
      data-hero-mobile="true"
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-label={isRTL ? 'القسم الرئيسي' : 'Hero section'}
      aria-roledescription="carousel"
      aria-live={canPlay ? 'off' : 'polite'}
      className="hhm-root"
      style={{
        position: 'relative',
        background: 'linear-gradient(to bottom,#020f0d 0%,#04211c 45%,#0b3d33 100%)',
        paddingBottom: 'max(14px,env(safe-area-inset-bottom,0px))',
        '--autoplay-ms':    `${AUTOPLAY_MS}ms`,
        '--slide-leave-ms': `${SLIDE_LEAVE_MS}ms`,
        '--slide-enter-ms': `${SLIDE_ENTER_MS}ms`,
        '--sparkle-ms':     `${SPARKLE_MS}ms`,
        '--calm-fade-ms':   `${CALM_FADE_MS}ms`,
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onFocus={() => setFocused(true)}
      onBlur={()   => setFocused(false)}
    >
      <Particles paused={paused}/>
      <CitySkyline/>

      {/* ── HEADER CLEARANCE ── The global fixed Header covers the top 68px */}
      <div style={{ flexShrink:0, height:'max(72px,calc(68px + env(safe-area-inset-top,0px)))' }}/>

      {/* ── VISUAL AREA — grid cell (all slides stacked) ── */}
      <div style={{
        flex:'1 1 0', minHeight:0, position:'relative',
        paddingInlineStart:20, paddingInlineEnd:20,
        display:'grid', gridTemplateColumns:'1fr', gridTemplateRows:'1fr',
      }}>
        {slides.map((slide, i) => {
          const isActive  = i === active;
          const isLeaving = i === leaving;
          let cls = 'hhm-slide';
          if (isActive)  cls += ' hhm-active';
          if (isLeaving) cls += ' hhm-leaving';

          return (
            <div
              key={slide.id}
              role="group" aria-roledescription="slide"
              aria-label={`${i+1} / ${total}`}
              aria-hidden={!isActive}
              {...(!isActive ? { inert:'' } : {})}
              className={cls}
            >
              {/* ── SPARKLE ROW — fixed height; star bottom ≥12px above keyword ── */}
              <div
                data-slot="sparkle"
                style={{
                  flex: '1 1 0',
                  minHeight: 0,
                  height: 'clamp(110px,22svh,170px)',
                  maxHeight: 'clamp(110px,22svh,170px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  /* NO overflow:hidden — sparkle tips must not clip */
                  paddingTop: 4,
                  paddingBottom: 0,
                }}
              >
                <SparkleVisual
                  spinKey={active}
                  dir={isRTL ? (spkDir === 'next' ? 'prev' : 'next') : spkDir}
                  paused={paused || !isActive}
                  isCalm={isCalm}
                />
              </div>

              {/* 12px clearance between sparkle bottom and keyword */}
              <div style={{ height: 12, flexShrink: 0 }}/>

              {/* ── TEXT SLOTS — keyword / headline / description ── */}
              <SlideText slide={slide} isRTL={isRTL} isActive={isActive}/>
            </div>
          );
        })}
      </div>

      {/* ── LOCKUP (once, outside slides) ── */}
      <div
        data-slot="lockup"
        style={{
          flexShrink: 0,
          paddingInlineStart: 20, paddingInlineEnd: 20,
          paddingTop: 10, paddingBottom: 6,
        }}
      >
        <div style={{ height:1, background:'rgba(255,255,255,0.15)', marginBottom:10 }}/>
        <div style={{
          display:'flex', alignItems:'baseline', gap:6, marginBottom:2,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        }}>
          <span style={{
            fontSize:13, fontWeight:500, letterSpacing:'0.02em',
            color:'rgba(255,255,255,0.45)',
          }}>
            {isRTL ? 'من حلول' : 'A solution by'}
          </span>
          <span style={{
            fontSize:22, fontWeight:600,
            fontFamily:"'Cormorant Garamond',Georgia,'Times New Roman',serif",
            fontVariantCaps:'all-small-caps',
            letterSpacing:'0.04em',
            color:'rgba(255,255,255,0.95)',
            lineHeight:1,
          }}>
            SENTIVRA
          </span>
        </div>
        <div style={{
          textAlign: isRTL ? 'right' : 'left',
        }}>
          <span style={{
            fontSize:11, fontWeight:700,
            fontFamily:"'Cormorant Garamond',Georgia,'Times New Roman',serif",
            letterSpacing:'0.3em', textTransform:'uppercase',
            color:'rgba(255,255,255,0.28)',
          }}>
            SOFTWARE SOLUTIONS
          </span>
        </div>
      </div>

      {/* ── CTA ── */}
      <div
        data-slot="cta"
        style={{ flexShrink:0, paddingInlineStart:20, paddingInlineEnd:20, paddingBottom:16 }}
      >
        <a
          href={hero?.cta_primary_link || '/contact'}
          style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            width:'100%', height:48, borderRadius:24,
            background:'#FFFFFF', color:'#01120F',
            fontSize:15, fontWeight:700, textDecoration:'none',
            fontFamily: FONT,
          }}
        >
          <span style={{ width:7,height:7,borderRadius:'50%',background:EM,flexShrink:0 }}
            aria-hidden="true"/>
          {isRTL ? 'اطلب استشارة' : 'Request a consultation'}
        </a>
      </div>

      {/* ── CONTROLS ROW — 3-zone CSS grid ──────────────────────────
           [wa-slot WA_SLOT px] [segments 1fr] [arrows auto]
           wa-slot = 56px WA button + 12px gap = 68px
           In RTL the WA float is on the right, so wa-slot is at the end.
           Use padding-inline-start in LTR / padding-inline-end in RTL.
      ───────────────────────────────────────────────────────────────── */}
      <div
        data-slot="controls"
        style={{
          flexShrink: 0,
          display: 'grid',
          gridTemplateColumns: `${WA_SLOT}px 1fr auto`,
          alignItems: 'center',
          columnGap: 10,
          paddingInlineStart: isRTL ? 16 : 0,
          paddingInlineEnd:   isRTL ? 0  : 16,
          paddingBottom: 2,
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Zone 1: WA spacer (clears the floating WA button) */}
        <div aria-hidden="true" style={{ width: WA_SLOT }}/>

        {/* Zone 2: progress segments */}
        <div
          data-slot="segments"
          style={{ display:'flex', gap:6, alignItems:'center', minWidth:0 }}
        >
          {slides.map((_, i) => {
            const isDone = i < active;
            const isBar  = i === active;
            let cls = 'hhm-bar';
            if (isBar && canPlay) cls += ' hhm-fill';
            else if (isBar)       cls += ' hhm-pause';
            else if (isDone)      cls += ' hhm-done';
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={isRTL ? `الشريحة ${i+1}` : `Slide ${i+1}`}
                style={{
                  flex:'1 1 0', minWidth:8, maxWidth:44, height:3,
                  borderRadius:2, background:'rgba(255,255,255,0.25)',
                  overflow:'hidden', position:'relative',
                  border:'none', padding:0, cursor:'pointer',
                }}
              >
                <div key={`${i}-${active}`} className={cls}
                  style={{ position:'absolute', inset:0, background:'#FFFFFF' }}/>
              </button>
            );
          })}
        </div>

        {/* Zone 3: arrows (prev + next, direction-aware) */}
        <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
          {/*
            LTR: left button = prev (‹), right button = next (›)
            RTL: left button = next (›, points right in RTL flow), right = prev (‹)
            We always render [back-btn] [fwd-btn] in DOM order,
            but swap chevron direction and aria-labels by isRTL.
          */}
          <button
            onClick={isRTL ? goNext : goPrev}
            aria-label={isRTL ? 'الشريحة التالية' : 'Previous slide'}
            style={{ width:44,height:44,borderRadius:'50%',flexShrink:0,
              background:'transparent',border:'1px solid rgba(255,255,255,0.45)',
              display:'flex',alignItems:'center',justifyContent:'center',
              color:'#FFFFFF',cursor:'pointer' }}
          >
            {isRTL ? <ChevronRight/> : <ChevronLeft/>}
          </button>
          <button
            onClick={isRTL ? goPrev : goNext}
            aria-label={isRTL ? 'الشريحة السابقة' : 'Next slide'}
            style={{ width:44,height:44,borderRadius:'50%',flexShrink:0,
              background:'transparent',border:'1px solid rgba(255,255,255,0.45)',
              display:'flex',alignItems:'center',justifyContent:'center',
              color:'#FFFFFF',cursor:'pointer' }}
          >
            {isRTL ? <ChevronLeft/> : <ChevronRight/>}
          </button>
        </div>
      </div>
    </section>
  );
}
