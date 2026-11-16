/**
 * MockupsHeroMobile — phones only (≤768px / hover:none / saveData)
 *
 * Design rules:
 * - ZERO images (hero loads 0 bytes of image data)
 * - Brand emerald tokens throughout — no navy/slate hex literals
 * - Light theme: soft emerald-tinted surface, dark text, AA contrast
 * - Dark theme: deep brand-950 surface, emerald radial glow
 * - ONE CSS animation: slow (12s) opacity/transform shift on the radial glow
 *   Paused when: off-screen (IntersectionObserver) | reduced-motion | saveData | calm mode
 * - Category chips: horizontally scrollable scroll-snap row, from real DB data
 * - Stats: only real values from DB (designsCount, industriesCount) — hidden if zero
 * - EN | AR, RTL, light/dark, AA contrast, safe-area aware
 * - H1 + both buttons visible within first screen at 360×640
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, LayoutGrid, Briefcase, ShoppingCart,
  UtensilsCrossed, Heart, GraduationCap, Dumbbell, Home, User } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useThemeContext } from '@/theme/ThemeContext';
import { useMockups, useMockupCategories, useAllPageContent } from '@/hooks/useContent';
import { useMotionPreference } from '@/hooks/useMotionPreference';

/* ── Icon map (same set as FilterBarPremium) ─────────────────────── */
const ICON_MAP = {
  LayoutGrid, Briefcase, ShoppingCart, UtensilsCrossed,
  Heart, GraduationCap, Dumbbell, Home, User, Sparkles,
};
const DEFAULT_ICON = LayoutGrid;

