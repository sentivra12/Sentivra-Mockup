import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFAQs, useSiteSettings } from '@/hooks/useContent';
import PageHero from '../components/ui/PageHero';
import ContactForm from '../components/ui/ContactForm';
import ContactInfoCard from '../components/ui/ContactInfoCard';
import ProjectChecklistCard from '../components/ui/ProjectChecklistCard';
import FAQAccordion from '../components/ui/FAQAccordion';
import CTABand from '../components/ui/CTABand';
import WhatsAppButton from '../components/ui/WhatsAppButton';
import Footer from '../components/Footer';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import { useTranslation } from '@/i18n/useTranslation';
import { SEO, useSEO } from '@/components/SEO';
import supabase from '@/lib/supabase';

const ContactPage = () => {
  const { t, language } = useTranslation();
  const { getMetadata } = useSEO();
  const seoData = getMetadata('contact');
  const [searchParams] = useSearchParams();
  
  // Fetch data from Supabase
  const { data: faqs = [], isLoading: faqsLoading } = useFAQs('contact');
  const { data: siteSettings } = useSiteSettings();
  
  // Design request state
  const [selectedMockup, setSelectedMockup] = useState(null);
  const [loadingMockup, setLoadingMockup] = useState(false);

  // Load mockup from URL parameter
  useEffect(() => {
    const designSlug = searchParams.get('design');
    if (designSlug) {
      setLoadingMockup(true);
      supabase
        .from('mockups')
        .select('id, slug, title_en, title_ar, desktop_screenshot_url, cover_image_url')
        .eq('slug', designSlug)
        .eq('is_active', true)
        .single()
        .then(({ data, error }) => {
          if (data && !error) {
            setSelectedMockup(data);
          }
          setLoadingMockup(false);
        })
        .catch(() => setLoadingMockup(false));
    }
  }, [searchParams]);

  // Hero features (hardcoded for now - could be moved to database if needed)
  const heroFeatures = [
    { text: t('contact.hero.feature1') },
    { text: t('contact.hero.feature2') },
    { text: t('contact.hero.feature3') }
  ];

  // Contact info from site settings
  const contactInfo = {
    whatsapp: siteSettings?.whatsapp_number || '201558952126'
  };

  const handleScrollToForm = (e) => {
    e.preventDefault();
    const formElement = document.getElementById('contact-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    const url = `https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(t('contact.whatsappMessage'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <SEO 
        title={seoData.title}
        description={seoData.description}
        type="website"
      />
      <div className="min-h-screen bg-color-background dark:bg-gray-900">
      {/* Hero Section */}
      <PageHero
        breadcrumbs={[
          { label: t('nav.home'), href: '/' },
          { label: t('nav.contact') }
        ]}
        label={t('contact.hero.label')}
        title={t('contact.hero.title')}
        titleAccent={t('contact.hero.titleAccent')}
        description={t('contact.hero.description')}
        featureBadges={heroFeatures}
      />

      {/* Main Content Section */}
      <Section spacing="xl" className="bg-frost-soft">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Contact Form (2/3 width on desktop) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
              id="contact-form"
            >
              <ContactForm selectedMockup={selectedMockup} onRemoveMockup={() => setSelectedMockup(null)} />
            </motion.div>

            {/* Right Column - Info Cards (1/3 width on desktop, hidden on mobile) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block space-y-6"
            >
              <ContactInfoCard />
              <ProjectChecklistCard />
            </motion.div>
          </div>

          {/* Mobile Contact Info (visible only on mobile) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:hidden mt-8"
          >
            <ContactInfoCard />
          </motion.div>
        </Container>
      </Section>

      {/* FAQ Section */}
      <Section spacing="xl" className="bg-color-background">
        <Container>
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              {t('contact.faq.label')}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-deep mb-4">
              {t('contact.faq.title')}
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              {t('contact.faq.description')}
            </p>
          </motion.div>

          {/* FAQ Grid - 2 columns on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <FAQAccordion faqs={faqs.slice(0, Math.ceil(faqs.length / 2))} />
            </motion.div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <FAQAccordion faqs={faqs.slice(Math.ceil(faqs.length / 2))} />
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* CTA Band */}
      <CTABand
        title={t('contact.cta.title')}
        description={t('contact.cta.description')}
        primaryButton={{
          label: t('contact.cta.primaryButton'),
          href: '#contact-form',
          onClick: handleScrollToForm
        }}
        secondaryButton={{
          label: t('contact.cta.secondaryButton'),
          href: '#whatsapp',
          onClick: handleWhatsAppClick
        }}
      />

      {/* Footer */}
      <Footer />

      {/* WhatsApp Floating Button */}
      <WhatsAppButton
        phoneNumber={contactInfo.whatsapp.replace(/[^0-9]/g, '')}
        message={t('contact.whatsappMessage')}
      />
    </div>
    </>
  );
};

export default ContactPage;
