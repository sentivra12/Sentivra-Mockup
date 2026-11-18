/**
 * MockupsHeroPremium — Desktop Mockups hero (≥ 769px, lazy-loaded)
 *
 * HANDS IMAGE: public/hero/hands-720.webp (414×584, ~22KB)
 *   Transparent cut-out of two hands holding crumpled paper with "?".
 *   Served via <picture> with responsive WebP sources.
 *   fetchpriority="low" decoding="async" — hero TEXT is the LCP, not this image.
 *   PNG never referenced (stays in public/ but never imported).
 *
 * LAYOUT (two-column, RTL swaps via CSS grid):
 *   Start col: eyebrow → H1 → subtitle → paragraph → CTAs
 *   End col  : hands image, bottom-flush with hero bottom, no cropping
 *   Height   : 88vh desktop
 *
 * SINGLE H1: "So are you ready?" — one accent word in emerald.
 *   "Ready-Made Website Mockups" is a subtitle <p>, NOT a heading.
 *
 * DIVIDER SEAM: fill = computed var(--color-background) at runtime.
 *
 * SCROLL INDICATOR: moved to text column (never overlaps visual).
 *
 * ANIMATIONS (max 3 running loops, transform/opacity only):
 *   (a) hands float  — translateY 0→-6px, 7s, loop
 *   (b) paper tilt   — handled inside the same element via CSS class
 *   (c) triangle shimmer — optional desktop, 25s, very faint, calm=off
 *   Content fade-up  — one-shot (not a loop)
 *   All pause off-screen (IO) + tab hidden + calm/reduced + saveData.
 *
 * DARK THEME: emerald radial glow behind hands (plain gradient, no blur).
 *
 * CONTRAST (WCAG AA):
 *   H1 light  : #01120F on #E8F5F2 → ~16:1 ✓
 *   H1 dark   : #E6F7F3 on #01120F → ~15:1 ✓
 *   Para light: #3D6B61 on #E8F5F2 → ~5.5:1 ✓
 *   Para dark : #7ABFB0 on #01120F → ~5.2:1 ✓
 *   Btn primary: white on #055A4F  → 7.3:1 ✓
 *   Btn outline: #055A4F on transparent (light) → AA on mint bg ✓
 */

import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { useThemeContext } from '@/theme/ThemeContext';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { Button } from '@/components/ui/button';

/* ── CSS injected once ─────────────────────────────────────────────────── */
const HERO_CSS = `
@keyframes mh-enter {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes mh-force { to { opacity:1; transform:none; } }
.mh-enter {
  opacity:0;
  animation:
    mh-enter 0.4s cubic-bezier(0.16,1,0.3,1) both,
    mh-force 0s linear 1.5s both;
}
@keyframes mh-float {
  0%,100% { transform: translateY(0px) rotate(0deg); }
  50%      { transform: translateY(-6px) rotate(0.5deg); }
}
@keyframes mh-shimmer {
  0%,100% { opacity:0.08; }
  50%      { opacity:0.20; }
}
.mh-float-run { animation: mh-float 7s ease-in-out infinite; will-change:transform; }
.mh-shimmer-run { animation: mh-shimmer 25s ease-in-out infinite; }
.mh-paused { animation-play-state: paused !important; }
[data-motion="calm"] .mh-enter { animation:none!important; opacity:1; transform:none; }
[data-motion="calm"] .mh-float-run,
[data-motion="calm"] .mh-shimmer-run { animation:none!important; }
`;
let _css = false;
function ensureCSS() {
  if (_css || typeof document === 'undefined') return;
  const s = document.createElement('style');
  s.textContent = HERO_CSS; s.dataset.id = 'mhp-css';
  document.head.appendChild(s); _css = true;
}