/* ── Scroll to grid helper ───────────────────────────────────────── */
function scrollToGrid() {
  const el = document.getElementById('mockups-grid')
    || document.querySelector('[data-mockups-grid]');
  if (el) {
    const y = el.getBoundingClientRect().top + window.pageYOffset - 72;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

/* ═══════════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════════ */
const MockupsHeroMobile = () => {
  const { language } = useTranslation();
  const { isDark } = useThemeContext();
  const isRTL = language === 'ar';
  const { mode: motionMode, allowHeavy } = useMotionPreference();
  const isCalm = motionMode === 'calm';

  /* saveData check */
  const saveData = typeof navigator !== 'undefined'
    && (navigator.connection?.saveData === true
      || navigator.connection?.effectiveType === 'slow-2g');

  /* Pause glow when off-screen */
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* One animation runs only when: visible + full motion + no saveData */
  const animActive = isVisible && !isCalm && !saveData;

  /* ── Data ─────────────────────────────────────────────────────── */
  const { data: mockups = [] }    = useMockups();
  const { data: categories = [] } = useMockupCategories();
  const { data: pageContent }     = useAllPageContent('mockups');

  /* Published mockups only */
  const publishedMockups = useMemo(
    () => mockups.filter(m => m.is_active === true || m.published === true),
    [mockups]
  );

  /* Category chips with counts */
  const categoryChips = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories
      .map(cat => ({
        id:    cat.id,
        slug:  cat.slug,
        name:  language === 'ar' ? (cat.name_ar || cat.name_en) : (cat.name_en || cat.name_ar),
        icon:  cat.icon || 'LayoutGrid',
        color: cat.color || null,
        count: publishedMockups.filter(m => {
          const s = m.category?.slug || m.category_slug;
          return s === cat.slug;
        }).length,
      }))
      .filter(c => c.count > 0);
  }, [categories, publishedMockups, language]);

  /* Stats */
  const designsCount    = publishedMockups.length;
  const industriesCount = categoryChips.length;

  /* ── CMS texts ────────────────────────────────────────────────── */
  const texts = useMemo(() => ({
    eyebrow:   language === 'ar'
      ? pageContent?.hero_eyebrow_ar || 'نماذج المواقع'
      : pageContent?.hero_eyebrow    || 'WEBSITE MOCKUPS',
    titlePre:  language === 'ar' ? '' : 'Ready‑Made ',
    titleKey:  language === 'ar'
      ? pageContent?.title_ar        || 'نماذج مواقع جاهزة'
      : pageContent?.title           || 'Website Mockups',
    subtitle:  language === 'ar'
      ? pageContent?.subtitle_ar     || 'استكشف تصاميم مواقع جاهزة لمختلف الصناعات. اختر تصميمًا يعجبك وتواصل معنا لتخصيصه.'
      : pageContent?.subtitle        || "Explore ready-made website designs for different industries. Pick a design and we'll customise it for your business.",
    primary:   language === 'ar'
      ? pageContent?.hero_primary_cta_ar   || 'تصفح التصاميم'
      : pageContent?.hero_primary_cta      || 'Browse Designs',
    secondary: language === 'ar'
      ? pageContent?.hero_secondary_cta_ar || 'طلب تصميم مخصص'
      : pageContent?.hero_secondary_cta    || 'Request Custom Design',
    designs:   language === 'ar' ? 'تصميم جاهز'  : 'ready designs',
    industries:language === 'ar' ? 'صناعة'       : 'industries',
  }), [pageContent, language]);

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <section
      ref={sectionRef}
      data-mockups-hero-mobile
      aria-label={language === 'ar' ? 'قسم نماذج المواقع' : 'Mockups Hero Section'}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={[
        'relative flex flex-col overflow-hidden',
        /* safe-area: top padding accounts for fixed navbar (~72px) */
        'pt-20 pb-10',
        isDark
          ? 'bg-brand-950'
          : 'bg-gradient-to-b from-brand-50 to-white',
      ].join(' ')}
    >
      {/* ── Decorative background ─────────────────────────────── */}
      <div
        aria-hidden="true"
        className={[
          'absolute inset-0 pointer-events-none select-none overflow-hidden',
          'hero-mobile-bg',
        ].join(' ')}
      >
        {/* Radial glow — ONE CSS animation, paused via class */}
        <div
          className={[
            'absolute rounded-full',
            isRTL ? '-right-16 -top-16' : '-left-16 -top-16',
            'w-72 h-72 opacity-40',
            animActive
              ? 'hero-glow-anim'
              : 'hero-glow-anim-paused',
          ].join(' ')}
          style={{
            background: isDark
              ? 'radial-gradient(circle, #0D9E82 0%, transparent 70%)'
              : 'radial-gradient(circle, #26B59A 0%, transparent 65%)',
          }}
        />

        {/* Subtle dot grid — pure CSS, static */}
        {isDark && (
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `radial-gradient(circle, #0D9E82 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />
        )}

        {/* Light-mode: faint linear sweep */}
        {!isDark && (
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(160deg, rgba(13,158,130,0.07) 0%, transparent 55%)',
            }}
          />
        )}
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div
        className={[
          'relative z-10 flex flex-col px-5',
          /* Fade-up on load — ends at final state, 400ms */
          /* CSS fallback: if JS hasn't toggled, it still shows after 1.5s */
          'hero-content-fadein',
        ].join(' ')}
      >
        {/* Eyebrow pill */}
        <div
          className={[
            'inline-flex items-center gap-2 self-start',
            'px-3 py-1.5 rounded-full mb-4',
            isDark
              ? 'bg-brand-900 border border-brand-700/50 text-brand-400'
              : 'bg-brand-100 border border-brand-200 text-brand-700',
          ].join(' ')}
        >
          <Sparkles className="w-3 h-3 shrink-0" aria-hidden="true" />
          <span className="text-[11px] font-bold uppercase tracking-widest leading-none">
            {texts.eyebrow}
          </span>
        </div>

        {/* H1 — 28-32px, emerald key word with gradient + underline */}
        <h1
          className={[
            'font-extrabold leading-[1.15] tracking-tight mb-3',
            'text-[1.75rem]',          /* 28px min */
            'sm:text-[2rem]',          /* 32px on wider phones */
            isDark ? 'text-white' : 'text-brand-950',
          ].join(' ')}
        >
          {language === 'ar' ? (
            /* Arabic: single gradient span on the whole title */
            <span className="hero-gradient-text">{texts.titleKey}</span>
          ) : (
            <>
              <span>{texts.titlePre}</span>
              {/* Key word with emerald gradient + underline */}
              <span className="relative inline-block">
                <span className="hero-gradient-text">{texts.titleKey}</span>
                {/* Underline — inline-block under key word only */}
                <span
                  aria-hidden="true"
                  className={[
                    'absolute left-0 right-0 -bottom-0.5 h-[3px] rounded-full',
                    isDark ? 'bg-brand-500' : 'bg-brand-500',
                  ].join(' ')}
                />
              </span>
            </>
          )}
        </h1>

        {/* Paragraph — 16px, AA contrast */}
        <p
          className={[
            'text-base leading-relaxed mb-6',
            isDark ? 'text-brand-200' : 'text-brand-800',
          ].join(' ')}
        >
          {texts.subtitle}
        </p>

        {/* CTA Buttons — full-width, 48px, stacked */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Primary — emerald solid */}
          <button
            onClick={scrollToGrid}
            className={[
              'flex items-center justify-center gap-2',
              'w-full h-12 rounded-xl font-semibold text-white',
              'transition-colors duration-200',
              isDark
                ? 'bg-brand-500 hover:bg-brand-400 active:bg-brand-600'
                : 'bg-brand-600 hover:bg-brand-500 active:bg-brand-700',
            ].join(' ')}
          >
            <span>{texts.primary}</span>
            <ArrowRight
              className={`w-4 h-4 shrink-0 ${isRTL ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {/* Secondary — outline, AA contrast (3:1 border, 4.5:1 text) */}
          <Link
            to="/contact"
            className={[
              'flex items-center justify-center',
              'w-full h-12 rounded-xl font-semibold border-2',
              'transition-colors duration-200',
              isDark
                ? 'border-brand-500 text-brand-300 hover:bg-brand-900'
                : 'border-brand-600 text-brand-700 hover:bg-brand-50',
            ].join(' ')}
          >
            {texts.secondary}
          </Link>
        </div>

        {/* ── Category chips row ─────────────────────────────── */}
        {categoryChips.length > 0 && (
          <div className="mb-6 -mx-5">
            {/* Scroll-snap row, no JS scroll listeners */}
            <div
              className="flex gap-2.5 overflow-x-auto px-5 pb-2"
              style={{
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              aria-label={language === 'ar' ? 'فئات التصاميم' : 'Design categories'}
              role="list"
            >
              {categoryChips.map(chip => {
                const Icon = ICON_MAP[chip.icon] || DEFAULT_ICON;
                return (
                  <div
                    key={chip.id}
                    role="listitem"
                    className={[
                      'flex flex-col items-center gap-1.5 shrink-0',
                      'w-20 px-2 py-2.5 rounded-xl',
                      'border transition-colors duration-150',
                      isDark
                        ? 'bg-brand-900/80 border-brand-700/40 text-brand-300'
                        : 'bg-white border-brand-100 text-brand-700',
                    ].join(' ')}
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div
                      className={[
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                        isDark ? 'bg-brand-800' : 'bg-brand-50',
                      ].join(' ')}
                      style={chip.color
                        ? { backgroundColor: `${chip.color}22` }
                        : undefined}
                    >
                      <Icon
                        className="w-4 h-4"
                        aria-hidden="true"
                        style={chip.color ? { color: chip.color } : undefined}
                      />
                    </div>
                    <span className="text-[10px] font-semibold leading-tight text-center line-clamp-2">
                      {chip.name}
                    </span>
                    <span
                      className={[
                        'text-[9px] font-bold tabular-nums',
                        isDark ? 'text-brand-500' : 'text-brand-500',
                      ].join(' ')}
                    >
                      {chip.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Stats strip — only real DB values ─────────────── */}
        {(designsCount > 0 || industriesCount > 0) && (
          <div
            className={[
              'flex items-center gap-0 pt-5 mt-auto',
              isDark ? 'border-t border-brand-800' : 'border-t border-brand-100',
            ].join(' ')}
          >
            {designsCount > 0 && (
              <div className="flex-1 text-center">
                <p
                  className={[
                    'text-2xl font-extrabold tabular-nums leading-none',
                    isDark ? 'text-brand-400' : 'text-brand-600',
                  ].join(' ')}
                >
                  {designsCount}+
                </p>
                <p
                  className={[
                    'text-[11px] mt-1 leading-tight',
                    isDark ? 'text-brand-500' : 'text-brand-600/70',
                  ].join(' ')}
                >
                  {texts.designs}
                </p>
              </div>
            )}

            {designsCount > 0 && industriesCount > 0 && (
              <div
                className={[
                  'w-px self-stretch mx-2',
                  isDark ? 'bg-brand-800' : 'bg-brand-100',
                ].join(' ')}
                aria-hidden="true"
              />
            )}

            {industriesCount > 0 && (
              <div className="flex-1 text-center">
                <p
                  className={[
                    'text-2xl font-extrabold tabular-nums leading-none',
                    isDark ? 'text-brand-400' : 'text-brand-600',
                  ].join(' ')}
                >
                  {industriesCount}+
                </p>
                <p
                  className={[
                    'text-[11px] mt-1 leading-tight',
                    isDark ? 'text-brand-500' : 'text-brand-600/70',
                  ].join(' ')}
                >
                  {texts.industries}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default MockupsHeroMobile;
