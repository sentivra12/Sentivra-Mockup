import React, { useEffect } from 'react';
import { useLanguage } from '@/i18n/useLanguage';
import { 
  useServices, 
  useFAQs, 
  useSiteSettings 
} from '@/hooks/useContent';
import ServicesHeroPremium from '@/components/ui/ServicesHeroPremium';
import PremiumServiceCardRound1 from '@/components/ui/PremiumServiceCardRound1';
import HowWeWorkStrip from '@/components/ui/HowWeWorkStrip';
import WhyUsSection from '@/components/ui/WhyUsSection';
import ServicesFAQAccordion from '@/components/ui/ServicesFAQAccordion';
import ServicesFinalCTA from '@/components/ui/ServicesFinalCTA';
import ScrollToTop from '@/components/ScrollToTop';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

/**
 * ServicesPageRound1
 * 
 * Premium redesign of /services page for conversion-focused ad landing page.
 * 
 * Sections:
 * 1. ServicesHeroPremium - orbit visual with animated service icons
 * 2. PremiumServiceCardRound1 - searchable gallery with gradient borders
 * 3. HowWeWorkStrip - 3-step process with connectors
 * 4. WhyUsSection - 4 glass tiles (no fake stats)
 * 5. ServicesFAQAccordion - numbered accordion with smooth animations
 * 6. ServicesFinalCTA - compact orbit, magnetic button, WhatsApp
 * 
 * Features:
 * - InverseSurface tokens throughout
 * - Admin-managed content (EN/AR) from database
 * - RTL support
 * - Dark mode
 * - a11y (ARIA labels, keyboard navigation, screen reader announcements)
 * - Reduced-motion support
 * - Performance optimized (CLS ~0 target)
 * - No invented claims, stats, or fake data
 */
export default function ServicesPageRound1() {
  const { t, language, dir } = useLanguage();

  // Fetch data from Supabase
  const { data: services = [], isLoading: servicesLoading, error: servicesError } = useServices();
  const { data: allFaqs = [], isLoading: faqsLoading, error: faqsError } = useFAQs();
  const { data: siteSettings, isLoading: settingsLoading, error: settingsError } = useSiteSettings();

  // Filter active services only
  const activeServices = services.filter(s => s.is_active);

  // Filter FAQs for services page
  const serviceFaqs = allFaqs.filter(faq => faq.page_key === 'services');

  // Contact info for final CTA
  const contactInfo = siteSettings ? {
    whatsapp_number: siteSettings.whatsapp_number || '',
    email: siteSettings.primary_email || siteSettings.email || '',
    phone: siteSettings.primary_phone || siteSettings.phone || ''
  } : {};

  // Set page title and meta
  useEffect(() => {
    const title = language === 'ar' ? 'خدماتنا البرمجية | Sentivra' : 'Our Software Services | Sentivra';
    const description = language === 'ar' 
      ? 'نقدم حلولاً برمجية متكاملة من تطبيقات الويب والجوال إلى أنظمة إدارة الأعمال والذكاء الاصطناعي'
      : 'We deliver comprehensive software solutions from web and mobile applications to business management systems and AI';
    
    document.title = title;
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;

    // Set lang and dir on html element
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  // Loading state
  if (servicesLoading || faqsLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center">
          <div 
            className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"
            role="status"
            aria-label={language === 'ar' ? 'جارٍ التحميل' : 'Loading'}
          />
          <p className="text-slate-600 dark:text-slate-400">
            {language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (servicesError || faqsError || settingsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-slate-50 mb-2">
            {language === 'ar' ? 'حدث خطأ' : 'Something Went Wrong'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {language === 'ar' 
              ? 'نعتذر، حدث خطأ أثناء تحميل البيانات. يرجى المحاولة لاحقاً.'
              : 'Sorry, there was an error loading the data. Please try again later.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors"
          >
            {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors" dir={dir}>
      
      {/* 1. Hero with Services Orbit */}
      <ServicesHeroPremium services={activeServices} />

      {/* 2. Searchable Services Gallery */}
      <PremiumServiceCardRound1 services={activeServices} />

      {/* 3. How We Work Strip */}
      <HowWeWorkStrip />

      {/* 4. Why Choose Us Section */}
      <WhyUsSection />

      {/* 5. FAQ Accordion */}
      {serviceFaqs.length > 0 && (
        <ServicesFAQAccordion faqs={serviceFaqs} />
      )}

      {/* 6. Final CTA */}
      <ServicesFinalCTA 
        services={activeServices} 
        contactInfo={contactInfo} 
      />

      {/* Utilities */}
      <ScrollToTop />
      {contactInfo.whatsapp_number && <WhatsAppButton />}
    </div>
  );
}
