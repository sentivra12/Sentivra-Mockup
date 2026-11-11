/**
 * MockupsHero Component - Premium Edition
 * A premium, ad-campaign-ready hero with:
 * - Premium 3D device frames with reflections and shadows
 * - Convincing CSS mini-templates when no mockup images
 * - Handwritten note with animated arrow
 * - Rotating industry categories from published data
 * - Floating glass UI cards, chips, shapes
 * - Light beam sweeps, spotlight, parallax
 * - Staged intro, magnetic hover, pointer tilt
 * - Theme-aware (light/dark), RTL-ready, fully accessible
 * - Performance-optimized (LCP < 2s, CLS ~0, respects reduced-motion)
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
  
  // Get unique categories from published mockups
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
  
  // Stats for facts row
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
  
  // Cycle through mockup previews (paused on hover)
  useEffect(() => {
    if (isDeviceHovered || !isHeroVisible || simplifiedEffects) return;
    
    const showCount = Math.max(publishedMockups.length || 5, 1);
    const interval = setInterval(() => {
      setCurrentMockupIndex(prev => (prev + 1) % showCount);
    }, 3500);
    
    return () => clearInterval(interval);
  }, [publishedMockups.length, isHeroVisible, simplifiedEffects, isDeviceHovered]);
  
  // Mouse move handler for spotlight & tilt
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
    const grid = document.getElementById('mockups-grid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [heroTexts.primaryCTA]);
  
  const handleSecondaryCTA = useCallback(() => {
    analytics.heroCTAClick(heroTexts.secondaryCTA, '/contact');
  }, [heroTexts.secondaryCTA]);
  
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
              
              {/* Headline with gradient shimmer & underline */}
              <h1 
                className={`text-[2.5rem] sm:text-5xl lg:text-[3.5rem] leading-[1.1] font-extrabold ${
                  language === 'ar' ? 'tracking-normal' : 'tracking-tight'
                }`}
              >
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="block"
                >
                  <span className={isDark ? 'text-white' : 'text-[#1F3440]'}>
                    {heroTexts.title.split(' ').slice(0, -2).join(' ')}
                  </span>
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                  className="block relative"
                >
                  <span 
                    className="bg-gradient-to-r from-[#5C7E8F] via-[#6FD3D8] to-[#5C7E8F] bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]"
                  >
                    {heroTexts.title.split(' ').slice(-2).join(' ')}
                  </span>
                  {/* Squiggle underline */}
                  {!simplifiedEffects && (
                    <motion.svg
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: 1.2, ease: 'easeInOut' }}
                      className="absolute -bottom-2 left-0 w-full h-3"
                      viewBox="0 0 200 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <motion.path
                        d="M 0 5 Q 50 2, 100 5 T 200 5"
                        stroke={isDark ? '#6FD3D8' : '#5C7E8F'}
                        strokeWidth="2"
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
              
              {/* CTA Buttons */}
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
              className={`lg:col-span-7 ${isRTL ? 'lg:order-1' : ''} relative h-[450px] sm:h-[550px] lg:h-[680px]`}
              onMouseEnter={() => setIsDeviceHovered(true)}
              onMouseLeave={() => setIsDeviceHovered(false)}
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
              />
              
              {/* Handwritten Note with curved arrow */}
              {heroTexts.handwrittenNote && (
                <HandwrittenNote
                  text={heroTexts.handwrittenNote}
                  isDark={isDark}
                  isRTL={isRTL}
                  language={language}
                  simplified={simplifiedEffects}
                />
              )}
              
              {/* Floating Glass UI Cards */}
              {!simplifiedEffects && (
                <FloatingUICards
                  isDark={isDark}
                  isRTL={isRTL}
                  pageContent={pageContent}
                />
              )}
              
              {/* Orbiting Category Chips */}
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

// Sub-components will be added in next parts...
// (HeroBackground, IndustryRotator, MockupShowcase, HandwrittenNote, CountUp)

