/**
 * HomeHeroMobile — phones only (≤768px)
 * Dark brand surface regardless of site theme. HEIGHT: 100svh (100vh fallback).
 *
 * Flex-column, all interactive elements in normal flow (no absolute CTA/controls):
 *   clearance  — fixed header 68px
 *   visual     — flex:1; sparkle + keyword + title + description
 *   lockup     — once, outside slides
 *   CTA        — 52px white pill
 *   bottom row — WA | progress | prev/next
 *   safe-area
 *
 * Decorative bg layers: position:absolute, pointer-events:none
 */

import React, {
  useState, useEffect, useRef, useMemo, useCallback,
} from 'react';
import { useTranslation }      from '@/i18n/useTranslation';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { useServices, useSiteSettings } from '@/hooks/useContent';

/* ══════════════════════ CSS injected once ═══════════════════════════ */
const CSS = `
.hhm-root {
  height:100vh; height:100dvh; height:100svh;
  display:flex; flex-direction:column; overflow:hidden;
}

/* slide crossfade — all slides always mounted in ONE grid cell */
.hhm-slide {
  grid-row:1; grid-column:1;
  display:flex; flex-direction:column; justify-content:flex-end;
  opacity:0; pointer-events:none; visibility:hidden;
  transition: opacity 450ms ease-out, transform 450ms ease-out;
}
.hhm-slide.hhm-active {
  opacity:1; pointer-events:auto; z-index:1; visibility:visible;
  transition: opacity 600ms cubic-bezier(.22,.61,.36,1), transform 600ms cubic-bezier(.22,.61,.36,1);
}
.hhm-slide.hhm-leaving {
  opacity:0; transform:translateY(-12px); visibility:visible;
  transition: opacity 450ms ease-out, transform 450ms ease-out;
}
/* reduced-motion: keep 300ms opacity crossfade, no transforms */
[data-motion="calm"] .hhm-slide {
  transition: opacity 300ms ease-out;
  transform:none;
}
[data-motion="calm"] .hhm-slide.hhm-active {
  transition: opacity 300ms ease-out;
  transform:none;
}
[data-motion="calm"] .hhm-slide.hhm-leaving {
  transition: opacity 300ms ease-out;
  transform:none;
}

/* per-element stagger on ENTER (active slide only) */
.hhm-kw, .hhm-ttl, .hhm-dsc {
  opacity:0; transform:translateY(16px);
}
.hhm-active .hhm-kw {
  opacity:1; transform:none;
  transition: opacity 600ms cubic-bezier(.22,.61,.36,1), transform 600ms cubic-bezier(.22,.61,.36,1);
  transition-delay: 0ms;
}
.hhm-active .hhm-ttl {
  opacity:1; transform:none;
  transition: opacity 600ms cubic-bezier(.22,.61,.36,1), transform 600ms cubic-bezier(.22,.61,.36,1);
  transition-delay: 80ms;
}
.hhm-active .hhm-dsc {
  opacity:1; transform:none;
  transition: opacity 600ms cubic-bezier(.22,.61,.36,1), transform 600ms cubic-bezier(.22,.61,.36,1);
  transition-delay: 160ms;
}
[data-motion="calm"] .hhm-kw,
[data-motion="calm"] .hhm-ttl,
[data-motion="calm"] .hhm-dsc { transition: opacity 300ms ease-out; transform:none; }

/* progress bar — per-slide duration */
@keyframes hhm-prog-full { from{transform:scaleX(0)} to{transform:scaleX(1)} }
@keyframes hhm-prog-calm { from{transform:scaleX(0)} to{transform:scaleX(1)} }
.hhm-bar { transform-origin:left; transform:scaleX(0); }
.hhm-bar.hhm-fill-full  { animation:hhm-prog-full 4.5s linear forwards; }
.hhm-bar.hhm-fill-calm  { animation:hhm-prog-calm 6s linear forwards; }
.hhm-bar.hhm-pause { animation-play-state:paused; }
.hhm-bar.hhm-done  { transform:scaleX(1); animation:none; }

/* sparkle — full mode: scale+rotate on change; calm mode: opacity pulse 1→0.85 */
@keyframes hhm-spk-a {
  0%  { transform:scale(1)    rotate(0deg); }
  50% { transform:scale(1.08) rotate(10deg); }
  100%{ transform:scale(1)    rotate(20deg); }
}
@keyframes hhm-spk-b {
  0%  { transform:scale(1)    rotate(20deg); }
  50% { transform:scale(1.08) rotate(30deg); }
  100%{ transform:scale(1)    rotate(40deg); }
}
@keyframes hhm-spk-pulse {
  0%,100%{ opacity:1; }
  50%    { opacity:0.85; }
}
.hhm-spk-wrap[data-anim="a"] > svg { animation:hhm-spk-a .7s ease-out forwards; }
.hhm-spk-wrap[data-anim="b"] > svg { animation:hhm-spk-b .7s ease-out forwards; }
[data-motion="calm"] .hhm-spk-wrap > svg {
  animation: hhm-spk-pulse 4s ease-in-out infinite;
  transform:none;
}

/* glow slow drift in full mode; calm mode: static at 0.36 opacity */
@keyframes hhm-glow {
  0%,100%{ opacity:.36; transform:translateY(0)    scale(1); }
  50%    { opacity:.54; transform:translateY(-10px) scale(1.14); }
}
.hhm-glow { animation:hhm-glow 18s ease-in-out infinite; }
.hhm-glow.hhm-paused { animation-play-state:paused; }
[data-motion="calm"] .hhm-glow { animation:none; opacity:.36; transform:none; }

/* particles — full mode: 3 depth layers drifting; calm mode: STATIC but VISIBLE */
@keyframes hhm-far  {
  0%,100%{transform:translate3d(0,0,0)}
  25%    {transform:translate3d(16px,-26px,0)}
  50%    {transform:translate3d(-12px,-42px,0)}
  75%    {transform:translate3d(20px,-30px,0)}
}
@keyframes hhm-mid  {
  0%,100%{transform:translate3d(0,0,0)}
  33%    {transform:translate3d(-20px,34px,0)}
  66%    {transform:translate3d(26px,-28px,0)}
}
@keyframes hhm-near {
  0%,100%{transform:translate3d(0,0,0)}
  40%    {transform:translate3d(30px,40px,0)}
  80%    {transform:translate3d(-26px,-36px,0)}
}
@keyframes hhm-twkl { 0%,100%{opacity:var(--ob)} 50%{opacity:calc(var(--ob)*1.8)} }

.hhm-p-far  { animation:hhm-far  28s ease-in-out infinite alternate; will-change:transform; }
.hhm-p-mid  { animation:hhm-mid  20s ease-in-out infinite alternate; will-change:transform; }
.hhm-p-near { animation:hhm-near 14s ease-in-out infinite alternate; will-change:transform; }
.hhm-p-far.hhm-paused,
.hhm-p-mid.hhm-paused,
.hhm-p-near.hhm-paused { animation-play-state:paused; }
[data-motion="calm"] .hhm-p-far,
[data-motion="calm"] .hhm-p-mid,
[data-motion="calm"] .hhm-p-near { animation:none; transform:none; will-change:auto; }
.hhm-twkl { animation:hhm-twkl 5s ease-in-out infinite; }
[data-motion="calm"] .hhm-twkl { animation:none; opacity:var(--ob); }

/* short screens ≤700px height: tighten sizes, 2-line desc */
@media (max-height:700px) {
  .hhm-spk-wrap { width:clamp(90px,18svh,140px) !important; height:clamp(90px,18svh,140px) !important; }
  .hhm-kw-text  { font-size:clamp(52px,15vw,76px) !important; }
  .hhm-desc     { -webkit-line-clamp:2 !important; }
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
const SPARKLE_D = 'M50 0 C54 28 72 46 100 50 C72 54 54 72 50 100 C46 72 28 54 0 50 C28 46 46 28 50 0 Z';

function SparkleVisual({ animAlt, paused }) {
  const gId = 'hhm-sg';
  return (
    <div
      className="hhm-spk-wrap"
      data-anim={animAlt ? 'b' : 'a'}
      style={{
        position: 'relative',
        /* bigger on tall screens, smaller on short (overridden by @media above) */
        width:  'clamp(150px, 28svh, 240px)',
        height: 'clamp(150px, 28svh, 240px)',
        flexShrink: 0,
      }}
    >
      {/* radial glow — slow drift via .hhm-glow */}
      <div
        className={`hhm-glow${paused ? ' hhm-paused' : ''}`}
        aria-hidden="true"
        style={{
          position: 'absolute', inset: '-32%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13,158,130,.55) 0%, transparent 68%)',
          pointerEvents: 'none',
        }}
      />
      <svg
        width="100%" height="100%"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
        style={{ position: 'relative', display: 'block' }}
      >
        <defs>
          <linearGradient id={gId} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%"   stopColor="#F4FBF8" />
            <stop offset="100%" stopColor="#B2E8DC" />
          </linearGradient>
        </defs>
        <path d={SPARKLE_D} fill={`url(#${gId})`} />
      </svg>
    </div>
  );
}

