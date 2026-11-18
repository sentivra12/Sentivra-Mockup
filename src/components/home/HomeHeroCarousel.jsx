/**
 * HomeHeroCarousel — mobile-only (≤768px) home hero.
 * Replaces HomeHeroMobile on phones.
 *
 * HEIGHT : exactly 100svh (100vh fallback via CSS class .hhc-root).
 *
 * GRID LAYOUT (top → bottom):
 *   [A] Top bar         — logo + circular menu button (safe-area aware)
 *   [B] Visual          — per-slide inline SVG scene (~30svh)
 *   [C] Keyword         — large bold display text, clamp(56px,18vw,88px)
 *   [D] Slide title     — 28-34px bold
 *   [E] Description     — 16px, 2-3 lines max
 *   [F] Divider + lockup — "A solution by SENTIVRA / SOFTWARE SOLUTIONS"
 *   [G] CTA             — 52px pill, full-width
 *   [H] Controls row    — WhatsApp | progress bars | prev/next (safe-area aware)
 *
 * SLIDER:
 *   - Stacked slides in a CSS grid cell (all same position, opacity transition)
 *   - Autoplay 5s, crossfade + small translateY (transform only)
 *   - Paused: touch/focus/tab-hidden/off-screen/reducedMotion/calm/saveData
 *   - Swipe (pointer events), keyboard ←→, prev/next buttons
 *   - Progress bar = CSS scaleX animation, restarted per slide
 *   - aria-roledescription="carousel", slide role="group" aria-label="n of N"
 *   - aria-live="off" autoplay, "polite" paused; non-active slides inert+aria-hidden
 *
 * SERVICES DATA:
 *   - useServices() — real DB, filtered is_active, ordered display_order, max 6
 *   - Keyword derived from slug (first segment before '-') or first word of title
 *   - If loading/empty → 1 static fallback slide (never blank)
 *
 * BACKGROUND (CSS-only, 0 images):
 *   Dark  : vertical gradient near-black-green → deep-emerald, radial glow, star dots
 *   Light : soft emerald-tinted mint surface
 *   City skyline SVG at bottom (< 3 KB, aria-hidden, low opacity)
 *
 * MENU: fires click on the existing Header hamburger via
 *   document.querySelector('[aria-controls="mobile-menu"]')?.click()
 *
 * MOTION: all infinite loops (autoplay, progress bar, star pulse) disabled
 *   when mode==='calm' || saveData || off-screen || tab hidden.
 *   Slide transitions (one-shot opacity/transform, 400ms) always allowed.
 */

import React, {
  useState, useEffect, useRef, useMemo, useCallback, useId,
} from 'react';
import { Link } from 'react-router-dom';
import Logo    from '@/components/ui/Logo';
import { useTranslation }    from '@/i18n/useTranslation';
import { useThemeContext }   from '@/theme/ThemeContext';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { useServices }       from '@/hooks/useContent';
import { useSiteSettings }   from '@/hooks/useContent';

/* ═══════════════════════════════════════════════════════════════════════════
   CSS — injected once
═══════════════════════════════════════════════════════════════════════════ */
const CSS = `
/* ── height fallback chain ── */
.hhc-root { height:100vh; height:100dvh; height:100svh; }

/* ── slide transition (one-shot, always allowed) ── */
.hhc-slide {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.4s ease, transform 0.4s ease;
  pointer-events: none;
  will-change: opacity, transform;
}
.hhc-slide.hhc-active {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  z-index: 1;
}
/* calm/reducedMotion: skip transition */
[data-motion="calm"] .hhc-slide,
[data-motion="calm"] .hhc-slide.hhc-active {
  transition: none !important;
}

/* ── progress bar animation ── */
@keyframes hhc-progress {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
.hhc-bar-fill {
  transform-origin: left;
  transform: scaleX(0);
}
.hhc-bar-fill.hhc-running {
  animation: hhc-progress 5s linear forwards;
}
.hhc-bar-fill.hhc-paused {
  animation-play-state: paused;
}
[data-motion="calm"] .hhc-bar-fill { animation: none !important; transform: scaleX(1) !important; }

/* ── star dots pulse (optional glow, one slow pulse) ── */
@keyframes hhc-star-pulse {
  0%,100% { opacity: 0.4; }
  50%      { opacity: 0.9; }
}
.hhc-star { animation: hhc-star-pulse 4s ease-in-out infinite; }
[data-motion="calm"] .hhc-star { animation: none !important; opacity: 0.6; }

/* ── visual SVG gentle float (transform only, 7s, loop) ── */
@keyframes hhc-float {
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(-6px); }
}
.hhc-visual-float { animation: hhc-float 7s ease-in-out infinite; will-change: transform; }
.hhc-visual-paused { animation-play-state: paused !important; }
[data-motion="calm"] .hhc-visual-float { animation: none !important; }

/* ── scrollbar hide on chips ── */
.hhc-no-scroll { scrollbar-width:none; }
.hhc-no-scroll::-webkit-scrollbar { display:none; }
`;