export default MockupsHero;


// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * HeroBackground - Animated background layers
 */
const HeroBackground = ({ isDark, isRTL, spotlightX, spotlightY, prefersReducedMotion, isVisible }) => {
  const spotlightTransform = useTransform(
    [spotlightX, spotlightY],
    ([x, y]) => `translate(${x - 300}px, ${y - 300}px)`
  );
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Aurora blobs */}
      <div className="absolute inset-0">
        {!prefersReducedMotion && isVisible ? (
          <>
            <motion.div
              animate={{
                x: [0, 100, 0],
                y: [0, -80, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 ${
                isDark ? 'bg-primary' : 'bg-primary/40'
              }`}
            />
            <motion.div
              animate={{
                x: [0, -120, 0],
                y: [0, 100, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 5
              }}
              className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 ${
                isDark ? 'bg-cyan-400' : 'bg-cyan-300/50'
              }`}
            />
          </>
        ) : (
          <>
            <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 ${
              isDark ? 'bg-primary' : 'bg-primary/40'
            }`} />
            <div className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 ${
              isDark ? 'bg-cyan-400' : 'bg-cyan-300/50'
            }`} />
          </>
        )}
      </div>
      
      {/* Grid with radial mask */}
      <div 
        className={`absolute inset-0 opacity-[0.03] ${isDark ? 'opacity-[0.05]' : ''}`}
        style={{
          backgroundImage: `
            linear-gradient(${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(92,126,143,0.15)'} 1px, transparent 1px),
            linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(92,126,143,0.15)'} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)'
        }}
      />
      
      {/* Floating shapes */}
      {!prefersReducedMotion && isVisible && (
        <div className="absolute inset-0 overflow-hidden">
          <FloatingShape delay={0} duration={15} isDark={isDark}>
            <div className={`w-12 h-12 rounded-lg border-2 ${isDark ? 'border-white/10' : 'border-primary/10'}`} />
          </FloatingShape>
          <FloatingShape delay={2} duration={18} isDark={isDark}>
            <div className={`w-16 h-16 rounded-full border-2 ${isDark ? 'border-white/10' : 'border-primary/10'}`} />
          </FloatingShape>
          <FloatingShape delay={4} duration={20} isDark={isDark}>
            <svg width="32" height="32" className={isDark ? 'text-white/10' : 'text-primary/10'}>
              <line x1="16" y1="0" x2="16" y2="32" stroke="currentColor" strokeWidth="2"/>
              <line x1="0" y1="16" x2="32" y2="16" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </FloatingShape>
          <FloatingShape delay={1} duration={22} isDark={isDark}>
            <div className={`w-8 h-8 rounded ${isDark ? 'bg-white/5' : 'bg-primary/5'}`} />
          </FloatingShape>
        </div>
      )}
      
      {/* Code tokens */}
      {!prefersReducedMotion && isVisible && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <CodeToken delay={0} top="15%" left="10%" isDark={isDark}>{'{}'}</CodeToken>
          <CodeToken delay={3} top="25%" right="15%" isDark={isDark}>{'</>'}</CodeToken>
          <CodeToken delay={6} top="60%" left="8%" isDark={isDark}>{'=>'}</CodeToken>
          <CodeToken delay={2} top="70%" right="12%" isDark={isDark}>{'#'}</CodeToken>
          <CodeToken delay={5} top="40%" right="5%" isDark={isDark}>className</CodeToken>
          <CodeToken delay={4} top="80%" left="15%" isDark={isDark}>{'( )'}</CodeToken>
        </div>
      )}
      
      {/* Spotlight (desktop only) */}
      {!prefersReducedMotion && typeof window !== 'undefined' && window.innerWidth > 1024 && (
        <motion.div
          style={{
            transform: spotlightTransform,
          }}
          className={`absolute w-[600px] h-[600px] rounded-full pointer-events-none ${
            isDark 
              ? 'bg-gradient-radial from-primary/20 via-primary/5 to-transparent' 
              : 'bg-gradient-radial from-primary/10 via-primary/3 to-transparent'
          }`}
        />
      )}
      
      {/* Grain texture */}
      <div 
        className={`absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Light beam sweep (runs every 8s) */}
      {!prefersReducedMotion && isVisible && (
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
          className={`absolute inset-y-0 w-[200px] ${
            isDark 
              ? 'bg-gradient-to-r from-transparent via-white/5 to-transparent'
              : 'bg-gradient-to-r from-transparent via-primary/10 to-transparent'
          } pointer-events-none`}
          style={{ transform: 'skewX(-20deg)' }}
        />
      )}
    </div>
  );
};

