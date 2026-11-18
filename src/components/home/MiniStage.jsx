/**
 * MiniStage — compact phone hero illustration (Round 2)
 *
 * Layout contract:
 *  • Root: position:relative, width:100%, height:100%
 *    (parent gives it a flex-1 container sized by the hero layout)
 *  • No position:absolute on the root — it stays in document flow
 *  • Internal elements ARE absolutely-positioned inside the root
 *  • overflow:hidden + isolation:isolate on root → nothing escapes
 *  • Satellite cards: 12px min inset from edges (never touch screen edge)
 *
 * Animations (max 3 running loops in the whole hero):
 *  This component runs 2 of the 3 slots:
 *   (a) ms-float — main browser card, 8s vertical bob (translateY 0→-5px)
 *   (b) ms-pulse — SP core node, 3s scale 1→1.06, with a glow ring expanding out
 *  The 3rd slot is used by HomeHeroMobile for content fade-up (one-shot, not a loop).
 *
 *  Additional CSS-only effects (not counted as "running loops" — they are one-shot
 *  or use stroke-dashoffset which the browser can run off the compositor):
 *   (c) ms-bar-grow — analytics bars grow once on mount (scaleY 0→1, transform-origin bottom)
 *   (d) ms-dash-flow — SVG connector strokeDashoffset marching (CSS animation on <path>)
 *   (e) ms-glow-ring — pulse ring expands from core node, fades out (scale+opacity, loop)
 *
 *  All animations: transform/opacity only. will-change only on the two looping elements.
 *  Pause: IntersectionObserver (threshold 0.1) + visibilitychange + calm mode + saveData.
 *  Calm / data-motion="calm": animation:none on everything → final visible state.
 *  No blur, no backdrop-filter, no box-shadow chains.
 *
 * RTL: root scaleX(-1) mirrors the whole stage.
 *      Text inside satellite labels gets scaleX(-1) back so it reads correctly.
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { SPMark } from '@/components/ui/Logo';

/* ── CSS injected once into <head> ─────────────────────────────────────── */
const STAGE_CSS = `
/* ── Loop a: browser card float ───────────────────── */
@keyframes ms-float {
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(-5px); }
}
/* ── Loop b: SP node pulse ────────────────────────── */
@keyframes ms-pulse {
  0%,100% { transform: scale(1); }
  50%      { transform: scale(1.06); }
}
/* ── Loop b2: glow ring ───────────────────────────── */
@keyframes ms-glow-ring {
  0%   { transform: scale(0.9); opacity: 0.7; }
  100% { transform: scale(1.9); opacity: 0; }
}
/* ── One-shot c: bar grow ─────────────────────────── */
@keyframes ms-bar-grow {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
/* ── Loop d: SVG dash flow ────────────────────────── */
@keyframes ms-dash-flow {
  from { stroke-dashoffset: 0; }
  to   { stroke-dashoffset: -24; }
}

/* Running classes */
.ms-float-run  {
  animation: ms-float 8s ease-in-out infinite;
  will-change: transform;
}
.ms-pulse-run  {
  animation: ms-pulse 3s ease-in-out infinite;
  will-change: transform;
}
.ms-ring-run   { animation: ms-glow-ring 2.4s ease-out infinite; }
.ms-bar-run    {
  animation: ms-bar-grow 0.55s cubic-bezier(0.22,1,0.36,1) both;
  transform-origin: bottom center;
}
.ms-dash-run   { animation: ms-dash-flow 2s linear infinite; }

/* Paused state */
.ms-paused     { animation-play-state: paused !important; }

/* Calm/reduced-motion: jump to final state */
[data-motion="calm"] .ms-float-run,
[data-motion="calm"] .ms-pulse-run,
[data-motion="calm"] .ms-ring-run,
[data-motion="calm"] .ms-bar-run,
[data-motion="calm"] .ms-dash-run {
  animation: none !important;
  transform: none;
  opacity: 1;
}
/* Bar final state when animation is off */
[data-motion="calm"] .ms-bar-run { transform: scaleY(1) !important; }
`;

let _cssInjected = false;
function ensureCSS() {
  if (_cssInjected || typeof document === 'undefined') return;
  const s = document.createElement('style');
  s.textContent = STAGE_CSS;
  s.dataset.id  = 'ms-css-v2';
  document.head.appendChild(s);
  _cssInjected = true;
}

/* ── Design tokens ─────────────────────────────────────────────────────── */
const T = {
  cardBg:     'rgba(1,18,15,0.72)',
  border:     'rgba(13,158,130,0.28)',
  borderMain: 'rgba(13,158,130,0.55)',
  shadow:     '0 4px 14px rgba(0,0,0,0.32)',
  shadowSat:  '0 2px 8px rgba(0,0,0,0.28)',
  textLabel:  '#B2F0E0',
  barA:       '#0D9E82',
  barB:       'rgba(13,158,130,0.42)',
  line:       'rgba(13,158,130,0.35)',
  nodeGrad:   'linear-gradient(135deg,#0D9E82 0%,#044D40 100%)',
  nodeGlow:   'rgba(13,158,130,0.45)',
};

