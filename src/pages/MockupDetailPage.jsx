import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Monitor, Tablet, Smartphone, Check } from 'lucide-react';
import { 
  useMockups, 
  useMockupCategories,
  useSiteSettings 
} from '@/hooks/useContent';
import { useTranslation } from '@/i18n/useTranslation';
import { SEO } from '@/components/SEO';
import DeviceFrame from '@/components/mockups/DeviceFrame';
import EnhancedMockupCard from '@/components/mockups/EnhancedMockupCard';
import InverseSurface from '@/components/ui/InverseSurface';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import { Button } from '@/components/ui/button';

/**
 * MockupDetailPage - Full case study page for a single mockup
 * Route: /mockups/:slug
 * 
 * Sections:
 * 1. Hero with breadcrumb & device preview
 * 2. Device switcher (Desktop/Tablet/Mobile)
 * 3. Description
 * 4. What's Included list
 * 5. Image gallery (if available)
 * 6. Related mockups (same category)
 * 7. Final CTA
 */
const MockupDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';

  const [activeDevice, setActiveDevice] = useState('desktop');

  // Fetch data
  const { data: mockups = [], isLoading } = useMockups();
  const { data: categories = [] } = useMockupCategories();
  const { data: siteSettings } = useSiteSettings();

  // Find the mockup
  const mockup = mockups.find(m => m.slug === slug && m.is_active);
  const category = Array.isArray(categories) ? categories.find(c => c.id === mockup?.category_id) : null;

  // Get bilingual content
  const title = mockup && (isRTL ? (mockup.title_ar || mockup.title) : (mockup.title_en || mockup.title));
  const shortDescription = mockup && (isRTL 
    ? (mockup.short_description_ar || mockup.short_description) 
    : (mockup.short_description_en || mockup.short_description));
  const longDescription = mockup && (isRTL 
    ? (mockup.long_description_ar || mockup.long_description) 
    : (mockup.long_description_en || mockup.long_description));
  const categoryName = isRTL ? category?.name_ar : category?.name_en;

  // Parse what's included
  const whatsIncluded = (() => {
    if (!mockup?.whats_included) return [];
    if (Array.isArray(mockup.whats_included)) return mockup.whats_included;
    try {
      return JSON.parse(mockup.whats_included);
    } catch {
      return [];
    }
  })();

  // Related mockups (same category)
  const relatedMockups = mockups
    .filter(m => m.is_active && m.category_id === mockup?.category_id && m.slug !== slug)
    .slice(0, 3);

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

  // 404 if mockup not found
  if (!mockup) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-full bg-frost-soft flex items-center justify-center mx-auto mb-6">
            <Monitor className="w-10 h-10 text-text-muted" />
          </div>
          <h1 className="text-3xl font-bold text-primary-deep mb-4">
            {isRTL ? 'التصميم غير موجود' : 'Mockup Not Found'}
          </h1>
          <p className="text-text-muted mb-8">
            {isRTL 
              ? 'عذراً، لم نتمكن من العثور على التصميم المطلوب.'
              : 'Sorry, we couldn\'t find the mockup you\'re looking for.'}
          </p>
          <Button onClick={() => navigate('/mockups')} className="bg-primary hover:bg-primary-dark text-white">
            {isRTL ? 'عرض كل التصاميم' : 'View All Mockups'}
          </Button>
        </div>
      </div>
    );
  }

  // SEO
  const seoTitle = `${title} - Sentivra Mockups`;
  const seoDescription = shortDescription || longDescription?.substring(0, 160);
  const seoImage = mockup.cover_image_url || mockup.desktop_screenshot_url;

  const handleWhatsApp = () => {
    const phoneNumber = siteSettings?.whatsapp_number || '201558952126';
    const message = isRTL
      ? `مرحباً! أنا مهتم بتصميم "${title}". أريد مناقشة خيارات التخصيص.`
      : `Hello! I'm interested in the "${title}" design. I'd like to discuss customization options.`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO 
        title={seoTitle}
        description={seoDescription}
        image={seoImage}
        type="article"
      />
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        {seoImage && <meta property="og:image" content={seoImage} />}
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
            <Link to="/mockups" className="hover:text-inverse-accent transition-colors">
              {t('nav.mockups')}
            </Link>
            <span>/</span>
            <span className="text-inverse-fg font-medium">{title}</span>
          </nav>

          {/* Back Button */}
          <button
            onClick={() => navigate('/mockups')}
            className={`inline-flex items-center gap-2 text-inverse-fg-muted hover:text-inverse-accent transition-colors mb-8 group ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`w-4 h-4 group-hover:-translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-sm font-medium">
              {isRTL ? 'العودة للتصاميم' : 'Back to Mockups'}
            </span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Category Badge */}
              {categoryName && (
                <div className="mb-4">
                  <span 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold backdrop-blur-sm"
                    style={{
                      backgroundColor: `${category?.color}20`,
                      color: category?.color || '#3b82f6',
                      borderColor: `${category?.color}40`
                    }}
                  >
                    {categoryName}
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

              {/* Action Buttons */}
              <div className={`flex flex-wrap gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {mockup.demo_url && (
                  <a 
                    href={mockup.demo_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button 
                      size="lg"
                      className="bg-inverse-accent hover:bg-inverse-accent/90 text-inverse-bg font-semibold px-6 py-5 rounded-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      <ExternalLink className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'عرض النسخة التجريبية' : 'View Live Demo'}
                    </Button>
                  </a>
                )}
                <Link to={`/contact?design=${mockup.slug}`}>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-2 border-inverse-border text-inverse-fg hover:bg-inverse-fg/10 font-semibold px-6 py-5 rounded-lg backdrop-blur-sm"
                  >
                    {isRTL ? 'طلب هذا التصميم' : 'Request This Design'}
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right: Device Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] flex items-center justify-center">
                <DeviceFrame
                  type="laptop"
                  mockup={mockup}
                  className="w-full"
                  animate={false}
                />
              </div>
            </motion.div>
          </div>
        </Container>
      </InverseSurface>

      {/* Device Switcher + Preview */}
      <Section spacing="lg" className="bg-color-background">
        <Container>
          <div className="max-w-5xl mx-auto">
            {/* Device Switcher */}
            <div className={`flex items-center justify-center gap-4 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setActiveDevice('desktop')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeDevice === 'desktop'
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-frost-soft text-text-muted hover:bg-frost'
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span>{isRTL ? 'سطح المكتب' : 'Desktop'}</span>
              </button>
              <button
                onClick={() => setActiveDevice('tablet')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeDevice === 'tablet'
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-frost-soft text-text-muted hover:bg-frost'
                }`}
              >
                <Tablet className="w-5 h-5" />
                <span>{isRTL ? 'جهاز لوحي' : 'Tablet'}</span>
              </button>
              <button
                onClick={() => setActiveDevice('mobile')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeDevice === 'mobile'
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-frost-soft text-text-muted hover:bg-frost'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span>{isRTL ? 'جوال' : 'Mobile'}</span>
              </button>
            </div>

            {/* Device Preview */}
            <div className="flex items-center justify-center bg-gradient-to-br from-frost-soft to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl p-12 min-h-[600px]">
              <DeviceFrame
                type={activeDevice}
                mockup={{
                  ...mockup,
                  desktop_screenshot_url: activeDevice === 'desktop' ? mockup.desktop_screenshot_url : null,
                  tablet_screenshot_url: activeDevice === 'tablet' ? mockup.tablet_screenshot_url : null,
                  mobile_screenshot_url: activeDevice === 'mobile' ? mockup.mobile_screenshot_url : null,
                }}
                className={
                  activeDevice === 'desktop' ? 'w-full max-w-3xl' :
                  activeDevice === 'tablet' ? 'w-96' :
                  'w-72'
                }
                animate={false}
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* Description + What's Included */}
      <Section spacing="lg" className="bg-frost-soft">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Description */}
            {longDescription && (
              <div>
                <h2 className="text-3xl font-bold text-primary-deep mb-6">
                  {isRTL ? 'الوصف' : 'Overview'}
                </h2>
                <p className="text-text-muted leading-relaxed whitespace-pre-line">
                  {longDescription}
                </p>
              </div>
            )}

            {/* What's Included */}
            {whatsIncluded.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-primary-deep mb-6">
                  {isRTL ? 'ما يتضمنه التصميم' : 'What\'s Included'}
                </h2>
                <ul className="space-y-3">
                  {whatsIncluded.map((item, index) => (
                    <li key={index} className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                      </div>
                      <span className="text-primary-deep leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Container>
      </Section>

      {/* Related Mockups */}
      {relatedMockups.length > 0 && (
        <Section spacing="xl" className="bg-color-background">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-deep mb-4">
                {isRTL ? 'تصاميم ذات صلة' : 'Related Mockups'}
              </h2>
              <p className="text-lg text-text-muted">
                {isRTL 
                  ? 'تصاميم أخرى قد تهمك في نفس الفئة'
                  : 'Other mockups you might like in the same category'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedMockups.map((relatedMockup, index) => (
                <EnhancedMockupCard
                  key={relatedMockup.id}
                  mockup={relatedMockup}
                  category={category}
                  onViewMockup={() => navigate(`/mockups/${relatedMockup.slug}`)}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Final CTA */}
      <InverseSurface withTopGlow className="py-16 md:py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-inverse-fg mb-6">
              {isRTL ? 'معجب بهذا التصميم؟' : 'Like This Design?'}
            </h2>
            <p className="text-xl text-inverse-fg-muted mb-8">
              {isRTL 
                ? 'دعنا نخصصه ليتناسب مع علامتك التجارية ومحتواك. تواصل معنا اليوم للحصول على عرض أسعار مخصص.'
                : 'Let\'s customize it to match your brand and content. Contact us today for a personalized quote.'}
            </p>
            <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <Link to={`/contact?design=${mockup.slug}`}>
                <Button 
                  size="lg"
                  className="bg-inverse-accent hover:bg-inverse-accent/90 text-inverse-bg font-semibold px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {isRTL ? 'طلب هذا التصميم' : 'Request This Design'}
                </Button>
              </Link>
              {siteSettings?.whatsapp_number && (
                <Button 
                  onClick={handleWhatsApp}
                  size="lg"
                  variant="outline"
                  className="border-2 border-inverse-border text-inverse-fg hover:bg-inverse-fg/10 font-semibold px-8 py-6 rounded-lg backdrop-blur-sm"
                >
                  {isRTL ? 'اطلب عبر واتساب' : 'Order via WhatsApp'}
                </Button>
              )}
            </div>
          </div>
        </Container>
      </InverseSurface>
    </motion.div>
  );
};

export default MockupDetailPage;
