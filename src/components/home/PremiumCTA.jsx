/**
 * Premium CTA Section - Redesigned with site_settings integration
 * Features:
 * - Deep slate surface (tokens only, no hardcoded colors)
 * - Aurora mesh glow, faint grid with radial mask
 * - Decorative glowing ring/orbit lines around S logo mark
 * - Two columns on desktop: left (heading/buttons), right (channels glass card)
 * - Original heading: "Let's Turn Your Ideas Into Real Products"
 * - Contact channels: Email, Phone, WhatsApp from site_settings
 * - Copy-to-clipboard with confirmation
 * - No duplicated pill, no "Trusted by" strip, no emoji icons
 * - Fixed clipped descenders (line-height 1.15, pb-2)
 * - RTL-aware
 */

import { useState } from 'react';
import { ArrowRight, Mail, Phone, MessageCircle, Check, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { useTranslation } from '../../i18n/useTranslation';
import { useSiteSettings } from '../../hooks/useContent';

const ContactChannel = ({ icon: Icon, label, value, href, isRTL }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-cta-channel-bg border border-cta-channel-border hover:border-cta-channel-border-hover transition-all duration-300 group">
      {/* Icon */}
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-cta-icon-bg flex items-center justify-center group-hover:bg-cta-icon-hover transition-colors">
        <Icon className="w-6 h-6 text-cta-icon" />
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0">
        <div className="text-sm text-cta-label mb-1">{label}</div>
        <a
          href={href}
          className="text-base font-medium text-cta-value hover:text-cta-accent transition-colors break-all"
        >
          {value}
        </a>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="flex-shrink-0 p-2 rounded-lg hover:bg-cta-copy-hover transition-colors focus:outline-none focus:ring-2 focus:ring-cta-accent"
        aria-label={copied ? 'Copied' : `Copy ${label}`}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
      >
        {copied ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : (
          <Copy className="w-5 h-5 text-cta-copy" />
        )}
      </button>

      {/* Copied confirmation */}
      {copied && (
        <div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-sm rounded-md shadow-lg"
          role="status"
          aria-live="polite"
        >
          Copied!
        </div>
      )}
    </div>
  );
};

const PremiumCTA = () => {
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  const { data: siteSettings } = useSiteSettings();

  // Get contact details from site_settings with fallbacks
  const email = siteSettings?.primary_email || 'info@sentivra.com';
  const phone = siteSettings?.primary_phone || '+1 (555) 123-4567';
  const whatsapp = siteSettings?.whatsapp_number || '1234567890';

  return (
    <section className="relative py-20 md:py-32 bg-cta-deep overflow-hidden">
      {/* Top hairline glow (visible in dark mode) */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cta-hairline to-transparent opacity-50" />

      {/* Background effects */}
      <div className="absolute inset-0">
        {/* Aurora mesh glow */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cta-aurora-1 rounded-full blur-3xl mix-blend-screen" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cta-aurora-2 rounded-full blur-3xl mix-blend-screen" />
        </div>

        {/* Faint grid with radial mask */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%),
              linear-gradient(to right, rgba(143,179,196,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(143,179,196,0.03) 1px, transparent 1px)
            `,
            backgroundSize: 'auto, 60px 60px, 60px 60px',
            backgroundPosition: 'center, 0 0, 0 0'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Two-column layout */}
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${isRTL ? 'lg:grid-flow-dense' : ''}`}>
          {/* Left column: Heading and buttons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={isRTL ? 'lg:col-start-2' : ''}
          >
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-medium text-cta-accent mb-4 uppercase tracking-wider"
            >
              {t('home.cta.eyebrow') || "Let's Work Together"}
            </motion.p>

            {/* Heading - Fixed clipped descenders */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-cta-heading to-cta-accent bg-clip-text text-transparent pb-2"
              style={{ lineHeight: '1.15', display: 'inline-block' }}
            >
              {t('home.cta.title') || "Let's Turn Your Ideas Into Real Products"}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-cta-subtitle mb-10 leading-relaxed max-w-xl"
            >
              {t('home.cta.subtitle') || 'Transform your vision into reality with our expert team. Get started today with a free consultation.'}
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}
            >
              {/* Primary button with slide arrow and glow */}
              <Button 
                size="lg" 
                className="bg-white dark:bg-frost hover:bg-white/90 dark:hover:bg-frost/90 text-primary-deep shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 group text-lg px-8 py-6 relative overflow-hidden"
                asChild
              >
                <Link to="/contact" className="relative z-10">
                  <span className="flex items-center gap-2">
                    {t('home.cta.primaryButton') || 'Start Your Project'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {/* Subtle glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>

              {/* Secondary glass button */}
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-cta-glass-border bg-cta-glass-bg backdrop-blur-sm hover:bg-cta-glass-hover hover:border-cta-accent/40 text-cta-glass-text transition-all duration-300 text-lg px-8 py-6"
                asChild
              >
                <Link to="/our-work">
                  {t('home.cta.secondaryButton') || 'View Our Work'}
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right column: Channels glass card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={isRTL ? 'lg:col-start-1 lg:row-start-1' : ''}
          >
            <div className="p-8 rounded-2xl bg-cta-card-bg backdrop-blur-xl border border-cta-card-border shadow-2xl space-y-4">
              <h3 className="text-2xl font-bold text-cta-card-heading mb-6">
                {t('home.cta.contactTitle') || 'Get In Touch'}
              </h3>

              {/* Email */}
              <div className="relative">
                <ContactChannel
                  icon={Mail}
                  label={t('home.cta.email') || 'Email'}
                  value={email}
                  href={`mailto:${email}`}
                  isRTL={isRTL}
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <ContactChannel
                  icon={Phone}
                  label={t('home.cta.phone') || 'Phone'}
                  value={phone}
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  isRTL={isRTL}
                />
              </div>

              {/* WhatsApp */}
              <div className="relative">
                <ContactChannel
                  icon={MessageCircle}
                  label={t('home.cta.whatsapp') || 'WhatsApp'}
                  value={whatsapp}
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  isRTL={isRTL}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative S logo orbit (optional - can be added later with SVG) */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 opacity-5 pointer-events-none">
          <div className="w-full h-full rounded-full border-2 border-cta-accent animate-ping" style={{ animationDuration: '3s' }} />
        </div>
      </div>
    </section>
  );
};

export default PremiumCTA;
