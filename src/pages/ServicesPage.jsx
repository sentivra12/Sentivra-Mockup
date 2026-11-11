import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Mail, Phone, MessageCircle, MapPin } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { 
  useServices, 
  useFAQs, 
  useServiceCategories,
  usePageContent,
  useAllPageContent,
  useSiteSettings 
} from '@/hooks/useContent';
import { useTranslation } from '@/i18n/useTranslation';
import { SEO, useSEO } from '@/components/SEO';
import PremiumHero from '@/components/ui/PremiumHero';
import FeatureStrip from '@/components/ui/FeatureStrip';
import CategoryFilter from '@/components/ui/CategoryFilter';
import EnhancedServiceCard from '@/components/ui/EnhancedServiceCard';
import WhyChooseUsBand from '@/components/ui/WhyChooseUsBand';
import FAQAccordion from '@/components/ui/FAQAccordion';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import PremiumCTA from '@/components/ui/PremiumCTA';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import InverseSurface from '@/components/ui/InverseSurface';

const ServicesPage = () => {
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  const { getMetadata } = useSEO();
  const seoData = getMetadata('services');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState(categoryParam || 'all');

  // Fetch data
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const { data: categories = [], isLoading: categoriesLoading } = useServiceCategories();
  const { data: faqs = [], isLoading: faqsLoading } = useFAQs('services');
  const { data: pageContent = [] } = useAllPageContent('services');
  const { data: siteSettings } = useSiteSettings();

  // Helper function to get icon component
  const getIcon = (iconName) => {
    const Icon = LucideIcons[iconName];
    return Icon || LucideIcons.Box;
  };

  // Get page content sections
  const heroContent = pageContent.find(c => c.section_key === 'hero') || {};
  const listContent = pageContent.find(c => c.section_key === 'services-list') || {};
  const whyChooseContent = pageContent.find(c => c.section_key === 'why-choose-us') || {};
  const faqContent = pageContent.find(c => c.section_key === 'faq') || {};

  // Filter active services
  const activeServices = services.filter(s => s.is_active);

  // Count services per category
  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    count: activeServices.filter(s => s.category_id === cat.id).length,
  }));

  // Filter services by category
  const filteredServices = activeCategory === 'all' 
    ? activeServices
    : activeServices.filter(service => {
        const category = categories.find(cat => cat.id === service.category_id);
        return category?.slug === activeCategory;
      });

  // Build constellation items for hero
  const constellationItems = activeServices.slice(0, 6).map(service => ({
    id: service.id,
    icon: getIcon(service.icon),
    name: isRTL ? (service.title_ar || service.title) : (service.title_en || service.title),
  }));

  // Contact data for FAQ sidebar
  const contactData = {
    email: siteSettings?.primary_email || 'info@sentivra.com',
    phone: siteSettings?.primary_phone || '+20 123 456 7890',
    whatsapp: siteSettings?.whatsapp_number || '+20 123 456 7890',
    location: siteSettings?.location || (isRTL ? 'القاهرة، مصر' : 'Cairo, Egypt'),
  };

  // Stats for Why Choose Us (temporary hardcoded until stats table is added)
  const stats = [
    { value: 50, suffix: '+', icon: LucideIcons.CheckCircle, label: isRTL ? 'مشروع ناجح' : 'Successful Projects' },
    { value: 98, suffix: '%', icon: LucideIcons.Users, label: isRTL ? 'رضا العملاء' : 'Client Satisfaction' },
    { value: 5, suffix: '+', icon: LucideIcons.Award, label: isRTL ? 'سنوات الخبرة' : 'Years Experience' },
    { value: 24, suffix: '/7', icon: LucideIcons.Clock, label: isRTL ? 'دعم مستمر' : 'Ongoing Support' },
  ];

  // Handle category change with URL sync
  const handleCategoryChange = (slug) => {
    setActiveCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams, { replace: true });
  };

  // Update category from URL on mount and when it changes
  useEffect(() => {
    if (categoryParam && categoryParam !== activeCategory) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  // Show loading state
  if (servicesLoading || categoriesLoading) {
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

      {/* Premium Hero with Constellation */}
      <PremiumHero
        breadcrumbs={[
          { label: t('nav.home'), href: '/' },
          { label: t('nav.services') },
        ]}
        label={isRTL ? heroContent.label_ar : heroContent.label_en}
        title={isRTL ? heroContent.title_ar : heroContent.title_en}
        titleAccent={isRTL ? heroContent.title_accent_ar : heroContent.title_accent_en}
        description={isRTL ? heroContent.description_ar : heroContent.description_en}
        primaryButton={{
          label: isRTL ? heroContent.primary_button_label_ar : heroContent.primary_button_label_en,
          href: heroContent.primary_button_link || '#services-list',
        }}
        secondaryButton={{
          label: isRTL ? heroContent.secondary_button_label_ar : heroContent.secondary_button_label_en,
          href: heroContent.secondary_button_link || '/contact',
        }}
        backgroundImageUrl={heroContent.background_image_url}
        constellationItems={constellationItems}
        height={580}
      />

      {/* Feature Strip */}
      <FeatureStrip features={[]} />

      {/* Services Explorer Section */}
      <Section id="services-list" spacing="xl" className="bg-frost-soft/50">
        <Container>
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              {isRTL ? listContent.label_ar : listContent.label_en}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-primary-deep mb-4">
              {isRTL ? listContent.title_ar : listContent.title_en}
            </h2>
            <p className="text-xl text-text-muted max-w-3xl mx-auto">
              {isRTL ? listContent.description_ar : listContent.description_en}
            </p>
          </motion.div>

          <div className={`flex gap-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Category Filter (Sidebar on desktop, chips on mobile) */}
            <CategoryFilter
              categories={categoriesWithCounts}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />

            {/* Services Grid */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {filteredServices.length > 0 ? (
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredServices.map((service, index) => (
                      <EnhancedServiceCard
                        key={service.id}
                        service={service}
                        delay={index * 0.05}
                        language={language}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-20"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-frost-soft mb-6">
                      <LucideIcons.Search className="w-10 h-10 text-text-muted" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary-deep mb-2">
                      {isRTL ? 'لا توجد خدمات' : 'No Services Found'}
                    </h3>
                    <p className="text-text-muted mb-6">
                      {isRTL 
                        ? 'لم نجد أي خدمات في هذه الفئة حالياً.' 
                        : 'We couldn\'t find any services in this category right now.'}
                    </p>
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                    >
                      {isRTL ? 'عرض كل الخدمات' : 'View All Services'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Container>
      </Section>

      {/* Why Choose Us Band */}
      <WhyChooseUsBand
        label={isRTL ? whyChooseContent.label_ar : whyChooseContent.label_en}
        title={isRTL ? whyChooseContent.title_ar : whyChooseContent.title_en}
        description={isRTL ? whyChooseContent.description_ar : whyChooseContent.description_en}
        stats={stats}
        ctaButton={{
          label: isRTL ? whyChooseContent.primary_button_label_ar : whyChooseContent.primary_button_label_en,
          href: whyChooseContent.primary_button_link || '/contact',
        }}
      />

      {/* FAQ Section */}
      <Section id="faq" spacing="xl" className="bg-color-background">
        <Container>
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              {isRTL ? faqContent.label_ar : faqContent.label_en}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-primary-deep mb-4">
              {isRTL ? faqContent.title_ar : faqContent.title_en}
            </h2>
            <p className="text-xl text-text-muted max-w-3xl mx-auto">
              {isRTL ? faqContent.description_ar : faqContent.description_en}
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
                {/* Decorative gradient orbs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative">
                  <h3 className="text-2xl font-bold text-primary-deep mb-6">
                    {isRTL ? 'تواصل معنا' : 'Get in Touch'}
                  </h3>

                  {/* Contact Info */}
                  <div className="space-y-4 mb-8">
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

      {/* Final CTA Band (reuse from Home if exists) */}
      <PremiumCTA />

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </motion.div>
  );
};

export default ServicesPage;
