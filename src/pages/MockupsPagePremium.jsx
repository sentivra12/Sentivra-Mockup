/**
 * MockupsPage - Premium Edition V2
 * 
 * ROUND 3 FIXES:
 * 1. Filter bar: Dynamic categories from DB, proper name fields, counts, URL state, sticky with blur
 * 2. Card images: Fixed field mapping (cover_image_url), CSS template fallback, no broken images
 * 3. Card layout: Title full width, equal heights, footer pinned, 2-line clamps
 * 4. Grid: Responsive (1/2/3/4 cols), same container as navbar/hero, consistent gaps
 * 5. Header: Proper width, search opposite side, aligned
 * 6. Data states: Empty state, few items balanced, long titles, missing images, missing Arabic
 * 7. Dark mode: Proper treatment (not inversion)
 * 8. Motion: Staggered fade-up with IntersectionObserver
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown } from 'lucide-react';
import { useMockups, useMockupCategories, useFAQs } from '@/hooks/useContent';
import { useTranslation } from '@/i18n/useTranslation';
import { useThemeContext } from '@/theme/ThemeContext';
import { SEO, useSEO } from '@/components/SEO';
import MockupsHero from '@/components/mockups/MockupsHeroPremium';
import MockupsFilterBar from '@/components/mockups/MockupsFilterBar';
import MockupCardPremium from '@/components/mockups/MockupCardPremium';
import StickyMobileCTA from '@/components/mockups/StickyMobileCTA';
import MockupModal from '@/components/ui/MockupModal';
import CustomDesignBanner from '@/components/ui/CustomDesignBanner';
import FAQAccordion from '@/components/ui/FAQAccordion';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { Button } from '@/components/ui/button';

const MockupsPagePremium = () => {
  const { t, language } = useTranslation();
  const { isDark } = useThemeContext();
  const { getMetadata } = useSEO();
  const seoData = getMetadata('mockups');
  
  // State
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedMockup, setSelectedMockup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  
  // Fetch data
  const { data: mockups = [], isLoading: mockupsLoading } = useMockups();
  const { data: categories = [], isLoading: categoriesLoading } = useMockupCategories();
  const { data: faqs = [] } = useFAQs('mockups');
  
  // Debounce search (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Filter mockups
  const filteredMockups = useMemo(() => {
    return mockups.filter((mockup) => {
      // Published/active only
      if (!mockup.published && !mockup.is_active) return false;
      
      // Category filter
      if (activeCategory !== 'all') {
        const mockupCategorySlug = mockup.category_slug || mockup.slug;
        if (mockupCategorySlug !== activeCategory) return false;
      }
      
      // Search filter (title, description, category - localized)
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const title = language === 'ar' ? mockup.title_ar : mockup.title_en || mockup.title;
        const desc = language === 'ar' ? mockup.short_description_ar : mockup.short_description_en || mockup.description;
        const cat = language === 'ar' ? mockup.category_name_ar : mockup.category_name_en;
        
        const matchesTitle = title?.toLowerCase().includes(query);
        const matchesDesc = desc?.toLowerCase().includes(query);
        const matchesCat = cat?.toLowerCase().includes(query);
        
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }
      
      return true;
    });
  }, [mockups, activeCategory, debouncedSearch, language]);
  
  // Visible mockups (with pagination)
  const visibleMockups = useMemo(() => 
    filteredMockups.slice(0, visibleCount),
    [filteredMockups, visibleCount]
  );
  
  const hasMore = visibleCount < filteredMockups.length;
  
  // Reduced motion check
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
  
  // Handlers
  const handleCategoryChange = useCallback((categorySlug) => {
    setActiveCategory(categorySlug);
    setVisibleCount(12);
    // Scroll to grid smoothly
    setTimeout(() => {
      const grid = document.getElementById('mockups-grid');
      if (grid) {
        const yOffset = -140; // Account for sticky filter bar + header
        const y = grid.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  }, []);
  
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setVisibleCount(12);
  }, []);
  
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
  }, []);
  
  const handleResetFilters = useCallback(() => {
    setActiveCategory('all');
    setSearchQuery('');
    setDebouncedSearch('');
    setVisibleCount(12);
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
    setVisibleCount(prev => Math.min(prev + 12, filteredMockups.length));
  }, [filteredMockups.length]);
  
  // Loading state
  if (mockupsLoading || categoriesLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center pt-16 ${
        isDark ? 'bg-[#0A1525]' : 'bg-white'
      }`}>
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: isDark ? '#6FD3D8' : '#5C7E8F' }}
          />
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
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
      </Helmet>

      {/* PREMIUM HERO */}
      <MockupsHero />
      
      {/* STICKY FILTER BAR */}
      <MockupsFilterBar
        categories={categories}
        mockups={mockups}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        language={language}
        isDark={isDark}
      />
      
      {/* MOCKUPS GRID SECTION */}
      <section 
        id="mockups-grid"
        className={`py-16 lg:py-20 ${isDark ? 'bg-[#0A1525]' : 'bg-white'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Search */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end mb-12">
            {/* Left: Heading */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span 
                  className={`inline-block text-xs font-bold uppercase tracking-wider mb-3 ${
                    isDark ? 'text-cyan-400' : 'text-[#5C7E8F]'
                  }`}
                >
                  {language === 'ar' ? 'معرض التصاميم' : 'Design Gallery'}
                </span>
                <h2 
                  className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${
                    isDark ? 'text-white' : 'text-[#1F3440]'
                  }`}
                  style={{ 
                    maxWidth: language === 'ar' ? '100%' : '20ch',
                    textWrap: 'balance'
                  }}
                >
                  {language === 'ar' ? 'استكشف تصاميم مواقعنا' : 'Explore Our Website Designs'}
                </h2>
                <p className={`text-base sm:text-lg ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {language === 'ar' 
                    ? 'تصفح مجموعتنا من التصاميم الجاهزة واختر ما يناسب عملك'
                    : 'Browse our collection of ready-made designs and find what fits your business'}
                </p>
              </motion.div>
            </div>
            
            {/* Right: Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:flex lg:justify-end lg:items-center"
            >
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
                  className={`w-full h-12 ${language === 'ar' ? 'pr-12 pl-10' : 'pl-12 pr-10'} rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isDark
                      ? 'bg-slate-800/50 border-white/10 text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-cyan-400'
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#5C7E8F] focus:ring-[#5C7E8F]'
                  }`}
                  aria-label={language === 'ar' ? 'ابحث عن تصميم' : 'Search for a design'}
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                      isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                    }`}
                    aria-label={language === 'ar' ? 'مسح البحث' : 'Clear search'}
                  >
                    <X className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
          
          {/* Results count with aria-live */}
          {(debouncedSearch || activeCategory !== 'all') && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {language === 'ar' ? (
                  <>
                    تم العثور على <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-[#1F3440]'}`}>{filteredMockups.length}</span> {filteredMockups.length === 1 ? 'تصميم' : 'تصميم'}
                    {debouncedSearch && ` مطابق لـ "${debouncedSearch}"`}
                  </>
                ) : (
                  <>
                    Found <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-[#1F3440]'}`}>{filteredMockups.length}</span> {filteredMockups.length === 1 ? 'design' : 'designs'}
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Responsive grid: 1/2/3/4 cols, 24px gap */}
                <div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
                  role="list"
                  aria-label={language === 'ar' ? 'قائمة التصاميم' : 'Mockup designs list'}
                >
                  {visibleMockups.map((mockup, index) => (
                    <div key={mockup.id} role="listitem">
                      <MockupCardPremium
                        mockup={mockup}
                        onViewMockup={handleViewMockup}
                        onRequestDesign={handleRequestDesign}
                        index={index}
                        isFirst={index === 0}
                        language={language}
                        isDark={isDark}
                        simplified={prefersReducedMotion}
                      />
                    </div>
                  ))}
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
                      className={`px-8 h-12 font-semibold transition-all duration-300 ${
                        isDark
                          ? 'bg-gradient-to-r from-[#5C7E8F] to-[#4A6B7C] text-white hover:from-[#4A6B7C] hover:to-[#5C7E8F]'
                          : 'bg-gradient-to-r from-[#5C7E8F] to-[#4A6B7C] text-white hover:from-[#4A6B7C] hover:to-[#5C7E8F]'
                      } ${language === 'ar' ? 'flex-row-reverse' : ''}`}
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
                className="text-center py-20"
              >
                <div className="max-w-md mx-auto">
                  <div 
                    className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                      isDark ? 'bg-slate-800' : 'bg-slate-100'
                    }`}
                  >
                    <Search className={`w-12 h-12 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                  </div>
                  <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-[#1F3440]'}`}>
                    {language === 'ar' ? 'لم يتم العثور على نتائج' : 'No designs found'}
                  </h3>
                  <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
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
                    className={`${
                      isDark
                        ? 'border-2 border-white/20 text-white hover:bg-white/10'
                        : 'border-2 border-[#5C7E8F] text-[#5C7E8F] hover:bg-[#5C7E8F] hover:text-white'
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
      
      {/* CUSTOM DESIGN BANNER */}
      <CustomDesignBanner
        title={language === 'ar' ? 'وجدت تصميماً يعجبك؟' : 'Found a Design You Like?'}
        description={language === 'ar' 
          ? 'يمكننا تخصيص أي من تصاميمنا لتتناسب مع علامتك التجارية ومحتواك واحتياجات عملك.'
          : 'We can customize any of our mockups to match your brand, content, and business needs.'}
        buttonLabel={language === 'ar' ? 'تواصل معنا الآن' : 'Contact Us Now'}
        buttonHref="/contact"
        image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
      />
      
      {/* FAQ SECTION */}
      <section className={`py-16 lg:py-20 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className={`inline-block text-xs font-bold uppercase tracking-wider mb-3 ${
              isDark ? 'text-cyan-400' : 'text-[#5C7E8F]'
            }`}>
              {language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
            </span>
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-[#1F3440]'
            }`}>
              {language === 'ar' ? 'الأسئلة المتكررة' : 'Frequently Asked Questions'}
            </h2>
            <p className={`text-base sm:text-lg max-w-3xl mx-auto ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {language === 'ar'
                ? 'اعثر على إجابات للأسئلة الشائعة حول نماذج المواقع والتخصيص.'
                : 'Find answers to common questions about our website mockups and customization.'}
            </p>
          </div>
          
          {/* 2-column FAQ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FAQAccordion faqs={faqs.slice(0, Math.ceil(faqs.length / 2))} />
            <FAQAccordion faqs={faqs.slice(Math.ceil(faqs.length / 2))} />
          </div>
        </div>
      </section>
      
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

export default MockupsPagePremium;