/**
 * FloatingShape - Wrapper for animated floating elements
 */
const FloatingShape = ({ children, delay, duration, isDark }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.3, 0.6, 0.3],
        y: [0, -30, 0],
        x: [0, 15, 0],
        rotate: [0, 10, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
      className="absolute"
      style={{
        top: `${Math.random() * 80}%`,
        left: `${Math.random() * 80}%`,
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * CodeToken - Floating code snippet
 */
const CodeToken = ({ children, top, left, right, delay, isDark }) => {
  return (
    <motion.code
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0.05, 0.15, 0.05],
        y: [0, -40, 0],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
      className={`absolute text-sm font-mono ${isDark ? 'text-white/10' : 'text-primary/10'}`}
      style={{ top, left, right }}
    >
      {children}
    </motion.code>
  );
};

/**
 * IndustryRotator - Typewriter rotating categories
 */
const IndustryRotator = ({ categories, leadText, isDark, isRTL, prefersReducedMotion }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (categories.length === 0 || prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % categories.length);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [categories.length, prefersReducedMotion]);
  
  return (
    <div className={`flex items-center gap-2 text-base ${isDark ? 'text-frost' : 'text-text-muted'}`}>
      <span className="font-medium">{leadText}</span>
      <div className="relative h-7 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentIndex}
            initial={{ y: prefersReducedMotion ? 0 : 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: prefersReducedMotion ? 0 : -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 font-bold ${isDark ? 'text-primary' : 'text-primary-strong'}`}
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
const CountUp = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime;
    let animationFrame;
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return <span>{count}</span>;
};

/**
 * MockupShowcase - Laptop with cycling mockup previews + floating devices
 */
const MockupShowcase = ({ mockups, currentIndex, isDark, isRTL, prefersReducedMotion, categories }) => {
  // Get current mockup or use wireframe fallback
  const currentMockup = mockups[currentIndex % mockups.length];
  const previewImage = currentMockup?.preview_image_url || currentMockup?.screenshot_desktop_url;
  
  // If no mockups, show wireframe designs for first 3 categories
  const showWireframe = !previewImage;
  const wireframeCategory = categories[currentIndex % Math.min(categories.length, 3)];
  
  return (
    <div className="relative w-full h-full">
      {/* Main laptop frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className={`absolute inset-0 flex items-center justify-center ${isRTL ? 'scale-x-[-1]' : ''}`}
        style={{
          transform: `perspective(1000px) rotateY(${isRTL ? '5deg' : '-5deg'}) rotateX(5deg)`,
        }}
      >
        {/* Laptop body */}
        <div className={`relative w-[90%] max-w-[600px] aspect-[16/10] rounded-2xl ${
          isDark ? 'bg-gray-800' : 'bg-gray-200'
        } p-2 shadow-2xl`}>
          {/* Screen */}
          <div className={`relative w-full h-full rounded-lg overflow-hidden ${
            isDark ? 'bg-gray-900' : 'bg-white'
          }`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: prefersReducedMotion ? 0 : -50 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={currentMockup?.title || 'Website mockup'}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                ) : (
                  <WireframeWebsite category={wireframeCategory} isDark={isDark} />
                )}
              </motion.div>
            </AnimatePresence>
            
            {/* Progress indicator */}
            {mockups.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {mockups.slice(0, Math.min(mockups.length, 5)).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === (currentIndex % mockups.length)
                        ? `w-8 ${isDark ? 'bg-primary' : 'bg-primary-strong'}`
                        : `w-1 ${isDark ? 'bg-white/30' : 'bg-gray-300'}`
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Laptop base */}
          <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-[110%] h-3 rounded-b-xl ${
            isDark ? 'bg-gray-700' : 'bg-gray-300'
          }`} />
        </div>
      </motion.div>
      
      {/* Code editor window (behind laptop) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 60 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-[10%] w-[45%] max-w-[280px] ${
          isDark ? 'bg-gray-900/90' : 'bg-white/90'
        } backdrop-blur-sm rounded-lg shadow-xl border ${
          isDark ? 'border-white/10' : 'border-gray-200'
        } overflow-hidden`}
        style={{ zIndex: -1 }}
      >
        <div className={`flex items-center gap-2 px-3 py-2 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
          <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            styles.css
          </div>
        </div>
        <div className="p-3 font-mono text-[10px] leading-relaxed">
          <TypewriterCode isDark={isDark} isVisible={!prefersReducedMotion} />
        </div>
      </motion.div>
      
      {/* Phone frame (overlapping laptop) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: -30 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className={`absolute ${isRTL ? 'right-[5%]' : 'left-[5%]'} bottom-[15%] w-[22%] max-w-[140px] aspect-[9/19] ${
          isDark ? 'bg-gray-800' : 'bg-gray-200'
        } rounded-[2rem] p-1 shadow-2xl`}
      >
        <div className={`relative w-full h-full rounded-[1.7rem] overflow-hidden ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}>
          {currentMockup?.screenshot_mobile_url ? (
            <img
              src={currentMockup.screenshot_mobile_url}
              alt="Mobile preview"
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          ) : (
            <WireframeMobile isDark={isDark} />
          )}
        </div>
      </motion.div>
      
      {/* Floating category chips */}
      {categories.slice(0, 4).map((category, i) => (
        <FloatingChip
          key={category}
          text={category}
          index={i}
          total={Math.min(categories.length, 4)}
          isDark={isDark}
          isRTL={isRTL}
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </div>
  );
};

/**
 * WireframeWebsite - CSS-based wireframe for fallback
 */
const WireframeWebsite = ({ category, isDark }) => {
  const colors = {
    'Business': 'from-blue-500/20 to-blue-600/20',
    'E-Commerce': 'from-purple-500/20 to-purple-600/20',
    'Restaurant': 'from-orange-500/20 to-orange-600/20',
    'Healthcare': 'from-green-500/20 to-green-600/20',
    'Education': 'from-yellow-500/20 to-yellow-600/20',
    'default': 'from-primary/20 to-primary-strong/20',
  };
  
  const gradient = colors[category] || colors.default;
  
  return (
    <div className={`w-full h-full ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 space-y-4`}>
      {/* Nav */}
      <div className={`h-12 rounded-lg bg-gradient-to-r ${gradient}`} />
      
      {/* Hero */}
      <div className={`h-32 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center`}>
        <div className={`w-24 h-24 rounded-full ${isDark ? 'bg-white/10' : 'bg-white/50'}`} />
      </div>
      
      {/* Cards */}
      <div className="grid grid-cols-3 gap-2">
        {[1,2,3].map(i => (
          <div key={i} className={`h-16 rounded-lg ${isDark ? 'bg-white/5' : 'bg-white/80'}`} />
        ))}
      </div>
      
      {/* Footer */}
      <div className={`h-8 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
    </div>
  );
};

/**
 * WireframeMobile - Mobile wireframe fallback
 */
const WireframeMobile = ({ isDark }) => {
  return (
    <div className={`w-full h-full ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-2 space-y-2`}>
      <div className={`h-6 rounded ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
      <div className={`h-16 rounded bg-gradient-to-r from-primary/20 to-primary-strong/20`} />
      <div className="space-y-1">
        {[1,2,3].map(i => (
          <div key={i} className={`h-10 rounded ${isDark ? 'bg-white/5' : 'bg-white/80'}`} />
        ))}
      </div>
    </div>
  );
};

/**
 * TypewriterCode - Animated typing code
 */
const TypewriterCode = ({ isDark, isVisible }) => {
  const code = `.hero {\n  background: linear-gradient();\n  padding: 2rem;\n}`;
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
    }, 50);
    
    return () => clearInterval(interval);
  }, [isVisible]);
  
  return (
    <pre className={isDark ? 'text-green-400' : 'text-green-700'}>
      {displayedCode}
      {isVisible && displayedCode.length < code.length && (
        <span className="animate-pulse">|</span>
      )}
    </pre>
  );
};

/**
 * FloatingChip - Category chip with orbit animation
 */
const FloatingChip = ({ text, index, total, isDark, isRTL, prefersReducedMotion }) => {
  const radius = 180;
  const angle = (index / total) * Math.PI * 2;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: prefersReducedMotion ? 0 : x,
        y: prefersReducedMotion ? 0 : y,
      }}
      transition={{
        duration: 0.8,
        delay: 0.7 + index * 0.1,
      }}
      className={`absolute top-1/2 left-1/2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md ${
        isDark 
          ? 'bg-white/10 border border-white/20 text-white'
          : 'bg-white/80 border border-primary/20 text-primary-deep'
      } shadow-lg whitespace-nowrap`}
      style={{
        transform: `translate(-50%, -50%)`,
      }}
    >
      {text}
    </motion.div>
  );
};

