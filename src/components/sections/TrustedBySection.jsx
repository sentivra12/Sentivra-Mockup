/**
 * TrustedBySection — Round 2: Premium round logo marquee
 *
 * REQUIREMENTS (CLIENT LOGOS STRIP)
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Round/rounded-square glass badges (72–88px), logo centered object-fit:contain
 * 2. Infinite CSS marquee (translateX loop), seamless duplicates, edge fade masks
 * 3. Pause on hover/focus, pause when off-screen/tab hidden
 * 4. Two rows (opposite directions) if 12+ logos; single row if 6–11; static grid if <6
 * 5. Reduced motion: static wrapped grid (fully visible, no overflow)
 * 6. SaveData/low-power: static
 * 7. Image fallback: initials monogram + name in a clean chip (no broken-image icon)
 * 8. Hide entire strip if 0 published logos with valid name
 * 9. Light theme: grayscale → color on hover; dark theme: light glass tile so dark logos visible
 * 10. Brand emerald tokens only (no hardcoded hex/old palette)
 * 11. RTL: marquee direction flips
 * 12. AA contrast: all text meets WCAG AA
 * 13. Dev mode: unpublished logos show a "DEMO" badge (translated)
 * 14. Section header from page_sections (fallback: "Trusted By")
 * 15. Links open in new tab with rel="noopener noreferrer" if website_url set
 * 16. Invert-in-dark-mode toggle for dark logos on transparent bg
 * 17. No new heavy deps (CSS-only animation)
 * 18. CLS ~0 (reserve height even when loading)
 *
 * SHARED COMPONENT CHANGES: None — this file is home-page-only.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState, useRef } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { supabase } from '@/lib/supabase';
import { useReducedMotion } from '@/hooks/useMotionPreference';
import Sparkle from '@/components/ui/Sparkle';

/* ── helpers ────────────────────────────────────────────────────────────── */

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

