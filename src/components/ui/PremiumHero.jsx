import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/useTranslation';
import InverseSurface from './InverseSurface';

/**
 * PremiumHero - Compact cinematic hero for Services and other pages
 * 
 * Features:
 * - Inverse dark surface (stays dark in both themes)
 * - Aurora gradient glow with grain texture
 * - Faint grid with radial mask
 * - Services constellation with parallax on desktop
 * - Horizontal scrollable chips on mobile
 * - Breadcrumb with structured data
 * - Eyebrow pill label
 * - Gradient accent words in title
 * - Smooth scroll to anchor support
 * - Full RTL support
 * 
 * Props:
 * @param {Array} breadcrumbs - [{label, href}]
 * @param {String} label - Eyebrow text
 * @param {String} title - Main headline
 * @param {String} titleAccent - Highlighted word(s) with gradient
 * @param {String} description - Paragraph text
 * @param {Object} primaryButton - {label, href, onClick}
 * @param {Object} secondaryButton - {label, href, onClick}
 * @param {String} backgroundImageUrl - Optional background overlay image
 * @param {Array} constellationItems - Service items for floating chips [{icon, name, id}]
 * @param {Number} height - Hero height (default 560 on desktop, auto on mobile)
 */
const PremiumHero = ({
  breadcrumbs = [],
  label,
  title,
  titleAccent,
  description,
  primaryButton,
  secondaryButton,
  backgroundImageUrl,
  constellationItems = [],
  height = 560,
}) => {
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  
  // Fallbacks for missing content (development warnings)
  const isDev = import.meta.env.DEV;
  
  const safeLabel = label || (isDev ? '[Missing: label]' : '');
  const safeTitle = title || (isDev ? '[Missing: title]' : t('common.loading', 'Loading...'));
  const safeTitleAccent = titleAccent || '';
  const safeDescription = description || (isDev ? '[Missing: description]' : '');
  
  const safePrimaryButton = primaryButton?.label ? primaryButton : null;
  const safeSecondaryButton = secondaryButton?.label ? secondaryButton : null;
  
  // Log warnings in development
  if (isDev) {
    if (!label) console.warn('[PremiumHero] Missing prop: label');
    if (!title) console.warn('[PremiumHero] Missing prop: title');
    if (!description) console.warn('[PremiumHero] Missing prop: description');
    if (primaryButton && !primaryButton.label) console.warn('[PremiumHero] Primary button has no label');
    if (secondaryButton && !secondaryButton.label) console.warn('[PremiumHero] Secondary button has no label');
  }
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Parallax mouse tracking (desktop only)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 100 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 100 });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    const checkMotion = () => setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    
    checkMobile();
    checkMotion();
    
    window.addEventListener('resize', checkMobile);
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', checkMotion);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.matchMedia('(prefers-reduced-motion: reduce)').removeEventListener('change', checkMotion);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile || reduceMotion || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 25;
    const y = (e.clientY - rect.top - rect.height / 2) / 25;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleClick = (e, href, onClick) => {
    // Handle anchor links with smooth scroll
    if (href?.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    if (onClick) onClick(e);
  };

  return (
    <InverseSurface 
      as="section" 
      withTopGlow={false} 
      withGrid={true}
      className="relative"
      style={{ minHeight: isMobile ? 'auto' : `${height}px` }}
    >
      {/* Optional background image with heavy overlay */}
      {backgroundImageUrl && (
        <div className="absolute inset-0 opacity-10">
          <img
            src={backgroundImageUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-inverse-bg via-inverse-bg/90 to-inverse-bg" />
        </div>
      )}

      {/* Aurora glow */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.3), transparent 70%)',
        }}
      />

      {/* Grain texture */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px',
        }}
      />

      {/* Main content */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={isRTL ? 'lg:order-2' : ''}
          >
            {/* Breadcrumb with structured data */}
            {breadcrumbs.length > 0 && (
              <nav 
                className={`flex items-center text-sm text-inverse-fg-muted mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}
                aria-label="Breadcrumb"
              >
                <ol 
                  className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} space-x-2`}
                  itemScope 
                  itemType="https://schema.org/BreadcrumbList"
                >
                  {breadcrumbs.map((crumb, index) => (
                    <li
                      key={index}
                      itemProp="itemListElement"
                      itemScope
                      itemType="https://schema.org/ListItem"
                      className="flex items-center"
                    >
                      {index > 0 && (
                        <ChevronRight 
                          className={`h-4 w-4 mx-2 text-inverse-fg-subtle ${isRTL ? 'rotate-180' : ''}`} 
                          aria-hidden="true"
                        />
                      )}
                      {crumb.href ? (
                        <Link
                          to={crumb.href}
                          itemProp="item"
                          className="hover:text-inverse-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inverse-ring rounded"
                        >
                          <span itemProp="name">{crumb.label}</span>
                        </Link>
                      ) : (
                        <span itemProp="name" className="text-inverse-fg font-medium">
                          {crumb.label}
                        </span>
                      )}
                      <meta itemProp="position" content={index + 1} />
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Eyebrow pill */}
            {safeLabel && (
              <div className="mb-6">
                <span className={`inline-flex items-center px-4 py-2 rounded-full bg-inverse-fg/10 border border-inverse-border-subtle text-inverse-accent text-sm font-semibold uppercase tracking-wider backdrop-blur-sm ${isDev && !label ? 'bg-red-500/20 border-red-500' : ''}`}>
                  {safeLabel}
                </span>
              </div>
            )}

            {/* Title with gradient accent */}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-inverse-fg leading-tight mb-6 ${isDev && !title ? 'text-red-400' : ''}`}>
              {safeTitle}
              {safeTitleAccent && (
                <>
                  {' '}
                  <span 
                    className="bg-gradient-to-r from-inverse-accent via-blue-400 to-purple-400 bg-clip-text text-transparent"
                    style={{ display: 'inline-block' }}
                  >
                    {safeTitleAccent}
                  </span>
                </>
              )}
            </h1>

            {/* Description */}
            {safeDescription && (
              <p className={`text-lg md:text-xl text-inverse-fg-muted leading-relaxed mb-8 max-w-2xl ${isDev && !description ? 'text-red-300' : ''}`}>
                {safeDescription}
              </p>
            )}

            {/* Buttons */}
            {(safePrimaryButton || safeSecondaryButton) && (
              <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                {safePrimaryButton && (
                  <Button
                    size="lg"
                    onClick={(e) => handleClick(e, safePrimaryButton.href, safePrimaryButton.onClick)}
                    asChild={!!safePrimaryButton.href && !safePrimaryButton.href.startsWith('#')}
                    className="bg-inverse-accent hover:bg-inverse-accent/90 text-inverse-bg font-semibold px-8 py-6 text-base rounded-lg group shadow-lg hover:shadow-xl transition-all"
                  >
                    {safePrimaryButton.href && !safePrimaryButton.href.startsWith('#') ? (
                      <a href={safePrimaryButton.href}>
                        {safePrimaryButton.label}
                        <ArrowRight className={`h-5 w-5 group-hover:translate-x-1 transition-transform ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                      </a>
                    ) : (
                      <>
                        {safePrimaryButton.label}
                        <ArrowRight className={`h-5 w-5 group-hover:translate-x-1 transition-transform ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                      </>
                    )}
                  </Button>
                )}
                {safeSecondaryButton && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={(e) => handleClick(e, safeSecondaryButton.href, safeSecondaryButton.onClick)}
                    asChild={!!safeSecondaryButton.href}
                    className="border-2 border-inverse-border hover:border-inverse-accent/50 text-inverse-fg hover:bg-inverse-fg/10 font-semibold px-8 py-6 text-base rounded-lg group backdrop-blur-sm"
                  >
                    {safeSecondaryButton.href ? (
                      <Link to={safeSecondaryButton.href} className="inline-flex items-center">
                        {safeSecondaryButton.label}
                        <ArrowRight className={`h-5 w-5 text-inverse-fg group-hover:text-inverse-accent group-hover:translate-x-1 transition-all ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                      </Link>
                    ) : (
                      <>
                        {safeSecondaryButton.label}
                        <ArrowRight className={`h-5 w-5 text-inverse-fg group-hover:text-inverse-accent group-hover:translate-x-1 transition-all ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </motion.div>

          {/* Right: Constellation or Mobile Chips */}
          <div className={`relative ${isRTL ? 'lg:order-1' : ''}`}>
            {/* Desktop: Floating constellation */}
            {!isMobile && constellationItems.length > 0 && (
              <motion.div
                className="relative h-96 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* Center mark - Sentivra S */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-2xl bg-inverse-fg/5 backdrop-blur-md border border-inverse-border-subtle flex items-center justify-center shadow-2xl hover:bg-inverse-fg/10 transition-all">
                    <svg width="56" height="56" viewBox="0 0 100 100" fill="none" className="text-inverse-accent">
                      {/* Sentivra S Mark - stylized letterform */}
                      <path 
                        d="M 50 15 
                           C 65 15, 75 25, 75 40
                           C 75 50, 70 55, 60 57
                           C 70 59, 75 64, 75 74
                           C 75 89, 65 99, 50 99
                           C 35 99, 25 89, 25 74
                           L 35 74
                           C 35 83, 41 89, 50 89
                           C 59 89, 65 83, 65 74
                           C 65 67, 61 63, 50 63
                           L 50 53
                           C 61 53, 65 49, 65 42
                           C 65 33, 59 25, 50 25
                           C 41 25, 35 31, 35 40
                           L 25 40
                           C 25 25, 35 15, 50 15 Z"
                        fill="currentColor"
                        opacity="0.9"
                      />
                      {/* Glow effect */}
                      <path 
                        d="M 50 15 
                           C 65 15, 75 25, 75 40
                           C 75 50, 70 55, 60 57
                           C 70 59, 75 64, 75 74
                           C 75 89, 65 99, 50 99
                           C 35 99, 25 89, 25 74
                           L 35 74
                           C 35 83, 41 89, 50 89
                           C 59 89, 65 83, 65 74
                           C 65 67, 61 63, 50 63
                           L 50 53
                           C 61 53, 65 49, 65 42
                           C 65 33, 59 25, 50 25
                           C 41 25, 35 31, 35 40
                           L 25 40
                           C 25 25, 35 15, 50 15 Z"
                        stroke="currentColor"
                        strokeWidth="1"
                        fill="none"
                        opacity="0.3"
                        filter="blur(2px)"
                      />
                    </svg>
                  </div>
                </div>

                {/* Orbit lines - stronger visibility */}
                <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 400">
                  <circle 
                    cx="200" 
                    cy="200" 
                    r="130" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    className="text-inverse-fg-subtle" 
                    strokeDasharray="6 6" 
                  />
                  <circle 
                    cx="200" 
                    cy="200" 
                    r="190" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    className="text-inverse-fg-subtle" 
                    strokeDasharray="6 6" 
                  />
                  {/* Connection dots at cardinal points */}
                  <circle cx="200" cy="10" r="2" fill="currentColor" className="text-inverse-accent" opacity="0.5" />
                  <circle cx="390" cy="200" r="2" fill="currentColor" className="text-inverse-accent" opacity="0.5" />
                  <circle cx="200" cy="390" r="2" fill="currentColor" className="text-inverse-accent" opacity="0.5" />
                  <circle cx="10" cy="200" r="2" fill="currentColor" className="text-inverse-accent" opacity="0.5" />
                </svg>

                {/* Floating service chips with improved spacing */}
                {constellationItems.slice(0, 6).map((item, index) => {
                  const totalItems = Math.min(constellationItems.length, 6);
                  // Distribute evenly around circle, starting from top
                  const angle = (index / totalItems) * Math.PI * 2 - Math.PI / 2;
                  // Alternate between inner and outer radius for visual balance
                  const radius = index % 2 === 0 ? 150 : 210;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  const parallaxX = useTransform(smoothMouseX, (val) => val * (index % 2 === 0 ? 0.5 : -0.3));
                  const parallaxY = useTransform(smoothMouseY, (val) => val * (index % 2 === 0 ? 0.3 : -0.5));

                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.id || index}
                      className="absolute"
                      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                      animate={{ opacity: 1, scale: 1, x, y }}
                      transition={{
                        duration: 0.8,
                        delay: 0.4 + index * 0.1,
                        type: 'spring',
                        stiffness: 100,
                      }}
                      style={{
                        x: reduceMotion ? x : parallaxX,
                        y: reduceMotion ? y : parallaxY,
                        left: '50%',
                        top: '50%',
                      }}
                    >
                      <motion.div
                        animate={reduceMotion ? {} : { y: [0, -10, 0] }}
                        transition={{
                          duration: 3 + index * 0.3,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="px-4 py-3 rounded-xl bg-inverse-fg/10 backdrop-blur-md border border-inverse-border-subtle shadow-lg hover:shadow-xl hover:bg-inverse-fg/15 transition-all cursor-default hover:scale-105"
                      >
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className="h-5 w-5 text-inverse-accent flex-shrink-0" />}
                          <span className="text-sm font-semibold text-inverse-fg whitespace-nowrap">
                            {item.name}
                          </span>
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Mobile: Horizontal scrollable chips */}
            {isMobile && constellationItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="overflow-x-auto scrollbar-hide -mx-4 px-4"
              >
                <div className={`flex gap-3 pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {constellationItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id || index}
                        className="flex-shrink-0 px-4 py-3 rounded-xl bg-inverse-fg/10 backdrop-blur-md border border-inverse-border-subtle shadow-lg"
                      >
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className="h-5 w-5 text-inverse-accent flex-shrink-0" />}
                          <span className="text-sm font-semibold text-inverse-fg whitespace-nowrap">
                            {item.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Structured data for breadcrumb */}
      {breadcrumbs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              'itemListElement': breadcrumbs.map((crumb, index) => ({
                '@type': 'ListItem',
                'position': index + 1,
                'name': crumb.label,
                ...(crumb.href && { 'item': `${window.location.origin}${crumb.href}` }),
              })),
            }),
          }}
        />
      )}
    </InverseSurface>
  );
};

export default PremiumHero;
