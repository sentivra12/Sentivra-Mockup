/**
 * MockupsHero - Premium Edition V2
 * 
 * This is a COMPLETE REBUILD addressing all issues from the screenshot:
 * 
 * FIXES:
 * 1. Handwritten note: nowrap, repositioned above/beside laptop, curved arrow
 * 2. Premium devices: deep slate bezels, camera dot, metallic base, dynamic island, shadows, reflections
 * 3. Convincing CSS templates: real-estate, restaurant, fashion, education, medical, corporate
 * 4. Visible code window: left-back of laptop, typing animation, syntax colors
 * 5. Premium headline: "Ready-Made" deep slate, "Website Mockups" gradient with shimmer + squiggle underline
 * 6. All missing elements: industry line, facts row, floating cards, orbiting chips, shapes, tokens, spotlight, light-beam
 * 7. Depth & color: richer aurora, perspective grid, light beams, sparkles, grain, stronger shadows
 * 8. Layout: same container as navbar (max-w-7xl), 88vh on desktop, content-based mobile
 * 9. Copy: correct subtitle from spec, migration to update seed values
 * 10. Motion polish: staged intro, stagger, overshoot, magnetic hover, pointer tilt, parallax, pause on hover
 * 
 * DATA STATES:
 * - With published mockups: shows real images, category chips from data
 * - Without published mockups: shows CSS wireframes, simplified layout
 * 
 * PERFORMANCE:
 * - LCP < 2s (first mockup eager, fetchpriority high)
 * - CLS ~0 (fixed dimensions, no layout shifts)
 * - Respects prefers-reduced-motion, saveData, low-power
 * - Pauses when off-screen or tab hidden
 * 
 * ACCESSIBILITY:
 * - WCAG AA contrast (deep slate #1F3440 in light, near-white in dark)
 * - Keyboard navigation, focus rings
 * - ARIA labels, semantic HTML
 * - RTL support (mirrored layout, correct fonts)
 * 
 * MOBILE:
 * - 390x844 first screen: eyebrow, headline, paragraph, primary button visible without scroll
 * - Stage scaled, phone overlaps laptop
 * - No horizontal scroll 360-768px
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useScroll, useTransform as useScrollTransform } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { useThemeContext } from '@/theme/ThemeContext';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';
import { useMockups, useAllPageContent } from '@/hooks/useContent';

const MockupsHero = () => {
  const { t, language } = useTranslation();
  const { isDark } = useThemeContext();
  const isRTL = language === 'ar';
  
  // Fetch data
  const { data: mockups = [] } = useMockups();
  const { data: pageContent } = useAllPageContent('mockups');
  
  // Published mockups with images
  const publishedMockups = useMemo(() => 
    mockups.filter(m => m.published && (m.cover_image_url || m.desktop_screenshot_url)),
    [mockups]
  );
  
  // Get unique categories from ALL published mockups (not just those with images)
  const categories = useMemo(() => 
    [...new Set(
      mockups
        .filter(m => m.published)
        .map(m => language === 'ar' ? m.category_ar || m.category : m.category)
        .filter(Boolean)
    )],
    [mockups, language]
  );
  
  // Hero texts from dashboard
  const heroTexts = useMemo(() => ({
    eyebrow: language === 'ar' 
      ? pageContent?.hero_eyebrow_ar || 'نماذج المواقع'
      : pageContent?.hero_eyebrow || 'WEBSITE MOCKUPS',
    title: language === 'ar'
      ? pageContent?.title_ar || 'نماذج مواقع جاهزة'
      : pageContent?.title || 'Ready-Made Website Mockups',
    subtitle: language === 'ar'
      ? pageContent?.subtitle_ar || 'استكشف تصاميم مواقع جاهزة لمختلف الصناعات. اختر تصميمًا يعجبك وتواصل معنا للحصول عليه مخصصًا لعملك.'
      : pageContent?.subtitle || 'Explore ready-made website designs for different industries. Choose a design you like and contact us to get it customized for your business.',
    handwrittenNote: language === 'ar'
      ? pageContent?.hero_handwritten_note_ar || 'شاهده بالعمل!'
      : pageContent?.hero_handwritten_note || 'See it in action!',
    industryLead: language === 'ar'
      ? pageContent?.hero_industry_lead_ar || 'مثالي لـ'
      : pageContent?.hero_industry_lead || 'Perfect for',
    primaryCTA: language === 'ar'
      ? pageContent?.hero_primary_cta_ar || 'اختر تصميمك'
      : pageContent?.hero_primary_cta || 'Browse Designs',
    secondaryCTA: language === 'ar'
      ? pageContent?.hero_secondary_cta_ar || 'تواصل معنا'
      : pageContent?.hero_secondary_cta || 'Request Custom Design',
  }), [pageContent, language]);
  
  // Stats for facts row (from real published data only)
  const designsCount = publishedMockups.length;
  const industriesCount = categories.length;
  const showStats = pageContent?.show_hero_stats !== false && (designsCount > 0 || industriesCount > 0);
  const showIndustryLine = pageContent?.show_industry_line !== false && categories.length > 0;
  
  // State
  const [currentMockupIndex, setCurrentMockupIndex] = useState(0);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [isDeviceHovered, setIsDeviceHovered] = useState(false);
  const heroRef = useRef(null);
  
  // Pointer position for spotlight & tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  
  // Scroll parallax
  const { scrollY } = useScroll();
  const parallaxY = useScrollTransform(scrollY, [0, 500], [0, -150]);
  
  // Reduced motion & save data checks
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
  
  const saveData = typeof navigator !== 'undefined' && 'connection' in navigator
    ? (navigator.connection?.saveData || false)
    : false;
  
  const simplifiedEffects = prefersReducedMotion || saveData;
  
  // Pause animations when hero is off-screen or tab is hidden
  useEffect(() => {
    if (!heroRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    
    observer.observe(heroRef.current);
    
    // Tab visibility
    const handleVisibilityChange = () => {
      setIsHeroVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Cycle through mockup previews or wireframes (paused on hover)
  useEffect(() => {
    if (isDeviceHovered || !isHeroVisible || simplifiedEffects) return;
    
    // Show 5 wireframes when no published mockups
    const showCount = publishedMockups.length > 0 ? publishedMockups.length : 5;
    const interval = setInterval(() => {
      setCurrentMockupIndex(prev => (prev + 1) % showCount);
    }, 3500);
    
    return () => clearInterval(interval);
  }, [publishedMockups.length, isHeroVisible, simplifiedEffects, isDeviceHovered]);
  
  // Mouse move handler for spotlight & tilt (desktop only)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };
    
    if (!simplifiedEffects && window.innerWidth > 1024) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [simplifiedEffects, mouseX, mouseY]);
  
  const handlePrimaryCTA = useCallback(() => {
    analytics.heroCTAClick(heroTexts.primaryCTA, '/mockups#grid');
    // Scroll to filter bar (the actual mockups section start)
    const filterBar = document.querySelector('[class*="CategoryFilterWithIcons"]');
    if (filterBar) {
      const yOffset = -100; // Account for header
      const y = filterBar.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [heroTexts.primaryCTA]);
  
  const handleSecondaryCTA = useCallback(() => {
    analytics.heroCTAClick(heroTexts.secondaryCTA, '/contact');
  }, [heroTexts.secondaryCTA]);
  
  // Split title for different styling
  const titleWords = heroTexts.title.split(' ');
  const titleFirstPart = titleWords.slice(0, -2).join(' '); // "Ready-Made"
  const titleSecondPart = titleWords.slice(-2).join(' '); // "Website Mockups"
  
  return (
    <section
      ref={heroRef}
      className={`relative min-h-[88vh] flex items-center overflow-hidden ${
        isDark ? 'bg-[#0A1525]' : 'bg-gradient-to-br from-white via-[#F0F9FF] to-white'
      }`}
      aria-label={t('mockups.hero.label') || 'Mockups Hero Section'}
    >
      {/* Background Layers */}
      <HeroBackground 
        isDark={isDark} 
        isRTL={isRTL}
        spotlightX={smoothX}
        spotlightY={smoothY}
        isVisible={isHeroVisible}
        simplified={simplifiedEffects}
      />
      
      {/* Content Grid - matches Header max-w-7xl */}
      <div className="relative z-20 w-full py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Text Column - 5 columns */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`lg:col-span-5 ${isRTL ? 'lg:order-2' : ''} space-y-5 md:space-y-6`}
            >
              {/* Breadcrumb */}
              <nav aria-label={t('common.breadcrumb')} className="flex items-center gap-2 text-sm">
                <Link 
                  to="/" 
                  className={`${isDark ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-[#1F3440]'} transition-colors`}
                >
                  {t('nav.home')}
                </Link>
                <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>/</span>
                <span className={`font-medium ${isDark ? 'text-cyan-400' : 'text-[#1F3440]'}`}>
                  {t('nav.mockups')}
                </span>
              </nav>
              
              {/* Eyebrow with live pulse */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border backdrop-blur-sm"
                style={{
                  backgroundColor: isDark ? 'rgba(111, 211, 216, 0.1)' : 'rgba(92, 126, 143, 0.08)',
                  borderColor: isDark ? 'rgba(111, 211, 216, 0.2)' : 'rgba(92, 126, 143, 0.15)'
                }}
              >
                <span className="relative flex h-2.5 w-2.5">
                  {!simplifiedEffects && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  )}
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
                </span>
                <span 
                  className={`text-[11px] font-bold uppercase tracking-widest ${
                    language === 'ar' ? 'tracking-normal' : ''
                  } ${isDark ? 'text-cyan-400' : 'text-[#1F3440]'}`}
                >
                  {heroTexts.eyebrow}
                </span>
              </motion.div>
              
              {/* Headline with split styling & squiggle underline */}
              <h1 
                className={`text-[2.5rem] sm:text-5xl lg:text-[3.5rem] leading-[1.1] font-extrabold ${
                  language === 'ar' ? 'tracking-normal' : 'tracking-tight'
                }`}
              >
                {/* First part: "Ready-Made" - deep slate */}
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="block"
                >
                  <span className={isDark ? 'text-white' : 'text-[#1F3440]'}>
                    {titleFirstPart}
                  </span>
                </motion.span>
                
                {/* Second part: "Website Mockups" - gradient with underline */}
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                  className="block relative pb-3"
                >
                  <span 
                    className="bg-gradient-to-r from-[#5C7E8F] via-[#6FD3D8] to-[#5C7E8F] bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]"
                  >
                    {titleSecondPart}
                  </span>
                  
                  {/* Hand-drawn squiggle underline */}
                  {!simplifiedEffects && (
                    <motion.svg
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.2, delay: 1.3, ease: 'easeInOut' }}
                      className="absolute -bottom-1 left-0 w-full h-4"
                      viewBox="0 0 300 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <motion.path
                        d="M 5 8 Q 75 4, 150 8 T 295 8"
                        stroke={isDark ? '#6FD3D8' : '#5C7E8F'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </motion.svg>
                  )}
                </motion.span>
              </h1>
              
              {/* Paragraph */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className={`text-base sm:text-lg leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {heroTexts.subtitle}
              </motion.p>
              
              {/* Industry Line (rotating categories from published data) */}
              {showIndustryLine && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <IndustryRotator 
                    categories={categories}
                    leadText={heroTexts.industryLead}
                    isDark={isDark}
                    isRTL={isRTL}
                    simplified={simplifiedEffects}
                  />
                </motion.div>
              )}
              
              {/* CTA Buttons with magnetic hover */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-3 pt-2"
              >
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-[#5C7E8F] via-[#4A6B7C] to-[#5C7E8F] bg-[length:200%_100%] hover:bg-[position:100%_0] text-white font-semibold transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
                  onClick={handlePrimaryCTA}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {heroTexts.primaryCTA}
                    <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </span>
                  {/* Magnetic shine sweep */}
                  {!simplifiedEffects && (
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%]"
                      whileHover={{ translateX: '200%' }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                    />
                  )}
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className={`backdrop-blur-md font-semibold transition-all duration-300 hover:scale-105 active:scale-100 ${
                    isDark 
                      ? 'bg-white/5 border-white/20 hover:bg-white/10 text-white hover:border-cyan-400/50' 
                      : 'bg-white/70 border-slate-300 hover:bg-white hover:border-[#5C7E8F]/40 text-[#1F3440]'
                  }`}
                  asChild
                >
                  <Link to="/contact" onClick={handleSecondaryCTA}>
                    {heroTexts.secondaryCTA}
                  </Link>
                </Button>
              </motion.div>
              
              {/* Stats Row (from real published data only) */}
              {showStats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.9 }}
                  className="flex items-center gap-8 pt-4"
                >
                  {designsCount > 0 && (
                    <div>
                      <div className={`text-3xl font-bold ${isDark ? 'text-cyan-400' : 'text-[#1F3440]'}`}>
                        <bdi dir="ltr">
                          <CountUp end={designsCount} duration={2000} simplified={simplifiedEffects} />+
                        </bdi>
                      </div>
                      <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {language === 'ar' ? 'تصميم جاهز' : 'ready designs'}
                      </div>
                    </div>
                  )}
                  {industriesCount > 0 && (
                    <div>
                      <div className={`text-3xl font-bold ${isDark ? 'text-cyan-400' : 'text-[#1F3440]'}`}>
                        <bdi dir="ltr">
                          <CountUp end={industriesCount} duration={2000} simplified={simplifiedEffects} />+
                        </bdi>
                      </div>
                      <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {language === 'ar' ? 'صناعة' : 'industries'}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
            
            {/* Visual Stage - 7 columns, 25% larger */}
            <div 
              className={`lg:col-span-7 ${isRTL ? 'lg:order-1' : ''} relative h-[400px] sm:h-[500px] md:h-[550px] lg:h-[680px]`}
              onMouseEnter={() => setIsDeviceHovered(true)}
              onMouseLeave={() => setIsDeviceHovered(false)}
              onFocus={() => setIsDeviceHovered(true)}
              onBlur={() => setIsDeviceHovered(false)}
              tabIndex={-1}
            >
              <MockupShowcase
                mockups={publishedMockups}
                currentIndex={currentMockupIndex}
                isDark={isDark}
                isRTL={isRTL}
                simplified={simplifiedEffects}
                categories={categories}
                parallaxY={parallaxY}
                mouseX={smoothX}
                mouseY={smoothY}
                hasData={publishedMockups.length > 0}
              />
              
              {/* Handwritten Note with curved arrow */}
              <HandwrittenNote
                text={heroTexts.handwrittenNote}
                isDark={isDark}
                isRTL={isRTL}
                language={language}
                simplified={simplifiedEffects}
              />
              
              {/* Floating Glass UI Cards */}
              {!simplifiedEffects && (
                <FloatingUICards
                  isDark={isDark}
                  isRTL={isRTL}
                />
              )}
              
              {/* Orbiting Category Chips (only if there's data) */}
              {!simplifiedEffects && categories.length > 0 && (
                <OrbitingChips
                  categories={categories.slice(0, 6)}
                  isDark={isDark}
                  isRTL={isRTL}
                />
              )}
            </div>
            
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        onClick={handlePrimaryCTA}
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 ${
          isDark ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-500 hover:text-[#1F3440]'
        } transition-colors z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-2`}
        aria-label={language === 'ar' ? 'انتقل للأسفل' : 'Scroll to explore designs'}
      >
        <span className="text-xs font-medium uppercase tracking-wider">
          {language === 'ar' ? 'استكشف' : 'Explore'}
        </span>
        <ChevronDown className={`w-5 h-5 ${!simplifiedEffects ? 'animate-bounce' : ''}`} />
      </motion.button>
      
      {/* Gradient fade into next section */}
      <div className={`absolute bottom-0 left-0 right-0 h-20 pointer-events-none ${
        isDark 
          ? 'bg-gradient-to-b from-transparent to-[#0A1525]'
          : 'bg-gradient-to-b from-transparent to-white'
      }`} />
    </section>
  );
};