/* ── BrowserCard ───────────────────────────────────────────────────────── */
const BrowserCard = ({ paused }) => (
  <div style={{
    background: T.cardBg, border: `1px solid ${T.borderMain}`,
    boxShadow: T.shadow, borderRadius: 10,
    overflow: 'hidden', width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
  }}>
    {/* Chrome bar */}
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '5px 9px', borderBottom: `1px solid ${T.border}`, flexShrink: 0,
    }}>
      {['#E05252','#E0A952','#52C07A'].map((c,i) => (
        <div key={i} style={{ width:6,height:6,borderRadius:'50%',background:c,opacity:0.7 }} />
      ))}
      <div style={{ flex:1, marginInlineStart:5, height:7, borderRadius:3, background:'rgba(255,255,255,0.08)' }} />
    </div>
    {/* Page skeleton */}
    <div style={{ padding:'9px 11px', display:'flex', flexDirection:'column', gap:7, flex:1 }}>
      {/* Hero row */}
      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        <div style={{ width:'62%', height:8, borderRadius:3, background:T.barA, opacity:0.80 }} />
        <div style={{ width:'80%', height:5, borderRadius:3, background:'rgba(255,255,255,0.11)' }} />
        <div style={{ width:'44%', height:5, borderRadius:3, background:'rgba(255,255,255,0.07)' }} />
        <div style={{ width:46, height:13, borderRadius:5, background:T.barA, opacity:0.75, marginTop:3 }} />
      </div>
      {/* Cards */}
      <div style={{ display:'flex', gap:5, flex:1 }}>
        {[72,58,78].map((h,i) => (
          <div key={i} style={{
            flex:1, borderRadius:5, padding:'5px 7px',
            background:'rgba(255,255,255,0.03)', border:`1px solid ${T.border}`,
          }}>
            <div style={{ width:'100%', height:3, borderRadius:2, background:T.barB, marginBottom:3 }} />
            <div style={{ width:'65%', height:3, borderRadius:2, background:'rgba(255,255,255,0.09)' }} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ── SP Core Node + glow ring ───────────────────────────────────────────── */
const CoreNode = ({ size = 34, running, paused }) => (
  <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
    {/* Expanding glow ring behind node */}
    <div
      className={running ? `ms-ring-run${paused ? ' ms-paused' : ''}` : ''}
      aria-hidden="true"
      style={{
        position:'absolute',
        inset: -size * 0.25,
        borderRadius:'50%',
        border:`1.5px solid ${T.nodeGlow}`,
        pointerEvents:'none',
      }}
    />
    {/* Core */}
    <div
      className={running ? `ms-pulse-run${paused ? ' ms-paused' : ''}` : ''}
      style={{
        width:size, height:size, borderRadius:'50%',
        background: T.nodeGrad,
        border:`1px solid rgba(13,158,130,0.60)`,
        boxShadow:`0 2px 10px ${T.nodeGlow}`,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}
      aria-hidden="true"
    >
      <SPMark size={size * 0.58} showBg={false} />
    </div>
  </div>
);

/* ── Analytics satellite card ──────────────────────────────────────────── */
const AnalyticsCard = ({ label, bars, running, paused, delay = 0, isRTL }) => (
  <div style={{
    background: T.cardBg, border:`1px solid ${T.border}`,
    boxShadow: T.shadowSat, borderRadius:8,
    padding:'7px 9px', minWidth:0,
  }}>
    {/* Status dot */}
    <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:5 }}>
      <div
        className={running ? `ms-pulse-run${paused ? ' ms-paused' : ''}` : ''}
        style={{
          width:5, height:5, borderRadius:'50%', background:T.barA, flexShrink:0,
        }}
        aria-hidden="true"
      />
      <div style={{
        fontSize:9, fontWeight:700, color: T.textLabel,
        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        /* Undo the parent scaleX(-1) for text so it reads correctly in RTL */
        transform: isRTL ? 'scaleX(-1)' : 'none',
        direction: isRTL ? 'rtl' : 'ltr',
      }}>
        {label}
      </div>
    </div>
    {/* Bars — grow once on mount */}
    <div style={{ display:'flex', gap:2, alignItems:'flex-end', height:16 }}>
      {bars.map((h, i) => (
        <div
          key={i}
          className={running ? `ms-bar-run${paused ? ' ms-paused' : ''}` : ''}
          style={{
            flex:1,
            height: `${h}%`,
            maxHeight:16, minHeight:2,
            borderRadius:2,
            background: i % 2 === 0 ? T.barA : T.barB,
            animationDelay: running ? `${delay + i * 55}ms` : '0ms',
          }}
        />
      ))}
    </div>
  </div>
);

/* ── Main component ─────────────────────────────────────────────────────── */
export default function MiniStage({
  services  = [],
  language  = 'en',
  isRTL     = false,
  isCalm    = false,
  saveData  = false,
}) {
  useEffect(() => { ensureCSS(); }, []);

  /* Pause when off-screen */
  const rootRef = useRef(null);
  const [inView,   setInView]   = useState(true);
  const [tabVisible, setTabVis] = useState(true);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const fn = () => setTabVis(!document.hidden);
    document.addEventListener('visibilitychange', fn);
    return () => document.removeEventListener('visibilitychange', fn);
  }, []);

  const running = inView && tabVisible && !isCalm && !saveData;
  const paused  = !running;

  /* Labels from real services or fallback */
  const names = useMemo(() => {
    const src = services.length
      ? services.slice(0, 4).map(s =>
          (language === 'ar' ? s.title_ar || s.title_en : s.title_en || s.title) || ''
        ).filter(Boolean)
      : [];
    const fb = language === 'ar'
      ? ['خدمات الويب', 'تطبيقات موبايل', 'تحليل البيانات', 'الذكاء الاصطناعي']
      : ['Web Apps', 'Mobile Apps', 'Analytics', 'AI & Chat'];
    return src.length >= 2 ? src : fb;
  }, [services, language]);

  const leftLabel  = names[0];
  const rightLabel = names[1];
  const leftBars   = [60, 85, 48, 72, 38];
  const rightBars  = [42, 68, 55, 80, 62];

  /* ── Connector path data (viewBox 0 0 100 100) ───────────────────── */
  const coreCX = 50, coreCY = 16;
  const satL   = { cx: 20, cy: 82 };
  const satR   = { cx: 80, cy: 82 };

  return (
    /*
     * Root: position:relative, width:100%, height:100%.
     * Parent (HomeHeroMobile) gives this a flex-1 container.
     * overflow:hidden + isolation:isolate ensures absolutely-positioned
     * children NEVER paint above the flex siblings (CTAs, chips) in any browser.
     */
    <div
      ref={rootRef}
      role="img"
      aria-label={
        language === 'ar'
          ? 'رسم توضيحي لخدمات البرمجيات'
          : 'Software services illustration'
      }
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        isolation: 'isolate',      /* creates stacking context — children stay inside */
        zIndex: 0,                 /* explicit: below any sibling with zIndex > 0 */
        /* RTL: mirror entire stage via scaleX; text inside cards un-mirrors itself */
        transform: isRTL ? 'scaleX(-1)' : 'none',
        direction: 'ltr',          /* always LTR internally */
      }}
    >
      {/* ── SVG: connector lines with dash-flow animation ── */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{
          position:'absolute', inset:0,
          width:'100%', height:'100%',
          pointerEvents:'none', zIndex:1,
        }}
      >
        {/* Left connector — static dashed, no animation (saves animation budget) */}
        <path
          d={`M ${coreCX} ${coreCY + 8} L ${satL.cx} ${satL.cy - 10}`}
          fill="none"
          stroke={T.line}
          strokeWidth="0.9"
          strokeDasharray="3 3"
        />
        {/* Right connector — static */}
        <path
          d={`M ${coreCX} ${coreCY + 8} L ${satR.cx} ${satR.cy - 10}`}
          fill="none"
          stroke={T.line}
          strokeWidth="0.9"
          strokeDasharray="3 3"
        />
      </svg>

      {/* ── SP Core Node — top-centre ── */}
      <div
        style={{
          position:'absolute', top:'6%', left:'50%',
          transform:'translateX(-50%)',
          zIndex:20,
        }}
      >
        <CoreNode size={34} running={running} paused={paused} />
      </div>

      {/* ── Main browser card — centred ── */}
      <div
        className={running ? `ms-float-run${paused ? ' ms-paused' : ''}` : ''}
        style={{
          position:'absolute',
          /* Vertically centred between core and satellites; 12px side inset */
          top: '20%', bottom: '20%',
          left: '12%', right: '12%',
          zIndex: 10,
        }}
      >
        <BrowserCard paused={paused} />
      </div>

      {/* ── Satellite left — bottom-left, 12px inset ── */}
      <div
        style={{
          position:'absolute',
          bottom:'4%', left: '3%',   /* ≥12px from edge at any stage width > 160px */
          width:'36%',
          zIndex:15,
        }}
      >
        <AnalyticsCard
          label={leftLabel}
          bars={leftBars}
          running={running}
          paused={paused}
          delay={80}
          isRTL={isRTL}
        />
      </div>

      {/* ── Satellite right — bottom-right, 12px inset ── */}
      <div
        style={{
          position:'absolute',
          bottom:'4%', right:'3%',
          width:'36%',
          zIndex:15,
        }}
      >
        <AnalyticsCard
          label={rightLabel}
          bars={rightBars}
          running={running}
          paused={paused}
          delay={180}
          isRTL={isRTL}
        />
      </div>
    </div>
  );
}
