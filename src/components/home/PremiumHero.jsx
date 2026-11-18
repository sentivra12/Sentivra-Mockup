/**
 * PremiumHero — Round 2: Premium animated "serious software company" hero
 *
 * Layout: 6/6 split on desktop (text left, visual right), stacked mobile
 * Heights: ~88vh desktop (min 640px, max 940px), content-based mobile
 *
 * Left column:
 *   • Eyebrow chip (Sparkle + badge text)
 *   • Gradient headline: key words "Real Digital Solutions" use .text-gradient-brand
 *     + hand-drawn SVG underline that draws itself once + Sparkle at end
 *   • Sub-headline paragraph
 *   • CTA buttons (primary = white fill with shine, secondary = glass)
 *   • Trust chips (staggered entrance, hover lift, animated icon)
 *   • Typewriter line cycling real service names
 *   • Facts row (service count + mockup count, count-up once)
 *
 * Right column:
 *   • <HeroVisual> fed with real services + real published mockup images
 *
 * Background:
 *   • <BrandBackground grain aurora grid beam>
 *   • Light theme: lightMint veil over gradient so text stays AA on white
 *   • Drifting code tokens (aria-hidden)
 *   • Curved SVG divider at bottom (no dark patch)
 *
 * Motion:
 *   • CSS .hero-enter-fallback for above-fold intro (no JS observer needed)
 *   • 1.5 s force-visible fallback baked into the keyframe
 *   • Framer Motion for trust chips stagger + typewriter
 *   • prefers-reduced-motion: everything static, opacity 1, transform none
 *   • saveData / low-power: no particles, no tilt, no beam
 *   • Pauses off-screen / hidden tab (delegated to HeroVisual)
 *
 * Shared component changes:
 *   • Header: logo now isScrolled ? full : light (done in H1)
 *   • BrandBackground: grid + beam props used here (done in H3)
 *   • HeroVisual: new component (done in H4)
 *   • No other shared components changed
 *
 * Secondary button: target changed from '/#services' (removed) to '/mockups'
 * per spec; label uses existing t('hero.ctaSecondary') = "Learn More" /
 * "View Our Work" override below.
 */

import React, {
  useEffect, useRef, useState, useCallback, useMemo, lazy, Suspense,
} from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useMotionPreference';
import { Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/* Mobile hero — lazy so the full component is never bundled on desktop. */
const HomeHeroMobile = lazy(() => import('@/components/home/HomeHeroMobile'));

/* Desktop stage — lazy so it is NEVER downloaded on phones.
   The conditional render below ensures the import() never fires on mobile. */
const HeroVisual = lazy(() => import('@/components/home/HeroVisual'));
import Sparkle from '@/components/ui/Sparkle';
import BrandBackground from '@/components/ui/BrandBackground';
import { useTranslation } from '@/i18n/useTranslation';
import { useServices } from '@/hooks/useContent';
import { getIcon } from '@/utils/iconMap';

/* ─── helpers ───────────────────────────────────────────────────────────── */

const saveDataActive = () =>
  typeof navigator !== 'undefined' &&
  (navigator.connection?.saveData ||
   navigator.connection?.effectiveType === 'slow-2g');

/** Split headline into "plain" and "accent" parts.
 *  Accent = last N words of the headline (heuristic: last 3 for EN, last 2 for AR)
 *  Falls back gracefully if headline is short.
 */
function splitHeadline(text, language) {
  if (!text) return { plain: '', accent: '' };
  const words  = text.trim().split(/\s+/);
  const n      = language === 'ar' ? Math.min(2, words.length) : Math.min(3, words.length);
  const plain  = words.slice(0, words.length - n).join(' ');
  const accent = words.slice(words.length - n).join(' ');
  return { plain, accent };
}

/* ─── sub-components ─────────────────────────────────────────────────────── */

/** Typewriter cycling through service names with blinking caret */
const Typewriter = ({ items, animate, isRTL }) => {
  const [idx, setIdx]   = useState(0);
  const [shown, setShown] = useState('');
  const [phase, setPhase] = useState('typing'); // typing | pause | erasing

  useEffect(() => {
    if (!animate || items.length === 0) {
      setShown(items[0] || '');
      return;
    }
    const target = items[idx];
    let timer;

    if (phase === 'typing') {
      if (shown.length < target.length) {
        timer = setTimeout(() => setShown(target.slice(0, shown.length + 1)), 60);
      } else {
        timer = setTimeout(() => setPhase('pause'), 1800);
      }
    } else if (phase === 'pause') {
      timer = setTimeout(() => setPhase('erasing'), 400);
    } else {
      if (shown.length > 0) {
        timer = setTimeout(() => setShown(shown.slice(0, -1)), 35);
      } else {
        setIdx(i => (i + 1) % items.length);
        setPhase('typing');
      }
    }
    return () => clearTimeout(timer);
  }, [animate, items, idx, shown, phase]);

  if (items.length === 0) return null;

  return (
    <div
      className={`flex items-center gap-2 font-medium ${isRTL ? 'flex-row-reverse' : ''}`}
      style={{ fontSize: 'clamp(13px, 1.2vw, 15px)' }}
      aria-live="polite"
      aria-atomic="true"
    >
      <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 400 }}>
        {isRTL ? 'خدماتنا:' : 'We build:'}
      </span>
      <span style={{ color: '#55C8B1', fontWeight: 700, minWidth: '8ch' }} dir="auto">
        {animate ? shown : items[0]}
      </span>
      <span
        className="inline-block w-0.5 h-[1em] align-middle"
        style={{
          background: '#26B59A',
          ...(animate ? { animation: 'caret-blink 1.1s step-end infinite' } : { opacity: 1 }),
        }}
        aria-hidden="true"
      />
    </div>
  );
};