let _cssInjected = false;
function ensureCSS() {
  if (_cssInjected || typeof document === 'undefined') return;
  if (document.querySelector('[data-id="hhc-css"]')) { _cssInjected = true; return; }
  const s = document.createElement('style');
  s.textContent = CSS;
  s.dataset.id  = 'hhc-css';
  document.head.appendChild(s);
  _cssInjected = true;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Service SVG icons (one per service, inline, aria-hidden)
   Drawn with brand emerald/white, no filters, no images.
═══════════════════════════════════════════════════════════════════════════ */

/* 4-point sparkle star (default / web dev) */
const SvgSparkle = ({ isDark }) => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="hhcg1" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#26B59A" stopOpacity="0.35"/>
        <stop offset="100%" stopColor="#0D9E82" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="60" cy="60" r="58" fill="url(#hhcg1)"/>
    {/* 4-point star */}
    <path d="M60 10 L65 55 L110 60 L65 65 L60 110 L55 65 L10 60 L55 55 Z"
      fill={isDark ? '#E0F4EF' : '#055A4F'} opacity="0.92"/>
    {/* inner glow ring */}
    <circle cx="60" cy="60" r="14" fill="none" stroke="#0D9E82" strokeWidth="2" opacity="0.6"/>
    {/* center dot */}
    <circle cx="60" cy="60" r="5" fill="#26B59A"/>
  </svg>
);

/* Mobile phone (mobile apps) */
const SvgMobile = ({ isDark }) => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="hhcg2" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#26B59A" stopOpacity="0.30"/>
        <stop offset="100%" stopColor="#0D9E82" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="60" cy="60" r="58" fill="url(#hhcg2)"/>
    <rect x="38" y="20" width="44" height="80" rx="8"
      fill={isDark ? 'rgba(224,244,239,0.1)' : 'rgba(5,90,79,0.08)'}
      stroke={isDark ? '#26B59A' : '#06796A'} strokeWidth="2"/>
    <rect x="45" y="30" width="30" height="48" rx="3"
      fill={isDark ? 'rgba(13,158,130,0.18)' : 'rgba(13,158,130,0.12)'}/>
    {/* screen lines */}
    <line x1="49" y1="40" x2="71" y2="40" stroke={isDark ? '#55C8B1' : '#0D9E82'} strokeWidth="1.5" opacity="0.7"/>
    <line x1="49" y1="47" x2="65" y2="47" stroke={isDark ? '#55C8B1' : '#0D9E82'} strokeWidth="1.5" opacity="0.5"/>
    <line x1="49" y1="54" x2="68" y2="54" stroke={isDark ? '#55C8B1' : '#0D9E82'} strokeWidth="1.5" opacity="0.5"/>
    {/* home button */}
    <circle cx="60" cy="90" r="4"
      fill={isDark ? '#26B59A' : '#06796A'} opacity="0.8"/>
  </svg>
);

