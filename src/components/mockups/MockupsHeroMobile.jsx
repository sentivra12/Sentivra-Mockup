/**
 * MockupsHeroMobile — 9:16 poster that fits EXACTLY one phone screen.
 *
 * ROOT PROBLEM with previous version:
 *   The section used `min-height: max(100svh, calc(68px + 340px + imageH - 24px))`.
 *   At 360×640 this evaluated to 780px (> 640px), so the poster was taller than
 *   the viewport. The user had to scroll to see the hands image.
 *
 * FIX — grid layout with strict height: 100svh
 * ─────────────────────────────────────────────
 * Section A (poster):
 *   height: 100svh (hard, not min-height)
 *   display: grid
 *   grid-template-rows: auto 1fr
 *   overflow: hidden
 *   isolation: isolate
 *
 *   Row 1 (auto): navbar clearance + eyebrow + H1
 *     H1 sized from BOTH sides:
 *       "So"      → clamp(28px, 4.2svh, 40px)
 *       "are/you/ready?" → clamp(44px, min(15vw, 8.2svh), 72px)
 *       line-height: 0.92
 *     This caps the h1 block at ≤ ~40svh on all supported viewports.
 *
 *   Row 2 (1fr): visual area — takes all remaining height.
 *     position: relative; overflow: hidden
 *     Contains:
 *       - emerald glow (absolute, full fill, z-index 0)
 *       - hands <picture> (absolute, bottom:-1px, centered, z-index 1)
 *         height: min(100%, 48svh); width: auto
 *         This sizes the image by the remaining height so it always
 *         fills the visual row WITHOUT overflowing.
 *         At very short screens (<=680px): height capped at 42svh.
 *
 * The "ready?" line is in row 1 (bottom of h1). The image top-of-paper
 * overlaps "ready?" by ~16-24px because the visual row starts immediately
 * after row 1, and the image is bottom-anchored — paper top = row2.top +
 * (row2.height − imageHeight), which is roughly at the boundary between
 * row 1 and row 2, overlapping the last h1 line by the desired amount.
 *
 * Section B (content sheet):
 *   margin-top: -24px (overlaps poster bottom by 24px so wrists hide behind sheet)
 *   background: var(--color-background) — same as next section, no seam
 *   border-start-radius: 28px
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useThemeContext } from '@/theme/ThemeContext';
import { useMockups, useMockupCategories } from '@/hooks/useContent';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { Button } from '@/components/ui/button';

/* ── Low-poly triangles ─────────────────────────────────────────────────── */
const MOB_TRIS = [
  [0,0,120,60,60,140,0],[60,140,120,60,200,100,2],[0,0,60,140,0,220,1],
  [120,60,240,0,200,100,3],[200,100,240,0,320,80,0],[240,0,400,0,320,80,2],
  [320,80,400,0,400,120,4],[0,220,60,140,100,260,1],[100,260,60,140,200,100,3],
  [100,260,200,100,220,240,0],[220,240,200,100,320,80,2],[220,240,320,80,340,220,1],
  [340,220,320,80,400,120,4],[340,220,400,120,400,260,3],[0,300,100,260,80,300,2],
  [80,300,100,260,220,240,0],[220,240,340,220,280,300,3],[280,300,340,220,400,260,1],
  [280,300,400,260,400,300,0],[0,220,100,260,0,300,4],
];
const LIGHT_F = ['rgba(200,232,224,0.55)','rgba(224,244,240,0.70)','rgba(185,220,212,0.50)','rgba(240,250,248,0.80)','rgba(170,210,200,0.45)'];
const DARK_F  = ['rgba(2,40,32,0.80)','rgba(3,56,44,0.65)','rgba(2,28,22,0.90)','rgba(4,65,52,0.55)','rgba(3,48,38,0.75)'];

function PolyBg({ isDark }) {
  const fills  = isDark ? DARK_F : LIGHT_F;
  const stroke = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.80)';
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"
      style={{ position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0 }}>
      {MOB_TRIS.map(([x1,y1,x2,y2,x3,y3,fi],i) => (
        <polygon key={i} points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
          fill={fills[fi % fills.length]} stroke={stroke} strokeWidth="0.6" />
      ))}
    </svg>
  );
}