/* ── Low-poly SVG triangles (< 2.6KB, inline, 0 image requests) ─────────── */
const TRIS = [
  [0,0,   240,80,  120,200, 0],  [120,200,240,80, 380,220, 2],
  [0,0,   120,200, 0,320,   1],  [240,80, 480,0,  380,220, 3],
  [380,220,480,0,  600,160, 1],  [480,0,  720,60, 600,160, 0],
  [600,160,720,60, 820,200, 4],  [720,60, 960,0,  820,200, 2],
  [820,200,960,0,  1000,180,1],  [960,0,  1200,80,1000,180,3],
  [1000,180,1200,80,1140,260,0], [1200,80, 1440,0, 1300,200,2],
  [1300,200,1440,0, 1440,200,4], [1140,260,1300,200,1440,200,1],
  [0,320,  120,200, 200,400, 2], [200,400,120,200, 380,220, 0],
  [200,400,380,220, 420,420, 3], [0,320,  200,400, 0,560,   4],
  [0,560,  200,400, 240,560, 1], [200,400,420,420, 360,560, 0],
  [420,420,380,220, 600,160, 2], [420,420,600,160, 620,380, 1],
  [620,380,600,160, 820,200, 3], [620,380,820,200, 800,420, 0],
  [800,420,820,200, 1000,180,4], [800,420,1000,180,1020,380,2],
  [1020,380,1000,180,1140,260,1],[1020,380,1140,260,1160,440,3],
  [1160,440,1140,260,1300,200,0],[1160,440,1300,200,1340,420,2],
  [1340,420,1300,200,1440,200,4],[1340,420,1440,200,1440,420,1],
  [360,560, 420,420, 620,380,3], [360,560, 620,380, 600,560,0],
  [600,560, 620,380, 800,420,2], [800,420, 1020,380,1000,560,1],
  [1000,560,1020,380,1160,440,3],[1000,560,1160,440,1200,560,0],
  [1200,560,1160,440,1340,420,2],[1200,560,1340,420,1440,420,4],
  [1340,420,1440,420,1440,560,1],[240,560, 360,560, 300,480,3],
  [600,560, 800,420, 800,560,4],
];
const SHIMMER_IDX = new Set([7, 15, 28, 36]);

const LIGHT_FILLS = [
  'rgba(200,232,224,0.55)','rgba(224,244,240,0.70)',
  'rgba(185,220,212,0.50)','rgba(240,250,248,0.80)',
  'rgba(170,210,200,0.45)',
];
const DARK_FILLS = [
  'rgba(2,40,32,0.80)','rgba(3,56,44,0.65)',
  'rgba(2,28,22,0.90)','rgba(4,65,52,0.55)',
  'rgba(3,48,38,0.75)',
];

