import React from 'react';
import { motion } from 'framer-motion';
import PageHero from '../components/ui/PageHero';
import ContactForm from '../components/ui/ContactForm';
import ContactInfoCard from '../components/ui/ContactInfoCard';
import ProjectChecklistCard from '../components/ui/ProjectChecklistCard';
import FAQAccordion from '../components/ui/FAQAccordion';
import CTABand from '../components/ui/CTABand';
import WhatsAppButton from '../components/ui/WhatsAppButton';
import Footer from '../components/Footer';
import { heroFeatures, contactFAQs, contactInfo } from '../data/contactData';

const ContactPage = () => {
  const handleScrollToForm = (e) => {
    e.preventDefault();
    const formElement = document.getElementById('contact-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    const url = `https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello! I would like to discuss a project with you.')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <PageHero
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Contact' }
        ]}
        label="GET IN TOUCH"
        title="Let's Build Something"
        titleAccent="Amazing Together"
        description="Have a project in mind? We're here to turn your ideas into reality. Reach out to us and let's start the conversation."
        featureBadges={heroFeatures}
      />

      {/* Main Content Section */}
      <section className="py-16 md:py-24 bg-frost-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <ContactForm />
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
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-deep mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Find answers to common questions about our services, process, and how we can help you.
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
              <FAQAccordion faqs={contactFAQs.slice(0, Math.ceil(contactFAQs.length / 2))} />
            </motion.div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <FAQAccordion faqs={contactFAQs.slice(Math.ceil(contactFAQs.length / 2))} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <CTABand
        title="Ready to Start Your Project?"
        description="Get in touch with us today and let's discuss how we can help bring your vision to life."
        primaryButton={{
          label: 'Send Message',
          href: '#contact-form',
          onClick: handleScrollToForm
        }}
        secondaryButton={{
          label: 'Chat on WhatsApp',
          href: '#whatsapp',
          onClick: handleWhatsAppClick
        }}
      />

      {/* Footer */}
      <Footer />

      {/* WhatsApp Floating Button */}
      <WhatsAppButton
        phoneNumber={contactInfo.whatsapp.replace(/[^0-9]/g, '')}
        message="Hello! I would like to discuss a project with you."
      />
    </div>
  );
};

export default ContactPage;
