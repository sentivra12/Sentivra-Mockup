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

/** Validate a URL is a real https link (not javascript: or empty) */
const isValidHttpsUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * MockupDetailPage — /mockups/:slug
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

  // Find the mockup — must be active/published, never static fallback
  const mockup = (mockups ?? []).find(
    m =>
      m.slug === slug &&
      (m.is_active === true || m.published === true) &&
      typeof m.id !== 'number'
  );
  const category = Array.isArray(categories)
    ? (categories ?? []).find(c => c.id === mockup?.category_id)
    : null;

  // Bilingual content
  const title = mockup
    ? (isRTL ? mockup.title_ar || mockup.title_en || mockup.title : mockup.title_en || mockup.title)
    : '';
  const shortDescription = mockup
    ? (isRTL
        ? mockup.short_description_ar || mockup.short_description_en
        : mockup.short_description_en)
    : '';
  const longDescription = mockup
    ? (isRTL
        ? mockup.long_description_ar || mockup.long_description_en
        : mockup.long_description_en)
    : '';
  const categoryName = isRTL ? category?.name_ar : category?.name_en;

  // Live demo URL — website_url takes priority, fallback to demo_url, must be https
  const rawDemoUrl = mockup?.website_url || mockup?.demo_url;
  const demoUrl = isValidHttpsUrl(rawDemoUrl) ? rawDemoUrl : null;
  const opensNewTab = mockup?.open_in_new_tab !== false; // default true

  // What's included / features
  const whatsIncluded = (() => {
    const src = mockup?.features || mockup?.whats_included;
    if (!src) return [];
    if (Array.isArray(src)) return src;
    try { return JSON.parse(src); } catch { return []; }
  })();

  // Screenshots per device
  const screenshots = mockup ? {
    desktop: mockup.desktop_screenshot_url || mockup.cover_image_url || mockup.image_url,
    tablet: mockup.tablet_screenshot_url || mockup.desktop_screenshot_url || mockup.cover_image_url,
    mobile: mockup.mobile_screenshot_url || mockup.desktop_screenshot_url || mockup.cover_image_url,
  } : {};
  const hasAnyScreenshot = Object.values(screenshots).some(Boolean);

  // Related mockups (same category, active, not static)
  const relatedMockups = (mockups ?? [])
    .filter(m =>
      (m.is_active === true || m.published === true) &&
      typeof m.id !== 'number' &&
      m.category_id === mockup?.category_id &&
      m.slug !== slug
    )
    .slice(0, 3);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // 404
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
              : "Sorry, we couldn't find the mockup you're looking for."}
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
    const phone = siteSettings?.whatsapp_number || '201558952126';
    const message = isRTL
      ? `مرحباً! أنا مهتم بتصميم "${title}". أريد مناقشة خيارات التخصيص.`
      : `Hello! I'm interested in the "${title}" design. I'd like to discuss customization options.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
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

      {/* ── Hero ── */}
      <InverseSurface withGrid className="pt-24 pb-12 md:pt-32 md:pb-16">
        <Container>
          {/* Breadcrumb */}
          <nav
            className={`flex items-center gap-2 text-sm text-inverse-fg-muted mb-6 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}
            aria-label="Breadcrumb"
          >
            <Link to="/" className="hover:text-inverse-accent transition-colors">{t('nav.home')}</Link>
            <span aria-hidden="true">/</span>
            <Link to="/mockups" className="hover:text-inverse-accent transition-colors">{t('nav.mockups')}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-inverse-fg font-medium" dir="auto">{title}</span>
          </nav>

          {/* Back */}
          <button
            onClick={() => navigate('/mockups')}
            className={`inline-flex items-center gap-2 text-inverse-fg-muted hover:text-inverse-accent transition-colors mb-8 group ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`w-4 h-4 group-hover:-translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-sm font-medium">{isRTL ? 'العودة للتصاميم' : 'Back to Mockups'}</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {categoryName && (
                <div className="mb-4">
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold backdrop-blur-sm text-sm bg-brand-accent/10 text-brand-accent border-brand-accent/30"
                  >
                    {categoryName}
                  </span>
                </div>
              )}

              <h1
                dir="auto"
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-inverse-fg leading-tight mb-6"
              >
                {title}
              </h1>

              {shortDescription && (
                <p dir="auto" className="text-xl text-inverse-fg-muted leading-relaxed mb-8">
                  {shortDescription}
                </p>
              )}

              {/* Action Buttons */}
              <div className={`flex flex-wrap gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {/* "View Live Demo" — only when a valid https URL exists */}
                {demoUrl && (
                  <a
                    href={demoUrl}
                    target={opensNewTab ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button
                      size="lg"
                      className="bg-inverse-accent hover:bg-inverse-accent/90 text-inverse-bg font-semibold px-6 py-5 rounded-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      <ExternalLink className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} aria-hidden="true" />
                      {isRTL ? 'عرض النسخة التجريبية' : 'View Live Demo'}
                    </Button>
                  </a>
                )}

                {/* "Request This Design" — always visible, labeled, AA contrast on dark surface */}
                <Link to={`/contact?design=${mockup.slug}`}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 font-semibold px-6 py-5 rounded-lg backdrop-blur-sm transition-all border-white/40 text-white bg-white/10 hover:bg-white/20 hover:border-white/60"
                  >
                    {isRTL ? 'طلب هذا التصميم' : 'Request This Design'}
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right: Device Preview (only if screenshot exists) */}
            {hasAnyScreenshot && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative aspect-[4/3] flex items-center justify-center">
                  <DeviceFrame type="laptop" mockup={mockup} className="w-full" animate={false} />
                </div>
              </motion.div>
            )}
          </div>
        </Container>
      </InverseSurface>

      {/* ── Device Switcher + Preview — hidden when no screenshots ── */}
      {hasAnyScreenshot && (
        <Section spacing="lg" className="bg-color-background">
          <Container>
            <div className="max-w-5xl mx-auto">
              {/* Device Switcher */}
              <div className={`flex items-center justify-center gap-4 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {[
                  { id: 'desktop', Icon: Monitor, label: isRTL ? 'سطح المكتب' : 'Desktop', has: Boolean(screenshots.desktop) },
                  { id: 'tablet',  Icon: Tablet,  label: isRTL ? 'جهاز لوحي' : 'Tablet',  has: Boolean(screenshots.tablet) },
                  { id: 'mobile',  Icon: Smartphone, label: isRTL ? 'جوال' : 'Mobile',  has: Boolean(screenshots.mobile) },
                ].map(({ id, Icon, label, has }) => (
                  <button
                    key={id}
                    onClick={() => setActiveDevice(id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      activeDevice === id
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-frost-soft text-text-muted hover:bg-frost'
                    } ${!has ? 'opacity-40 cursor-default' : ''}`}
                    disabled={!has}
                    aria-pressed={activeDevice === id}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Device Preview */}
              <div className="flex items-center justify-center bg-gradient-to-br from-frost-soft to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl p-8 md:p-12">
                <DeviceFrame
                  type={activeDevice}
                  mockup={mockup}
                  className={
                    activeDevice === 'desktop' ? 'w-full max-w-3xl' :
                    activeDevice === 'tablet'  ? 'w-96' :
                                                 'w-72'
                  }
                  animate={false}
                />
              </div>
            </div>
          </Container>
        </Section>
      )}

      {/* ── Description + What's Included — hidden when empty ── */}
      {(longDescription || whatsIncluded.length > 0) && (
        <Section spacing="lg" className="bg-frost-soft">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {longDescription && (
                <div>
                  <h2 className="text-3xl font-bold text-primary-deep mb-6">
                    {isRTL ? 'الوصف' : 'Overview'}
                  </h2>
                  <p dir="auto" className="text-text-muted leading-relaxed whitespace-pre-line">
                    {longDescription}
                  </p>
                </div>
              )}

              {whatsIncluded.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold text-primary-deep mb-6">
                    {isRTL ? 'ما يتضمنه التصميم' : "What's Included"}
                  </h2>
                  <ul className="space-y-3">
                    {whatsIncluded.map((item, i) => (
                      <li key={i} className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                        </div>
                        <span className="text-primary-deep leading-relaxed" dir="auto">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Container>
        </Section>
      )}

      {/* ── Related Mockups — hidden when empty ── */}
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
              {relatedMockups.map((rel, i) => (
                <EnhancedMockupCard
                  key={rel.id}
                  mockup={rel}
                  category={category}
                  onViewMockup={() => navigate(`/mockups/${rel.slug}`)}
                  delay={i * 0.1}
                />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ── Final CTA ── */}
      <InverseSurface withTopGlow className="py-16 md:py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-inverse-fg mb-6">
              {isRTL ? 'معجب بهذا التصميم؟' : 'Like This Design?'}
            </h2>
            <p className="text-xl text-inverse-fg-muted mb-8">
              {isRTL
                ? 'دعنا نخصصه ليتناسب مع علامتك التجارية ومحتواك.'
                : "Let's customize it to match your brand and content."}
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
                  className="border-2 font-semibold px-8 py-6 rounded-lg backdrop-blur-sm transition-all border-white/40 text-white bg-white/10 hover:bg-white/20 hover:border-white/60"
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