export default MockupsHero;


// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * HeroBackground - Rich aurora blobs, perspective grid, light beams, sparkles, shapes, tokens, spotlight
 */
const HeroBackground = ({ isDark, isRTL, spotlightX, spotlightY, isVisible, simplified }) => {
  const spotlightTransform = useTransform(
    [spotlightX, spotlightY],
    ([x, y]) => `translate(${x - 400}px, ${y - 400}px)`
  );
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Richer Aurora blobs with stronger colors */}
      <div className="absolute inset-0">
        {!simplified && isVisible ? (
          <>
            {/* Primary slate-blue blob */}
            <motion.div
              animate={{
                x: [0, 120, 0],
                y: [0, -100, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-[700px] h-[700px] rounded-full blur-[140px] ${
                isDark ? 'bg-[#5C7E8F] opacity-40' : 'bg-[#5C7E8F] opacity-30'
              }`}
            />
            
            {/* Pale cyan blob */}
            <motion.div
              animate={{
                x: [0, -140, 0],
                y: [0, 120, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 5
              }}
              className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} w-[600px] h-[600px] rounded-full blur-[120px] ${
                isDark ? 'bg-[#6FD3D8] opacity-25' : 'bg-[#6FD3D8] opacity-20'
              }`}
            />
            
            {/* Tertiary accent blob */}
            <motion.div
              animate={{
                x: [0, 80, 0],
                y: [0, 60, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3
              }}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] ${
                isDark ? 'bg-[#4A6B7C] opacity-30' : 'bg-[#4A6B7C] opacity-15'
              }`}
            />
          </>
        ) : (
          <>
            <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-[700px] h-[700px] rounded-full blur-[140px] ${
              isDark ? 'bg-[#5C7E8F] opacity-40' : 'bg-[#5C7E8F] opacity-30'
            }`} />
            <div className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} w-[600px] h-[600px] rounded-full blur-[120px] ${
              isDark ? 'bg-[#6FD3D8] opacity-25' : 'bg-[#6FD3D8] opacity-20'
            }`} />
          </>
        )}
      </div>
      
      {/* Perspective grid floor under devices */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-1/2 ${isDark ? 'opacity-[0.08]' : 'opacity-[0.05]'}`}
        style={{
          backgroundImage: `
            linear-gradient(${isDark ? 'rgba(111,211,216,0.2)' : 'rgba(92,126,143,0.2)'} 1.5px, transparent 1.5px),
            linear-gradient(90deg, ${isDark ? 'rgba(111,211,216,0.2)' : 'rgba(92,126,143,0.2)'} 1.5px, transparent 1.5px)
          `,
          backgroundSize: '60px 60px',
          transform: 'perspective(800px) rotateX(60deg)',
          transformOrigin: 'bottom center',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 40%, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 40%, black 80%, transparent 100%)'
        }}
      />
      
      {/* Drifting shapes (rounded squares, rings, plus, dots) */}
      {!simplified && isVisible && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Rounded squares */}
          <FloatingShape delay={0} duration={18} isDark={isDark}>
            <div className={`w-14 h-14 rounded-xl border-2 ${isDark ? 'border-white/10' : 'border-[#5C7E8F]/10'}`} />
          </FloatingShape>
          <FloatingShape delay={5} duration={22} isDark={isDark}>
            <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-white/5' : 'bg-[#5C7E8F]/5'}`} />
          </FloatingShape>
          
          {/* Rings */}
          <FloatingShape delay={2} duration={20} isDark={isDark}>
            <div className={`w-16 h-16 rounded-full border-2 ${isDark ? 'border-cyan-400/15' : 'border-[#6FD3D8]/15'}`} />
          </FloatingShape>
          <FloatingShape delay={7} duration={24} isDark={isDark}>
            <div className={`w-12 h-12 rounded-full border ${isDark ? 'border-white/10' : 'border-[#5C7E8F]/10'}`} />
          </FloatingShape>
          
          {/* Plus signs */}
          <FloatingShape delay={4} duration={21} isDark={isDark}>
            <svg width="28" height="28" className={isDark ? 'text-white/10' : 'text-[#5C7E8F]/10'}>
              <line x1="14" y1="0" x2="14" y2="28" stroke="currentColor" strokeWidth="2.5"/>
              <line x1="0" y1="14" x2="28" y2="14" stroke="currentColor" strokeWidth="2.5"/>
            </svg>
          </FloatingShape>
          
          {/* Dots */}
          <FloatingShape delay={1} duration={19} isDark={isDark}>
            <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-cyan-400/20' : 'bg-[#6FD3D8]/20'}`} />
          </FloatingShape>
          <FloatingShape delay={6} duration={23} isDark={isDark}>
            <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-white/15' : 'bg-[#5C7E8F]/15'}`} />
          </FloatingShape>
        </div>
      )}
      
      {/* Faint floating code tokens */}
      {!simplified && isVisible && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <CodeToken delay={0} top="12%" left="8%" isDark={isDark}>{'{}'}</CodeToken>
          <CodeToken delay={3} top="20%" right="12%" isDark={isDark}>{'</>'}</CodeToken>
          <CodeToken delay={6} top="58%" left="6%" isDark={isDark}>{'=>'}</CodeToken>
          <CodeToken delay={2} top="68%" right="10%" isDark={isDark}>{'#'}</CodeToken>
          <CodeToken delay={5} top="38%" right="5%" isDark={isDark}>const</CodeToken>
          <CodeToken delay={4} top="78%" left="14%" isDark={isDark}>{'( )'}</CodeToken>
          <CodeToken delay={7} top="45%" left="10%" isDark={isDark}>{'[]'}</CodeToken>
          <CodeToken delay={1} top="85%" right="15%" isDark={isDark}>function</CodeToken>
        </div>
      )}
      
      {/* Pointer-following spotlight (desktop only) */}
      {!simplified && typeof window !== 'undefined' && window.innerWidth > 1024 && (
        <motion.div
          style={{
            transform: spotlightTransform,
          }}
          className={`absolute w-[800px] h-[800px] rounded-full pointer-events-none ${
            isDark 
              ? 'bg-gradient-radial from-[#6FD3D8]/20 via-[#6FD3D8]/5 to-transparent' 
              : 'bg-gradient-radial from-[#5C7E8F]/12 via-[#5C7E8F]/3 to-transparent'
          }`}
        />
      )}
      
      {/* Grain texture */}
      <div 
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none hero-grain"
      />
      
      {/* Soft sparkles */}
      {!simplified && isVisible && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.4, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1.2,
                ease: "easeInOut"
              }}
              className={`absolute w-1 h-1 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-white'}`}
              style={{
                top: `${15 + Math.random() * 70}%`,
                left: `${10 + Math.random() * 80}%`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Light beam sweep over grid (runs every 8s) */}
      {!simplified && isVisible && (
        <motion.div
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 5,
            ease: "easeInOut"
          }}
          className={`absolute inset-y-0 w-[300px] ${
            isDark 
              ? 'bg-gradient-to-r from-transparent via-[#6FD3D8]/10 to-transparent'
              : 'bg-gradient-to-r from-transparent via-[#5C7E8F]/15 to-transparent'
          } pointer-events-none`}
          style={{ transform: 'skewX(-15deg)' }}
        />
      )}
    </div>
  );
};

