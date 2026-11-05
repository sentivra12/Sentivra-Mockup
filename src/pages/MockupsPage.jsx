import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useMockups, useFAQs } from '@/hooks/useContent';
import PageHero from '@/components/ui/PageHero';
import CategoryFilterWithIcons from '@/components/ui/CategoryFilterWithIcons';
import SearchInput from '@/components/ui/SearchInput';
import MockupCard from '@/components/ui/MockupCard';
import MockupModal from '@/components/ui/MockupModal';
import CustomDesignBanner from '@/components/ui/CustomDesignBanner';
import FAQAccordion from '@/components/ui/FAQAccordion';
import SectionHeader from '@/components/ui/SectionHeader';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { 
  Globe, ShoppingCart, Utensils, Briefcase, Heart, 
  GraduationCap, Dumbbell, Home, Layers 
} from 'lucide-react';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';

const MockupsPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMockup, setSelectedMockup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);

  // Fetch data from Supabase
  const { data: mockups = [], isLoading: mockupsLoading } = useMockups();
  const { data: faqs = [], isLoading: faqsLoading } = useFAQs('mockups');

  // Build mockup categories
  const mockupCategories = [
    { id: 'all', label: 'All Mockups', icon: Layers },
    { id: 'Business & Corporate', label: 'Business', icon: Briefcase },
    { id: 'E-Commerce', label: 'E-Commerce', icon: ShoppingCart },
    { id: 'Restaurant & Food', label: 'Restaurant', icon: Utensils },
    { id: 'Healthcare', label: 'Healthcare', icon: Heart },
    { id: 'Education', label: 'Education', icon: GraduationCap },
    { id: 'Fitness & Wellness', label: 'Fitness', icon: Dumbbell },
    { id: 'Real Estate', label: 'Real Estate', icon: Home },
    { id: 'Portfolio & Personal', label: 'Portfolio', icon: Globe },
    { id: 'Other', label: 'Other', icon: Layers }
  ];

  // Filter mockups based on category and search
  const filteredMockups = mockups.filter((mockup) => {
    const matchesCategory = activeCategory === 'all' || mockup.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      mockup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mockup.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mockup.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const visibleMockups = filteredMockups.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMockups.length;

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setVisibleCount(8); // Reset visible count when changing category
  };

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setVisibleCount(8); // Reset visible count when searching
  }, []);

  const handleViewMockup = (mockup) => {
    setSelectedMockup(mockup);
    setIsModalOpen(true);
  };

  const handleRequestDesign = (mockup) => {
    const message = `Hello! I'm interested in the "${mockup.title}" design from your mockups page. I'd like to discuss customization options.`;
    const phoneNumber = '201558952126';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleViewMore = () => {
    setVisibleCount(prev => Math.min(prev + 4, filteredMockups.length));
  };

  // Show loading state
  if (mockupsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading mockups...</p>
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
      <Helmet>
        <title>Website Mockups - Ready-Made Designs | Sentivra</title>
        <meta 
          name="description" 
          content="Explore our collection of ready-made website mockups. Choose a design you like and we'll customize it for your business needs." 
        />
      </Helmet>

      {/* Hero Section with Handwriting Annotation */}
      <div className="relative">
        <PageHero
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Mockups' }
          ]}
          label="WEBSITE MOCKUPS"
          title="Ready-Made"
          titleAccent="Website Mockups"
          description="Explore ready-made website designs for different industries. Choose a design you like and contact us to get it customized for your business."
          primaryButton={{
            label: 'Find Your Mockup',
            href: '#mockups-section'
          }}
          secondaryButton={{
            label: 'Contact Us',
            href: '/#contact'
          }}
          backgroundImage="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=800&fit=crop"
        />

        {/* Handwriting Annotation - Desktop Only */}
        <div className="hidden xl:block absolute top-40 right-32 text-2xl text-primary rotate-[-5deg] pointer-events-none z-20" style={{ fontFamily: 'Caveat, cursive' }}>
          <div className="relative">
            <span className="font-bold">Modern Designs</span>
            <br />
            <span className="font-bold">For Your Business</span>
            <svg className="absolute -bottom-2 -right-8 w-20 h-20" viewBox="0 0 100 100">
              <path
                d="M 10 50 Q 30 20, 50 40 T 90 30"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 85 25 L 90 30 L 85 35"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Category Filter Section */}
      <Section spacing="md" className="bg-frost-soft border-b border-frost">
        <Container>
          <CategoryFilterWithIcons
            categories={mockupCategories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </Container>
      </Section>

      {/* Mockups Grid Section */}
      <Section id="mockups-section" spacing="xl" className="bg-white">
        <Container>
          {/* Section Header with Search */}
          <div className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end mb-8">
              <div>
                <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                  OUR MOCKUPS
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-deep mb-4">
                  Explore Our Website Designs
                </h2>
                <p className="text-lg text-text-muted">
                  Browse our collection of ready-made designs. Click on any project to view more details.
                </p>
              </div>
              <div className="lg:flex lg:justify-end">
                <SearchInput
                  placeholder="Search for a mockup..."
                  onSearch={handleSearch}
                  className="w-full lg:max-w-md"
                />
              </div>
            </div>

            {/* Results Count */}
            {searchQuery && (
              <div className="mb-6" role="status" aria-live="polite">
                <p className="text-text-muted">
                  Found <span className="font-bold text-primary">{filteredMockups.length}</span> mockup{filteredMockups.length !== 1 ? 's' : ''} 
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>
            )}
          </div>

          {/* Mockups Grid - Desktop */}
          {visibleMockups.length > 0 ? (
            <>
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {visibleMockups.map((mockup, index) => (
                  <MockupCard
                    key={mockup.id}
                    mockup={mockup}
                    onViewMockup={handleViewMockup}
                    onRequestDesign={handleRequestDesign}
                    delay={index * 0.1}
                    layout="grid"
                  />
                ))}
              </div>

              {/* Mockups List - Mobile */}
              <div className="md:hidden space-y-4 mb-12">
                {visibleMockups.map((mockup, index) => (
                  <MockupCard
                    key={mockup.id}
                    mockup={mockup}
                    onViewMockup={handleViewMockup}
                    onRequestDesign={handleRequestDesign}
                    delay={index * 0.05}
                    layout="list"
                  />
                ))}
              </div>

              {/* View More Button */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-center"
                >
                  <Button
                    onClick={handleViewMore}
                    size="lg"
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-lg group"
                  >
                    View More Mockups
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}
            </>
          ) : (
            // Empty State
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-frost-soft rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-primary-deep mb-3">No mockups found</h3>
                <p className="text-text-muted mb-6">
                  We couldn't find any mockups matching your search. Try adjusting your filters or search terms.
                </p>
                <Button
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                  }}
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Clear Filters
                </Button>
              </div>
            </motion.div>
          )}
        </Container>
      </Section>

      {/* Custom Design CTA Banner */}
      <CustomDesignBanner
        title="Found a Design You Like?"
        description="We can customize any of our mockups to match your brand, content, and business needs."
        buttonLabel="Contact Us Now"
        buttonHref="/#contact"
        image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
      />

      {/* FAQ Section */}
      <Section spacing="xl" className="bg-frost-soft">
        <Container>
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-deep mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-text-muted max-w-3xl mx-auto">
              Find answers to common questions about our website mockups and customization.
            </p>
          </div>

          {/* 2-column FAQ on desktop, 1-column on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FAQAccordion faqs={faqs.slice(0, Math.ceil(faqs.length / 2))} />
            <FAQAccordion faqs={faqs.slice(Math.ceil(faqs.length / 2))} />
          </div>
        </Container>
      </Section>

      {/* Mockup Modal */}
      <MockupModal
        mockup={selectedMockup}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRequestDesign={handleRequestDesign}
      />

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </motion.div>
  );
};

export default MockupsPage;
