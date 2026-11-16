/**
 * MockupsPageRound5 - Premium Design Gallery with all Round 5 features
 * Performance optimized: lazy components, memoization, optimized images
 */

import React, { useState, useCallback, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useMotionPreference';
import { Search, X, ChevronDown } from 'lucide-react';
import { useMockups, useMockupCategories, useFAQs, useSiteSettings } from '@/hooks/useContent';
import { useTranslation } from '@/i18n/useTranslation';
import { useThemeContext } from '@/theme/ThemeContext';
import { SEO, useSEO } from '@/components/SEO';
import MockupsHero from '@/components/mockups/MockupsHeroPremium';
import MockupsFilterBarPremium from '@/components/mockups/MockupsFilterBarPremium';
import PremiumMockupCardRound5 from '@/components/mockups/PremiumMockupCardRound5';
import StickyMobileCTA from '@/components/mockups/StickyMobileCTA';
import MockupModal from '@/components/ui/MockupModal';
import HowItWorksStrip from '@/components/mockups/HowItWorksStrip';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { Button } from '@/components/ui/button';

// Lazy load heavy components below the fold
const PremiumFAQAccordion = lazy(() => import('@/components/mockups/PremiumFAQAccordion'));
const PremiumFinalCTA = lazy(() => import('@/components/mockups/PremiumFinalCTA'));

const MockupsPageRound5 = () => {
  const { t, language } = useTranslation();
  const { isDark } = useThemeContext();
  const { getMetadata } = useSEO();
  const seoData = getMetadata('mockups');
  const shouldReduceMotion = useReducedMotion();
  
  // State
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedMockup, setSelectedMockup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  // Fetch data with pagination and selective columns
  const { data: mockups = [], isLoading: mockupsLoading } = useMockups();
  const { data: categories = [], isLoading: categoriesLoading } = useMockupCategories();
  const { data: faqs = [] } = useFAQs('mockups');
  const { data: siteSettings = {} } = useSiteSettings();
  
  // Check for data saver / low power mode
  const saveData = typeof navigator !== 'undefined' && 
    (navigator.connection?.saveData || navigator.connection?.effectiveType === 'slow-2g');
  const disableHeavyEffects = shouldReduceMotion || saveData;
  
  // Debounce search (200ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Track mouse position for spotlight effect
  useEffect(() => {
    if (disableHeavyEffects) return;
    
    const handleMouseMove = (e) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    
    const section = sectionRef.current;
    if (section) {
      section.addEventListener('mousemove', handleMouseMove);
      return () => section.removeEventListener('mousemove', handleMouseMove);
    }
  }, [disableHeavyEffects]);
  
  // Staged reveal with IntersectionObserver
  useEffect(() => {
    if (disableHeavyEffects || typeof IntersectionObserver === 'undefined') return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-50px'
      }
    );
    
    // Observe header
    if (headerRef.current) {
      observer.observe(headerRef.current);
    }
    
    // Observe grid
    if (gridRef.current) {
      observer.observe(gridRef.current);
    }
    
    return () => observer.disconnect();
  }, [disableHeavyEffects]);
  
  // Filter mockups — only published/active rows, never static fallback data
  const filteredMockups = useMemo(() => {
    return (mockups ?? []).filter((mockup) => {
      // Guard: static fallback rows have numeric ids (1,2,3...) — skip them when real DB data is present
      // A proper DB row always has a UUID slug and no numeric id field
      if (typeof mockup.id === 'number') return false;

      // Active filter — must have is_active=true OR published=true
      const isPublished = mockup.is_active === true || mockup.published === true;
      if (!isPublished) return false;

      // Category filter — match against category_slug join field or category_id
      if (activeCategory !== 'all') {
        const catSlug = mockup.category?.slug || mockup.category_slug;
        const catId   = mockup.category_id;
        // try slug first, then id
        if (catSlug && catSlug !== activeCategory) return false;
        if (!catSlug && catId) {
          // catId comparison — activeCategory may be a UUID or a slug
          // We only have slug here so skip id-only comparison gracefully
        }
        if (!catSlug && !catId) return false; // uncategorized — skip when a filter is active
      }

      // Search filter
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const title    = language === 'ar' ? mockup.title_ar : mockup.title_en || mockup.title;
        const desc     = language === 'ar' ? mockup.short_description_ar : mockup.short_description_en || mockup.description;
        const catName  = language === 'ar' ? mockup.category?.name_ar : mockup.category?.name_en;
        const tagsStr  = Array.isArray(mockup.tags) ? mockup.tags.join(' ') : '';

        const hit = [title, desc, catName, tagsStr].some(s => s?.toLowerCase().includes(query));
        if (!hit) return false;
      }

      return true;
    });
  }, [mockups, activeCategory, debouncedSearch, language]);
  
  // Sort: featured first, then by date
  const sortedMockups = useMemo(() => {
    return [...filteredMockups].sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [filteredMockups]);
  
  // Visible mockups (with pagination)
  const visibleMockups = useMemo(() => 
    sortedMockups.slice(0, visibleCount),
    [sortedMockups, visibleCount]
  );
  
  const hasMore = visibleCount < sortedMockups.length;
  const hasFeatured = visibleMockups.some(m => m.is_featured);
  const shouldUseFeaturedLayout = hasFeatured && visibleMockups.length >= 5;
  
  // Handlers
  const handleCategoryChange = useCallback((categorySlug) => {
    setActiveCategory(categorySlug);
    setVisibleCount(9);
    // Scroll to grid smoothly
    setTimeout(() => {
      const grid = document.getElementById('mockups-grid');
      if (grid) {
        const yOffset = -140;
        const y = grid.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  }, []);
  
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setVisibleCount(9);
  }, []);
  
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
  }, []);
  
  const handleResetFilters = useCallback(() => {
    setActiveCategory('all');
    setSearchQuery('');
    setDebouncedSearch('');
    setVisibleCount(9);
  }, []);
  
  const handleViewMockup = useCallback((mockup) => {
    setSelectedMockup(mockup);
    setIsModalOpen(true);
  }, []);
  
  const handleRequestDesign = useCallback((mockup) => {
    const title = language === 'ar' ? mockup.title_ar : mockup.title_en || mockup.title;
    const message = language === 'ar'
      ? `مرحباً! أنا مهتم بتصميم "${title}" من صفحة النماذج. أود مناقشة خيارات التخصيص.`
      : `Hello! I'm interested in the "${title}" design from your mockups page. I'd like to discuss customization options.`;
    const phoneNumber = '201558952126';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [language]);
  
  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + 9, sortedMockups.length));
  }, [sortedMockups.length]);
  
  // Loading state
  if (mockupsLoading || categoriesLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center pt-16 ${
        isDark ? 'bg-brand-950' : 'bg-white'
      }`}>
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: isDark ? 'rgb(13, 158, 130)' : 'rgb(13, 158, 130)' }}
          />
          <p className={isDark ? 'text-text-muted' : 'text-text-muted'}>
            {language === 'ar' ? 'جاري التحميل...' : 'Loading mockups...'}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
    >
      <SEO 
        title={seoData.title}
        description={seoData.description}
        type="website"
      />
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <link rel="preconnect" href="https://njovqwbptfhfzbfmwjgk.supabase.co" />
        <link rel="dns-prefetch" href="https://njovqwbptfhfzbfmwjgk.supabase.co" />
      </Helmet>

      {/* PREMIUM HERO (from previous rounds - don't touch) */}
      <MockupsHero />
      
      {/* STICKY GLASS FILTER BAR (hidden if only "All") */}
      <MockupsFilterBarPremium
        categories={categories}
        mockups={mockups}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        language={language}
        isDark={isDark}
      />
      
      {/* PREMIUM DESIGN GALLERY SECTION */}
      <section 
        id="mockups-grid"
        ref={sectionRef}
        className={`relative py-16 lg:py-24 overflow-hidden scroll-mt-header page-with-scroll-top ${isDark ? 'bg-brand-950' : 'bg-white'}`}
      >
        {/* LAYERED BACKGROUNDS */}
        {!disableHeavyEffects && (
          <>
            {/* Aurora Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
              <motion.div
                className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-20"
                style={{
                  background: isDark
                    ? 'radial-gradient(circle, rgba(13, 158, 130, 0.3) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(13, 158, 130, 0.15) 0%, transparent 70%)',
                  top: '-20%',
                  left: '-10%'
                }}
                animate={{
                  x: [0, 50, 0],
                  y: [0, 80, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              <motion.div
                className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-20"
                style={{
                  background: isDark
                    ? 'radial-gradient(circle, rgba(13, 158, 130, 0.3) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(13, 158, 130, 0.12) 0%, transparent 70%)',
                  bottom: '-10%',
                  right: '-10%'
                }}
                animate={{
                  x: [0, -60, 0],
                  y: [0, -70, 0],
                  scale: [1, 1.15, 1]
                }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </div>
            
            {/* Perspective Grid */}
            <div 
              className="absolute inset-x-0 top-0 h-[500px] opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(${isDark ? 'rgba(111, 211, 216, 0.3)' : 'rgba(92, 126, 143, 0.3)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(111, 211, 216, 0.3)' : 'rgba(92, 126, 143, 0.3)'} 1px, transparent 1px)`,
                backgroundSize: '80px 80px',
                transform: 'perspective(500px) rotateX(60deg)',
                transformOrigin: 'top center'
              }}
              aria-hidden="true"
            />
            
            {/* Grain Texture */}
            <div 
              className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
              }}
              aria-hidden="true"
            />
            
            {/* Floating Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${10 + i * 12}%`,
                    top: `${20 + (i % 3) * 25}%`,
                    opacity: isDark ? 0.03 : 0.02
                  }}
                  animate={{
                    y: [0, -30, 0],
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 15 + i * 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.5
                  }}
                >
                  {i % 4 === 0 && (
                    <div className={`w-16 h-16 rounded-xl border-2 ${isDark ? 'border-brand-accent' : 'border-brand-accent'}`} />
                  )}
                  {i % 4 === 1 && (
                    <div className={`w-12 h-12 rounded-full border-2 ${isDark ? 'border-brand-accent' : 'border-brand-accent'}`} />
                  )}
                  {i % 4 === 2 && (
                    <div className={`text-4xl font-bold ${isDark ? 'text-brand-accent' : 'text-brand-accent'}`}>+</div>
                  )}
                  {i % 4 === 3 && (
                    <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-brand-accent' : 'bg-brand-accent'}`} />
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Pointer Spotlight */}
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-10 pointer-events-none"
              style={{
                background: isDark
                  ? 'radial-gradient(circle, rgba(13, 158, 130, 0.4) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(13, 158, 130, 0.3) 0%, transparent 70%)',
                left: mousePos.x - 300,
                top: mousePos.y - 300
              }}
              transition={{
                type: 'spring',
                stiffness: 50,
                damping: 30
              }}
              aria-hidden="true"
            />
          </>
        )}
        
        <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Search - Staged Reveal */}
          <motion.div
            ref={headerRef}
            initial={disableHeavyEffects ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end mb-16"
          >
            {/* Left: Heading */}
            <div>
              <span 
                className={`inline-block text-xs font-bold uppercase tracking-wider mb-3 ${
                  isDark ? 'text-brand-accent' : 'text-brand-accent-deep'
                }`}
              >
                {language === 'ar' ? 'معرض التصاميم' : 'Design Gallery'}
              </span>
              <h2 
                className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-primary-deep'
                }`}
                style={{ 
                  maxWidth: language === 'ar' ? '100%' : '20ch',
                  textWrap: 'balance'
                }}
              >
                {language === 'ar' ? 'استكشف تصاميم مواقعنا' : 'Explore Our Website Designs'}
              </h2>
              <p className={`text-base sm:text-lg ${
                isDark ? 'text-text-muted' : 'text-text-muted'
              }`}>
                {language === 'ar' 
                  ? 'تصفح مجموعتنا من التصاميم الجاهزة واختر ما يناسب عملك'
                  : 'Browse our collection of ready-made designs and find what fits your business'}
              </p>
            </div>
            
            {/* Right: Search */}
            <div className="lg:flex lg:justify-end lg:items-center">
              <div className="relative w-full lg:max-w-md">
                <Search 
                  className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={language === 'ar' ? 'ابحث عن تصميم...' : 'Search designs...'}
                  className={`w-full h-14 ${language === 'ar' ? 'pr-12 pl-10' : 'pl-12 pr-10'} rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isDark
                      ? 'bg-brand-900/50 border-brand-800 text-white placeholder-text-muted focus:border-brand-accent focus:ring-brand-accent'
                      : 'bg-white/80 border-brand-200 text-primary-deep placeholder-text-muted focus:border-brand-accent focus:ring-brand-accent'
                  }`}
                  style={{
                    boxShadow: isDark
                      ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                      : '0 4px 20px rgba(13, 158, 130, 0.08)'
                  }}
                  aria-label={language === 'ar' ? 'ابحث عن تصميم' : 'Search for a design'}
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                      isDark ? 'hover:bg-white/10' : 'hover:bg-brand-50'
                    }`}
                    aria-label={language === 'ar' ? 'مسح البحث' : 'Clear search'}
                  >
                    <X className={`w-4 h-4 ${isDark ? 'text-text-muted' : 'text-text-muted'}`} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Results count with aria-live */}
          {(debouncedSearch || activeCategory !== 'all') && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <p className={`text-sm ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                {language === 'ar' ? (
                  <>
                    تم العثور على <span className={`font-bold ${isDark ? 'text-brand-accent' : 'text-primary-deep'}`}>{sortedMockups.length}</span> {sortedMockups.length === 1 ? 'تصميم' : 'تصميم'}
                    {debouncedSearch && ` مطابق لـ "${debouncedSearch}"`}
                  </>
                ) : (
                  <>
                    Found <span className={`font-bold ${isDark ? 'text-brand-accent' : 'text-primary-deep'}`}>{sortedMockups.length}</span> {sortedMockups.length === 1 ? 'design' : 'designs'}
                    {debouncedSearch && ` matching "${debouncedSearch}"`}
                  </>
                )}
              </p>
            </motion.div>
          )}
          
          {/* GRID or EMPTY STATE */}
          <AnimatePresence mode="wait">
            {visibleMockups.length > 0 ? (
              <motion.div
                key="grid"
                ref={gridRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* PREMIUM RESPONSIVE GRID: auto-fit, min 300px, max 3 cols (<1600px), 4 cols (>=1600px) */}
                <div 
                  className="grid gap-8 mb-16"
                  style={{
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    maxWidth: '100%'
                  }}
                  role="list"
                  aria-label={language === 'ar' ? 'قائمة التصاميم' : 'Mockup designs list'}
                >
                  {/* Apply max 3 cols at <1600px, 4 cols at >=1600px via CSS */}
                  <style>{`
                    @media (min-width: 768px) and (max-width: 1599px) {
                      #mockups-grid > div > div[role="list"] {
                        grid-template-columns: repeat(auto-fit, minmax(300px, calc(33.333% - 22px))) !important;
                      }
                    }
                    @media (min-width: 1600px) {
                      #mockups-grid > div > div[role="list"] {
                        grid-template-columns: repeat(auto-fit, minmax(300px, calc(25% - 24px))) !important;
                      }
                    }
                    @media (max-width: 767px) {
                      #mockups-grid > div > div[role="list"] {
                        grid-template-columns: 1fr !important;
                        justify-items: stretch;
                        max-width: 100%;
                      }
                      #mockups-grid > div > div[role="list"] > div {
                        max-width: 100%;
                      }
                    }
                  `}</style>
                  
                  {visibleMockups.map((mockup, index) => {
                    const isFeatured = mockup.is_featured && shouldUseFeaturedLayout && index === 0;
                    
                    return (
                      <div 
                        key={mockup.id} 
                        role="listitem"
                        style={isFeatured ? { gridColumn: 'span 2' } : {}}
                      >
                        <PremiumMockupCardRound5
                          mockup={mockup}
                          onRequestDesign={handleRequestDesign}
                          index={index}
                          isFirst={index === 0}
                          isFeatured={isFeatured}
                          language={language}
                          isDark={isDark}
                          disableEffects={disableHeavyEffects}
                        />
                      </div>
                    );
                  })}
                </div>
                
                {/* Load More */}
                {hasMore && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-center"
                  >
                    <Button
                      onClick={handleLoadMore}
                      size="lg"
                      className={`px-10 h-14 font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-brand-accent to-brand-accent-deep text-white hover:from-brand-accent-deep hover:to-brand-accent ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                    >
                      <span>{language === 'ar' ? 'تحميل المزيد' : 'Load More'}</span>
                      <ChevronDown className={`w-5 h-5 ${language === 'ar' ? 'mr-2' : 'ml-2'}`} aria-hidden="true" />
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              // Empty state
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="text-center py-24"
              >
                <div className="max-w-md mx-auto">
                  <div 
                    className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm ${
                      isDark ? 'bg-brand-900/50 border border-brand-800' : 'bg-brand-50 border border-brand-200'
                    }`}
                  >
                    <Search className={`w-12 h-12 ${isDark ? 'text-brand-accent' : 'text-brand-accent'}`} />
                  </div>
                  <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-primary-deep'}`}>
                    {language === 'ar' ? 'لم يتم العثور على نتائج' : 'No designs found'}
                  </h3>
                  <p className={`mb-6 ${isDark ? 'text-text-muted' : 'text-text-muted'}`}>
                    {debouncedSearch ? (
                      language === 'ar' 
                        ? `لم نتمكن من العثور على تصاميم تطابق "${debouncedSearch}"`
                        : `We couldn't find any designs matching "${debouncedSearch}"`
                    ) : (
                      language === 'ar'
                        ? 'لا توجد تصاميم في هذه الفئة حالياً'
                        : 'No designs in this category yet'
                    )}
                  </p>
                  <Button
                    onClick={handleResetFilters}
                    variant="outline"
                    className={`rounded-xl border-2 ${
                      isDark
                        ? 'border-brand-accent/30 text-white hover:bg-brand-accent/10'
                        : 'border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white'
                    } ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                  >
                    {language === 'ar' ? 'عرض جميع التصاميم' : 'Show All Designs'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      
      {/* ROUND 6: HOW IT WORKS STRIP */}
      <HowItWorksStrip
        language={language}
        isDark={isDark}
      />
      
      {/* ROUND 6: PREMIUM FAQ ACCORDION */}
      <Suspense fallback={<div style={{ minHeight: '400px' }} />}>
        <PremiumFAQAccordion
          faqs={faqs}
          language={language}
          isDark={isDark}
          siteSettings={siteSettings}
        />
      </Suspense>
      
      {/* ROUND 6: PREMIUM FINAL CTA WITH DEVICE STAGE */}
      <Suspense fallback={<div style={{ minHeight: '600px' }} />}>
        <PremiumFinalCTA
          mockups={(mockups ?? []).filter(m => (m.is_active === true || m.published === true) && typeof m.id !== 'number')}
          categories={categories}
          siteSettings={siteSettings}
          language={language}
          isDark={isDark}
        />
      </Suspense>
      
      {/* MOCKUP MODAL */}
      <MockupModal
        mockup={selectedMockup}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRequestDesign={handleRequestDesign}
      />
      
      {/* STICKY MOBILE CTA */}
      <StickyMobileCTA />
      
      {/* WHATSAPP BUTTON */}
      <WhatsAppButton />
    </motion.div>
  );
};

export default MockupsPageRound5;