/**
 * HandwrittenNote - Annotation with arrow
 */
const HandwrittenNote = ({ text, isDark, isRTL, language, prefersReducedMotion }) => {
  const [isDrawn, setIsDrawn] = useState(false);
  
  useEffect(() => {
    if (!prefersReducedMotion) {
      const timeout = setTimeout(() => setIsDrawn(true), 1000);
      return () => clearTimeout(timeout);
    } else {
      setIsDrawn(true);
    }
  }, [prefersReducedMotion]);
  
  // Font: Caveat for English, Aref Ruqaa for Arabic (loaded in index.html)
  const fontFamily = language === 'ar' ? "'Aref Ruqaa', cursive" : "'Caveat', cursive";
  
  return (
    <div className={`hidden lg:block absolute ${
      isRTL ? 'left-[10%]' : 'right-[10%]'
    } top-[15%] z-30 pointer-events-none`}>
      <motion.div
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ 
          opacity: 1, 
          rotate: isRTL ? 5 : -5,
        }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className={`relative ${isRTL ? 'text-right' : 'text-left'}`}
        style={{ fontFamily }}
      >
        <div className={`text-2xl font-bold ${
          isDark ? 'text-primary' : 'text-primary-strong'
        } leading-tight`}>
          {text.split(' ').map((word, i) => (
            <div key={i}>{word}</div>
          ))}
        </div>
        
        {/* Arrow SVG */}
        <svg
          className={`absolute ${isRTL ? 'right-full mr-4' : 'left-full ml-4'} top-1/2 -translate-y-1/2`}
          width="60"
          height="40"
          viewBox="0 0 60 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d={isRTL ? "M50 20 Q 25 10, 5 20" : "M10 20 Q 35 10, 55 20"}
            stroke={isDark ? '#6FD3D8' : '#5C7E8F'}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isDrawn ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          />
          <motion.path
            d={isRTL ? "M5 20 L 10 17 M 5 20 L 10 23" : "M55 20 L 50 17 M 55 20 L 50 23"}
            stroke={isDark ? '#6FD3D8' : '#5C7E8F'}
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: isDrawn ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 2.1 }}
          />
        </svg>
      </motion.div>
    </div>
  );
};
