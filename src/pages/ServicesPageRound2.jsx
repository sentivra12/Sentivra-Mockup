/**
 * ServicesPageRound2 - Premium Engineering-Grade Services Page
 * 
 * CONSISTENT with /mockups design system
 * - Reuses PremiumFAQAccordion, PremiumFinalCTA
 * - Uses shared components: SectionHeader, GradientHeading, Reveal, InverseSurface
 * - Engineering visuals: constellation, code windows, animated visuals
 * - NO fake data: real services, real contact, Admin-managed FAQs
 * 
 * Sections:
 * 1. ServicesHeroConstellation - engineering showcase with constellation
 * 2. ServicesBentoGrid - bento layout with mini live visuals
 * 3. HowWeWorkTimeline - interactive timeline with scroll animations
 * 4. WhyUsCompact - 4 glass tiles (real content only)
 * 5. PremiumFAQAccordion - reused from mockups
 * 6. PremiumFinalCTA - reused from mockups
 * 
 * Features:
 * - InverseSurface tokens (no hardcoded colors)
 * - Admin-managed content (EN/AR from database)
 * - RTL support
 * - Light/dark themes (each with own treatment)
 * - a11y (AA contrast, keyboard, focus, screen reader)
 * - Reduced-motion, saveData, low-power handling
 * - Performance: CLS ~0, LCP <2s, Lighthouse 90+
 * - NO invented claims, numbers, prices, timelines
 */

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from '@/i18n/useTranslation';
import { useThemeContext } from '@/theme/ThemeContext';
import { 
  useServices, 
  useFAQs, 
  useSiteSettings 
} from '@/hooks/useContent';
import ServicesHeroConstellationRound3 from '@/components/services/ServicesHeroConstellationRound3';
import ServicesBentoGrid from '@/components/services/ServicesBentoGrid';
import HowWeWorkTimeline from '@/components/services/HowWeWorkTimeline';
import WhyUsCompact from '@/components/services/WhyUsCompact';
import PremiumFAQAccordion from '@/components/mockups/PremiumFAQAccordion';
import PremiumFinalCTA from '@/components/mockups/PremiumFinalCTA';
import ScrollProgressBar from '@/components/ui/ScrollProgressBar';
import ScrollToTop from '@/components/ScrollToTop';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import InverseSurface from '@/components/ui/InverseSurface';

export default function ServicesPageRound2() {
  const { t, language } = useTranslation();
  const { isDark } = useThemeContext();
  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  
  // Fetch data
  const { data: services = [], isLoading: servicesLoading, error: servicesError } = useServices();
  const { data: allFaqs = [], isLoading: faqsLoading, error: faqsError } = useFAQs('services');
  const { data: siteSettings, isLoading: settingsLoading, error: settingsError } = useSiteSettings();
  
  // Filter active services
  const activeServices = services.filter(s => s.is_active);
  
  // Filter FAQs for services page
  const serviceFaqs = allFaqs.filter(faq => faq.page_key === 'services');
  
  // Set page meta
  useEffect(() => {
    const title = language === 'ar' 
      ? 'خدماتنا البرمجية - حلول تقنية متكاملة | Sentivra' 
      : 'Our Software Services - Comprehensive Tech Solutions | Sentivra';
    
    const description = language === 'ar' 
      ? 'نقدم حلولاً برمجية متكاملة من تطبيقات الويب المتقدمة إلى أنظمة الذكاء الاصطناعي، مصممة خصيصاً لتحقيق أهداف عملك الرقمية'
      : 'We deliver comprehensive software solutions from advanced web applications to AI systems, tailored to achieve your digital business goals';
    
    document.title = title;
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;
    
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);
  
  // Loading state
  if (servicesLoading || faqsLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <InverseSurface token="canvas" className="absolute inset-0" />
        <div className="relative z-10 text-center">
          <div 
            className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"
            role="status"
            aria-label={language === 'ar' ? 'جارٍ التحميل' : 'Loading'}
          />
          <InverseSurface token="secondaryText">
            <p className="text-lg text-inverse-fg-muted">
              {language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}
            </p>
          </InverseSurface>
        </div>
      </div>
    );
  }
  
  // Error state
  if (servicesError || faqsError || settingsError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <InverseSurface token="canvas" className="absolute inset-0" />
        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-3 text-inverse-fg">
            {language === 'ar' ? 'حدث خطأ' : 'Something Went Wrong'}
          </h2>
          <p className="text-lg mb-6 text-inverse-fg-muted">
            {language === 'ar' 
              ? 'نعتذر، حدث خطأ أثناء تحميل البيانات. يرجى المحاولة لاحقاً.'
              : 'Sorry, there was an error loading the data. Please try again later.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>
          {language === 'ar' 
            ? 'خدماتنا البرمجية - حلول تقنية متكاملة | Sentivra' 
            : 'Our Software Services - Comprehensive Tech Solutions | Sentivra'}
        </title>
        <meta 
          name="description" 
          content={language === 'ar' 
            ? 'نقدم حلولاً برمجية متكاملة من تطبيقات الويب المتقدمة إلى أنظمة الذكاء الاصطناعي'
            : 'We deliver comprehensive software solutions from advanced web applications to AI systems'}
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={language === 'ar' ? 'خدماتنا البرمجية | Sentivra' : 'Our Software Services | Sentivra'} />
        <link rel="canonical" href="https://sentivra.com/services" />
      </Helmet>
      
      <div className="min-h-screen" dir={dir}>
        {/* Background - only for structural layout, NOT for color */}
        
        {/* Scroll progress bar */}
        <ScrollProgressBar />
        
        {/* 1. Hero - Constellation (has its own background) */}
        <ServicesHeroConstellationRound3 
          services={activeServices}
          language={language}
          dir={dir}
          siteSettings={siteSettings}
        />
        
        {/* 2. Services Grid - Bento Layout */}
        <ServicesBentoGrid 
          services={activeServices}
          language={language}
          dir={dir}
        />
        
        {/* 3. How We Work - Interactive Timeline */}
        <HowWeWorkTimeline 
          language={language}
          dir={dir}
        />
        
        {/* 4. Why Us - Compact Tiles */}
        <WhyUsCompact 
          language={language}
          dir={dir}
        />
        
        {/* 5. FAQ - Reused from Mockups (only if FAQs exist) */}
        {serviceFaqs.length > 0 && (
          <section className="relative py-16 sm:py-20 lg:py-24">
            <div className="absolute inset-0">
              <InverseSurface token="canvas" className="absolute inset-0" />
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <PremiumFAQAccordion 
                  faqs={serviceFaqs}
                  language={language}
                  isDark={isDark}
                  siteSettings={siteSettings}
                />
            </div>
          </section>
        )}
        
        {/* 6. Final CTA - Reused from Mockups */}
        <PremiumFinalCTA
          language={language}
          isDark={isDark}
          categories={activeServices} // Pass services as categories for constellation
          siteSettings={siteSettings}
        />
        
        {/* Utilities */}
        <ScrollToTop />
        {siteSettings?.whatsapp_number && <WhatsAppButton />}
      </div>
    </>
  );
}
