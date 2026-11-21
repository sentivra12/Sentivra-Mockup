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
import { getHeroSlideCopy } from './heroSlideCopy';

/* ══════════════════════ TIMING CONSTANTS ════════════════════════════ */
const AUTOPLAY_MS = 2000;
const SLIDE_LEAVE_MS = 250;
const SLIDE_ENTER_MS = 350;
const STAGGER_KEYWORD_MS = 0;
const STAGGER_HEADLINE_MS = 40;
const STAGGER_DESC_MS = 80;
const SPARKLE_MS = 480;
const CALM_FADE_MS = 200;

/* ══════════════════════ CSS injected once ═══════════════════════════ */
const CSS = `
/* Fonts: Cormorant Garamond (Latin display serif) + Aref Ruqaa (Arabic title) */
@font-face {
  font-family: 'Cormorant Garamond';
  src: url('/fonts/cormorant-garamond-latin-600.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0020-007F, U+00A0-00FF, U+0100-017F, U+0180-024F, U+1E00-1EFF, U+2000-206F, U+2070-209F, U+20A0-20CF, U+2100-214F, U+2150-218F, U+FB00-FB4F;
}
@font-face {
  font-family: 'Cormorant Garamond';
  src: url('/fonts/cormorant-garamond-latin-700.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0020-007F, U+00A0-00FF, U+0100-017F, U+0180-024F, U+1E00-1EFF, U+2000-206F, U+2070-209F, U+20A0-20CF, U+2100-214F, U+2150-218F, U+FB00-FB4F;
}
@font-face {
  font-family: 'Cormorant Garamond';
  src: url('/fonts/cormorant-garamond-latin-700-italic.woff2') format('woff2');
  font-weight: 700;
  font-style: italic;
  font-display: swap;
  unicode-range: U+0020-007F, U+00A0-00FF, U+0100-017F, U+0180-024F, U+1E00-1EFF, U+2000-206F, U+2070-209F, U+20A0-20CF, U+2100-214F, U+2150-218F, U+FB00-FB4F;
}
@font-face {
  font-family: 'Aref Ruqaa';
  src: url('/fonts/aref-ruqaa-arabic-700.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF;
}

.hhm-root {
  height:100vh; height:100dvh; height:100svh;
  display:flex; flex-direction:column; overflow:hidden;
}

/* slide crossfade — all slides always mounted in ONE grid cell */
.hhm-slide {
  grid-row:1; grid-column:1;
  display:flex; flex-direction:column; justify-content:flex-end;
  opacity:0; pointer-events:none; visibility:hidden;
  transition: opacity var(--slide-leave-ms) ease-out, transform var(--slide-leave-ms) ease-out;
}
.hhm-slide.hhm-active {
  opacity:1; pointer-events:auto; z-index:1; visibility:visible;
  transition: opacity var(--slide-enter-ms) cubic-bezier(.22,.61,.36,1), transform var(--slide-enter-ms) cubic-bezier(.22,.61,.36,1);
}
.hhm-slide.hhm-leaving {
  opacity:0; transform:translateY(-12px); visibility:visible;
  transition: opacity var(--slide-leave-ms) ease-out, transform var(--slide-leave-ms) ease-out;
}
/* reduced-motion: keep calm fade, no transforms */
[data-motion="calm"] .hhm-slide {
  transition: opacity var(--calm-fade-ms) ease-out;
  transform:none;
}
[data-motion="calm"] .hhm-slide.hhm-active {
  transition: opacity var(--calm-fade-ms) ease-out;
  transform:none;
}
[data-motion="calm"] .hhm-slide.hhm-leaving {
  transition: opacity var(--calm-fade-ms) ease-out;
  transform:none;
}

/* per-element stagger on ENTER (active slide only) */
.hhm-kw, .hhm-ttl, .hhm-dsc {
  opacity:0; transform:translateY(16px);
}
.hhm-active .hhm-kw {
  opacity:1; transform:none;
  transition: opacity var(--slide-enter-ms) cubic-bezier(.22,.61,.36,1), transform var(--slide-enter-ms) cubic-bezier(.22,.61,.36,1);
  transition-delay: var(--stagger-kw-ms);
}
.hhm-active .hhm-ttl {
  opacity:1; transform:none;
  transition: opacity var(--slide-enter-ms) cubic-bezier(.22,.61,.36,1), transform var(--slide-enter-ms) cubic-bezier(.22,.61,.36,1);
  transition-delay: var(--stagger-hl-ms);
}
.hhm-active .hhm-dsc {
  opacity:1; transform:none;
  transition: opacity var(--slide-enter-ms) cubic-bezier(.22,.61,.36,1), transform var(--slide-enter-ms) cubic-bezier(.22,.61,.36,1);
  transition-delay: var(--stagger-desc-ms);
}
[data-motion="calm"] .hhm-kw,
[data-motion="calm"] .hhm-ttl,
[data-motion="calm"] .hhm-dsc { transition: opacity var(--calm-fade-ms) ease-out; transform:none; }

/* progress bar — per-slide duration from CSS variable */
@keyframes hhm-prog { from{transform:scaleX(0)} to{transform:scaleX(1)} }
.hhm-bar { transform-origin:left; transform:scaleX(0); }
.hhm-bar.hhm-fill  { animation:hhm-prog var(--autoplay-ms) linear forwards; }
.hhm-bar.hhm-pause { animation-play-state:paused; }
.hhm-bar.hhm-done  { transform:scaleX(1); animation:none; }

/* sparkle — full mode: scale+rotate; calm mode: opacity pulse */
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
.hhm-spk-wrap[data-anim="a"] > svg { animation:hhm-spk-a var(--sparkle-ms) ease-out forwards; }
.hhm-spk-wrap[data-anim="b"] > svg { animation:hhm-spk-b var(--sparkle-ms) ease-out forwards; }
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

/* particles — full mode: 3 depth layers drifting with large motion; calm mode: gentle small drift */
@keyframes hhm-far-full  {
  0%  {transform:translate3d(0,0,0)}
  100%{transform:translate3d(14px,-32px,0)}
}
@keyframes hhm-mid-full  {
  0%  {transform:translate3d(0,0,0)}
  100%{transform:translate3d(18px,-38px,0)}
}
@keyframes hhm-near-full {
  0%  {transform:translate3d(0,0,0)}
  100%{transform:translate3d(-20px,40px,0)}
}
@keyframes hhm-far-calm  {
  0%  {transform:translate3d(0,0,0)}
  100%{transform:translate3d(6px,-10px,0)}
}
@keyframes hhm-mid-calm  {
  0%  {transform:translate3d(0,0,0)}
  100%{transform:translate3d(8px,-12px,0)}
}
@keyframes hhm-near-calm {
  0%  {transform:translate3d(0,0,0)}
  100%{transform:translate3d(-10px,12px,0)}
}
@keyframes hhm-twkl { 0%,100%{opacity:var(--ob)} 50%{opacity:calc(var(--ob)*1.9)} }

.hhm-p-far  { animation:hhm-far-full  26s ease-in-out infinite alternate; animation-delay:-8s; }
.hhm-p-mid  { animation:hhm-mid-full  18s ease-in-out infinite alternate; animation-delay:-5s; }
.hhm-p-near { animation:hhm-near-full 12s ease-in-out infinite alternate; animation-delay:-3s; }
.hhm-p-far.hhm-paused,
.hhm-p-mid.hhm-paused,
.hhm-p-near.hhm-paused { animation-play-state:paused; }
[data-motion="calm"] .hhm-p-far  { animation:hhm-far-calm  30s ease-in-out infinite alternate; animation-delay:-10s; }
[data-motion="calm"] .hhm-p-mid  { animation:hhm-mid-calm  24s ease-in-out infinite alternate; animation-delay:-7s; }
[data-motion="calm"] .hhm-p-near { animation:hhm-near-calm 20s ease-in-out infinite alternate; animation-delay:-5s; }
.hhm-twkl { animation:hhm-twkl 5s ease-in-out infinite; }
[data-motion="calm"] .hhm-twkl { animation:hhm-twkl 6s ease-in-out infinite; }

/* short screens ≤700px height: tighten sizes */
@media (max-height:700px) {
  .hhm-spk-wrap { width:clamp(90px,18svh,140px); height:clamp(90px,18svh,140px); }
  .hhm-kw-text  { font-size:clamp(48px,13vw,66px); }
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
// Longer, thinner, more concave points for elegant reference match
const SPARKLE_D = 'M50 0 C52 30 70 47 100 50 C70 53 52 70 50 100 C48 70 30 53 0 50 C30 47 48 30 50 0 Z';

function SparkleVisual({ animAlt, paused }) {
  const gId = 'hhm-sg';
  return (
    <div
      className="hhm-spk-wrap"
      data-anim={animAlt ? 'b' : 'a'}
      style={{
        position: 'relative',
        /* taller than wide (8%), bigger overall to match reference */
        width:  'clamp(190px, 38vw, 250px)',
        height: 'clamp(205px, 41vw, 270px)',
        flexShrink: 0,
      }}
    >
      {/* Large halo behind sparkle — outer radial + inner glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '-80%',
          pointerEvents: 'none',
          background: `
            radial-gradient(circle at center, rgba(220,255,245,0.25) 0%, transparent 35%),
            radial-gradient(circle at center, rgba(120,200,175,0.38) 0%, transparent 70%)
          `,
        }}
      />
      {/* Subtle animated glow drift for depth */}
      <div
        className={`hhm-glow${paused ? ' hhm-paused' : ''}`}
        aria-hidden="true"
        style={{
          position: 'absolute', inset: '-32%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13,158,130,.20) 0%, transparent 68%)',
          pointerEvents: 'none',
        }}
      />
      <svg
        width="100%" height="100%"
        viewBox="0 0 100 108"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        aria-hidden="true"
        style={{ position: 'relative', display: 'block' }}
      >
        <defs>
          <linearGradient id={gId} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%"   stopColor="#f2f7f5" />
            <stop offset="50%"  stopColor="#d5dedb" />
            <stop offset="100%" stopColor="#aeb9b6" />
          </linearGradient>
        </defs>
        <path d={SPARKLE_D} fill={`url(#${gId})`} />
      </svg>
    </div>
  );
}

