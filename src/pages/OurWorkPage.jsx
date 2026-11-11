import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Search, Mail, Phone, MessageCircle, MapPin } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { 
  useProjects, 
  useTestimonials, 
  useProcessSteps,
  useFAQs,
  useStats,
  useProjectCategories,
  useAllPageContent,
  useSiteSettings,
  useMarqueeItems
} from '@/hooks/useContent';
import { useTranslation } from '@/i18n/useTranslation';
import { SEO, useSEO } from '@/components/SEO';
import PremiumHero from '@/components/ui/PremiumHero';
import FeaturedProjectsStack from '@/components/ui/FeaturedProjectsStack';
import EnhancedProjectCard from '@/components/ui/EnhancedProjectCard';
import ProcessStepsList from '@/components/ui/ProcessStepsList';
import WhyChooseUsBand from '@/components/ui/WhyChooseUsBand';
import TestimonialSlider from '@/components/ui/TestimonialSlider';
import FAQAccordion from '@/components/ui/FAQAccordion';
import CTABand from '@/components/ui/CTABand';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import SectionHeader from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import InverseSurface from '@/components/ui/InverseSurface';
import PremiumMarqueeBand from '@/components/home/PremiumMarqueeBand';

const OurWorkPage = () => {
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  const { getMetadata } = useSEO();
  const seoData = getMetadata('ourWork');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('q') || '';
  
  const [activeCategory, setActiveCategory] = useState(categoryParam || 'all');
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [displayCount, setDisplayCount] = useState(9);

  // Fetch data
  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useProjects();
  const { data: categories = [], isLoading: categoriesLoading } = useProjectCategories();
  const { data: testimonials = [], isLoading: testimonialsLoading } = useTestimonials();
  const { data: processSteps = [], isLoading: processLoading } = useProcessSteps();
  const { data: faqs = [], isLoading: faqsLoading } = useFAQs('work');
  const { data: stats = [], isLoading: statsLoading } = useStats();
  const { data: pageContent = [] } = useAllPageContent('our-work');
  const { data: siteSettings } = useSiteSettings();
  const { data: marqueeItems = [] } = useMarqueeItems(1);

  // Get page content sections
  const heroContent = pageContent.find(c => c.section_key === 'hero') || {};
  const projectsHeaderContent = pageContent.find(c => c.section_key === 'projects-header') || {};
  const processContent = pageContent.find(c => c.section_key === 'process') || {};
  const impactContent = pageContent.find(c => c.section_key === 'impact') || {};
  const testimonialsHeaderContent = pageContent.find(c => c.section_key === 'testimonials-header') || {};
  const faqHeaderContent = pageContent.find(c => c.section_key === 'faq-header') || {};
  const ctaContent = pageContent.find(c => c.section_key === 'cta') || {};

  // Helper to get icon component
  const getIcon = (iconName) => {
    const Icon = LucideIcons[iconName];
    return Icon || LucideIcons.Folder;
  };

  // Filter active projects
  const activeProjects = projects.filter(p => p.is_active);

  // Get featured projects for hero (max 3)
  const featuredProjects = activeProjects
    .filter(p => p.is_featured)
    .slice(0, 3)
    .map(project => ({
      ...project,
      // Ensure icon is available
      icon: project.project_categories?.icon || 'Folder',
    }));

  // Count projects per category
  const categoriesWithCounts = categories.map(cat => {
    const count = cat.slug === 'all' 
      ? activeProjects.length
      : activeProjects.filter(p => p.project_categories?.slug === cat.slug).length;
    
    return {
      ...cat,
      count,
      icon: getIcon(cat.icon),
    };
  });

  // Filter projects by category and search
  let filteredProjects = activeCategory === 'all' 
    ? activeProjects
    : activeProjects.filter(project => project.project_categories?.slug === activeCategory);

  // Apply search filter
  if (searchTerm.trim()) {
    const query = searchTerm.toLowerCase();
    filteredProjects = filteredProjects.filter(project => {
      const titleEn = (project.title_en || project.title || '').toLowerCase();
      const titleAr = (project.title_ar || '').toLowerCase();
      const descEn = (project.short_description_en || project.short_description || '').toLowerCase();
      const descAr = (project.short_description_ar || '').toLowerCase();
      
      return titleEn.includes(query) || titleAr.includes(query) || 
             descEn.includes(query) || descAr.includes(query);
    });
  }

  const displayedProjects = filteredProjects.slice(0, displayCount);
  const hasMore = displayCount < filteredProjects.length;

  // Handle category change
  const handleCategoryChange = (slug) => {
    setActiveCategory(slug);
    setDisplayCount(9); // Reset
    
    const newParams = new URLSearchParams(searchParams);
    if (slug === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', slug);
    }
    setSearchParams(newParams, { replace: true });
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setDisplayCount(9); // Reset
    
    const newParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newParams.set('q', value);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams, { replace: true });
  };

  // Load more
  const loadMore = () => {
    setDisplayCount(prev => prev + 9);
  };

  // Contact data for FAQ sidebar
  const contactData = {
    email: siteSettings?.primary_email || 'info@sentivra.com',
    phone: siteSettings?.primary_phone || '+20 123 456 7890',
    whatsapp: siteSettings?.whatsapp_number || '+20 123 456 7890',
    location: siteSettings?.location || (isRTL ? 'القاهرة، مصر' : 'Cairo, Egypt'),
  };

  // Impact stats with proper icons
  const impactStats = (stats && stats.length > 0) ? stats.map(stat => ({
    value: stat?.value || 0,
    suffix: stat?.suffix || '',
    icon: getIcon(stat?.icon || 'CheckCircle'),
    label: isRTL ? (stat?.label_ar || stat?.label) : (stat?.label_en || stat?.label),
  })) : [
    { value: 50, suffix: '+', icon: getIcon('CheckCircle'), label: isRTL ? 'مشروع مُنجَز' : 'Projects Delivered' },
    { value: 30, suffix: '+', icon: getIcon('Users'), label: isRTL ? 'عميل راضٍ' : 'Happy Clients' },
    { value: 10, suffix: '+', icon: getIcon('TrendingUp'), label: isRTL ? 'صناعة مخدومة' : 'Industries Served' },
    { value: 98, suffix: '%', icon: getIcon('Award'), label: isRTL ? 'رضا العملاء' : 'Client Satisfaction' },
  ];

  // Filter real testimonials (hide demo ones in production)
  const realTestimonials = import.meta.env.PROD 
    ? testimonials.filter(t => !t.is_demo)
    : testimonials;

  // Show loading state
  if (projectsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (projectsError) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary-deep mb-2">
            {isRTL ? 'خطأ في التحميل' : 'Loading Error'}
          </h2>
          <p className="text-text-muted mb-6">{projectsError.message}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            {isRTL ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO 
        title={seoData.title}
        description={seoData.description}
        type="website"
      />
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
      </Helmet>

      {/* Premium Hero with Featured Projects Stack */}
      <PremiumHero
        breadcrumbs={[
          { label: isRTL ? 'الرئيسية' : 'Home', href: '/' },
          { label: isRTL ? (heroContent.label_ar || 'أعمالنا') : (heroContent.label_en || 'Our Work') }
        ]}
        label={isRTL ? heroContent.label_ar : heroContent.label_en}
        title={isRTL ? heroContent.title_ar : heroContent.title_en}
        titleAccent={isRTL ? heroContent.title_accent_ar : heroContent.title_accent_en}
        description={isRTL ? heroContent.description_ar : heroContent.description_en}
        primaryButton={heroContent.primary_button_label_en ? {
          label: isRTL ? heroContent.primary_button_label_ar : heroContent.primary_button_label_en,
          href: heroContent.primary_button_link || '#projects',
        } : null}
        secondaryButton={heroContent.secondary_button_label_en ? {
          label: isRTL ? heroContent.secondary_button_label_ar : heroContent.secondary_button_label_en,
          href: heroContent.secondary_button_link || '/contact',
        } : null}
        constellationItems={[]} // Don't use constellation, use custom visual
        height={580}
      >
        {/* Custom hero visual slot - Featured Projects Stack */}
        <FeaturedProjectsStack projects={featuredProjects} />
      </PremiumHero>

      {/* Client Logos Marquee */}
      {marqueeItems.length > 0 && (
        <PremiumMarqueeBand items={marqueeItems} />
      )}

      {/* Projects Section */}
      <Section id="projects" spacing="xl" className="bg-frost-soft/50">
        <Container>
          {/* Section Header */}
          <SectionHeader
            label={isRTL ? projectsHeaderContent.label_ar : projectsHeaderContent.label_en}
            title={isRTL ? projectsHeaderContent.title_ar : projectsHeaderContent.title_en}
            subtitle={isRTL ? projectsHeaderContent.description_ar : projectsHeaderContent.description_en}
            centered
          />

          {/* Category Filter + Search */}
          <div className={`flex flex-col lg:flex-row gap-6 mb-12 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
            {/* Category chips */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div 
                className={`flex gap-2 pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                role="tablist"
                aria-label={isRTL ? 'فئات المشاريع' : 'Project categories'}
              >
                {categoriesWithCounts.map((cat) => (
                  <button
                    key={cat.id}
                    role="tab"
                    aria-selected={activeCategory === cat.slug}
                    aria-controls="projects-grid"
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`
                      relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                      ${activeCategory === cat.slug
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 text-text-muted hover:text-primary-deep border border-frost hover:border-primary/30'
                      }
                    `}
                  >
                    {cat.icon && <cat.icon className="w-4 h-4" />}
                    <span>{isRTL ? cat.name_ar : cat.name_en}</span>
                    <span className={`text-xs ${activeCategory === cat.slug ? 'opacity-90' : 'opacity-60'}`}>
                      ({cat.count})
                    </span>
                    {activeCategory === cat.slug && (
                      <motion.div
                        layoutId="activeCategory"
                        className="absolute inset-0 bg-primary rounded-xl -z-10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={isRTL ? 'ابحث في المشاريع...' : 'Search projects...'}
                className={`
                  w-full lg:w-64 h-11 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} 
                  bg-white dark:bg-slate-800 border border-frost rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                  text-sm
                `}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          {/* Projects Grid */}
          <AnimatePresence mode="wait">
            {filteredProjects.length > 0 ? (
              <motion.div
                key={`${activeCategory}-${searchTerm}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                id="projects-grid"
                role="region"
                aria-live="polite"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {displayedProjects.map((project, index) => (
                    <EnhancedProjectCard
                      key={project.id}
                      project={project}
                      delay={index * 0.05}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-12">
                    <Button
                      onClick={loadMore}
                      size="lg"
                      variant="outline"
                      className={`
                        border-2 border-primary text-primary hover:bg-primary hover:text-white 
                        px-8 py-3 rounded-lg font-semibold group transition-all
                        ${isRTL ? 'flex-row-reverse' : ''}
                      `}
                    >
                      <span>
                        {isRTL 
                          ? `عرض المزيد (${displayCount} من ${filteredProjects.length})`
                          : `Load More (${displayCount} of ${filteredProjects.length})`
                        }
                      </span>
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-20"
                role="status"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-frost-soft mb-6">
                  <Search className="w-10 h-10 text-text-muted" />
                </div>
                <h3 className="text-2xl font-bold text-primary-deep mb-2">
                  {isRTL ? 'لم نجد مشاريع' : 'No Projects Found'}
                </h3>
                <p className="text-text-muted mb-6 max-w-md mx-auto">
                  {isRTL 
                    ? searchTerm 
                      ? 'لم نجد أي مشاريع تطابق بحثك. جرب كلمات مختلفة.'
                      : 'لا توجد مشاريع في هذه الفئة حالياً.'
                    : searchTerm
                      ? 'No projects match your search. Try different keywords.'
                      : 'No projects in this category yet.'
                  }
                </p>
                {(activeCategory !== 'all' || searchTerm) && (
                  <Button
                    onClick={() => {
                      handleCategoryChange('all');
                      handleSearch('');
                    }}
                    className="bg-primary hover:bg-primary-dark text-white"
                  >
                    {isRTL ? 'عرض كل المشاريع' : 'View All Projects'}
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </Section>

      {/* Process Section */}
      {processSteps.length > 0 && (
        <Section id="process" spacing="xl" className="bg-color-background">
          <Container>
            <div className="text-center mb-16">
              <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                {isRTL ? processContent.label_ar : processContent.label_en}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-primary-deep mb-6">
                {isRTL ? processContent.title_ar : processContent.title_en}
              </h2>
              <p className="text-xl text-text-muted max-w-3xl mx-auto mb-8">
                {isRTL ? processContent.description_ar : processContent.description_en}
              </p>
              {processContent.primary_button_label_en && (
                <a href={processContent.primary_button_link || '/contact'}>
                  <Button 
                    size="lg" 
                    className={`
                      bg-primary hover:bg-primary-dark text-white px-8 py-4 text-lg rounded-lg
                      font-semibold group ${isRTL ? 'flex-row-reverse' : ''}
                    `}
                  >
                    {isRTL ? processContent.primary_button_label_ar : processContent.primary_button_label_en}
                    <LucideIcons.ArrowRight className={`
                      h-5 w-5 ${isRTL ? 'mr-2 group-hover:-translate-x-1 rotate-180' : 'ml-2 group-hover:translate-x-1'} 
                      transition-transform
                    `} />
                  </Button>
                </a>
              )}
            </div>

            <ProcessStepsList steps={processSteps} />
          </Container>
        </Section>
      )}

      {/* Impact Stats Band */}
      <WhyChooseUsBand
        label={isRTL ? impactContent.label_ar : impactContent.label_en}
        title={isRTL ? impactContent.title_ar : impactContent.title_en}
        description={isRTL ? impactContent.description_ar : impactContent.description_en}
        stats={impactStats}
      />

      {/* Testimonials Section - Only show if real testimonials exist */}
      {realTestimonials.length > 0 && (
        <Section id="testimonials" spacing="xl" className="bg-color-background">
          <Container>
            <div className="text-center mb-16">
              <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                {isRTL ? testimonialsHeaderContent.label_ar : testimonialsHeaderContent.label_en}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-primary-deep mb-4">
                {isRTL ? testimonialsHeaderContent.title_ar : testimonialsHeaderContent.title_en}
              </h2>
              <p className="text-xl text-text-muted max-w-3xl mx-auto">
                {isRTL ? testimonialsHeaderContent.description_ar : testimonialsHeaderContent.description_en}
              </p>
            </div>

            <TestimonialSlider testimonials={realTestimonials} />
          </Container>
        </Section>
      )}

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <Section id="faq" spacing="xl" className="bg-frost-soft/50">
          <Container>
            <div className="text-center mb-16">
              <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                {isRTL ? faqHeaderContent.label_ar : faqHeaderContent.label_en}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-primary-deep mb-4">
                {isRTL ? faqHeaderContent.title_ar : faqHeaderContent.title_en}
              </h2>
              <p className="text-xl text-text-muted max-w-3xl mx-auto">
                {isRTL ? faqHeaderContent.description_ar : faqHeaderContent.description_en}
              </p>
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-start ${isRTL ? 'lg:grid-flow-dense' : ''}`}>
              {/* Contact Panel (Sticky) */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={`lg:sticky lg:top-24 ${isRTL ? 'lg:col-start-2' : ''}`}
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-frost p-8">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

                  <div className="relative">
                    <h3 className="text-2xl font-bold text-primary-deep mb-6">
                      {isRTL ? 'تواصل معنا' : 'Get in Touch'}
                    </h3>

                    <div className="space-y-4">
                      <a
                        href={`mailto:${contactData.email}`}
                        className={`flex items-center gap-4 p-4 rounded-xl bg-color-background/80 backdrop-blur-sm border border-frost hover:border-primary/30 transition-all group ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-text-muted mb-1">{isRTL ? 'البريد الإلكتروني' : 'Email'}</p>
                          <p className="font-semibold text-primary-deep" dir="ltr">{contactData.email}</p>
                        </div>
                      </a>

                      <a
                        href={`tel:${contactData.phone.replace(/\s/g, '')}`}
                        className={`flex items-center gap-4 p-4 rounded-xl bg-color-background/80 backdrop-blur-sm border border-frost hover:border-primary/30 transition-all group ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Phone className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-text-muted mb-1">{isRTL ? 'الهاتف' : 'Phone'}</p>
                          <p className="font-semibold text-primary-deep" dir="ltr">{contactData.phone}</p>
                        </div>
                      </a>

                      <a
                        href={`https://wa.me/${contactData.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-4 p-4 rounded-xl bg-color-background/80 backdrop-blur-sm border border-frost hover:border-primary/30 transition-all group ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <MessageCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-text-muted mb-1">WhatsApp</p>
                          <p className="font-semibold text-primary-deep" dir="ltr">{contactData.whatsapp}</p>
                        </div>
                      </a>

                      <div className={`flex items-start gap-4 p-4 rounded-xl bg-color-background/80 backdrop-blur-sm border border-frost ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-text-muted mb-1">{isRTL ? 'الموقع' : 'Location'}</p>
                          <p className="font-semibold text-primary-deep">{contactData.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* FAQ Accordion */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={isRTL ? 'lg:col-start-1 lg:row-start-1' : ''}
              >
                <FAQAccordion faqs={faqs} />
              </motion.div>
            </div>
          </Container>
        </Section>
      )}

      {/* Final CTA Band */}
      <CTABand
        label={isRTL ? ctaContent.label_ar : ctaContent.label_en}
        title={isRTL ? ctaContent.title_ar : ctaContent.title_en}
        description={isRTL ? ctaContent.description_ar : ctaContent.description_en}
        primaryButton={ctaContent.primary_button_label_en ? {
          label: isRTL ? ctaContent.primary_button_label_ar : ctaContent.primary_button_label_en,
          href: ctaContent.primary_button_link || '/contact',
        } : null}
        secondaryButton={ctaContent.secondary_button_label_en ? {
          label: isRTL ? ctaContent.secondary_button_label_ar : ctaContent.secondary_button_label_en,
          href: ctaContent.secondary_button_link || '/services',
        } : null}
      />

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </motion.div>
  );
};

export default OurWorkPage;