/* Database cylinders (ERP / data) */
const SvgDatabase = ({ isDark }) => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="hhcg3" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#26B59A" stopOpacity="0.30"/>
        <stop offset="100%" stopColor="#0D9E82" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="60" cy="60" r="58" fill="url(#hhcg3)"/>
    {/* three stacked cylinders */}
    {[0, 22, 44].map((y, i) => (
      <g key={i} transform={`translate(0,${y})`}>
        <ellipse cx="60" cy="28" rx="26" ry="7"
          fill={isDark ? 'rgba(38,181,154,0.18)' : 'rgba(13,158,130,0.12)'}
          stroke={isDark ? '#26B59A' : '#06796A'} strokeWidth="1.5"/>
        <rect x="34" y="28" width="52" height="14"
          fill={isDark ? 'rgba(38,181,154,0.08)' : 'rgba(13,158,130,0.07)'}/>
        <line x1="34" y1="42" x2="86" y2="42"
          stroke={isDark ? '#26B59A' : '#06796A'} strokeWidth="1.5" opacity="0.6"/>
      </g>
    ))}
  </svg>
);

/* Brain / AI chip */
const SvgAI = ({ isDark }) => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="hhcg4" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#26B59A" stopOpacity="0.35"/>
        <stop offset="100%" stopColor="#0D9E82" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="60" cy="60" r="58" fill="url(#hhcg4)"/>
    {/* chip body */}
    <rect x="35" y="35" width="50" height="50" rx="6"
      fill={isDark ? 'rgba(224,244,239,0.08)' : 'rgba(5,90,79,0.07)'}
      stroke={isDark ? '#26B59A' : '#06796A'} strokeWidth="2"/>
    {/* inner grid */}
    {[46,60,74].map(x => (
      <line key={x} x1={x} y1="38" x2={x} y2="82"
        stroke={isDark ? '#55C8B1' : '#0D9E82'} strokeWidth="1" opacity="0.4"/>
    ))}
    {[46,60,74].map(y => (
      <line key={y} x1="38" y1={y} x2="82" y2={y}
        stroke={isDark ? '#55C8B1' : '#0D9E82'} strokeWidth="1" opacity="0.4"/>
    ))}
    {/* center highlight */}
    <rect x="50" y="50" width="20" height="20" rx="3"
      fill={isDark ? 'rgba(38,181,154,0.3)' : 'rgba(13,158,130,0.2)'}/>
    {/* pins */}
    {[42,55,68].map(p => [
      <line key={`l${p}`} x1="35" y1={p} x2="27" y2={p} stroke={isDark?'#26B59A':'#06796A'} strokeWidth="2"/>,
      <line key={`r${p}`} x1="85" y1={p} x2="93" y2={p} stroke={isDark?'#26B59A':'#06796A'} strokeWidth="2"/>,
      <line key={`t${p}`} x1={p} y1="35" x2={p} y2="27" stroke={isDark?'#26B59A':'#06796A'} strokeWidth="2"/>,
      <line key={`b${p}`} x1={p} y1="85" x2={p} y2="93" stroke={isDark?'#26B59A':'#06796A'} strokeWidth="2"/>,
    ])}
  </svg>
);

/* Globe / web */
const SvgGlobe = ({ isDark }) => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="hhcg5" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#26B59A" stopOpacity="0.30"/>
        <stop offset="100%" stopColor="#0D9E82" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="60" cy="60" r="58" fill="url(#hhcg5)"/>
    <circle cx="60" cy="60" r="32" fill="none" stroke={isDark?'#26B59A':'#06796A'} strokeWidth="2"/>
    {/* meridians */}
    <ellipse cx="60" cy="60" rx="16" ry="32" fill="none" stroke={isDark?'#55C8B1':'#0D9E82'} strokeWidth="1.5" opacity="0.6"/>
    {/* parallels */}
    {[-16,0,16].map(dy => (
      <ellipse key={dy} cx="60" cy={60+dy}
        rx={Math.sqrt(32*32 - dy*dy)} ry="6"
        fill="none" stroke={isDark?'#55C8B1':'#0D9E82'} strokeWidth="1.2" opacity="0.5"/>
    ))}
    <circle cx="60" cy="60" r="4" fill={isDark?'#26B59A':'#06796A'}/>
  </svg>
);