/* ── CSS injected once ─────────────────────────────────────────────────── */
const CSS = `
/* Poster sizing: hard 100svh, fallback to 100vh if svh not supported */
.mhpm-poster {
  height: 100vh;
  height: 100svh;
}
@supports (height: 100svh) {
  .mhpm-poster { height: 100svh; }
}

/* Short screens: shrink image row */
@media (max-height: 680px) {
  .mhpm-imgwrap img { height: min(100%, 42svh) !important; }
}

@keyframes mh-enter {
  from { opacity:0; transform:translateY(14px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes mh-force { to { opacity:1; transform:none; } }
.mh-enter {
  opacity:0;
  animation: mh-enter 0.35s cubic-bezier(0.16,1,0.3,1) both,
             mh-force 0s linear 1.5s both;
}
@keyframes mhp-float {
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(-6px); }
}
.mhp-float-run  { animation: mhp-float 7s ease-in-out infinite; will-change:transform; }
.mhp-paused     { animation-play-state: paused !important; }
[data-motion="calm"] .mh-enter      { animation:none; opacity:1; transform:none; }
[data-motion="calm"] .mhp-float-run { animation:none; }

/* Scroll chevron bounce */
@keyframes mhp-bounce {
  0%,100% { transform:translateY(0); }
  50%      { transform:translateY(4px); }
}
.mhp-bounce { animation: mhp-bounce 1.6s ease-in-out infinite; }
[data-motion="calm"] .mhp-bounce { animation:none; }
`;
let _css = false;
function ensureCSS() {
  if (_css || typeof document === 'undefined') return;
  if (document.querySelector('[data-id="mhpm-css"]')) { _css = true; return; }
  const s = document.createElement('style');
  s.textContent = CSS; s.dataset.id = 'mhpm-css';
  document.head.appendChild(s); _css = true;
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function MockupsHeroMobile() {
  useEffect(() => { ensureCSS(); }, []);

  const { t, language }     = useTranslation();
  const isRTL               = language === 'ar';
  const { isDark }          = useThemeContext();
  const { mode, allowLoop } = useMotionPreference();
  const isCalm  = mode === 'calm';
  const saveData = typeof navigator !== 'undefined'
    && (navigator.connection?.saveData === true || navigator.connection?.effectiveType === 'slow-2g');

  /* Compute optimal image width based on row2 height so overlap = ~20px */
  const [imgStyle, setImgStyle] = useState({ width: '100vw', height: 'auto' });
  const row2Ref = useRef(null);
  useEffect(() => {
    const el = row2Ref.current;
    if (!el) return;
    const compute = () => {
      // Synchronous — getBoundingClientRect is reliable after first layout
      const row2H = el.getBoundingClientRect().height;
      if (row2H <= 0) {
        // Retry on next frame if layout not ready
        requestAnimationFrame(compute);
        return;
      }
      const targetH = row2H + 20;
      const targetW = targetH / 1.4111;
      const vw      = window.innerWidth;
      const finalW  = Math.min(targetW, vw * 1.12);
      setImgStyle({ width: `${Math.round(finalW)}px`, height: 'auto' });
    };
    compute();
    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(compute) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, []);
  const visualRef = useRef(null);
  const [inView, setInView] = useState(true);
  const [tabVis, setTabVis] = useState(true);
  useEffect(() => {
    const el = visualRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  useEffect(() => {
    const fn = () => setTabVis(!document.hidden);
    document.addEventListener('visibilitychange', fn);
    return () => document.removeEventListener('visibilitychange', fn);
  }, []);
  const running = inView && tabVis && !isCalm && !saveData && allowLoop;
  const paused  = !running;

  /* Sheet bg = var(--color-background) for seamless transition */
  const [sheetBg, setSheetBg] = useState(() => {
    if (typeof document === 'undefined') return '#FFFFFF';
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--color-background').trim() || '#FFFFFF';
  });
  useEffect(() => {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-background').trim();
    setSheetBg(v || (isDark ? '#01120F' : '#FFFFFF'));
  }, [isDark]);

  /* Real data */
  const { data: mockups    = [] } = useMockups();
  const { data: categories = [] } = useMockupCategories();
  const publishedCount = useMemo(
    () => (mockups || []).filter(m => m.is_active === true || m.published === true).length,
    [mockups]
  );
  const catCount = (categories || []).length;

  /* i18n */
  const badge   = t('mockups.hero.label');
  const title   = t('mockups.hero.title');
  const accent  = t('mockups.hero.titleAccent');
  const desc    = t('mockups.hero.description');
  const ctaPri  = t('mockups.hero.primaryCTA');
  const ctaSec  = t('mockups.hero.secondaryCTA');

  /*
   * H1 lines sized from BOTH sides (vw + svh):
   *   "So" is small — sets the visual rhythm without eating svh
   *   "are/you/ready?" — capped by BOTH 15vw and 8.2svh
   *   At 360×640: min(15×360/100, 8.2×640/100) = min(54, 52.5) = 52.5px
   *   At 390×844: min(15×390/100, 8.2×844/100) = min(58.5, 69.2) = 58.5px
   *   At 412×915: min(15×412/100, 8.2×915/100) = min(61.8, 75) = 61.8px
   *   Total h1 block ≈ 4 lines × 52-62px × 0.92 lh ≈ 191-228px
   *   = 30-27% of viewport → well under 45%.
   *
   * AR: wider glyphs so clamp minimum is lower to prevent overflow at 360px.
   */
  const bigSize = 'clamp(44px, min(15vw, 8.2svh), 72px)';
  const soSize  = 'clamp(28px, 4.2svh, 40px)';

  const h1Lines = isRTL
    ? [
        { text: 'هل',      size: 'clamp(28px, 4.2svh, 40px)',         emerald: false },
        { text: 'أنتَ',    size: 'clamp(38px, min(12vw, 7svh), 60px)', emerald: false },
        { text: 'مستعد؟',  size: 'clamp(34px, min(11vw, 6.5svh), 56px)', emerald: true },
      ]
    : [
        { text: 'So',      size: soSize,   emerald: false },
        { text: 'are',     size: bigSize,  emerald: false },
        { text: 'you',     size: bigSize,  emerald: false },
        { text: 'ready?',  size: bigSize,  emerald: true  },
      ];

  const handsAlt = isRTL
    ? 'يدان تمسكان ورقة مجعّدة بعليها علامة استفهام'
    : 'Two hands holding crumpled paper with a question mark';

  const d = (i) => isCalm ? {} : { animationDelay: `${i * 55}ms` };

  const posterBg = isDark
    ? 'linear-gradient(165deg,#01120F 0%,#02231E 60%,#01120F 100%)'
    : 'linear-gradient(165deg,#E8F5F2 0%,#F0FAF7 55%,#E0F4EF 100%)';

  const glowColor = isDark
    ? 'radial-gradient(ellipse 85% 70% at 50% 90%, rgba(13,158,130,0.30) 0%, transparent 65%)'
    : 'radial-gradient(ellipse 85% 70% at 50% 90%, rgba(13,158,130,0.15) 0%, transparent 65%)';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ════════════════════════════════════════════════
          SECTION A — POSTER (exactly one viewport tall)
          ════════════════════════════════════════════════ */}
      <section
        aria-label={isRTL ? 'قسم بطل الصفحة' : 'Hero section'}
        className="mhpm-poster"
        style={{
          /*
           * height: 100svh via className (with fallback in CSS)
           * display:grid splits into:
           *   row 1 (auto) = navbar clearance + eyebrow + h1
           *   row 2 (1fr)  = hands visual, takes all remaining height
           */
          display: 'grid',
          gridTemplateRows: 'auto 1fr',
          position: 'relative',
          overflow: 'hidden',
          isolation: 'isolate',
          background: posterBg,
        }}
      >
        {/* Background triangles (absolute, full section) */}
        <PolyBg isDark={isDark} />

        {/* ── ROW 1: navbar clearance + eyebrow + H1 ── */}
        <div style={{
          position: 'relative',
          zIndex: 3,
          paddingTop: 'max(68px, calc(60px + env(safe-area-inset-top, 0px)))',
          paddingInlineStart: 'clamp(20px, 5vw, 32px)',
          paddingInlineEnd: 'clamp(20px, 5vw, 32px)',
          /*
           * No paddingBottom here — the overlap between "ready?" and the image
           * comes naturally from the visual row starting immediately below.
           * The image is bottom-anchored in its row, so its top sits at:
           *   row1.bottom + (row2.height - imageHeight)
           * When imageHeight ≈ row2.height, imageTop ≈ row1.bottom → ~0px gap.
           * In practice the image is slightly shorter than the row (48svh cap)
           * so there is a small positive gap, which we bridge by pulling the
           * image up with a negative margin in the wrapper:
           *   marginTop: -20px on the img wrapper creates the 16-24px overlap.
           */
        }}>
          {/* Eyebrow */}
          <div className="mh-enter" style={{ ...d(0), marginBottom: 12 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 999,
              background: isDark ? 'rgba(13,158,130,0.22)' : 'rgba(13,158,130,0.12)',
              border: '1px solid rgba(13,158,130,0.38)',
              color: isDark ? '#55C8B1' : '#06796A',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <Sparkles size={9} color={isDark ? '#55C8B1' : '#0D9E82'} aria-hidden="true" />
              {badge}
            </span>
          </div>

          {/* H1 — stacked, svh-capped */}
          <h1
            dir="auto"
            style={{
              margin: 0, padding: 0,
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              lineHeight: 0.92,
              letterSpacing: '-0.02em',
              fontWeight: 800,
              textAlign: 'start',
            }}
          >
            {h1Lines.map((line, i) => (
              <span
                key={i}
                data-line={line.text}
                className="mh-enter"
                style={{
                  ...d(i + 1),
                  display: 'block',
                  fontSize: line.size,
                  fontWeight: 800,
                  lineHeight: 0.92,
                  paddingBottom: line.emerald ? 4 : 0,
                  ...(line.emerald ? {
                    background: 'linear-gradient(135deg,#0D9E82 0%,#26B59A 50%,#06796A 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: '#0D9E82',
                  } : {
                    color: isDark ? '#E6F7F3' : '#01120F',
                  }),
                }}
              >
                {line.text}
              </span>
            ))}
          </h1>
        </div>

        {/* ── ROW 2: visual area (1fr = all remaining height) ── */}
        <div
          ref={(el) => { visualRef.current = el; row2Ref.current = el; }}
          className="mhpm-imgwrap"
          style={{
            position: 'relative',
            overflow: 'visible',  /* allow image top to extend into h1 row for overlap */
            zIndex: 2,
            minHeight: 0,
          }}
        >
          {/* Emerald glow behind image — no blur */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0,
            background: glowColor,
            zIndex: 0,
            pointerEvents: 'none',
          }} />

          {/*
           * Hands image:
           *   position:absolute, top:-20px, bottom:-1px, centered
           *   height: calc(100% + 20px) fills the visual row + 20px overlap into h1
           *   width: auto → natural aspect ratio preserved
           *   top:-20px creates the overlap (image starts 20px above row2 top = inside h1)
           *   The paper top is at ~20px above the row boundary = overlaps "ready?" by ~20px.
           */}
          {/* ── Hands image: bottom-flush, centered, JS-sized ── */}
          <picture
            style={{
              position: 'absolute',
              bottom: -1,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1,
              lineHeight: 0,
              display: 'block',
              /* JS sets width to (row2H+20)/1.4111 so image fills visual row
                 and extends 20px above into h1 for the "ready?" overlap */
              width: imgStyle.width,
            }}
          >
            <source
              srcSet="/hero/hands-360.webp 360w, /hero/hands-720.webp 720w"
              sizes="(max-width: 435px) 80vw, 340px"
              type="image/webp"
            />
            <img
              src="/hero/hands.png"
              alt={handsAlt}
              width={360}
              height={508}
              decoding="async"
              fetchPriority="low"
              loading="eager"
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                background: 'transparent',
              }}
              className={running ? `mhp-float-run${paused ? ' mhp-paused' : ''}` : ''}
            />
          </picture>

          {/* Scroll hint chevron — static, aria-hidden */}
          <div
            aria-hidden="true"
            className={isCalm ? '' : 'mhp-bounce'}
            style={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 4,
              color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)',
              fontSize: 18,
              lineHeight: 1,
              pointerEvents: 'none',
            }}
          >
            ↓
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SECTION B — CONTENT SHEET
          margin-top:-24px overlaps poster so wrists hide
          bg = var(--color-background) = next section → no seam
          ════════════════════════════════════════════════ */}
      <section
        data-hero-sheet="true"
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{
          position: 'relative',
          zIndex: 10,
          marginTop: -24,
          background: sheetBg,
          borderStartStartRadius: 28,
          borderStartEndRadius: 28,
          padding: '32px 20px',
          paddingBottom: 'max(40px, calc(env(safe-area-inset-bottom, 0px) + 32px))',
        }}
      >
        {/* Subtitle */}
        <p dir="auto" style={{
          margin: '0 0 10px',
          fontSize: 'clamp(15px, 4vw, 18px)',
          fontWeight: 500, lineHeight: 1.3,
          color: isDark ? '#7ABFB0' : '#3D6B61',
        }}>
          <span>{title} </span>
          <span style={{
            background: 'linear-gradient(135deg,#0D9E82 0%,#26B59A 50%,#06796A 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', color: '#0D9E82', fontWeight: 600,
          }}>{accent}</span>
        </p>

        {/* Paragraph — no clamp */}
        <p dir="auto" style={{
          margin: '0 0 20px',
          fontSize: 15, lineHeight: 1.55,
          color: isDark ? '#7ABFB0' : '#3D6B61',
          display: 'block',
        }}>
          {desc}
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <Button asChild size="lg" className="w-full h-12 rounded-xl font-bold text-base">
            <a href="#mockups-grid">{ctaPri}</a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full h-12 rounded-xl font-semibold text-base"
          >
            <Link to="/contact">{ctaSec}</Link>
          </Button>
        </div>

        {/* Stats — real DB values only */}
        {(publishedCount > 0 || catCount > 0) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {publishedCount > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: isDark ? '#E6F7F3' : '#01120F', lineHeight: 1 }}>{publishedCount}+</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {isRTL ? 'تصميم' : 'Designs'}
                </span>
              </span>
            )}
            {publishedCount > 0 && catCount > 0 && (
              <span aria-hidden="true" style={{ width: 1, height: 14, background: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)' }} />
            )}
            {catCount > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: isDark ? '#E6F7F3' : '#01120F', lineHeight: 1 }}>{catCount}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {isRTL ? 'صناعة' : 'Industries'}
                </span>
              </span>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