/** Animated count-up number */
const CountUp = ({ to, animate, suffix = '' }) => {
  const [val, setVal] = useState(animate ? 0 : to);

  useEffect(() => {
    if (!animate || to === 0) { setVal(to); return; }
    const steps = 40;
    const inc   = to / steps;
    let step    = 0;
    const id    = setInterval(() => {
      step++;
      if (step >= steps) { setVal(to); clearInterval(id); }
      else setVal(Math.ceil(inc * step));
    }, 1400 / steps);
    return () => clearInterval(id);
  }, [animate, to]);

  return <>{val}{suffix}</>;
};

/** Drifting ambient code tokens (aria-hidden, decorative) */
const CodeTokens = ({ animate }) => {
  const tokens = [
    { text: '<div>',      x: '72%', y: '14%', delay: 0    },
    { text: 'const',     x: '85%', y: '62%', delay: 1.2  },
    { text: 'async',     x: '68%', y: '82%', delay: 2.4  },
    { text: '{ }',       x: '78%', y: '32%', delay: 0.6  },
    { text: 'return',    x: '90%', y: '48%', delay: 1.8  },
    { text: 'export',    x: '64%', y: '50%', delay: 3.0  },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {tokens.map((tk, i) => (
        <span
          key={i}
          className="absolute font-mono text-[10px] text-brand-400/15 select-none"
          style={{
            left: tk.x, top: tk.y,
            ...(animate ? {
              animation: `float-delayed ${8 + i * 1.2}s ease-in-out ${tk.delay}s infinite`,
            } : {}),
          }}
        >
          {tk.text}
        </span>
      ))}
    </div>
  );
};

/* ─── Thin dispatcher — decides mobile vs desktop ───────────────────────── */

const PremiumHero = ({ hero, trustBadges = [] }) => {
  /* Mobile detection lives here (before any child-specific hooks).
     ≤768px viewport OR touch-primary device OR saveData → mobile hero.
     This is the ONLY hook in this wrapper; all other hooks live in the
     respective child component so there is no conditional-hook violation. */
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px)').matches
      || window.matchMedia('(hover: none)').matches
      || saveDataActive();
  });
  useEffect(() => {
    const mq      = window.matchMedia('(max-width: 768px)');
    const mqHover = window.matchMedia('(hover: none)');
    const update  = () => setIsMobile(mq.matches || mqHover.matches || saveDataActive());
    mq.addEventListener('change', update);
    mqHover.addEventListener('change', update);
    return () => {
      mq.removeEventListener('change', update);
      mqHover.removeEventListener('change', update);
    };
  }, []);

  if (isMobile) {
    return (
      <Suspense fallback={<div style={{ height:'100svh', background:'#01120F' }} aria-hidden="true" />}>
        <HomeHeroMobile hero={hero} trustBadges={trustBadges} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<DesktopHeroFallback />}>
      <DesktopHero hero={hero} trustBadges={trustBadges} />
    </Suspense>
  );
};