/* ══════════════════════ Particles (background stars) ════════════════ */
// 28 drifting dots split into 3 depth layers (far/mid/near)
// [left%, top%, sizePx, baseOpacity, layer]
const DOTS = [
  // FAR layer (9 dots) — smallest motion, slower
  [12,8,1.5,.45,'far'],[78,12,2,.50,'far'],[35,18,1.5,.42,'far'],
  [88,25,2,.48,'far'],[52,32,1.5,.40,'far'],[25,45,2,.52,'far'],
  [68,55,1.5,.46,'far'],[85,68,2,.50,'far'],[45,75,1.5,.44,'far'],
  
  // MID layer (10 dots) — medium motion
  [15,6,2.5,.62,'mid'],[92,15,2,.58,'mid'],[40,22,2.5,.65,'mid'],
  [62,35,2,.60,'mid'],[8,42,2.5,.68,'mid'],[75,52,2,.62,'mid'],
  [32,62,2.5,.70,'mid'],[90,72,2,.58,'mid'],[55,80,2.5,.66,'mid'],
  [20,85,2,.60,'mid'],
  
  // NEAR layer (9 dots) — largest motion, fastest, some emerald tint
  [50,10,3,.78,'near'],[18,20,2.5,.75,'near'],[82,28,4,.85,'near'],
  [28,38,2.5,.72,'near'],[65,48,3,.80,'near'],[10,58,3.5,.82,'near'],
  [42,65,2.5,.76,'near'],[72,78,3,.84,'near'],[60,88,2.5,.74,'near'],
];

