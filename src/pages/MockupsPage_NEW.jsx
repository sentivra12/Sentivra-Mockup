import React, { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { 
  useMockups, 
  useMockupCategories,
  useFAQs,
  useAllPageContent 
} from '@/hooks/useContent';
import { useTranslation } from '@/i18n/useTranslation';
import { SEO, useSEO } from '@/components/SEO';
import PremiumMockupsHero from '@/components/mockups/PremiumMockupsHero';
import EnhancedMockupCard from '@/components/mockups/EnhancedMockupCard';
import CustomDesignBanner from '@/components/ui/CustomDesignBanner';
import FAQAccordion from '@/components/ui/FAQAccordion';
import InverseSurface from '@/components/ui/InverseSurface';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import StickyMobileCTA from '@/components/mockups/StickyMobileCTA';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

/**
 * MockupsPage - Redesigned premium mockups showcase
 * 
 * Features:
 * - Premium hero with device showcase
 * - Database-driven category filter
 * - Search with live count
 * - Enhanced mockup cards with browser frames
 * - Quick view modal
 * - Design request conversion flow
 * - Full CMS integration
 * - Bilingual EN/AR
 */
const MockupsPage = () => {
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  const { getMetadata } = useSEO();
  const { data: pageContent = [] } = useAllPageContent('mockups');
  const seoData = getMetadata('mockups');
  
  // Helper function to get content by key
  const getContent = (key) => {
    const content = pageContent.find(c => c.content_key === key);
    return content ? (isRTL ? content.content_ar : content.content_en) : key;
  };
  
  // URL state
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('q') || '';
  const sortParam = searchParams.get('sort') || 'featured';
  
  // Local state
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [sortBy, setSortBy] = useState(sortParam);
  const [visibleCount, setVisibleCount] = useState(9);
  const [selectedMockup, setSelectedMockup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data
  const { data: mockups = [], isLoading: mockupsLoading } = useMockups();
  const { data: categories = [], isLoading: categoriesLoading } = useMockupCategories();
  const { data: faqs = [], isLoading: faqsLoading } = useFAQs('mockups');

  // Sync URL with state
  useEffect(() => {
    const params = {};
    if (activeCategory !== 'all') params.category = activeCategory;
    if (searchTerm) params.q = searchTerm;
    if (sortBy !== 'featured') params.sort = sortBy;
    
    setSearchParams(params, { replace: true });
  }, [activeCategory, searchTerm, sortBy, setSearchParams]);

  // Filter and sort mockups
  const getFilteredMockups = () => {
    let filtered = mockups.filter(m => m.is_active);

    // Category filter
    if (activeCategory !== 'all') {
      const category = categories.find(c => c.slug === activeCategory);
      if (category) {
        filtered = filtered.filter(m => m.category_id === category.id);
      }
    }

    // Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(m => {
        const title = isRTL ? (m.title_ar || m.title) : (m.title_en || m.title);
        const description = isRTL 
          ? (m.short_description_ar || m.short_description) 
          : (m.short_description_en || m.short_description);
        const categoryName = categories.find(c => c.id === m.category_id)?.[isRTL ? 'name_ar' : 'name_en'];
        
        return (
          title?.toLowerCase().includes(query) ||
          description?.toLowerCase().includes(query) ||
          categoryName?.toLowerCase().includes(query)
        );
      });
    }

    // Sort
    if (sortBy === 'featured') {
      filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'az') {
      filtered.sort((a, b) => {
        const aTitle = isRTL ? (a.title_ar || a.title) : (a.title_en || a.title);
        const bTitle = isRTL ? (b.title_ar || b.title) : (b.title_en || b.title);
        return aTitle.localeCompare(bTitle);
      });
    }

    return filtered;
  };

  const filteredMockups = getFilteredMockups();
  const visibleMockups = filteredMockups.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMockups.length;

  const handleCategoryChange = (slug) => {
    setActiveCategory(slug);
    setVisibleCount(9);
  };

  const handleSearch = useCallback((query) => {
    setSearchTerm(query);
    setVisibleCount(9);
  }, []);

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 6, filteredMockups.length));
  };

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSearchTerm('');
    setSortBy('featured');
    setVisibleCount(9);
  };

  // Loading state
  if (mockupsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
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

      {/* Premium Hero */}
      <PremiumMockupsHero mockups={mockups} categories={categories} />

      {/* Category Filter Bar (Sticky) */}
      <div 
        id="mockups-filter"
        className="sticky top-16 z-40 bg-color-background/95 backdrop-blur-md border-b border-frost shadow-sm"
      >
        <Container>
          <div className="py-4">
            {/* Categories + Search + Sort */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
              {/* Category pills */}
              <div className={`flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {categories.filter(c => c.is_active).map((category) => {
                  const isActive = activeCategory === category.slug;
                  const count = mockups.filter(m => 
                    m.is_active && (category.slug === 'all' || m.category_id === category.id)
                  ).length;

                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.slug)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-frost-soft text-text-muted hover:bg-frost hover:text-primary-deep'
                      }`}
                    >
                      <span>{isRTL ? category.name_ar : category.name_en}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20' : 'bg-primary/10 text-primary'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 rounded-lg bg-frost-soft border border-frost text-primary-deep focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="featured">{getContent('mockups-sort-featured')}</option>
                <option value="newest">{getContent('mockups-sort-newest')}</option>
                <option value="az">{getContent('mockups-sort-az')}</option>
              </select>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted ${isRTL ? 'right-4' : 'left-4'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={getContent('mockups-search-placeholder') || 'Search for a mockup...'}
                className={`w-full ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-3 rounded-lg bg-white dark:bg-gray-800 border border-frost focus:outline-none focus:ring-2 focus:ring-primary/50`}
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} p-1 hover:bg-frost-soft rounded-full transition-colors`}
                >
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              )}
            </div>

            {/* Results count */}
            {(searchTerm || activeCategory !== 'all') && (
              <div className="mt-3 text-sm text-text-muted" role="status" aria-live="polite">
                {getContent('mockups-results-found')} <span className="font-bold text-primary">{filteredMockups.length}</span> {filteredMockups.length !== 1 ? getContent('mockups-results-mockups-plural') : getContent('mockups-results-mockups-singular')}
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* Mockups Grid */}
      <Section spacing="xl" className="bg-color-background">
        <Container>
          {visibleMockups.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {visibleMockups.map((mockup, index) => (
                  <EnhancedMockupCard
                    key={mockup.id}
                    mockup={mockup}
                    category={categories.find(c => c.id === mockup.category_id)}
                    onViewMockup={setSelectedMockup}
                    delay={index * 0.05}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-text-muted">
                    {getContent('mockups-showing-count')
                      ?.replace('{current}', visibleCount)
                      .replace('{total}', filteredMockups.length)}
                  </p>
                  <Button
                    onClick={handleLoadMore}
                    size="lg"
                    className="bg-primary hover:bg-primary-dark text-white px-8"
                  >
                    {getContent('mockups-load-more')}
                  </Button>
                </div>
              )}
            </>
          ) : (
            // Empty state
            <div className="text-center py-20 max-w-md mx-auto">
              <div className="w-20 h-20 bg-frost-soft rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-text-muted" />
              </div>
              <h3 className="text-2xl font-bold text-primary-deep mb-3">
                {getContent('mockups-empty-title')}
              </h3>
              <p className="text-text-muted mb-6">
                {getContent('mockups-empty-description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white"
                >
                  {getContent('mockups-empty-reset-button')}
                </Button>
                <Link to="/contact">
                  <Button className="bg-primary hover:bg-primary-dark text-white">
                    {getContent('mockups-empty-contact-link')}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Container>
      </Section>

      {/* Custom Design Banner */}
      <InverseSurface withTopGlow className="py-16 md:py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-inverse-fg mb-6">
              {getContent('mockups-banner-title')}
            </h2>
            <p className="text-xl text-inverse-fg-muted mb-8">
              {getContent('mockups-banner-description')}
            </p>
            <Link to="/contact">
              <Button 
                size="lg"
                className="bg-inverse-accent hover:bg-inverse-accent/90 text-inverse-bg font-semibold px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                {getContent('mockups-banner-button')}
              </Button>
            </Link>
          </div>
        </Container>
      </InverseSurface>

      {/* FAQ Section */}
      <Section spacing="xl" className="bg-frost-soft">
        <Container>
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              {getContent('mockups-faq-eyebrow')}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-deep mb-4">
              {getContent('mockups-faq-title')}
            </h2>
            <p className="text-lg text-text-muted max-w-3xl mx-auto">
              {getContent('mockups-faq-description')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FAQAccordion faqs={faqs.slice(0, Math.ceil(faqs.length / 2))} />
            <FAQAccordion faqs={faqs.slice(Math.ceil(faqs.length / 2))} />
          </div>
        </Container>
      </Section>

      {/* Final CTA */}
      <InverseSurface withTopGlow className="py-16 md:py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-inverse-fg mb-6">
              {getContent('mockups-cta-title')}
            </h2>
            <p className="text-xl text-inverse-fg-muted mb-8">
              {getContent('mockups-cta-description')}
            </p>
            <Link to="/contact">
              <Button 
                size="lg"
                className="bg-inverse-accent hover:bg-inverse-accent/90 text-inverse-bg font-semibold px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                {getContent('mockups-cta-button')}
              </Button>
            </Link>
          </div>
        </Container>
      </InverseSurface>

      {/* Footer */}
      <Footer />

      {/* Sticky Mobile CTA */}
      <StickyMobileCTA />

      <WhatsAppButton />
    </motion.div>
  );
};

export default MockupsPage;