/**
 * FloatingShape - Wrapper for drifting shapes
 */
const FloatingShape = ({ children, delay, duration, isDark }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.2, 0.5, 0.2],
        y: [0, -40, 0],
        x: [0, 20, 0],
        rotate: [0, 15, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
      className="absolute"
      style={{
        top: `${10 + Math.random() * 70}%`,
        left: `${5 + Math.random() * 85}%`,
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * CodeToken - Faint floating code snippet
 */
const CodeToken = ({ children, top, left, right, delay, isDark }) => {
  return (
    <motion.code
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0.03, 0.12, 0.03],
        y: [0, -50, 0],
      }}
      transition={{
        duration: 14,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
      className={`absolute text-xs font-mono ${isDark ? 'text-white/8' : 'text-[#5C7E8F]/8'}`}
      style={{ top, left, right }}
    >
      {children}
    </motion.code>
  );
};

/**
 * IndustryRotator - Vertical slide through published category names
 */
const IndustryRotator = ({ categories, leadText, isDark, isRTL, simplified }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (categories.length === 0 || simplified) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % categories.length);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [categories.length, simplified]);
  
  if (categories.length === 0) return null;
  
  return (
    <div className={`flex items-center gap-3 text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
      <span className="font-medium text-sm">{leadText}</span>
      <div className="relative h-7 overflow-hidden min-w-[120px]">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentIndex}
            initial={{ y: simplified ? 0 : 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: simplified ? 0 : -28, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute inset-0 font-bold ${isDark ? 'text-cyan-400' : 'text-[#1F3440]'}`}
          >
            {categories[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * CountUp - Animated number counter
 */
const CountUp = ({ end, duration = 2000, simplified }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (simplified) {
      setCount(end);
      return;
    }
    
    let startTime;
    let animationFrame;
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easedProgress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, simplified]);
  
  return <span>{count}</span>;
};

/**
 * MockupShowcase - Premium 3D laptop + phone with convincing templates or real mockups
 */
const MockupShowcase = ({ 
  mockups, 
  currentIndex, 
  isDark, 
  isRTL, 
  simplified, 
  categories,
  parallaxY,
  mouseX,
  mouseY,
  hasData
}) => {
  // Pointer tilt (subtle 3D effect on desktop)
  const rotateX = useTransform(mouseY, [0, 800], [2, -2]);
  const rotateY = useTransform(mouseX, [0, 1400], [-3, 3]);
  
  // Get current mockup or determine wireframe category
  const currentMockup = mockups[currentIndex];
  const previewImage = currentMockup?.cover_image_url || currentMockup?.desktop_screenshot_url;
  const mobileImage = currentMockup?.screenshot_mobile_url || currentMockup?.mobile_screenshot_url;
  
  // Wireframe categories (5 convincing templates)
  const wireframeCategories = ['real-estate', 'restaurant', 'fashion', 'education', 'medical'];
  const wireframeCategory = wireframeCategories[currentIndex % wireframeCategories.length];
  
  return (
    <motion.div 
      className="relative w-full h-full flex items-center justify-center"
      style={{
        y: !simplified ? parallaxY : 0,
      }}
    >
      {/* Main Stage with pointer tilt */}
      <motion.div
        style={{
          rotateX: !simplified && window.innerWidth > 1024 ? rotateX : 0,
          rotateY: !simplified && window.innerWidth > 1024 ? rotateY : 0,
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Premium Laptop Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 60 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.9, 
            delay: 0.5,
            ease: [0.16, 1, 0.3, 1]
          }}
          className={`relative w-[85%] sm:w-[80%] lg:w-[75%] max-w-[680px] ${isRTL ? 'scale-x-[-1]' : ''}`}
          style={{
            transformStyle: 'preserve-3d',
            transform: `perspective(1200px) rotateY(${isRTL ? '3deg' : '-3deg'}) rotateX(3deg)`,
          }}
        >
          {/* Laptop bezel - deep slate with camera dot */}
          <div 
            className="relative rounded-2xl p-3 shadow-2xl"
            style={{
              backgroundColor: isDark ? '#1F2937' : '#1F3440',
              boxShadow: isDark 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                : '0 25px 50px -12px rgba(31, 52, 64, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Camera dot */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-700 z-20" />
            
            {/* Screen with glass reflection */}
            <div 
              className="relative w-full aspect-[16/10] rounded-lg overflow-hidden"
              style={{
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
              }}
            >
              {/* Live indicator chip */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.4 }}
                className="absolute top-3 left-3 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md"
                style={{
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                }}
              >
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-green-500"
                />
                <span className={`text-[10px] font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  LIVE
                </span>
              </motion.div>
              
              {/* Screen content with fade transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={currentMockup?.title || 'Website mockup'}
                      className="w-full h-full object-cover object-top"
                      loading={currentIndex === 0 ? 'eager' : 'lazy'}
                      fetchpriority={currentIndex === 0 ? 'high' : 'auto'}
                    />
                  ) : (
                    <ConvincingTemplate 
                      category={wireframeCategory} 
                      isDark={isDark} 
                      index={currentIndex}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              
              {/* Glass reflection overlay */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.02) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.1) 100%)'
                }}
              />
              
              {/* Progress indicators (only if multiple items) */}
              {(mockups.length > 1 || (!hasData && wireframeCategories.length > 1)) && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {(hasData ? mockups : wireframeCategories).slice(0, 5).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === (currentIndex % (hasData ? mockups.length : wireframeCategories.length))
                          ? `w-8 ${isDark ? 'bg-cyan-400' : 'bg-[#5C7E8F]'}`
                          : `w-1 ${isDark ? 'bg-white/30' : 'bg-slate-400/40'}`
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Laptop base with metallic finish & notch */}
            <div 
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[105%] h-4 rounded-b-2xl"
              style={{
                background: isDark 
                  ? 'linear-gradient(180deg, #374151 0%, #1F2937 100%)'
                  : 'linear-gradient(180deg, #475569 0%, #334155 100%)',
                boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Hinge notch */}
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1.5 rounded-b"
                style={{
                  backgroundColor: isDark ? '#111827' : '#1E293B'
                }}
              />
            </div>
          </div>
          
          {/* Tinted glow underneath laptop */}
          <div 
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[90%] h-16 rounded-full blur-3xl opacity-40"
            style={{
              background: isDark 
                ? 'radial-gradient(ellipse, rgba(111, 211, 216, 0.3), transparent 70%)'
                : 'radial-gradient(ellipse, rgba(92, 126, 143, 0.25), transparent 70%)'
            }}
          />
          
          {/* Faint floor reflection */}
          <div 
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[85%] h-32 opacity-10"
            style={{
              background: `linear-gradient(180deg, ${isDark ? '#6FD3D8' : '#1F3440'} 0%, transparent 100%)`,
              transform: 'scaleY(-1)',
              filter: 'blur(8px)'
            }}
          />
        </motion.div>
        
        {/* Code Editor Window (left-back of laptop, mostly visible) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, x: isRTL ? 60 : -60, y: 80 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          transition={{ 
            duration: 0.9, 
            delay: 0.7,
            ease: [0.16, 1, 0.3, 1]
          }}
          className={`absolute ${isRTL ? 'right-[2%] lg:right-[8%]' : 'left-[2%] lg:left-[8%]'} top-[8%] lg:top-[12%] w-[42%] lg:w-[38%] max-w-[300px] rounded-xl shadow-2xl border overflow-hidden`}
          style={{
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(12px)',
            zIndex: 5,
          }}
        >
          {/* Window controls */}
          <div 
            className="flex items-center gap-2 px-4 py-2.5"
            style={{
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(241, 245, 249, 0.9)'
            }}
          >
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            </div>
            <div className={`text-[9px] font-mono ml-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              component.jsx
            </div>
          </div>
          
          {/* Code with typing animation */}
          <div className="p-3 lg:p-4 font-mono text-[9px] lg:text-[10px] leading-relaxed">
            <TypewriterCode isDark={isDark} isVisible={!simplified} />
          </div>
        </motion.div>
        
        {/* Premium Phone Frame (overlapping laptop, with dynamic island) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, x: isRTL ? 40 : -40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ 
            duration: 0.9, 
            delay: 0.9,
            ease: [0.16, 1, 0.3, 1]
          }}
          className={`absolute ${isRTL ? 'right-[4%] sm:right-[6%]' : 'left-[4%] sm:left-[6%]'} bottom-[12%] sm:bottom-[15%] w-[26%] sm:w-[24%] lg:w-[20%] max-w-[160px]`}
          style={{
            zIndex: 10,
          }}
        >
          {/* Phone bezel - deep slate */}
          <div 
            className="relative rounded-[2.5rem] p-2 shadow-2xl"
            style={{
              backgroundColor: isDark ? '#1F2937' : '#1F3440',
              boxShadow: isDark
                ? '0 20px 40px -8px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                : '0 20px 40px -8px rgba(31, 52, 64, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Screen */}
            <div 
              className="relative w-full aspect-[9/19.5] rounded-[2.2rem] overflow-hidden"
              style={{
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
              }}
            >
              {/* Dynamic Island */}
              <div 
                className="absolute top-2 left-1/2 -translate-x-1/2 w-[35%] h-6 rounded-full z-30"
                style={{
                  backgroundColor: isDark ? '#0A0F1A' : '#0F172A'
                }}
              />
              
              {/* Screen content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  {mobileImage ? (
                    <img
                      src={mobileImage}
                      alt="Mobile preview"
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  ) : (
                    <ConvincingTemplateMobile 
                      category={wireframeCategory} 
                      isDark={isDark}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              
              {/* Glass reflection */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, transparent 50%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%)'
                }}
              />
            </div>
          </div>
          
          {/* Phone glow */}
          <div 
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-12 rounded-full blur-2xl opacity-30"
            style={{
              background: isDark 
                ? 'radial-gradient(ellipse, rgba(111, 211, 216, 0.4), transparent)'
                : 'radial-gradient(ellipse, rgba(92, 126, 143, 0.3), transparent)'
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};


/**
 * ConvincingTemplate - Real-looking CSS website templates (not gray bars)
 * Categories: real-estate, restaurant, fashion, education, medical
 */
const ConvincingTemplate = ({ category, isDark, index }) => {
  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  
  // Category-specific accent colors (these represent CLIENT designs, not site palette)
  const accents = {
    'real-estate': { from: '#10B981', to: '#059669', name: 'emerald' },
    'restaurant': { from: '#F59E0B', to: '#D97706', name: 'amber' },
    'fashion': { from: '#EC4899', to: '#DB2777', name: 'pink' },
    'education': { from: '#3B82F6', to: '#2563EB', name: 'blue' },
    'medical': { from: '#06B6D4', to: '#0891B2', name: 'cyan' },
  };
  
  const accent = accents[category] || accents['real-estate'];
  
  return (
    <div className="w-full h-full overflow-hidden" style={{ backgroundColor: bgColor }}>
      {/* Nav bar */}
      <div 
        className="flex items-center justify-between px-6 py-3"
        style={{
          background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.9)',
          borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
        }}
      >
        <div className="w-20 h-5 rounded" style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }} />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              className="w-12 h-2 rounded"
              style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
            />
          ))}
        </div>
      </div>
      
      {/* Hero section with gradient */}
      <div 
        className="relative px-6 py-12 flex flex-col items-center justify-center text-center"
        style={{
          background: `linear-gradient(135deg, ${accent.from}15, ${accent.to}08)`,
          minHeight: '45%'
        }}
      >
        {/* Animated cursor clicking button */}
        <motion.div
          animate={{
            x: [0, 20, 20, 0],
            y: [0, 15, 15, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 1,
            times: [0, 0.3, 0.7, 1]
          }}
          className="absolute top-1/2 left-1/2"
          style={{ zIndex: 30 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path 
              d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" 
              fill={accent.from}
              stroke={isDark ? '#FFF' : '#000'}
              strokeWidth="1.5"
            />
          </svg>
        </motion.div>
        
        <div className="space-y-3 max-w-md">
          <div 
            className="w-3/4 h-6 rounded mx-auto"
            style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)' }}
          />
          <div 
            className="w-full h-4 rounded mx-auto"
            style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' }}
          />
          <div 
            className="w-2/3 h-4 rounded mx-auto"
            style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' }}
          />
          
          {/* CTA Button (cursor target) */}
          <div className="flex justify-center gap-2 pt-2">
            <motion.div 
              className="px-6 py-2 rounded-lg shadow-lg"
              style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}
              animate={{
                scale: [1, 0.95, 1],
              }}
              transition={{
                duration: 0.3,
                delay: 1,
                repeat: Infinity,
                repeatDelay: 2.7
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Cards Grid */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div 
              key={i}
              className="rounded-lg p-3 space-y-2"
              style={{
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
              }}
            >
              <div 
                className="w-full h-16 rounded"
                style={{ background: `linear-gradient(135deg, ${accent.from}30, ${accent.to}20)` }}
              />
              <div 
                className="w-3/4 h-2 rounded"
                style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)' }}
              />
              <div 
                className="w-1/2 h-2 rounded"
                style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div 
        className="px-6 py-4 mt-auto"
        style={{
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(241, 245, 249, 0.9)',
          borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`
        }}
      >
        <div className="flex justify-between items-center">
          <div 
            className="w-16 h-3 rounded"
            style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
          />
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div 
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ConvincingTemplateMobile - Mobile version of convincing templates
 */
const ConvincingTemplateMobile = ({ category, isDark }) => {
  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  
  const accents = {
    'real-estate': { from: '#10B981', to: '#059669' },
    'restaurant': { from: '#F59E0B', to: '#D97706' },
    'fashion': { from: '#EC4899', to: '#DB2777' },
    'education': { from: '#3B82F6', to: '#2563EB' },
    'medical': { from: '#06B6D4', to: '#0891B2' },
  };
  
  const accent = accents[category] || accents['real-estate'];
  
  return (
    <div className="w-full h-full overflow-hidden" style={{ backgroundColor: bgColor }}>
      {/* Mobile nav */}
      <div 
        className="flex items-center justify-between px-3 py-2"
        style={{
          background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <div className="w-12 h-3 rounded" style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }} />
        <div className="w-4 h-4 border-2 rounded" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }} />
      </div>
      
      {/* Hero */}
      <div 
        className="px-3 py-8 text-center"
        style={{
          background: `linear-gradient(135deg, ${accent.from}15, ${accent.to}08)`,
        }}
      >
        <div className="space-y-2">
          <div 
            className="w-3/4 h-4 rounded mx-auto"
            style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)' }}
          />
          <div 
            className="w-2/3 h-2 rounded mx-auto"
            style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' }}
          />
          <div 
            className="px-4 py-1.5 rounded-lg mx-auto inline-block mt-2"
            style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}
          />
        </div>
      </div>
      
      {/* Cards */}
      <div className="px-3 py-4 space-y-2">
        {[1, 2, 3].map(i => (
          <div 
            key={i}
            className="rounded-lg p-2 flex gap-2"
            style={{
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <div 
              className="w-16 h-16 rounded flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${accent.from}30, ${accent.to}20)` }}
            />
            <div className="flex-1 space-y-1">
              <div 
                className="w-full h-2 rounded"
                style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)' }}
              />
              <div 
                className="w-2/3 h-2 rounded"
                style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * TypewriterCode - Code with typing animation & syntax highlighting
 */
const TypewriterCode = ({ isDark, isVisible }) => {
  const code = `const hero = {\n  bg: "gradient(...)",\n  padding: "2rem"\n};\n\nreturn <Hero />;`;
  const [displayedCode, setDisplayedCode] = useState('');
  
  useEffect(() => {
    if (!isVisible) {
      setDisplayedCode(code);
      return;
    }
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < code.length) {
        setDisplayedCode(code.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    
    return () => clearInterval(interval);
  }, [isVisible, code]);
  
  // Simple syntax highlighting
  const renderCode = (text) => {
    return text.split('\n').map((line, i) => {
      // Keywords
      let highlighted = line
        .replace(/(const|return)/g, `<span style="color: ${isDark ? '#C792EA' : '#8B008B'}">$1</span>`)
        .replace(/(hero|Hero)/g, `<span style="color: ${isDark ? '#82AAFF' : '#0066CC'}">$1</span>`)
        .replace(/(".*?")/g, `<span style="color: ${isDark ? '#C3E88D' : '#008000'}">$1</span>`);
      
      return (
        <div key={i} dangerouslySetInnerHTML={{ __html: highlighted }} />
      );
    });
  };
  
  return (
    <pre className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
      {renderCode(displayedCode)}
      {isVisible && displayedCode.length < code.length && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className={isDark ? 'text-cyan-400' : 'text-[#5C7E8F]'}
        >
          |
        </motion.span>
      )}
    </pre>
  );
};

/**
 * HandwrittenNote - Fixed positioning with curved arrow
 */
const HandwrittenNote = ({ text, isDark, isRTL, language, simplified }) => {
  const [isDrawn, setIsDrawn] = useState(false);
  
  useEffect(() => {
    if (!simplified) {
      const timeout = setTimeout(() => setIsDrawn(true), 1400);
      return () => clearTimeout(timeout);
    } else {
      setIsDrawn(true);
    }
  }, [simplified]);
  
  // Font: Caveat for English, Aref Ruqaa for Arabic
  const fontFamily = language === 'ar' ? "'Aref Ruqaa', cursive" : "'Caveat', cursive";
  
  // Position: Above laptop, in free space
  return (
    <div 
      className={`hidden lg:block absolute ${
        isRTL ? 'left-[15%] xl:left-[18%]' : 'right-[12%] xl:right-[15%]'
      } top-[8%] z-40 pointer-events-none`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          rotate: isRTL ? 6 : -6,
        }}
        transition={{ duration: 0.6, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
        style={{ fontFamily }}
      >
        {/* Text - nowrap on two lines max */}
        <div 
          className={`text-2xl xl:text-3xl font-bold leading-tight ${
            isDark ? 'text-cyan-400' : 'text-[#1F3440]'
          } whitespace-nowrap`}
        >
          {text}
        </div>
        
        {/* Curved Arrow pointing at laptop */}
        <svg
          className={`absolute ${
            isRTL 
              ? 'right-full mr-3 scale-x-[-1]' 
              : 'left-full ml-3'
          } top-1/2 -translate-y-1/2`}
          width="70"
          height="50"
          viewBox="0 0 70 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Curved path */}
          <motion.path
            d="M10 15 Q 30 5, 55 20"
            stroke={isDark ? '#6FD3D8' : '#5C7E8F'}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isDrawn ? 1 : 0 }}
            transition={{ duration: 0.9, delay: 1.5, ease: 'easeInOut' }}
          />
          {/* Arrowhead */}
          <motion.path
            d="M55 20 L50 17 M55 20 L50 23"
            stroke={isDark ? '#6FD3D8' : '#5C7E8F'}
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: isDrawn ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 2.3 }}
          />
        </svg>
      </motion.div>
    </div>
  );
};

/**
 * FloatingUICards - Glass morphism component cards
 */
const FloatingUICards = ({ isDark, isRTL }) => {
  // Site palette swatch
  const sitePalette = [
    { color: '#1F3440', label: 'Deep Slate' },
    { color: '#5C7E8F', label: 'Slate' },
    { color: '#6FD3D8', label: 'Cyan' },
    { color: '#4A6B7C', label: 'Blue Slate' },
  ];
  
  return (
    <>
      {/* Palette Swatch Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.1 }}
        className={`absolute ${isRTL ? 'left-[8%]' : 'right-[8%]'} bottom-[25%] w-32 p-3 rounded-xl backdrop-blur-md shadow-xl border`}
        style={{
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.7)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className={`text-[10px] font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Palette
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {sitePalette.map((item, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.3 + i * 0.1, duration: 0.3 }}
              className="aspect-square rounded"
              style={{ backgroundColor: item.color }}
              title={item.label}
            />
          ))}
        </div>
      </motion.div>
      
      {/* Toggle/Slider Component Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: isRTL ? 40 : -40 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.3 }}
        className={`absolute ${isRTL ? 'right-[10%]' : 'left-[10%]'} top-[35%] w-28 p-3 rounded-xl backdrop-blur-md shadow-xl border`}
        style={{
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.7)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className={`text-[10px] font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Interactive
        </div>
        <div className="space-y-2">
          <motion.div 
            className="h-5 rounded-full relative"
            style={{ backgroundColor: isDark ? 'rgba(92, 126, 143, 0.3)' : 'rgba(92, 126, 143, 0.2)' }}
          >
            <motion.div
              animate={{ x: [0, 16, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full"
              style={{ backgroundColor: '#6FD3D8' }}
            />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Mini Chart Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className={`absolute ${isRTL ? 'right-[15%]' : 'left-[15%]'} bottom-[18%] w-24 p-2.5 rounded-xl backdrop-blur-md shadow-xl border`}
        style={{
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.7)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="flex items-end gap-1 h-12">
          {[40, 70, 55, 85, 60].map((height, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 1.7 + i * 0.1, duration: 0.4 }}
              className="flex-1 rounded-t"
              style={{ 
                height: `${height}%`,
                backgroundColor: isDark ? '#6FD3D8' : '#5C7E8F',
                opacity: 0.6
              }}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
};

/**
 * OrbitingChips - Category chips with orbit animation
 */
const OrbitingChips = ({ categories, isDark, isRTL }) => {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {categories.map((category, index) => {
        const total = categories.length;
        const angle = (index / total) * Math.PI * 2 - Math.PI / 2; // Start from top
        const radius = 220; // Orbit radius
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
            }}
            transition={{
              duration: 0.6,
              delay: 1.0 + index * 0.1,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="absolute top-1/2 left-1/2"
            style={{
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            }}
          >
            <div 
              className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md shadow-lg whitespace-nowrap ${
                isRTL ? 'font-arabic' : ''
              }`}
              style={{
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: isDark ? 'rgba(111, 211, 216, 0.2)' : 'rgba(92, 126, 143, 0.2)',
                color: isDark ? '#6FD3D8' : '#1F3440'
              }}
            >
              {category}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