function Particles({ paused }) {
  // Group dots by layer
  const byLayer = { far: [], mid: [], near: [] };
  DOTS.forEach(dot => byLayer[dot[4]].push(dot));
  
  return (
    <div aria-hidden="true"
      style={{ position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0 }}>
      {/* FAR layer container */}
      <div className={`hhm-p-far${paused ? ' hhm-paused' : ''}`}
        style={{ position:'absolute',inset:0,willChange:'transform' }}>
        {byLayer.far.map(([l,t,sz,op], i) => (
          <span key={`f${i}`} data-particle="true" data-layer="far"
            className="hhm-twkl"
            style={{
              '--ob': op,
              position:'absolute', left:`${l}%`, top:`${t}%`,
              width:sz, height:sz, borderRadius:'50%',
              background:'#FFFFFF',
              boxShadow: `0 0 ${sz*1.4}px rgba(255,255,255,${op*0.6})`,
            }}
          />
        ))}
      </div>
      
      {/* MID layer container */}
      <div className={`hhm-p-mid${paused ? ' hhm-paused' : ''}`}
        style={{ position:'absolute',inset:0,willChange:'transform' }}>
        {byLayer.mid.map(([l,t,sz,op], i) => (
          <span key={`m${i}`} data-particle="true" data-layer="mid"
            className="hhm-twkl"
            style={{
              '--ob': op,
              position:'absolute', left:`${l}%`, top:`${t}%`,
              width:sz, height:sz, borderRadius:'50%',
              background:'#FFFFFF',
              boxShadow: `0 0 ${sz*1.3}px rgba(255,255,255,${op*0.5})`,
            }}
          />
        ))}
      </div>
      
      {/* NEAR layer container */}
      <div className={`hhm-p-near${paused ? ' hhm-paused' : ''}`}
        style={{ position:'absolute',inset:0,willChange:'transform' }}>
        {byLayer.near.map(([l,t,sz,op], i) => {
          // Some near dots have emerald tint
          const isEmerald = i % 3 === 0;
          const bg = isEmerald ? 'rgba(13,158,130,0.85)' : '#FFFFFF';
          const shadow = isEmerald
            ? `0 0 ${sz*1.6}px rgba(13,158,130,${op*0.7})`
            : `0 0 ${sz*1.5}px rgba(255,255,255,${op*0.6})`;
          
          return (
            <span key={`n${i}`} data-particle="true" data-layer="near"
              className="hhm-twkl"
              style={{
                '--ob': op,
                position:'absolute', left:`${l}%`, top:`${t}%`,
                width:sz, height:sz, borderRadius:'50%',
                background: bg,
                boxShadow: shadow,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════ Skyline ═════════════════════════════════════ */
function CitySkyline() {
  return (
    <svg viewBox="0 0 414 80" preserveAspectRatio="none" aria-hidden="true"
      style={{ position:'absolute',bottom:0,left:0,right:0,
               width:'100%',height:'clamp(44px,7svh,72px)',
               pointerEvents:'none',zIndex:1,opacity:.9,
               filter:'brightness(0.7)' }}
    >
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
      {/* Tiny teal city lights */}
      <circle cx="15" cy="45" r="1.2" fill="rgba(13,158,130,0.4)" />
      <circle cx="62" cy="24" r="1.2" fill="rgba(13,158,130,0.4)" />
      <circle cx="98" cy="18" r="1.2" fill="rgba(13,158,130,0.4)" />
      <circle cx="138" cy="26" r="1.2" fill="rgba(13,158,130,0.4)" />
      <circle cx="200" cy="28" r="1.2" fill="rgba(13,158,130,0.4)" />
      <circle cx="262" cy="30" r="1.2" fill="rgba(13,158,130,0.4)" />
      <circle cx="324" cy="32" r="1.2" fill="rgba(13,158,130,0.4)" />
      <circle cx="380" cy="42" r="1.2" fill="rgba(13,158,130,0.4)" />
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
        headline: isRTL ? 'برمجيات مصممة على قد شغلك' : 'Software built around your business',
        description: isRTL
          ? 'حلول مخصصة نصممها وننفذها وندعمها بفريق واحد.'
          : 'Custom solutions designed, built and supported by one team.',
      }];
    }
    return active.map(s => {
      let kw = s.slug ? s.slug.split('-')[0].toUpperCase() : '';
      if (!kw && s.title) kw = s.title.split(/\s+/)[0].toUpperCase();
      kw = kw.slice(0, 7);

      const lang = isRTL ? 'ar' : 'en';
      const copy = getHeroSlideCopy({ ...s, keyword: kw }, lang);
      // getHeroSlideCopy now always returns non-null headline + description
      return {
        id: s.id,
        keyword: kw,
        headline: copy.headline,
        description: copy.description,
      };
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

  const canPlay = inView && tabVis && !touching && !focused && total > 1;

  /* autoplay — runs in ALL modes (full/calm/reduced), only paused by tab/scroll/touch */
  const timerRef = useRef(null);
  const lastInteractionRef = useRef(0);
  
  useEffect(() => {
    if (!canPlay || total <= 1) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    
    timerRef.current = setTimeout(() => {
      setLeaving(prev => active);
      setActive(p => (p+1) % total);
      setSpkAlt(a => !a);
    }, AUTOPLAY_MS);
    
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [canPlay, total, active]);
  
  /* on manual interaction: reset timer to give full duration on new slide */
  useEffect(() => {
    if (lastInteractionRef.current === 0) return;
    const now = Date.now();
    if ((now - lastInteractionRef.current) < 100) {
      // manual interaction just happened, timer already restarted by active change
      lastInteractionRef.current = 0;
    }
  }, [active]);

  /* nav */
  const goTo   = useCallback((idx) => {
    const next = ((idx%total)+total)%total;
    lastInteractionRef.current = Date.now();
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
    if (Math.abs(dx) > 44) {
      lastInteractionRef.current = Date.now();
      (dx>0 ? (isRTL?goNext:goPrev) : (isRTL?goPrev:goNext))();
    }
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
      aria-live={canPlay ? 'off' : 'polite'}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="hhm-root"
      style={{
        position: 'relative',
        /* darker reference match: near-black teal top → deep green bottom */
        background: 'linear-gradient(to bottom, #020f0d 0%, #04211c 45%, #0b3d33 100%)',
        paddingBottom: 'max(14px, env(safe-area-inset-bottom, 0px))',
        /* CSS variables for timing */
        '--autoplay-ms': `${AUTOPLAY_MS}ms`,
        '--slide-leave-ms': `${SLIDE_LEAVE_MS}ms`,
        '--slide-enter-ms': `${SLIDE_ENTER_MS}ms`,
        '--stagger-kw-ms': `${STAGGER_KEYWORD_MS}ms`,
        '--stagger-hl-ms': `${STAGGER_HEADLINE_MS}ms`,
        '--stagger-desc-ms': `${STAGGER_DESC_MS}ms`,
        '--sparkle-ms': `${SPARKLE_MS}ms`,
        '--calm-fade-ms': `${CALM_FADE_MS}ms`,
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

          // Per-keyword font scaling so long words (MOBILE=6) and short ones (ERP=3)
          // fill the same visual weight without overflowing the container.
          // Available width ? viewport - 40px side padding.
          // Cormorant Garamond caps avg char width ? 0.62 � font-size.
          const letters = Math.max(slide.keyword.length, 1);
          const kwFontSize = `min(76px, calc((100vw - 40px) / ${(letters * 0.62).toFixed(2)}))`;

          // Headline: 2-line fixed height (worst case = 2 � 26px � lh)
          const hlLH = isRTL ? '1.4' : '1.25';
          const hlH  = isRTL ? 'calc(2 * 26px * 1.4)' : 'calc(2 * 26px * 1.25)';

          // Description: 2-line fixed height
          const dscH = isRTL ? 'calc(2 * 16px * 1.8)' : 'calc(2 * 15px * 1.6)';

          return (
            <div
              key={slide.id}
              role="group" aria-roledescription="slide"
              aria-label={`${i+1} / ${total}`}
              aria-hidden={!isActive}
              {...(!isActive ? { inert:'' } : {})}
              className={cls}
            >
              {/* sparkle � fills leftover space above text */}
              <div style={{ flex:'1 1 0', minHeight:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                paddingTop:8, paddingBottom:4 }}>
                <SparkleVisual animAlt={spkAlt} paused={paused||!isActive} />
              </div>

              {/* ?? KEYWORD SLOT � 1 line, fixed height 76�0.88=~67px ?? */}
              <div className="hhm-kw" style={{
                flexShrink: 0,
                width: '100%',
                marginBottom: 6,
                height: 'calc(76px * 0.88)',
                display: 'flex',
                alignItems: 'flex-end',
                overflow: 'hidden',
              }}>
                <span className="hhm-kw-text" style={{
                  display: 'block',
                  fontSize: kwFontSize,
                  lineHeight: 0.88,
                  fontWeight: 700,
                  fontFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
                  color: '#eafaf5',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                }}>
                  {slide.keyword}
                </span>
              </div>

              {/* ?? HEADLINE SLOT � always rendered, fixed 2-line height ?? */}
              <h2
                className="hhm-ttl hhm-headline"
                dir="auto"
                lang={isRTL ? 'ar' : 'en'}
                style={{
                  flexShrink: 0,
                  width: '92%',
                  margin: 0,
                  marginBlockEnd: 8,
                  height: hlH,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  fontSize: 'clamp(22px, 6vw, 26px)',
                  fontWeight: 600,
                  lineHeight: hlLH,
                  color: '#FFFFFF',
                  fontFamily: isRTL
                    ? "'Aref Ruqaa', 'Traditional Arabic', serif"
                    : "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
                  fontStyle: isRTL ? 'normal' : 'italic',
                  letterSpacing: 'normal',
                  textWrap: 'balance',
                }}
              >
                {slide.headline}
              </h2>

              {/* ?? DESCRIPTION SLOT � always rendered, fixed 2-line height ?? */}
              <p
                className="hhm-dsc"
                dir="auto"
                lang={isRTL ? 'ar' : 'en'}
                style={{
                  flexShrink: 0,
                  width: '92%',
                  margin: 0,
                  marginBlockEnd: 16,
                  height: dscH,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  fontSize: isRTL ? '16px' : '15px',
                  lineHeight: isRTL ? 1.8 : 1.6,
                  color: 'rgba(255,255,255,0.72)',
                  fontFamily: isRTL
                    ? "'IBM Plex Sans Arabic', system-ui, sans-serif"
                    : "'Plus Jakarta Sans', system-ui, sans-serif",
                  letterSpacing: 'normal',
                }}
              >
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
        paddingTop:14, paddingBottom:6,
      }}>
        {/* thin divider */}
        <div style={{ height:1, background:'rgba(255,255,255,0.15)', marginBottom:14 }} />
        {/* first line: "A solution by / من حلول" + SENTIVRA inline */}
        <div style={{
          display:'flex', alignItems:'baseline',
          gap:6, marginBottom:3,
        }}>
          <span style={{
            fontSize: isRTL ? 15 : 14,
            fontWeight:500,
            letterSpacing:'0.02em',
            color:'rgba(255,255,255,0.45)',
          }}>
            {lockupBy}
          </span>
          <span style={{
            fontSize:24,
            fontWeight:600,
            fontFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
            fontVariantCaps: 'all-small-caps',
            letterSpacing:'0.04em',
            color:'rgba(255,255,255,0.95)',
            lineHeight:1,
          }}>
            SENTIVRA
          </span>
        </div>
        {/* second line - SOFTWARE SOLUTIONS */}
        <span style={{
          fontSize:12,
          fontWeight:700,
          fontFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
          letterSpacing:'0.35em',
          textTransform:'uppercase',
          color:'rgba(255,255,255,0.32)',
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

      {/* ── BOTTOM ROW ──
           The global floating WhatsApp button (56px circle, 16px from inline-start)
           overlaps the first progress segment. Add clearance = 56 + 16 + 12 = 84px
           on the WA side. The button is on inline-start (left in EN, right in AR).
      */}
      <div style={{
        flexShrink:0,
        display:'flex', alignItems:'center', gap:10,
        paddingInlineStart: 84, paddingInlineEnd:16,
        position:'relative', zIndex:10,
      }}>
        {/* progress segments */}
        <div style={{ flex:1, display:'flex', gap:4, alignItems:'center', minWidth:0 }}>
          {slides.map((_, i) => {
            const isDone = i < active;
            const isBar  = i === active;
            let cls = 'hhm-bar';
            if (isBar && canPlay) cls += ' hhm-fill';
            else if (isBar) cls += ' hhm-pause';
            else if (isDone) cls += ' hhm-done';
            
            return (
              <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i+1}`}
                style={{
                  minWidth: total > 5 ? 40 : 48,
                  maxWidth: 56,
                  flex: '1 1 0',
                  height: 3,
                  borderRadius: 2,
                  background:'rgba(255,255,255,0.25)',
                  overflow:'hidden',
                  position:'relative',
                  border:'none',
                  padding:0,
                  cursor:'pointer'
                }}>
                <div key={`${i}-${active}`} className={cls}
                  style={{ position:'absolute', inset:0, background:'#FFFFFF' }} />
              </button>
            );
          })}
        </div>

        {/* prev */}
        <button onClick={goPrev} aria-label={isRTL ? 'التالي' : 'Previous'}
          style={{ width:44, height:44, borderRadius:'50%', flexShrink:0,
            background:'transparent', border:'1px solid rgba(255,255,255,0.5)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#FFFFFF', cursor:'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* next */}
        <button onClick={goNext} aria-label={isRTL ? 'السابق' : 'Next'}
          style={{ width:44, height:44, borderRadius:'50%', flexShrink:0,
            background:'transparent', border:'1px solid rgba(255,255,255,0.5)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#FFFFFF', cursor:'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

    </section>
  );
}
