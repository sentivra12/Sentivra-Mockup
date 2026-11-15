/**
 * PremiumMarqueeBand — SP brand edition
 * Deep emerald band, dual-row marquee, brand accent text/icons.
 * All old slate/cyan/rgba(143,179,196) replaced with brand tokens.
 */

import { useState, useRef } from 'react';
import { Pause, Play } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { useMarqueeItems } from '../../hooks/useContent';
import { resolveIcon } from '../../lib/iconResolver';
import { useReducedMotion } from '@/hooks/useMotionPreference';

const PremiumMarqueeBand = () => {
  const { language } = useTranslation();
  const isRTL = language === 'ar';

  const { data: row1Items = [] } = useMarqueeItems(1);
  const { data: row2Items = [] } = useMarqueeItems(2);

  const [isPaused, setIsPaused] = useState(false);
  const [focusedRow, setFocusedRow] = useState(null);

  const prefersReducedMotion = useReducedMotion();

  const dup1 = prefersReducedMotion ? row1Items : [...row1Items, ...row1Items, ...row1Items];
  const dup2 = prefersReducedMotion ? row2Items : [...row2Items, ...row2Items, ...row2Items];

  if (row1Items.length === 0 && row2Items.length === 0) return null;

  /* ── Edge fade helper ───────────────────────────────────────────── */
  const EdgeFade = ({ side }) => (
    <div
      className={`absolute ${side}-0 top-0 bottom-0 w-28 z-10 pointer-events-none`}
      style={{
        background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, var(--marquee-deep), transparent)`,
      }}
    />
  );

  return (
    <section
      className="relative overflow-hidden py-12 md:py-16"
      style={{
        background: 'var(--marquee-deep)',
        transform: 'rotate(-1.5deg) scale(1.025)',
        transformOrigin: 'center',
      }}
      onMouseEnter={() => !prefersReducedMotion && setIsPaused(true)}
      onMouseLeave={() => !prefersReducedMotion && setIsPaused(false)}
      aria-label="Brand highlights"
    >
      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none brand-grain"
        aria-hidden="true"
      />

      {/* Faint grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(13,158,130,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(13,158,130,0.4) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      {/* Counter-rotate content so it reads straight */}
      <div style={{ transform: 'rotate(1.5deg)' }} className="relative">

        {/* ── Row 1 — large display text ──────────────────────────── */}
        {row1Items.length > 0 && (
          <div className="relative mb-8 md:mb-10">
            {!prefersReducedMotion && <><EdgeFade side="left" /><EdgeFade side="right" /></>}

            <div
              className={`flex gap-12 md:gap-16 ${prefersReducedMotion ? 'flex-wrap justify-center' : ''}`}
              style={!prefersReducedMotion ? {
                animation: isPaused || focusedRow === 1
                  ? 'none'
                  : `marquee-band-${isRTL ? 'rtl' : 'ltr'}-slow 50s linear infinite`,
                width: 'fit-content',
                willChange: 'transform',
              } : {}}
              onFocus={() => setFocusedRow(1)}
              onBlur={() => setFocusedRow(null)}
              role="list"
              aria-label="Brand highlights row 1"
            >
              {dup1.map((item, idx) => (
                <div
                  key={`r1-${item.id}-${idx}`}
                  className="flex-shrink-0 flex items-center gap-6"
                  role="listitem"
                  aria-hidden={!prefersReducedMotion && idx >= row1Items.length ? true : undefined}
                >
                  <span
                    className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight whitespace-nowrap text-brand-gradient"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.90), var(--marquee-accent))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {isRTL ? item.text_ar : item.text_en}
                  </span>
                  {/* Sparkle separator */}
                  <span
                    aria-hidden="true"
                    className="text-marquee-accent text-3xl opacity-50 select-none"
                    style={{ fontWeight: 300 }}
                  >
                    ✦
                  </span>
                </div>
              ))}
            </div>

            {!prefersReducedMotion && (
              <ul className="sr-only">
                {row1Items.map(item => (
                  <li key={`sr1-${item.id}`}>{isRTL ? item.text_ar : item.text_en}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ── Row 2 — pill chips with icons ───────────────────────── */}
        {row2Items.length > 0 && (
          <div className="relative">
            {!prefersReducedMotion && <><EdgeFade side="left" /><EdgeFade side="right" /></>}

            <div
              className={`flex gap-5 md:gap-7 items-center ${prefersReducedMotion ? 'flex-wrap justify-center' : ''}`}
              style={!prefersReducedMotion ? {
                animation: isPaused || focusedRow === 2
                  ? 'none'
                  : `marquee-band-${isRTL ? 'ltr' : 'rtl'}-fast 65s linear infinite`,
                width: 'fit-content',
                willChange: 'transform',
              } : {}}
              onFocus={() => setFocusedRow(2)}
              onBlur={() => setFocusedRow(null)}
              role="list"
              aria-label="Services and values"
            >
              {dup2.map((item, idx) => {
                const Icon = item.icon_name ? resolveIcon(item.icon_name) : null;
                return (
                  <div
                    key={`r2-${item.id}-${idx}`}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-marquee-chip border border-marquee-chip-border hover:bg-marquee-chip-hover hover:border-brand-500/30 transition-all duration-300"
                    role="listitem"
                    aria-hidden={!prefersReducedMotion && idx >= row2Items.length ? true : undefined}
                  >
                    {Icon && <Icon className="w-4 h-4 text-marquee-accent flex-shrink-0" strokeWidth={2} aria-hidden="true" />}
                    <span className="text-sm md:text-base font-semibold text-marquee-text whitespace-nowrap">
                      {isRTL ? item.text_ar : item.text_en}
                    </span>
                  </div>
                );
              })}
            </div>

            {!prefersReducedMotion && (
              <ul className="sr-only">
                {row2Items.map(item => (
                  <li key={`sr2-${item.id}`}>{isRTL ? item.text_ar : item.text_en}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Pause/Play */}
        {!prefersReducedMotion && (
          <div className="absolute top-3 right-4 z-20">
            <button
              onClick={() => setIsPaused(p => !p)}
              className="p-2 rounded-full bg-marquee-chip border border-marquee-chip-border hover:bg-marquee-chip-hover hover:border-brand-500/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
              style={{ '--tw-ring-offset-color': 'var(--marquee-deep)' }}
              aria-label={isPaused ? 'Play marquee' : 'Pause marquee'}
              aria-pressed={isPaused}
            >
              {isPaused
                ? <Play  className="w-4 h-4 text-marquee-accent" fill="currentColor" aria-hidden="true" />
                : <Pause className="w-4 h-4 text-marquee-accent" fill="currentColor" aria-hidden="true" />
              }
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes marquee-band-ltr-slow {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @keyframes marquee-band-rtl-slow {
          from { transform: translateX(0); }
          to   { transform: translateX(33.333%); }
        }
        @keyframes marquee-band-ltr-fast {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @keyframes marquee-band-rtl-fast {
          from { transform: translateX(0); }
          to   { transform: translateX(33.333%); }
        }
      `}</style>
    </section>
  );
};

export default PremiumMarqueeBand;
