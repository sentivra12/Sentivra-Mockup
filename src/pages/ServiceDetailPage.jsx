import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ExternalLink } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useServices, useServiceCategories } from '@/hooks/useContent';
import { useTranslation } from '@/i18n/useTranslation';
import { SEO } from '@/components/SEO';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import InverseSurface from '@/components/ui/InverseSurface';
import PremiumServiceCard from '@/components/ui/PremiumServiceCard';
import CTABand from '@/components/ui/CTABand';
import { Button } from '@/components/ui/button';

/**
 * ServiceDetailPage - Full detail page for a single service
 * Route: /services/:slug
 * 
 * Sections:
 * 1. Hero with breadcrumb
 * 2. Overview with long description
 * 3. Key features list
 * 4. Technologies used
 * 5. Related services
 * 6. Final CTA
 */
const ServiceDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';

  // Fetch data
  const { data: services = [], isLoading } = useServices();
  const { data: categories = [] } = useServiceCategories();

  // Find the service
  const service = services.find(s => s.slug === slug && s.is_active);
  
  // Get category info
  const category = categories.find(cat => cat.id === service?.category_id);

  // Get icon component
  const getIcon = (iconName) => {
    const Icon = LucideIcons[iconName];
    return Icon || LucideIcons.Box;
  };

  // Parse features array
  const parseFeatures = (featuresData) => {
    if (!featuresData) return [];
    if (Array.isArray(featuresData)) return featuresData;
    try {
      return JSON.parse(featuresData);
    } catch {
      return [];
    }
  };

  // Parse technologies
  const parseTechnologies = (techData) => {
    if (!techData) return [];
    if (Array.isArray(techData)) return techData;
    try {
      return JSON.parse(techData);
    } catch {
      return [];
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // 404 if service not found
  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-full bg-frost-soft flex items-center justify-center mx-auto mb-6">
            <LucideIcons.AlertCircle className="w-10 h-10 text-text-muted" />
          </div>
          <h1 className="text-3xl font-bold text-primary-deep mb-4">
            {isRTL ? 'الخدمة غير موجودة' : 'Service Not Found'}
          </h1>
          <p className="text-text-muted mb-8">
            {isRTL 
              ? 'عذراً، لم نتمكن من العثور على الخدمة المطلوبة.'
              : 'Sorry, we couldn\'t find the service you\'re looking for.'}
          </p>
          <Button onClick={() => navigate('/services')} className="bg-primary hover:bg-primary-dark text-white">
            {isRTL ? 'عرض كل الخدمات' : 'View All Services'}
          </Button>
        </div>
      </div>
    );
  }

  // Service data
  const title = isRTL ? (service.title_ar || service.title) : (service.title_en || service.title);
  const shortDescription = isRTL 
    ? (service.short_description_ar || service.short_description) 
    : (service.short_description_en || service.short_description);
  const longDescription = isRTL 
    ? (service.long_description_ar || service.long_description) 
    : (service.long_description_en || service.long_description);
  
  const features = parseFeatures(service.features);
  const technologies = parseTechnologies(service.technologies);
  const Icon = getIcon(service.icon);

  // Related services (same category, excluding current)
  const relatedServices = services
    .filter(s => s.is_active && s.category_id === service.category_id && s.slug !== slug)
    .slice(0, 3);

  // SEO
  const seoTitle = `${title} - Sentivra`;
  const seoDescription = shortDescription || longDescription?.substring(0, 160);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO 
        title={seoTitle}
        description={seoDescription}
        type="article"
      />
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
      </Helmet>

      {/* Hero Section */}
      <InverseSurface withGrid className="pt-24 pb-12 md:pt-32 md:pb-16">
        <Container>
          {/* Breadcrumb */}
          <nav 
            className={`flex items-center gap-2 text-sm text-inverse-fg-muted mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}
            aria-label="Breadcrumb"
          >
            <Link to="/" className="hover:text-inverse-accent transition-colors">
              {t('nav.home')}
            </Link>
            <span>/</span>
            <Link to="/services" className="hover:text-inverse-accent transition-colors">
              {t('nav.services')}
            </Link>
            <span>/</span>
            <span className="text-inverse-fg font-medium">{title}</span>
          </nav>

          {/* Back Button */}
          <button
            onClick={() => navigate('/services')}
            className={`inline-flex items-center gap-2 text-inverse-fg-muted hover:text-inverse-accent transition-colors mb-8 group ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`w-4 h-4 group-hover:-translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-sm font-medium">
              {isRTL ? 'العودة للخدمات' : 'Back to Services'}
            </span>
          </button>

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isRTL ? 'lg:grid-flow-dense' : ''}`}>
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={isRTL ? 'lg:col-start-2' : ''}
            >
              {/* Category Badge */}
              {category && (
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-inverse-fg/10 border border-inverse-border-subtle text-inverse-accent text-sm font-semibold backdrop-blur-sm">
                    <Icon className="w-4 h-4" />
                    {isRTL ? category.name_ar : category.name_en}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-inverse-fg leading-tight mb-6">
                {title}
              </h1>

              {/* Short Description */}
              <p className="text-xl text-inverse-fg-muted leading-relaxed mb-8">
                {shortDescription}
              </p>

              {/* CTA Button */}
              <Link to="/contact">
                <Button 
                  size="lg"
                  className="bg-inverse-accent hover:bg-inverse-accent/90 text-inverse-bg font-semibold px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {isRTL ? 'ابدأ مشروعك' : 'Start Your Project'}
                  <LucideIcons.ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </Button>
              </Link>
            </motion.div>

            {/* Right: Icon Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`relative ${isRTL ? 'lg:col-start-1 lg:row-start-1' : ''}`}
            >
              <div className="relative aspect-square max-w-md mx-auto">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-inverse-accent/20 via-purple-500/10 to-pink-500/10 rounded-3xl rotate-6" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-inverse-accent/20 to-pink-500/10 rounded-3xl -rotate-6" />
                
                {/* Icon Container */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <div className="w-48 h-48 rounded-3xl bg-inverse-fg/10 backdrop-blur-md border border-inverse-border-subtle flex items-center justify-center shadow-2xl">
                    <Icon className="w-24 h-24 text-inverse-accent" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Floating orbs */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-8 right-8 w-16 h-16 rounded-full bg-inverse-accent/20 blur-2xl"
                />
                <motion.div
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-8 left-8 w-20 h-20 rounded-full bg-purple-500/20 blur-2xl"
                />
              </div>
            </motion.div>
          </div>
        </Container>
      </InverseSurface>

      {/* Overview Section */}
      {longDescription && (
        <Section spacing="lg" className="bg-color-background">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary-deep mb-6">
                {isRTL ? 'نظرة عامة' : 'Overview'}
              </h2>
              <div className="prose prose-lg max-w-none text-text-muted leading-relaxed">
                <p>{longDescription}</p>
              </div>
            </motion.div>
          </Container>
        </Section>
      )}

      {/* Key Features Section */}
      {features.length > 0 && (
        <Section spacing="lg" className="bg-frost-soft/50">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary-deep mb-8">
                {isRTL ? 'المميزات الرئيسية' : 'Key Features'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex items-start gap-3 p-4 rounded-xl bg-color-background border border-frost hover:border-primary/30 hover:shadow-card transition-all ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                    </div>
                    <p className="text-primary-deep font-medium leading-relaxed">{feature}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Container>
        </Section>
      )}

      {/* Technologies Section */}
      {technologies.length > 0 && (
        <Section spacing="lg" className="bg-color-background">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary-deep mb-8">
                {isRTL ? 'التقنيات المستخدمة' : 'Technologies We Use'}
              </h2>
              <div className={`flex flex-wrap gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {technologies.map((tech, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="px-5 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-semibold hover:bg-primary/20 transition-colors"
                  >
                    {tech}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Container>
        </Section>
      )}

      {/* Related Services Section */}
      {relatedServices.length > 0 && (
        <Section spacing="xl" className="bg-frost-soft/50">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary-deep mb-4">
                {isRTL ? 'خدمات ذات صلة' : 'Related Services'}
              </h2>
              <p className="text-lg text-text-muted">
                {isRTL 
                  ? 'خدمات أخرى قد تهمك في نفس المجال'
                  : 'Other services you might be interested in'}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedServices.map((relatedService, index) => (
                <PremiumServiceCard
                  key={relatedService.id}
                  service={relatedService}
                  delay={index * 0.1}
                />
              ))}
            </div>

            {/* View All Link */}
            <div className="text-center mt-12">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all group"
              >
                <span>{isRTL ? 'عرض كل الخدمات' : 'View All Services'}</span>
                <LucideIcons.ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
              </Link>
            </div>
          </Container>
        </Section>
      )}

      {/* Final CTA */}
      <InverseSurface withTopGlow className="py-16 md:py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-inverse-fg mb-6">
              {isRTL ? 'مستعد للبدء؟' : 'Ready to Get Started?'}
            </h2>
            <p className="text-xl text-inverse-fg-muted mb-8">
              {isRTL 
                ? 'دعنا نحول رؤيتك إلى حقيقة. تواصل معنا اليوم لمناقشة مشروعك.'
                : 'Let\'s turn your vision into reality. Contact us today to discuss your project.'}
            </p>
            <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <Link to="/contact">
                <Button 
                  size="lg"
                  className="bg-inverse-accent hover:bg-inverse-accent/90 text-inverse-bg font-semibold px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {isRTL ? 'تواصل معنا' : 'Contact Us'}
                  <LucideIcons.ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </Button>
              </Link>
              <Link to="/our-work">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-inverse-border text-inverse-fg hover:bg-inverse-fg/10 font-semibold px-8 py-6 rounded-lg backdrop-blur-sm"
                >
                  {isRTL ? 'شاهد أعمالنا' : 'View Our Work'}
                  <ExternalLink className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </InverseSurface>
    </motion.div>
  );
};

export default ServiceDetailPage;