/* ─── Fallback shown while desktop hero lazy-loads ─────────────────────── */
const DesktopHeroFallback = () => (
  <div
    style={{
      minHeight: 'clamp(360px, 88svh, 940px)',
      background: 'linear-gradient(135deg, #0D9E82 0%, #06796A 40%, #055A4F 70%, #02231E 100%)',
    }}
    aria-hidden="true"
  />
);

/* ─── Desktop hero (all original logic, unchanged) ──────────────────────── */
const DesktopHero = ({ hero, trustBadges = [] }) => {
  const { t, language }    = useTranslation();
  const isRTL              = language === 'ar';
  const shouldReduceMotion = useReducedMotion();
  const saveData           = saveDataActive();
  const lowPower           = shouldReduceMotion || saveData;
  const animate            = !shouldReduceMotion;

  /* ── Real data ──────────────────────────────────────────────────────── */
  const { data: services = [] } = useServices();

  const publishedServices = useMemo(
    () => services.filter(s => s.is_active !== false),
    [services],
  );

  /* Service names for typewriter */
  const serviceNames = useMemo(
    () =>
      publishedServices
        .slice(0, 8)
        .map(s => (language === 'ar' ? s.title_ar || s.title_en : s.title_en || s.title) || '')
        .filter(Boolean),
    [publishedServices, language],
  );

  /* ── Headline split ─────────────────────────────────────────────────── */
  const rawHeadline = hero?.headline || t('hero.defaultHeadline');
  const { plain, accent } = splitHeadline(rawHeadline, language);

  /* ── Trust chips ────────────────────────────────────────────────────── */
  const trustChips = (trustBadges || []).slice(0, 4);
  const getTrustIcon = (name) => getIcon(name, getIcon('Shield'));

  /* ── Video refs ───────────────────────────────────────────────────── */
  const videoRef         = useRef(null);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [videoError, setVideoError] = useState(false);
  const showVideo        = hero?.show_background_video !== false;
  const hasVideo         = showVideo && !lowPower && !videoError &&
                           (hero?.video_url || hero?.video_webm_url);

  /* ── Video autoplay ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!hasVideo || !videoRef.current) return;
    videoRef.current.muted = true;
    videoRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(() => {});
  }, [hasVideo]);

  const toggleVideo = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.muted = true;
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setVideoError(true));
    }
  }, [isPlaying]);

  /* ── Scroll cue ─────────────────────────────────────────────────────── */
  const scrollDown = useCallback(() => {
    window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  }, []);

  /* ── Framer Motion stagger for chips ─────────────────────────────────── */
  const chipContainer = {
    hidden: {},
    show:   { transition: { staggerChildren: 0.08, delayChildren: 0.6 } },
  };
  const chipItem = shouldReduceMotion
    ? {}
    : {
        hidden: { opacity: 0, y: 12 },
        show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
      };

  /* ── Count-up trigger when section mounts ─────────────────────────── */
  const [countStarted, setCountStarted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setCountStarted(true), 900);
    return () => clearTimeout(id);
  }, []);

  /* ── Entrance animation delays (CSS .hero-enter-fallback) ─────────── */
  const enterDelay = (ms) =>
    shouldReduceMotion ? {} : { animationDelay: `${ms}ms` };

  return (
    <section
      data-hero-desktop
      className="relative overflow-hidden flex flex-col"
      style={{
        minHeight: 'clamp(640px, 88svh, 940px)',
        background: 'linear-gradient(135deg, #0D9E82 0%, #06796A 40%, #055A4F 70%, #02231E 100%)',
      }}
      aria-label="Hero section"
    >
      {/* ── Background layers ────────────────────────────────────────── */}
      <BrandBackground grain aurora={!lowPower} grid beam={!lowPower} />

      {/* Light theme: mint veil softens the gradient so headline contrast stays AA */}
      <div
        className="absolute inset-0 pointer-events-none hidden dark:hidden"
        style={{
          background: 'linear-gradient(to right, rgba(1,18,15,0.65) 0%, rgba(1,18,15,0.30) 60%, rgba(1,18,15,0.0) 100%)',
        }}
        aria-hidden="true"
      />
      {/* Dark theme: deeper scrim on the left for text */}
      <div
        className="absolute inset-0 pointer-events-none dark:block hidden"
        style={{
          background: isRTL
            ? 'linear-gradient(to left, rgba(1,18,15,0.80) 0%, rgba(1,18,15,0.45) 55%, rgba(1,18,15,0.0) 100%)'
            : 'linear-gradient(to right, rgba(1,18,15,0.80) 0%, rgba(1,18,15,0.45) 55%, rgba(1,18,15,0.0) 100%)',
        }}
        aria-hidden="true"
      />
      {/* Universal: left-side reading scrim (works in both themes) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isRTL
            ? 'linear-gradient(to left, rgba(1,18,15,0.72) 0%, rgba(1,18,15,0.38) 50%, rgba(1,18,15,0.0) 100%)'
            : 'linear-gradient(to right, rgba(1,18,15,0.72) 0%, rgba(1,18,15,0.38) 50%, rgba(1,18,15,0.0) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Ambient code tokens (desktop, full mode) */}
      {!lowPower && <CodeTokens animate={animate} />}

      {/* ── Video layer (optional, hidden behind visual) ──────────────── */}
      {hasVideo && (
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <video
            ref={videoRef}
            autoPlay muted loop playsInline preload="metadata"
            poster={hero?.video_poster_url}
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.6) saturate(0.7)', mixBlendMode: 'luminosity' }}
            onError={() => setVideoError(true)}
          >
            {hero?.video_webm_url && <source src={hero.video_webm_url} type="video/webm" />}
            {hero?.video_url      && <source src={hero.video_url}      type="video/mp4"  />}
          </video>
        </div>
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(1,18,15,0.50) 100%)' }}
        aria-hidden="true"
      />

      {/* ── Main grid ────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start ${isRTL ? 'lg:grid-flow-dense' : ''}`}>

            {/* ══════════════════════════════════════════════════
                LEFT: Text content
            ══════════════════════════════════════════════════ */}
            <div className={`flex flex-col ${isRTL ? 'items-end text-right lg:col-start-2' : 'items-start text-left'}`}>

              {/* Eyebrow */}
              <div
                className="mb-5 hero-enter-fallback"
                style={{ ...enterDelay(0) }}
              >
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border"
                  style={{
                    background: 'rgba(13,158,130,0.18)',
                    borderColor: 'rgba(13,158,130,0.40)',
                    backdropFilter: 'blur(12px)',
                    color: '#B2F0E0',
                  }}
                >
                  <Sparkle size={13} color="#B2F0E0" glow={!lowPower} animate={animate} />
                  {hero?.badge_text || t('hero.badge')}
                </span>
              </div>

              {/* Headline */}
              <div
                className="hero-enter-fallback mb-5"
                style={{ ...enterDelay(100) }}
              >
                <h1
                  className="font-extrabold text-white"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    fontSize:   'clamp(36px, 5vw, 68px)',
                    lineHeight: language === 'ar' ? '1.35' : '1.08',
                    letterSpacing: language === 'ar' ? '0' : '-0.025em',
                    textWrap: 'balance',
                    hyphens: 'none',
                    textShadow: '0 2px 20px rgba(0,0,0,0.30)',
                  }}
                >
                  {/* Plain part */}
                  {plain && <span>{plain} </span>}

                  {/* Accent part — gradient text fill. The relative span wraps ONLY
                      the accent text so the SVG underline width = text width exactly.
                      Sparkle sits inline inside h1 on the same text run, so it
                      never creates an orphan line before the paragraph. */}
                  <span style={{ position:'relative', display:'inline' }}>
                    <span
                      className="text-gradient-brand"
                      style={{ position:'relative', display:'inline-block' }}
                    >
                      {accent}
                      {/* SVG underline scoped to the inline-block accent span */}
                      <svg
                        style={{
                          position:'absolute',
                          left:0,
                          bottom:'-4px',
                          width:'100%',
                          height:8,
                          overflow:'visible',
                          pointerEvents:'none',
                        }}
                        viewBox="0 0 300 8"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 5 C60 1, 120 7, 180 4 C240 1, 275 6, 298 4"
                          fill="none"
                          stroke="#26B59A"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          className="underline-draw"
                          style={{ opacity:0.65 }}
                        />
                      </svg>
                    </span>
                    {/* Sparkle immediately after accent, same inline context → no line gap */}
                    <span
                      style={{ display:'inline-block', verticalAlign:'middle', marginLeft:4, marginBottom:'0.08em' }}
                    >
                      <Sparkle size={22} color="#B2F0E0" glow={!lowPower} animate={animate} />
                    </span>
                  </span>
                </h1>
              </div>

              {/* Sub-headline */}
              <p
                className="hero-enter-fallback text-white/80 leading-relaxed mb-8 max-w-[50ch]"
                style={{
                  ...enterDelay(200),
                  fontSize: 'clamp(15px, 1.6vw, 20px)',
                  textShadow: '0 1px 10px rgba(0,0,0,0.20)',
                  letterSpacing: language === 'ar' ? '0' : undefined,
                }}
                dir="auto"
              >
                {hero?.subheadline || t('hero.defaultSubheadline')}
              </p>

              {/* CTA buttons */}
              <div
                className={`hero-enter-fallback flex flex-col sm:flex-row gap-3 mb-8 ${isRTL ? 'sm:flex-row-reverse' : ''}`}
                style={{ ...enterDelay(300) }}
              >
                {/* Primary — white fill, deep brand text, shine sweep */}
                <a
                  href={hero?.cta_primary_link || '/contact'}
                  className="group relative overflow-hidden inline-flex items-center justify-center gap-2 font-bold rounded-xl min-h-[48px] px-7 text-brand-900 bg-white shadow-xl transition-all duration-300 hover:shadow-sparkle hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 whitespace-nowrap"
                  style={{ fontSize: '0.9375rem' }}
                >
                  {/* Shine sweep overlay */}
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.8s ease-in-out infinite',
                    }}
                    aria-hidden="true"
                  />
                  <span className="relative">
                    {hero?.cta_primary_text || t('hero.ctaPrimary')}
                  </span>
                  <span
                    className={`relative transition-transform duration-200 group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`}
                    aria-hidden="true"
                  >
                    →
                  </span>
                </a>

                {/* Secondary — glass border
                    NOTE: "Our Work" page removed → now points to /mockups */}
                <Link
                  to={hero?.cta_secondary_link || '/mockups'}
                  className="inline-flex items-center justify-center gap-2 font-semibold rounded-xl min-h-[48px] px-7 border-2 backdrop-blur-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 whitespace-nowrap"
                  style={{
                    fontSize: '0.9375rem',
                    borderColor: 'rgba(13,158,130,0.55)',
                    background: 'rgba(13,158,130,0.10)',
                    color: '#FFFFFF',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(13,158,130,0.90)'; e.currentTarget.style.background = 'rgba(13,158,130,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(13,158,130,0.55)'; e.currentTarget.style.background = 'rgba(13,158,130,0.10)'; }}
                >
                  {hero?.cta_secondary_text || t('home.cta.secondaryButton') || 'View Our Work'}
                </Link>
              </div>

              {/* Trust chips — compact, one row at desktop */}
              {trustChips.length > 0 && (
                <motion.div
                  variants={chipContainer}
                  initial="hidden"
                  animate="show"
                  className={`flex flex-wrap gap-2 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}
                  style={shouldReduceMotion ? { opacity: 1 } : {}}
                >
                  {trustChips.map((chip) => {
                    const ChipIcon = getTrustIcon(chip.icon);
                    return (
                      <motion.div
                        key={chip.id}
                        variants={chipItem}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400/70 hover:shadow-glow-sm cursor-default whitespace-nowrap"
                        style={{
                          background: 'rgba(13,158,130,0.14)',
                          borderColor: 'rgba(13,158,130,0.35)',
                          color: '#E0F4EF',   /* ~6:1 on the brand gradient bg */
                        }}
                      >
                        <ChipIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#55C8B1' }} aria-hidden="true" />
                        <span>{chip.title}</span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Typewriter — improved contrast + size */}
              {serviceNames.length > 0 && (
                <div
                  className="hero-enter-fallback mb-4"
                  style={{ ...enterDelay(500) }}
                >
                  <Typewriter items={serviceNames} animate={animate} isRTL={isRTL} />
                </div>
              )}

              {/* Facts row — services count, tight, high contrast */}
              {publishedServices.length > 0 && (
                <div
                  className={`hero-enter-fallback ${isRTL ? 'flex-row-reverse' : ''}`}
                  style={{ ...enterDelay(600), display:'inline-flex', alignItems:'baseline', gap:6, marginTop:4 }}
                >
                  <span style={{ fontSize:'clamp(22px,2vw,28px)', fontWeight:800, color:'#FFFFFF', fontVariantNumeric:'tabular-nums', lineHeight:1 }}>
                    <CountUp to={publishedServices.length} animate={countStarted && animate} suffix="+" />
                  </span>
                  <span style={{ fontSize:'clamp(10px,0.9vw,12px)', fontWeight:700, color:'rgba(255,255,255,0.65)', textTransform:'uppercase', letterSpacing:'0.12em', lineHeight:1 }}>
                    {language === 'ar' ? 'خدمة' : 'Services'}
                  </span>
                </div>
              )}
            </div>{/* /LEFT */}

            {/* ══ RIGHT: HeroVisual ══ */}
            <div
              className={`relative hero-enter-visual ${isRTL ? 'lg:col-start-1 lg:row-start-1' : ''}`}
              style={{
                ...enterDelay(200),
                minHeight: 'clamp(280px, 40vw, 460px)',
                /* On desktop, align-self stretch so it matches the text column height */
              }}
            >
              <Suspense fallback={<div style={{ minHeight: 'clamp(280px, 40vw, 460px)' }} aria-hidden="true" />}>
                <HeroVisual
                  services={publishedServices}
                  isRTL={isRTL}
                />
              </Suspense>
            </div>

          </div>{/* /grid */}
        </div>{/* /container */}
      </div>{/* /flex-1 */}

      {/* ── Scroll cue ───────────────────────────────────────────────── */}
      {animate && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.3 }}
          onClick={scrollDown}
          className="hidden lg:flex absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors"
          aria-label={t('hero.scrollDown')}
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest">
            {t('hero.scrollDown')}
          </span>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border-2 border-current flex items-start justify-center pt-1"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1 h-1 rounded-full bg-current"
            />
          </motion.div>
        </motion.button>
      )}

      {/* Video control (shown only when video is active) */}
      {hasVideo && (
        <button
          onClick={toggleVideo}
          className="absolute bottom-6 end-5 z-20 w-10 h-10 rounded-full backdrop-blur-md border border-white/20 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-label={isPlaying ? t('hero.pauseVideo') : t('hero.playVideo')}
        >
          {isPlaying
            ? <Pause className="w-4 h-4 text-white" aria-hidden="true" />
            : <Play  className="w-4 h-4 text-white ms-0.5" aria-hidden="true" />
          }
        </button>
      )}

      {/* ── Curved SVG divider — exact match to next section background ───── */}
      {/* Uses currentColor so it inherits the page background color correctly */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-10 text-[color:var(--color-background)]"
        aria-hidden="true"
        style={{ lineHeight: 0 }}
      >
        <svg
          viewBox="0 0 1440 56"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full"
          style={{ display: 'block', height: 'clamp(32px, 4vw, 56px)' }}
        >
          <path
            d="M0,28 C360,56 720,0 1080,28 C1260,42 1380,14 1440,28 L1440,56 L0,56 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
};

export default PremiumHero;