/* Bar chart (CRM / analytics) */
const SvgChart = ({ isDark }) => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="hhcg6" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#26B59A" stopOpacity="0.30"/>
        <stop offset="100%" stopColor="#0D9E82" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="60" cy="60" r="58" fill="url(#hhcg6)"/>
    {/* axes */}
    <line x1="30" y1="88" x2="90" y2="88" stroke={isDark?'#26B59A':'#06796A'} strokeWidth="2"/>
    <line x1="30" y1="88" x2="30" y2="30" stroke={isDark?'#26B59A':'#06796A'} strokeWidth="2"/>
    {/* bars */}
    {[
      { x:38, h:40, op:0.9 },
      { x:52, h:55, op:1.0 },
      { x:66, h:28, op:0.75 },
      { x:80, h:48, op:0.85 },
    ].map((b,i) => (
      <rect key={i} x={b.x} y={88-b.h} width="10" height={b.h} rx="2"
        fill={isDark ? '#26B59A' : '#06796A'} opacity={b.op}/>
    ))}
  </svg>
);

/* Map icon → SVG scene */
const ICON_SVG_MAP = {
  Code:     SvgSparkle,
  Monitor:  SvgGlobe,
  Cpu:      SvgAI,
  Database: SvgDatabase,
  Globe:    SvgGlobe,
  Smartphone: SvgMobile,
  Brain:    SvgAI,
  BarChart: SvgChart,
  TrendingUp: SvgChart,
  Headphones: SvgSparkle,
  Shield:   SvgAI,
};
function getSlideVisual(icon, isDark) {
  const C = ICON_SVG_MAP[icon] || SvgSparkle;
  return <C isDark={isDark} />;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Star dots background (static inline SVG < 2KB)
═══════════════════════════════════════════════════════════════════════════ */
const STAR_POS = [
  [12,8],[85,5],[34,15],[68,12],[92,20],[7,32],[55,25],[78,30],
  [25,45],[90,42],[14,58],[47,52],[82,55],[38,68],[72,65],[18,78],
  [60,75],[88,80],[30,88],[65,92],[8,95],[44,90],[96,88],
];
function StarDots({ isDark }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ position:'absolute', inset:0, width:'100%', height:'100%',
               pointerEvents:'none', zIndex:0 }}>
      {STAR_POS.map(([cx,cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i%3===0?0.6:i%5===0?0.9:0.45}
          fill={isDark ? '#55C8B1' : '#06796A'}
          opacity={isDark ? 0.55 : 0.30}
          className={i % 4 === 0 ? 'hhc-star' : undefined}
          style={i%4===0 ? { animationDelay: `${(i*0.4)%4}s` } : undefined}
        />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   City skyline SVG (< 3KB, bottom, aria-hidden)
═══════════════════════════════════════════════════════════════════════════ */
function CitySkyline({ isDark }) {
  const fill = isDark ? 'rgba(13,158,130,0.07)' : 'rgba(5,90,79,0.055)';
  return (
    <svg viewBox="0 0 414 90" preserveAspectRatio="none" aria-hidden="true"
      style={{ position:'absolute', bottom:0, left:0, right:0,
               width:'100%', height:'clamp(60px,10svh,90px)',
               pointerEvents:'none', zIndex:1 }}>
      <path fill={fill} d="
        M0,90 L0,55 L15,55 L15,40 L22,40 L22,32 L29,32 L29,40 L38,40 L38,55
        L52,55 L52,30 L58,30 L58,22 L65,22 L65,30 L72,30 L72,18 L76,18 L76,30
        L80,30 L80,55 L95,55 L95,42 L100,42 L100,35 L107,35 L107,42 L114,42
        L114,55 L125,55 L125,28 L132,28 L132,20 L136,20 L136,15 L140,15
        L140,20 L144,20 L144,28 L155,28 L155,45 L160,45 L160,38 L165,38
        L165,45 L175,45 L175,55 L190,55 L190,35 L195,35 L195,27 L200,27
        L200,20 L205,20 L205,27 L210,27 L210,35 L220,35 L220,55
        L232,55 L232,40 L238,40 L238,33 L244,33 L244,40 L252,40 L252,55
        L265,55 L265,30 L271,30 L271,22 L277,22 L277,30 L285,30 L285,55
        L295,55 L295,45 L300,45 L300,38 L307,38 L307,45 L315,45 L315,55
        L328,55 L328,25 L333,25 L333,18 L338,18 L338,12 L342,12 L342,18
        L347,18 L347,25 L355,25 L355,55 L370,55 L370,42 L376,42 L376,35
        L382,35 L382,42 L390,42 L390,55 L414,55 L414,90 Z
      "/>
      {/* windows: a few tiny rectangles */}
      {[
        [137,17,2,3],[141,17,2,3],[197,22,2,3],[202,22,2,3],
        [335,19,2,3],[340,14,2,3],[345,19,2,3],[73,20,2,3],[77,22,2,3],
      ].map(([x,y,w,h],i) => (
        <rect key={i} x={x} y={y} width={w} height={h}
          fill={isDark ? 'rgba(38,181,154,0.3)' : 'rgba(13,158,130,0.2)'}/>
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   WhatsApp SVG icon
═══════════════════════════════════════════════════════════════════════════ */
const WaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════════════
   Derive a short keyword from slug or title
═══════════════════════════════════════════════════════════════════════════ */
function deriveKeyword(service, language) {
  if (service.keyword) return service.keyword.toUpperCase();
  // from slug: "erp-system" → "ERP"
  if (service.slug) {
    const first = service.slug.split('-')[0];
    if (first && first.length <= 6) return first.toUpperCase();
  }
  // from title: first word
  const title = language === 'ar'
    ? (service.title_ar || service.title_en || service.title || '')
    : (service.title_en || service.title || '');
  const firstWord = title.trim().split(/\s+/)[0] || '';
  if (firstWord.length <= 8) return firstWord.toUpperCase();
  // acronym from first 3 words
  const words = title.trim().split(/\s+/).slice(0, 3);
  return words.map(w => w[0]).join('').toUpperCase();
}

/* ═══════════════════════════════════════════════════════════════════════════
   Build slide data from services
═══════════════════════════════════════════════════════════════════════════ */
function buildSlides(services, language, t) {
  const active = services.filter(s => s.is_active !== false).slice(0, 6);
  if (active.length === 0) {
    return [{
      id:      'fallback',
      keyword: t('hero.carousel.fallbackKeyword'),
      title:   t('hero.carousel.fallbackTitle'),
      desc:    t('hero.carousel.fallbackDesc'),
      icon:    'Code',
    }];
  }
  return active.map(s => ({
    id:      s.id,
    keyword: deriveKeyword(s, language),
    title:   language === 'ar'
      ? (s.title_ar  || s.title_en || s.title || t('hero.carousel.fallbackTitle'))
      : (s.title_en  || s.title    || t('hero.carousel.fallbackTitle')),
    desc:    language === 'ar'
      ? (s.short_description_ar || s.short_description_en || s.short_description || t('hero.carousel.fallbackDesc'))
      : (s.short_description_en || s.short_description    || t('hero.carousel.fallbackDesc')),
    icon:    s.icon || 'Code',
  }));
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════════════════ */
export default function HomeHeroCarousel() {
  useEffect(() => { ensureCSS(); }, []);

  const { t, language }     = useTranslation();
  const isRTL               = language === 'ar';
  const { isDark }          = useThemeContext();
  const { mode, allowLoop } = useMotionPreference();
  const isCalm  = mode === 'calm';
  const saveData = typeof navigator !== 'undefined'
    && (navigator.connection?.saveData === true
        || navigator.connection?.effectiveType === 'slow-2g');

  /* Real services */
  const { data: rawServices = [] } = useServices();
  const { data: siteSettings }     = useSiteSettings();
  const waNumber = (siteSettings?.whatsapp_number || '').replace(/\D/g, '');

  /* Slides */
  const slides = useMemo(
    () => buildSlides(rawServices, language, t),
    [rawServices, language, t]
  );
  const total = slides.length;

  /* Active slide state */
  const [active, setActive]   = useState(0);
  const [paused, setPaused]   = useState(false);
  const [inView,  setInView]  = useState(true);
  const [tabVis,  setTabVis]  = useState(true);
  const [progKey, setProgKey] = useState(0); // key to restart progress bar

  /* Autoplay should run when: motion allowed, in view, tab visible, not user-paused */
  const shouldAutoplay = allowLoop && !isCalm && !saveData && inView && tabVis && !paused;

  /* IntersectionObserver */
  const rootRef = useRef(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  /* Tab visibility */
  useEffect(() => {
    const fn = () => setTabVis(!document.hidden);
    document.addEventListener('visibilitychange', fn);
    return () => document.removeEventListener('visibilitychange', fn);
  }, []);

  /* Advance slide */
  const goTo = useCallback((idx) => {
    setActive(((idx % total) + total) % total);
    setProgKey(k => k + 1);
  }, [total]);
  const goNext = useCallback(() => goTo(active + 1), [active, goTo]);
  const goPrev = useCallback(() => goTo(active - 1), [active, goTo]);

  /* Autoplay timer — only when shouldAutoplay */
  const timerRef = useRef(null);
  useEffect(() => {
    if (!shouldAutoplay || total <= 1) return;
    timerRef.current = setTimeout(() => { goNext(); }, 5000);
    return () => clearTimeout(timerRef.current);
  }, [shouldAutoplay, active, total, goNext]);

  /* Keyboard navigation */
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'ArrowRight') { isRTL ? goPrev() : goNext(); }
      if (e.key === 'ArrowLeft')  { isRTL ? goNext() : goPrev(); }
    };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [isRTL, goNext, goPrev]);

  /* Swipe — pointer events */
  const swipeStart = useRef(null);
  const handlePointerDown = (e) => {
    swipeStart.current = e.clientX;
    setPaused(true);
  };
  const handlePointerUp = (e) => {
    if (swipeStart.current === null) return;
    const dx = e.clientX - swipeStart.current;
    if (Math.abs(dx) > 40) {
      dx < 0 ? (isRTL ? goPrev() : goNext()) : (isRTL ? goNext() : goPrev());
    }
    swipeStart.current = null;
    setPaused(false);
  };

  /* Open existing Header nav */
  const openMenu = () => {
    document.querySelector('[aria-controls="mobile-menu"]')?.click();
  };

  /* Colours */
  const bg = isDark
    ? 'linear-gradient(175deg, #01120F 0%, #02231E 55%, #033830 85%, #044D40 100%)'
    : 'linear-gradient(175deg, #E8F5F2 0%, #F0FAF7 50%, #E0F4EF 100%)';
  const textMain   = isDark ? '#E0F4EF' : '#01120F';
  const textMuted  = isDark ? '#7ABFB0' : '#3D6B61';
  const borderCol  = isDark ? 'rgba(38,181,154,0.25)' : 'rgba(6,121,106,0.20)';
  const btnBg      = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(5,90,79,0.07)';
  const ctaBg      = isDark ? '#FFFFFF' : '#055A4F';
  const ctaText    = isDark ? '#01120F' : '#FFFFFF';
  const progTrack  = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
  const progFill   = isDark ? '#26B59A' : '#06796A';
  const glowColor  = isDark
    ? 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(13,158,130,0.22) 0%, transparent 70%)'
    : 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(13,158,130,0.10) 0%, transparent 70%)';

  const uid = useId();
  const carouselId = `hhc-${uid}`;

  return (
    <section
      ref={rootRef}
      data-hero-carousel
      data-active-slide={String(active)}
      data-slide-count={String(total)}
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-roledescription="carousel"
      aria-label={t('hero.carousel.carouselLabel')}
      aria-live={shouldAutoplay ? 'off' : 'polite'}
      id={carouselId}
      className="hhc-root"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        isolation: 'isolate',
        background: bg,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'pan-y',
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { swipeStart.current = null; setPaused(false); }}
    >
      {/* ── Background layers (z=0) ───────────────────────────────────────── */}
      <StarDots isDark={isDark} />
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: glowColor,
      }}/>
      <CitySkyline isDark={isDark} />

      {/* ══════════════════════════════════════════════════════════════════
          [A] TOP BAR
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'relative', zIndex: 20, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 'max(16px, env(safe-area-inset-top, 0px))',
        paddingBottom: 10,
        paddingInlineStart: 20,
        paddingInlineEnd: 20,
      }}>
        <Link to="/" aria-label="Sentivra home">
          <Logo variant={isDark ? 'light' : 'full'} size={34} />
        </Link>

        <button
          data-menu-btn
          onClick={openMenu}
          aria-label={t('hero.carousel.openMenu')}
          aria-hidden="true"
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: btnBg,
            border: `1px solid ${borderCol}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: isDark ? '#E0F4EF' : '#01120F',
            flexShrink: 0,
          }}
        >
          {/* hamburger icon */}
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
            <rect y="0"  width="20" height="2" rx="1" fill="currentColor"/>
            <rect y="6"  width="14" height="2" rx="1" fill="currentColor"/>
            <rect y="12" width="20" height="2" rx="1" fill="currentColor"/>
          </svg>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SLIDE STACK — all slides stacked in one grid cell
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'relative', flex: 1, minHeight: 0,
        display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: '1fr',
      }}>
        {slides.map((slide, i) => {
          const isActive = i === active;
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${t('hero.carousel.slideLabel')} ${i + 1} ${t('hero.carousel.slideOf')} ${total}`}
              aria-hidden={!isActive}
              {...(!isActive ? { inert: '' } : {})}
              className={`hhc-slide${isActive ? ' hhc-active' : ''}`}
              style={{ gridRow: 1, gridColumn: 1 }}
            >
              {/* ── [B] Visual ─────────────────────────────────────────── */}
              <div style={{
                flexShrink: 0,
                height: 'clamp(140px, 28svh, 200px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', zIndex: 2,
              }}>
                <div
                  className={`hhc-visual-float${!shouldAutoplay || !isActive ? ' hhc-visual-paused' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {getSlideVisual(slide.icon, isDark)}
                </div>
              </div>

              {/* ── [C] Keyword ────────────────────────────────────────── */}
              <div style={{
                flexShrink: 0,
                paddingInlineStart: 'clamp(20px,5vw,32px)',
                paddingInlineEnd: 'clamp(20px,5vw,32px)',
                position: 'relative', zIndex: 2,
                marginBottom: 4,
              }}>
                <span
                  aria-hidden="true"
                  style={{
                    display: 'block',
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    fontSize: 'clamp(56px, 18vw, 88px)',
                    fontWeight: 800,
                    lineHeight: 0.88,
                    letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg, #0D9E82 0%, #26B59A 50%, #06796A 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: '#0D9E82', /* fallback */
                    textAlign: 'start',
                  }}
                >
                  {slide.keyword}
                </span>
              </div>

              {/* ── [D] Title ──────────────────────────────────────────── */}
              <div style={{
                flexShrink: 0,
                paddingInlineStart: 'clamp(20px,5vw,32px)',
                paddingInlineEnd: 'clamp(20px,5vw,32px)',
                position: 'relative', zIndex: 2,
                marginBottom: 8,
              }}>
                <h1
                  dir="auto"
                  style={{
                    margin: 0,
                    fontFamily: "'IBM Plex Sans Arabic', 'Plus Jakarta Sans', system-ui, sans-serif",
                    fontSize: 'clamp(22px, 7vw, 32px)',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: textMain,
                  }}
                >
                  {slide.title}
                </h1>
              </div>

              {/* ── [E] Description ────────────────────────────────────── */}
              <div style={{
                flexShrink: 0,
                paddingInlineStart: 'clamp(20px,5vw,32px)',
                paddingInlineEnd: 'clamp(20px,5vw,32px)',
                position: 'relative', zIndex: 2,
                marginBottom: 12,
              }}>
                <p
                  dir="auto"
                  style={{
                    margin: 0,
                    fontSize: 15,
                    lineHeight: 1.5,
                    color: textMuted,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {slide.desc}
                </p>
              </div>

              {/* ── [F] Divider + lockup ───────────────────────────────── */}
              <div style={{
                flexShrink: 0,
                paddingInlineStart: 'clamp(20px,5vw,32px)',
                paddingInlineEnd: 'clamp(20px,5vw,32px)',
                position: 'relative', zIndex: 2,
                marginBottom: 14,
              }}>
                <div style={{
                  height: 1,
                  background: borderCol,
                  marginBottom: 8,
                }}/>
                <p style={{
                  margin: 0, fontSize: 11, fontWeight: 500,
                  color: textMuted, letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap',
                }}>
                  <span>{t('hero.carousel.by')}</span>
                  <span style={{
                    fontWeight: 800, letterSpacing: '0.08em',
                    color: isDark ? '#26B59A' : '#055A4F',
                  }}>{t('hero.carousel.brand')}</span>
                  <span style={{ opacity: 0.6 }}>·</span>
                  <span style={{ opacity: 0.7 }}>{t('hero.carousel.solutions')}</span>
                </p>
              </div>

              {/* ── [G] CTA ────────────────────────────────────────────── */}
              <div style={{
                flexShrink: 0,
                paddingInlineStart: 'clamp(20px,5vw,32px)',
                paddingInlineEnd: 'clamp(20px,5vw,32px)',
                position: 'relative', zIndex: 2,
              }}>
                <Link
                  to="/contact"
                  data-cta-primary
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 8,
                    height: 52,
                    borderRadius: 999,
                    background: ctaBg,
                    color: ctaText,
                    fontFamily: "'IBM Plex Sans Arabic', 'Plus Jakarta Sans', system-ui, sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: '0.01em',
                    textDecoration: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* status dot */}
                  <span
                    aria-hidden="true"
                    title={t('hero.carousel.statusDot')}
                    style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: isDark ? '#26B59A' : '#E0F4EF',
                      flexShrink: 0,
                      boxShadow: `0 0 6px ${isDark ? 'rgba(38,181,154,0.6)' : 'rgba(224,244,239,0.8)'}`,
                    }}
                  />
                  {t('hero.carousel.cta')}
                </Link>
              </div>
            </div> /* /slide */
          );
        })}
      </div> {/* /slide stack */}

      {/* ══════════════════════════════════════════════════════════════════
          [H] CONTROLS ROW
      ══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: 'relative', zIndex: 20, flexShrink: 0,
          display: 'flex', alignItems: 'center',
          paddingTop: 10,
          paddingBottom: 'max(14px, calc(env(safe-area-inset-bottom, 0px) + 10px))',
          paddingInlineStart: 'clamp(16px,4vw,24px)',
          paddingInlineEnd:   'clamp(16px,4vw,24px)',
          gap: 10,
        }}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {/* WhatsApp */}
        <a
          data-whatsapp-btn
          href={waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(language === 'ar' ? 'مرحباً، أود الاستفسار عن خدماتكم.' : 'Hello! I would like to know more about your services.')}` : '#'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('hero.carousel.whatsapp')}
          style={{
            width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
            background: '#25D366',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', textDecoration: 'none',
            border: 'none',
          }}
        >
          <WaIcon />
        </a>

        {/* Progress bars */}
        <div
          style={{
            flex: 1, minWidth: 0,
            display: 'flex', gap: 4, alignItems: 'center',
          }}
          aria-hidden="true"
        >
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              tabIndex={-1}
              aria-hidden="true"
              style={{
                flex: 1, height: 3, borderRadius: 99,
                padding: 0, border: 'none', cursor: 'pointer',
                background: progTrack,
                position: 'relative', overflow: 'hidden',
              }}
            >
              {i === active && (
                <span
                  key={progKey}
                  className={`hhc-bar-fill${shouldAutoplay ? ' hhc-running' : ''}`}
                  style={{
                    position: 'absolute', inset: 0,
                    background: progFill,
                    borderRadius: 99,
                  }}
                />
              )}
              {i !== active && (
                <span style={{
                  position: 'absolute', inset: 0,
                  background: progFill,
                  opacity: i < active ? 1 : 0,
                  borderRadius: 99,
                }}/>
              )}
            </button>
          ))}
        </div>

        {/* Prev / Next */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            data-prev-btn
            onClick={() => { goPrev(); setPaused(true); setTimeout(() => setPaused(false), 8000); }}
            aria-label={t('hero.carousel.prevSlide')}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: btnBg,
              border: `1px solid ${borderCol}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: isDark ? '#E0F4EF' : '#01120F',
            }}
          >
            {/* RTL: prev points right; LTR: prev points left */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
              style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }}>
              <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            data-next-btn
            onClick={() => { goNext(); setPaused(true); setTimeout(() => setPaused(false), 8000); }}
            aria-label={t('hero.carousel.nextSlide')}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: btnBg,
              border: `1px solid ${borderCol}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: isDark ? '#E0F4EF' : '#01120F',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
              style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }}>
              <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