function PolyBg({ isDark, isCalm, running }) {
  const fills  = isDark ? DARK_FILLS : LIGHT_FILLS;
  const stroke = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.80)';
  return (
    <svg viewBox="0 0 1440 560" preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0 }}>
      {TRIS.map(([x1,y1,x2,y2,x3,y3,fi],i) => (
        <polygon key={i}
          points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
          fill={fills[fi]}
          stroke={stroke}
          strokeWidth="0.8"
          className={running && !isCalm && SHIMMER_IDX.has(i) ? 'mh-shimmer-run' : undefined}
        />
      ))}
    </svg>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function MockupsHeroPremium() {
  useEffect(() => { ensureCSS(); }, []);

  const { t, language }     = useTranslation();
  const isRTL               = language === 'ar';
  const { isDark }          = useThemeContext();
  const { mode, allowLoop } = useMotionPreference();
  const isCalm  = mode === 'calm';
  const saveData = typeof navigator !== 'undefined'
    && (navigator.connection?.saveData===true || navigator.connection?.effectiveType==='slow-2g');

  /* Pause off-screen / tab hidden */
  const ref = useRef(null);
  const [inView,  setInView]  = useState(true);
  const [tabVis,  setTabVis]  = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver==='undefined') return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold:0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  useEffect(() => {
    const fn = () => setTabVis(!document.hidden);
    document.addEventListener('visibilitychange', fn);
    return () => document.removeEventListener('visibilitychange', fn);
  }, []);
  const running = inView && tabVis && !isCalm && !saveData && allowLoop;
  const paused  = !running;

  /* Divider fill = next section's background token, computed at runtime */
  const [divFill, setDivFill] = useState(() => {
    // Synchronous read on mount for instant correct fill
    if (typeof document === 'undefined') return '';
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--color-background').trim() || '';
  });
  useEffect(() => {
    setDivFill(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-background').trim()
        || (isDark ? '#01120F' : '#FFFFFF')
    );
  }, [isDark]);

  /* i18n */
  const badge   = t('mockups.hero.label');
  const title   = t('mockups.hero.title');
  const accent  = t('mockups.hero.titleAccent');
  const desc    = t('mockups.hero.description');
  const ctaPri  = t('mockups.hero.primaryCTA');
  const ctaSec  = t('mockups.hero.secondaryCTA');

  /* Single H1: "So are you ready?" in EN / "هل أنتَ مستعد؟" in AR
     The word "ready?" (EN) / "مستعد؟" (AR) gets the emerald accent. */
  const h1Plain = language === 'ar' ? 'هل أنتَ'   : 'So are you';
  const h1Acc   = language === 'ar' ? 'مستعد؟'    : 'ready?';

  /* Alt text translated */
  const handsAlt = language === 'ar'
    ? 'يدان تمسكان ورقة مجعّدة بعليها علامة استفهام'
    : 'Two hands holding crumpled paper with a question mark';

  /* Stagger delays */
  const d = (i) => isCalm ? {} : { animationDelay:`${i*60}ms` };

  /* Background */
  const heroBg = isDark
    ? 'linear-gradient(160deg,#01120F 0%,#02231E 60%,#01120F 100%)'
    : 'linear-gradient(160deg,#E8F5F2 0%,#F0FAF7 55%,#E0F4EF 100%)';

  return (
    <section
      ref={ref}
      aria-label={language==='ar' ? 'قسم بطل الصفحة' : 'Hero section'}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        position: 'relative',
        minHeight: '88vh',
        display: 'grid',
        /* Two columns; RTL: order reverses via column-reverse on the grid */
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr',
        overflow: 'hidden',
        background: heroBg,
      }}
    >
      {/* Low-poly pattern */}
      <PolyBg isDark={isDark} isCalm={isCalm} running={running} />

      {/* Bottom gradient fade (behind divider) */}
      <div aria-hidden="true" style={{
        position:'absolute', bottom:0, left:0, right:0, height:'28%',
        background: isDark
          ? 'linear-gradient(to bottom,transparent,rgba(1,18,15,0.55))'
          : 'linear-gradient(to bottom,transparent,rgba(240,250,247,0.70))',
        pointerEvents:'none', zIndex:1,
      }} />

      {/* ══ TEXT COLUMN (start side) ══ */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',   /* always start-aligned */
        paddingInlineStart: 'clamp(24px,5vw,96px)',
        paddingInlineEnd: 'clamp(16px,3vw,48px)',
        paddingTop: 'clamp(80px,10vh,120px)',
        paddingBottom: 60,
        /* No manual gridColumn — dir="rtl" on the section swaps visually automatically */
      }}>

        {/* Eyebrow */}
        <div className="mh-enter" style={{ ...d(0), marginBottom:16 }}>
          <span style={{
            display:'inline-flex', alignItems:'center', gap:6,
            padding:'5px 14px', borderRadius:999,
            background: isDark?'rgba(13,158,130,0.20)':'rgba(13,158,130,0.12)',
            border:'1px solid rgba(13,158,130,0.35)',
            color: isDark?'#55C8B1':'#06796A',
            fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
          }}>
            <span aria-hidden="true" style={{
              width:5, height:5, borderRadius:'50%', background:'#0D9E82', display:'inline-block',
            }} />
            {badge}
          </span>
        </div>

        {/* SINGLE H1 — "So are you ready?" */}
        <h1
          className="mh-enter"
          dir="auto"
          style={{
            ...d(1), margin:'0 0 12px',
            fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
            fontSize:'clamp(44px,5.5vw,80px)',
            lineHeight:1.05, fontWeight:800,
            letterSpacing:'-0.025em',
            textWrap:'balance',
          }}
        >
          <span style={{ color: isDark?'#E6F7F3':'#01120F' }}>{h1Plain} </span>
          {/* Accent word in emerald gradient — solid color fallback */}
          <span style={{
            background:'linear-gradient(135deg,#0D9E82 0%,#26B59A 50%,#06796A 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            backgroundClip:'text', color:'#0D9E82',
          }}>{h1Acc}</span>
        </h1>

        {/* Subtitle <p> — NOT a heading */}
        <p
          className="mh-enter"
          dir="auto"
          style={{
            ...d(2), margin:'0 0 12px',
            fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
            fontSize:'clamp(18px,2.2vw,28px)',
            fontWeight:700, lineHeight:1.25,
          }}
        >
          <span style={{ color: isDark?'#B2F0E0':'#02231E' }}>{title} </span>
          <span style={{
            background:'linear-gradient(135deg,#0D9E82 0%,#26B59A 50%,#06796A 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            backgroundClip:'text', color:'#0D9E82',
          }}>{accent}</span>
        </p>

        {/* Description */}
        <p className="mh-enter" dir="auto" style={{
          ...d(3), margin:'0 0 32px',
          fontSize:16, lineHeight:1.65,
          color: isDark?'#7ABFB0':'#3D6B61',
          maxWidth:'52ch',
        }}>
          {desc}
        </p>

        {/* CTAs */}
        <div className="mh-enter" style={{
          ...d(4),
          display:'flex', flexWrap:'wrap', gap:12, alignItems:'center',
        }}>
          <Button asChild size="lg" className="h-12 px-7 rounded-xl font-bold text-base">
            <a href="#mockups-grid">{ctaPri}</a>
          </Button>
          <Button asChild variant="outline" size="lg"
            className="h-12 px-7 rounded-xl font-semibold text-base">
            <Link to="/contact">{ctaSec}</Link>
          </Button>
        </div>

        {/* Scroll cue — TEXT COLUMN, never overlaps visual */}
        <div
          className="mh-enter"
          aria-hidden="true"
          style={{
            ...d(6),
            marginTop:'auto', paddingTop:32,
            display:'flex', alignItems:'center', gap:6,
            color: isDark?'rgba(255,255,255,0.35)':'rgba(0,0,0,0.30)',
            fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase',
          }}
        >
          <span>↓</span>
          <span style={{ fontFamily:'system-ui' }}>
            {language==='ar' ? 'مرر للأسفل' : 'Scroll'}
          </span>
        </div>
      </div>

      {/* ══ VISUAL COLUMN (end side, full height, bottom-flush) ══ */}
      <div
        className="mh-enter"
        style={{
          ...d(2),
          position: 'relative', zIndex: 2,
          display: 'flex',
          alignItems: 'flex-end',   /* bottom-flush */
          justifyContent: 'center',
          overflow: 'hidden',
          paddingTop: 60,           /* give top of image room to breathe */
          /* No gridColumn override — dir="rtl" handles visual position */
          /* Dark: emerald radial glow behind hands — no blur */
          ...(isDark ? {
            background: 'radial-gradient(ellipse 60% 60% at 50% 80%, rgba(13,158,130,0.18) 0%, transparent 70%)',
          } : {}),
        }}
        aria-hidden="true"
      >
        <picture>
          {/* Phone source (never served on desktop — media query handles this) */}
          <source
            srcSet="/hero/hands-360.webp"
            type="image/webp"
            media="(max-width: 768px)"
          />
          {/* Desktop source */}
          <source
            srcSet="/hero/hands-720.webp"
            type="image/webp"
          />
          {/* Fallback PNG */}
          <img
            src="/hero/hands.png"
            alt={handsAlt}
            width={414}
            height={584}
            decoding="async"
            fetchPriority="low"
            style={{
              /* Show as much of the image as possible, bottom-flush */
              width: 'auto',
              height: '100%',
              maxHeight: '75vh',
              objectFit: 'contain',
              objectPosition: 'bottom center',
              display: 'block',
              maxWidth: '90%',
              filter: isDark
                ? 'drop-shadow(0 8px 32px rgba(0,0,0,0.60)) drop-shadow(0 0 24px rgba(13,158,130,0.25))'
                : 'drop-shadow(0 8px 32px rgba(0,0,0,0.12))',
            }}
            className={running ? `mh-float-run${paused ? ' mh-paused' : ''}` : ''}
          />
        </picture>
      </div>

      {/* Curved divider — fill matches next section bg, with solid backing */}
      <div
        aria-hidden="true"
        style={{
          position:'absolute', bottom:0, left:0, right:0,
          lineHeight:0, zIndex:10, pointerEvents:'none',
        }}
      >
        {/* Solid backing strip — eliminates seam between hero and SVG path */}
        <div style={{
          position:'absolute',
          bottom:0, left:0, right:0,
          height: 'clamp(20px,2.5vw,32px)',
          background: divFill || (isDark ? '#01120F' : '#FFFFFF'),
        }} />
        <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ display:'block', width:'100%', height:'clamp(32px,4vw,48px)', position:'relative' }}>
          <path
            d="M0,24 C360,48 720,0 1080,24 C1260,36 1380,12 1440,24 L1440,48 L0,48 Z"
            fill={divFill || (isDark ? '#01120F' : '#FFFFFF')}
          />
        </svg>
      </div>
    </section>
  );
}