/* ══════════════════════ Particles ═══════════════════════════════════ */
// 16 dots — [left%, top%, sizePx, opacity, layer(0=far/1=mid/2=near), twinkle, delay]
const DOTS = [
  [8,12,3,.42,0,false,'0s'], [82,8,3,.38,0,false,'3s'], [35,18,4,.48,0,true,'1.2s'],
  [65,11,3,.36,0,false,'5s'],[92,28,3,.44,0,false,'2s'], [15,55,4,.54,1,false,'0s'],
  [72,48,5,.58,1,true,'2.5s'],[48,35,4,.50,1,false,'4s'],[88,62,4,.56,1,false,'1s'],
  [22,70,4,.52,1,false,'3.5s'],[55,22,3,.40,0,true,'0.8s'],[5,80,5,.60,2,false,'0s'],
  [78,75,5,.60,2,true,'1.8s'],[42,82,5,.58,2,false,'3s'],[60,58,4,.54,2,false,'0.5s'],
  [30,42,4,.48,1,true,'2.2s'],[18,32,3,.46,0,false,'1.5s'],[90,46,3,.40,0,true,'3.2s'],
];

function Particles({ paused }) {
  return (
    <div aria-hidden="true"
      style={{ position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0 }}>
      {[0,1,2].map(layer => (
        <div key={layer}
          className={`${['hhm-p-far','hhm-p-mid','hhm-p-near'][layer]}${paused?' hhm-paused':''}`}
          style={{ position:'absolute', inset:0 }}
        >
          {DOTS.filter(d => d[4]===layer).map(([l,t,sz,op,,twk,dly], i) => (
            <span key={i} data-particle="true"
              className={twk ? 'hhm-twkl' : undefined}
              style={{
                '--ob': op,
                position:'absolute', left:`${l}%`, top:`${t}%`,
                width:sz, height:sz, borderRadius:'50%',
                background: layer === 2 ? '#0D9E82' : '#FFFFFF',
                opacity:op,
                boxShadow: `0 0 ${sz*1.5}px rgba(${layer === 2 ? '13,158,130' : '255,255,255'},${op*0.6})`,
                animationDelay: twk ? dly : undefined,
              }}
            />
          ))}
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
               width:'100%',height:'clamp(44px,7svh,72px)',
               pointerEvents:'none',zIndex:1,opacity:.12 }}
    >
      <path fill="#26B59A"
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
    </svg>
  );
}

/* ══════════════════════ WhatsApp icon ═══════════════════════════════ */
function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

/* ══════════════════════ MAIN ════════════════════════════════════════ */
export default function HomeHeroMobile({ hero }) {
  useEffect(() => { injectCSS(); }, []);

  const { language }        = useTranslation();
  const isRTL               = language === 'ar';
  const { mode, allowLoop } = useMotionPreference();
  const isCalm              = mode === 'calm';

  /* data */
  const { data: rawServices = [] } = useServices();
  const { data: siteSettings }     = useSiteSettings();

  const whatsappNum = useMemo(
    () => (siteSettings?.whatsapp_number || '201558952126').replace(/\D/g, ''),
    [siteSettings],
  );

  const slides = useMemo(() => {
    const active = rawServices.filter(s => s.is_active !== false).slice(0, 6);
    if (active.length === 0) {
      return [{
        id:'fb',
        keyword: isRTL ? 'برامج' : 'SOFTWARE',
        title:   isRTL ? 'حلول برمجية متكاملة' : 'Complete Software Solutions',
        description: isRTL
          ? 'نبني منتجات رقمية تدفع أعمالك إلى الأمام.'
          : 'We build digital products that move your business forward.',
      }];
    }
    return active.map(s => {
      const title = (isRTL ? (s.title_ar||s.title_en) : (s.title_en||s.title_ar)) || s.title || '';
      const desc  = (isRTL ? (s.description_ar||s.description_en) : (s.description_en||s.description_ar))
                    || s.description
                    || (isRTL
                        ? 'نقدم حلولاً برمجية متكاملة تلبي احتياجات عملك.'
                        : 'We deliver complete software solutions tailored to your business needs.');
      let kw = s.slug ? s.slug.split('-')[0].toUpperCase() : title.split(/\s+/)[0].toUpperCase();
      kw = kw.slice(0, 7);
      return { id:s.id, keyword:kw, title, description:desc };
    });
  }, [rawServices, isRTL]);

  /* carousel */
  const total  = slides.length;
  const [active,   setActive]   = useState(0);
  const [leaving,  setLeaving]  = useState(-1);
  const [spkAlt,   setSpkAlt]   = useState(false);
  const [touching, setTouching] = useState(false);
  const [focused,  setFocused]  = useState(false);

  /* clear leaving class after transition */
  useEffect(() => {
    if (leaving === -1) return;
    const id = setTimeout(() => setLeaving(-1), 500);
    return () => clearTimeout(id);
  }, [leaving]);

  /* pause signals */
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

  const canPlay = inView && tabVis && !touching && !focused && allowLoop && total > 1;

  /* autoplay — 6s in calm mode (plain crossfade), 4.5s in full mode */
  useEffect(() => {
    if (!canPlay && !isCalm) return;
    if (total <= 1) return;
    const interval = isCalm ? 6000 : 4500;
    const id = setInterval(() => {
      setLeaving(active);
      setActive(p => (p+1) % total);
      setSpkAlt(a => !a);
    }, interval);
    return () => clearInterval(id);
  }, [canPlay, isCalm, total, active]);

  /* nav */
  const goTo   = useCallback((idx) => {
    const next = ((idx%total)+total)%total;
    setLeaving(active);
    setActive(next);
    setSpkAlt(a => !a);
  }, [total, active]);
  const goPrev = useCallback(() => goTo(active-1), [active, goTo]);
  const goNext = useCallback(() => goTo(active+1), [active, goTo]);

  useEffect(() => {
    const fn = (e) => {
      if (e.key==='ArrowLeft')  { isRTL ? goNext() : goPrev(); }
      if (e.key==='ArrowRight') { isRTL ? goPrev() : goNext(); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [isRTL, goPrev, goNext]);

  const swipeX = useRef(0);
  const onTouchStart = (e) => { setTouching(true);  swipeX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    setTouching(false);
    const dx = e.changedTouches[0].clientX - swipeX.current;
    if (Math.abs(dx) > 44) (dx>0 ? (isRTL?goNext:goPrev) : (isRTL?goPrev:goNext))();
  };

  /* design tokens */
  const W  = '#FFFFFF';
  const D  = 'rgba(255,255,255,0.72)';
  const BF = 'rgba(255,255,255,0.18)';
  const EM = '#0D9E82';
  const FONT = "'Plus Jakarta Sans','IBM Plex Sans Arabic',system-ui,sans-serif";
  const paused = !inView || !tabVis;

  const lockupBy   = isRTL ? 'من حلول' : 'A solution by';

  return (
    <section
      ref={sectionRef}
      data-hero-mobile="true"
      data-motion={isCalm ? 'calm' : 'normal'}
      data-hhm-motion={isCalm ? 'calm' : 'full'}
      aria-label={isRTL ? 'القسم الرئيسي' : 'Hero section'}
      aria-roledescription="carousel"
      aria-live={canPlay || isCalm ? 'off' : 'polite'}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="hhm-root"
      style={{
        position: 'relative',
        /* near-black at top → dark emerald at bottom; NO light mint */
        background: 'linear-gradient(to bottom, #03130F 0%, #021A14 30%, #03302A 65%, #044D3A 100%)',
        paddingBottom: 'max(14px, env(safe-area-inset-bottom, 0px))',
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onFocus={() => setFocused(true)}
      onBlur={()   => setFocused(false)}
    >
      {/* bg decorative layers — particles visible in both modes (animated in full, static in calm) */}
      <Particles paused={paused} />
      <CitySkyline />

      {/* fixed header clearance */}
      <div style={{ flexShrink:0, height:'max(72px, calc(68px + env(safe-area-inset-top,0px)))' }} />

      {/* ── VISUAL AREA ── all slides stacked in one grid cell */}
      <div style={{
        flex:'1 1 0', minHeight:0, position:'relative',
        paddingInlineStart:20, paddingInlineEnd:20,
        display:'grid', gridTemplateColumns:'1fr', gridTemplateRows:'1fr',
      }}>
        {slides.map((slide, i) => {
          const isActive = i === active;
          const isLeaving = i === leaving;
          let cls = 'hhm-slide';
          if (isActive) cls += ' hhm-active';
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
              {/* sparkle — fills leftover space above text */}
              <div style={{ flex:'1 1 0', minHeight:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                paddingTop:8, paddingBottom:4 }}>
                <SparkleVisual animAlt={spkAlt} paused={paused||!isActive} />
              </div>

              {/* keyword — huge, display font */}
              <div className="hhm-kw" style={{ flexShrink:0, width:'100%', marginBottom:2,
                textAlign: isRTL ? 'right' : 'left' }}>
                <span className="hhm-kw-text" style={{
                  display: 'inline-block',
                  fontSize: 'clamp(64px, 18vw, 96px)',
                  lineHeight: .88, fontWeight: 800,
                  fontFamily: FONT,
                  color: W, letterSpacing: '-0.03em',
                }}>
                  {slide.keyword}
                </span>
              </div>

              {/* title */}
              <h1 className="hhm-ttl" dir="auto" style={{
                flexShrink:0, width:'100%', margin:'0 0 6px',
                textAlign: isRTL ? 'right' : 'left',
                fontSize: 'clamp(24px, 6.5vw, 32px)', fontWeight:700,
                lineHeight: isRTL ? 1.4 : 1.2, color: W,
                letterSpacing: isRTL ? 0 : '-0.02em',
                fontFamily: FONT,
              }}>
                {slide.title}
              </h1>

              {/* description */}
              <p className="hhm-dsc hhm-desc" dir="auto" style={{
                flexShrink:0, margin:'0 0 10px', fontSize:15, lineHeight:1.5,
                color: D, textAlign: isRTL ? 'right' : 'left',
                display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical',
                overflow:'hidden',
              }}>
                {slide.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── LOCKUP (once, outside slides) ── */}
      <div style={{
        flexShrink:0,
        paddingInlineStart:20, paddingInlineEnd:20,
        paddingTop:8, paddingBottom:6,
      }}>
        {/* thin divider */}
        <div style={{ height:1, background:'rgba(255,255,255,0.14)', marginBottom:7 }} />
        {/* first line: "A solution by SENTIVRA" inline */}
        <div style={{
          display:'flex', alignItems:'baseline',
          flexDirection: isRTL ? 'row-reverse' : 'row',
          gap:5, marginBottom:3,
        }}>
          <span style={{
            fontSize:12, fontWeight:500, letterSpacing:'0.04em',
            color:'rgba(255,255,255,0.45)',
          }}>
            {lockupBy}
          </span>
          <span style={{
            fontSize:20, fontWeight:800,
            fontFamily: FONT,
            letterSpacing:'0.03em', color:'rgba(255,255,255,0.90)',
            lineHeight:1,
          }}>
            SENTIVRA
          </span>
        </div>
        {/* second line */}
        <span style={{
          fontSize:10, fontWeight:700, letterSpacing:'0.3em',
          textTransform:'uppercase', color:'rgba(255,255,255,0.32)',
        }}>
          SOFTWARE SOLUTIONS
        </span>
      </div>

      {/* ── CTA ── */}
      <div style={{ flexShrink:0, paddingInlineStart:20, paddingInlineEnd:20, paddingBottom:10 }}>
        <a
          href={hero?.cta_primary_link || '/contact'}
          style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            width:'100%', height:52, borderRadius:26,
            background:'#FFFFFF', color:'#01120F',
            fontSize:16, fontWeight:700, textDecoration:'none',
            fontFamily: FONT,
          }}
        >
          <span style={{ width:8, height:8, borderRadius:'50%', background:EM, flexShrink:0 }}
            aria-hidden="true" />
          {isRTL ? 'اطلب استشارة' : 'Request a consultation'}
        </a>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div style={{
        flexShrink:0,
        display:'flex', alignItems:'center', gap:10,
        paddingInlineStart:16, paddingInlineEnd:16,
        flexDirection: isRTL ? 'row-reverse' : 'row',
        position:'relative', zIndex:10,
      }}>
        {/* WhatsApp */}
        <a href={`https://wa.me/${whatsappNum}`} target="_blank" rel="noopener noreferrer"
          aria-label="WhatsApp"
          style={{ width:52, height:52, borderRadius:'50%', flexShrink:0,
            background:'#FFFFFF', display:'flex', alignItems:'center',
            justifyContent:'center', color:'#128C7E', textDecoration:'none' }}>
          <WaIcon />
        </a>

        {/* progress segments */}
        <div style={{ flex:1, display:'flex', gap:5, alignItems:'center', minWidth:0 }}>
          {slides.map((_, i) => {
            const isDone = i < active;
            const isBar  = i === active;
            const animCls = isCalm ? 'hhm-fill-calm' : 'hhm-fill-full';
            let cls = 'hhm-bar';
            if (isBar && (canPlay || isCalm)) cls += ` ${animCls}`;
            else if (isBar) cls += ' hhm-pause';
            else if (isDone) cls += ' hhm-done';
            
            return (
              <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i+1}`}
                style={{ flex:1, height:3, borderRadius:2,
                  background:'rgba(255,255,255,0.20)',
                  overflow:'hidden', position:'relative',
                  border:'none', padding:0, cursor:'pointer' }}>
                <div key={`${i}-${active}`} className={cls}
                  style={{ position:'absolute', inset:0, background:'#FFFFFF' }} />
              </button>
            );
          })}
        </div>

        {/* prev */}
        <button onClick={goPrev} aria-label={isRTL ? 'التالي' : 'Previous'}
          style={{ width:44, height:44, borderRadius:'50%', flexShrink:0,
            background:'transparent', border:`1px solid ${BF}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:W, cursor:'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* next */}
        <button onClick={goNext} aria-label={isRTL ? 'السابق' : 'Next'}
          style={{ width:44, height:44, borderRadius:'50%', flexShrink:0,
            background:'transparent', border:`1px solid ${BF}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:W, cursor:'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

    </section>
  );
}