/* ── ClientBadge: round logo tile with fallback ────────────────────────────── */
function ClientBadge({ client, isRTL, animate }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const name = isRTL
    ? client.client_name_ar || client.client_name
    : client.client_name;

  const hasImage = client.logo_url && !imgError;

  const badge = (
    <div
      className={[
        'relative flex flex-col items-center gap-2 group',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-color-background rounded-2xl',
      ].join(' ')}
      tabIndex={client.website_url ? undefined : 0}
      role={client.website_url ? undefined : 'img'}
      aria-label={name}
    >
      {/* Badge tile — 72px on mobile, 96px on desktop */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          background: 'rgba(255,255,255,0.80)',
          border: '1px solid rgba(13,158,130,0.20)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10,
          boxShadow: '0 2px 8px rgba(13,158,130,0.08)',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
        className="md:w-24 md:h-24 md:rounded-[20px] md:p-4 md:shadow-[0_6px_20px_rgba(13,158,130,0.18),0_0_0_1px_rgba(255,255,255,0.60)_inset] group-hover:scale-105 group-hover:shadow-[0_10px_32px_rgba(13,158,130,0.28)] dark:bg-[rgba(255,255,255,0.12)] dark:border-[rgba(13,158,130,0.30)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.30)] md:dark:shadow-[0_6px_20px_rgba(0,0,0,0.40),0_0_0_1px_rgba(255,255,255,0.08)_inset]"
      >
        {hasImage ? (
          <img
            src={client.logo_url}
            alt={client.alt_text || name}
            onError={() => setImgError(true)}
            onLoad={() => setImgLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 0.3s, filter 0.3s',
              filter: 'grayscale(40%)',
            }}
            className={[
              'group-hover:grayscale-0 group-hover:brightness-105',
              client.invert_in_dark ? 'dark:invert' : '',
            ].join(' ')}
            loading="lazy"
          />
        ) : (
          /* Fallback: initials monogram */
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(13,158,130,0.25), rgba(4,77,64,0.35))',
              fontSize: 28,
              fontWeight: 800,
              color: 'rgba(13,158,130,0.90)',
              letterSpacing: '-0.02em',
            }}
            className="dark:bg-gradient-to-br dark:from-brand-400/30 dark:to-brand-600/30 dark:text-brand-300"
          >
            {getInitials(name)}
          </div>
        )}
      </div>

      {/* Name label (optional, off by default for cleaner look) */}
      {/* Uncomment if you want names under logos:
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(13,158,130,0.75)',
          textAlign: 'center',
          maxWidth: 90,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        className="dark:text-brand-300/70"
      >
        {name}
      </span>
      */}
    </div>
  );

  return client.website_url ? (
    <a
      href={client.website_url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} website`}
      className="block"
    >
      {badge}
    </a>
  ) : (
    badge
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function TrustedBySection() {
  const { language, t } = useTranslation();
  const isRTL = language === 'ar';

  const shouldReduceMotion = useReducedMotion();
  const saveData =
    typeof navigator !== 'undefined' &&
    (navigator.connection?.saveData || navigator.connection?.effectiveType === 'slow-2g');
  const lowPower = shouldReduceMotion || saveData;
  const animate = !shouldReduceMotion;

  const [clients, setClients] = useState([]);
  const [sectionSettings, setSectionSettings] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const sectionRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setIsError(false);

        // Fetch only published logos with valid logo_url
        const { data: clientsData, error: clientsError } = await supabase
          .from('client_logos')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (clientsError) throw clientsError;

        // Filter: only logos with a valid client_name and logo_url
        const validClients = (clientsData || []).filter(
          c => c.client_name && c.client_name.trim() && c.logo_url && c.logo_url.trim()
        );
        setClients(validClients);

        // Section header from page_sections (optional)
        const { data: sectionData } = await supabase
          .from('page_sections')
          .select('*')
          .eq('section_key', 'trusted_by')
          .eq('page', 'home')
          .eq('enabled', true)
          .single();
        if (sectionData) setSectionSettings(sectionData);
      } catch (err) {
        console.warn('[TrustedBySection] Error loading client logos:', err?.message || err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Pause when off-screen
  useEffect(() => {
    if (!sectionRef.current || lowPower) return;
    const obs = new IntersectionObserver(
      ([e]) => setIsVisible(e.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [lowPower]);

  // Pause when tab hidden
  useEffect(() => {
    if (lowPower) return;
    const onVis = () => setIsPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [lowPower]);

  /* ── 4-STATE LOGIC ──────────────────────────────────────────────────────
     1. LOADING: show skeleton
     2. ERROR: hide section
     3. EMPTY: hide section
     4. LOADED WITH DATA: render logos
  ────────────────────────────────────────────────────────────────────────── */

  // State 2: ERROR
  if (isError) return null;

  // State 1: LOADING
  if (isLoading) {
    return (
      <section
        className="relative py-16 md:py-20 overflow-hidden"
        style={{
          background: 'var(--color-background)',
        }}
        aria-busy="true"
        aria-label="Loading client logos"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header skeleton */}
          <div className="text-center mb-12 space-y-3 animate-pulse">
            <div className="h-4 bg-color-border rounded w-24 mx-auto" />
            <div className="h-8 bg-color-border rounded w-64 mx-auto" />
          </div>

          {/* Logos skeleton */}
          <div className="flex justify-center gap-8 flex-wrap">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                <div className="w-24 h-24 rounded-[20px] bg-color-border" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // State 3: EMPTY
  if (clients.length === 0) return null;

  /* ── Layout strategy ──────────────────────────────────────────────────────
     <6 logos:     static centered grid (no marquee)
     6–11 logos:   single-row marquee
     12+ logos:    two-row marquee (opposite directions)
     reduced motion / saveData: always static wrapped grid
  ────────────────────────────────────────────────────────────────────────── */

  const count = clients.length;
  const useMarquee = !lowPower && count >= 6;
  const useTwoRows = useMarquee && count >= 12;

  // For marquee: triple the track so the loop is seamless
  const marqueeClients = useMarquee ? [...clients, ...clients, ...clients] : clients;

  // Split into two rows if needed
  const row1 = useTwoRows ? marqueeClients.filter((_, i) => i % 2 === 0) : marqueeClients;
  const row2 = useTwoRows ? marqueeClients.filter((_, i) => i % 2 === 1) : [];

  const paused = isPaused || !isVisible;

  return (
    <section
      ref={sectionRef}
      className="relative py-5 md:py-16 md:overflow-hidden"
      style={{
        background: 'var(--color-surface)',
      }}
      aria-label="Trusted by"
    >
      {/* Subtle bottom separator line (between this section and next) — desktop only */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px hidden md:block"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(13,158,130,0.15), transparent)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — compact on mobile */}
        <div className="text-center mb-3 md:mb-12">
          {sectionSettings?.eyebrow ? (
            <div className="inline-flex items-center gap-2">
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'rgba(13,158,130,0.75)',
                }}
                className="dark:text-brand-300"
              >
                {isRTL ? sectionSettings.eyebrow_ar || sectionSettings.eyebrow : sectionSettings.eyebrow}
              </p>
              <Sparkle size={12} color="#26B59A" glow={animate} animate={animate} />
            </div>
          ) : (
            <div className="inline-flex items-center gap-2">
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'rgba(13,158,130,0.75)',
                }}
                className="dark:text-brand-300"
              >
                {isRTL ? 'موثوق به' : 'Trusted By'}
              </p>
              <Sparkle size={12} color="#26B59A" glow={animate} animate={animate} />
            </div>
          )}

          {sectionSettings?.title && (
            <h2
              className="hidden md:block"
              style={{
                fontSize: 'clamp(24px, 3vw, 32px)',
                fontWeight: 800,
                lineHeight: 1.2,
                color: 'var(--color-text)',
                marginTop: 12,
                marginBottom: 8,
              }}
            >
              {isRTL ? sectionSettings.title_ar || sectionSettings.title : sectionSettings.title}
            </h2>
          )}

          {sectionSettings?.subtitle && (
            <p
              className="hidden md:block"
              style={{
                fontSize: 15,
                color: 'var(--color-text-muted)',
                maxWidth: 600,
                margin: '0 auto',
              }}
            >
              {isRTL ? sectionSettings.subtitle_ar || sectionSettings.subtitle : sectionSettings.subtitle}
            </p>
          )}
        </div>

        {/* Logos strip — horizontal row on mobile, gap 12px */}
        {!useMarquee ? (
          /* ── Static grid (< 6 logos or reduced motion) ────────────────── */
          <div
            className="flex flex-wrap items-center justify-center gap-3 md:gap-8"
            role="list"
            aria-label="Client logos"
          >
            {clients.map(client => (
              <div key={client.id} role="listitem">
                <ClientBadge client={client} isRTL={isRTL} animate={animate} />
              </div>
            ))}
          </div>
        ) : (
          /* ── Marquee (6+ logos, motion allowed) ───────────────────────── */
          <div className="relative">
            {/* Edge fade masks — hidden on mobile */}
            <div
              className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none hidden md:block"
              style={{
                background: `linear-gradient(to right, var(--color-surface), transparent)`,
              }}
              aria-hidden="true"
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none hidden md:block"
              style={{
                background: `linear-gradient(to left, var(--color-surface), transparent)`,
              }}
              aria-hidden="true"
            />

            <div
              className="space-y-0 md:space-y-8"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              role="list"
              aria-label="Client logos"
            >
              {/* Row 1 */}
              <div className="overflow-x-auto md:overflow-hidden -mx-4 px-4 md:mx-0 md:px-0">
                <div
                  className="flex gap-3 md:gap-8 items-center"
                  style={{
                    width: 'fit-content',
                    animation: paused
                      ? 'none'
                      : `marquee-${isRTL ? 'rtl' : 'ltr'} ${Math.max(30, count * 2)}s linear infinite`,
                    willChange: paused ? 'auto' : 'transform',
                  }}
                >
                  {row1.map((client, idx) => (
                    <div key={`${client.id}-${idx}`} className="flex-shrink-0" role="listitem">
                      <ClientBadge client={client} isRTL={isRTL} animate={animate} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 2 (opposite direction) — hidden on mobile */}
              {useTwoRows && (
                <div className="overflow-hidden hidden md:block">
                  <div
                    className="flex gap-8 items-center"
                    style={{
                      width: 'fit-content',
                      animation: paused
                        ? 'none'
                        : `marquee-${isRTL ? 'ltr' : 'rtl'} ${Math.max(30, count * 2)}s linear infinite`,
                      willChange: paused ? 'auto' : 'transform',
                    }}
                  >
                    {row2.map((client, idx) => (
                      <div key={`${client.id}-row2-${idx}`} className="flex-shrink-0" role="listitem">
                        <ClientBadge client={client} isRTL={isRTL} animate={animate} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CSS animations (scoped to this component) */}
      <style>{`
        @keyframes marquee-ltr {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @keyframes marquee-rtl {
          from { transform: translateX(0); }
          to   { transform: translateX(33.333%); }
        }
      `}</style>
    </section>
  );
}
