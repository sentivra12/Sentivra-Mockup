/**
 * PremiumCTA — SP brand edition
 * Deep emerald CTA surface. All cta-* tokens rebased to brand emerald.
 * No hardcoded slate/cyan/rgba(143,179,196). green-500 copy toast → brand-500.
 */

import { useState } from 'react';
import { ArrowRight, Mail, Phone, MessageCircle, Check, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { useTranslation } from '../../i18n/useTranslation';
import { useSiteSettings } from '../../hooks/useContent';

/* ── Channel card ──────────────────────────────────────────────────────── */
const ContactChannel = ({ icon: Icon, label, value, href, isRTL }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group"
         style={{
           background: 'var(--cta-channel-bg)',
           border: '1px solid var(--cta-channel-border)',
         }}
         onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cta-channel-border-hover)'}
         onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--cta-channel-border)'}
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors"
        style={{ background: 'var(--cta-icon-bg)' }}
      >
        <Icon className="w-6 h-6 text-cta-icon" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0">
        <div className="text-sm text-cta-label mb-0.5">{label}</div>
        <a
          href={href}
          className="text-base font-semibold text-cta-value hover:text-cta-accent transition-colors break-all focus-visible:outline-none focus-visible:underline"
        >
          {value}
        </a>
      </div>

      {/* Copy */}
      <button
        onClick={handleCopy}
        className="flex-shrink-0 p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        style={{ color: 'var(--cta-copy)' }}
        aria-label={copied ? 'Copied!' : `Copy ${label}`}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
      >
        {copied
          ? <Check className="w-5 h-5 text-brand-400" aria-hidden="true" />
          : <Copy  className="w-5 h-5"               aria-hidden="true" />
        }
      </button>

      {/* Copied toast */}
      {copied && (
        <div
          className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md text-sm font-semibold text-white shadow-lg"
          style={{ background: 'var(--brand-600)' }}
          role="status"
          aria-live="polite"
        >
          Copied!
        </div>
      )}
    </div>
  );
};

/* ── Main CTA ──────────────────────────────────────────────────────────── */
const PremiumCTA = () => {
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  const { data: siteSettings } = useSiteSettings();

  const email    = siteSettings?.primary_email  || 'info@sentivra.com';
  const phone    = siteSettings?.primary_phone  || '+1 (555) 123-4567';
  const whatsapp = siteSettings?.whatsapp_number || '1234567890';

  return (
    <section
      className="relative py-20 md:py-32 overflow-hidden"
      style={{ background: 'var(--cta-deep)' }}
    >
      {/* Top hairline */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, var(--cta-hairline), transparent)' }}
      />

      {/* Aurora glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl mix-blend-screen opacity-40"
          style={{ background: 'var(--cta-aurora-1)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl mix-blend-screen opacity-40"
          style={{ background: 'var(--cta-aurora-2)' }}
        />
      </div>

      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.75) 100%)',
            'linear-gradient(to right, rgba(13,158,130,0.04) 1px, transparent 1px)',
            'linear-gradient(to bottom, rgba(13,158,130,0.04) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: 'auto, 60px 60px, 60px 60px',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${isRTL ? 'lg:grid-flow-dense' : ''}`}>

          {/* Left — heading + buttons */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className={isRTL ? 'lg:col-start-2' : ''}
          >
            <motion.p
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-wider text-cta-accent mb-4"
            >
              {t('home.cta.eyebrow') || "Let's Work Together"}
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="font-extrabold mb-6 text-cta-heading pb-1"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                lineHeight: '1.12',
                background: 'linear-gradient(135deg, #FFFFFF 0%, var(--brand-400) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                /* Solid fallback */
                color: '#FFFFFF',
              }}
            >
              {t('home.cta.title') || "Let's Turn Your Ideas Into Real Products"}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.16 }}
              className="text-xl text-cta-subtitle mb-10 leading-relaxed max-w-xl"
            >
              {t('home.cta.subtitle') || 'Transform your vision into reality with our expert team.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.24 }}
              className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}
            >
              {/* Primary — white on dark */}
              <Button size="lg" variant="light" className="shadow-xl hover:shadow-sparkle group" asChild>
                <Link to="/contact" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {t('home.cta.primaryButton') || 'Start Your Project'}
                  <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} aria-hidden="true" />
                </Link>
              </Button>

              {/* Secondary — glass outline */}
              <Button size="lg" variant="outline-white" asChild>
                <Link to="/mockups">{t('home.cta.secondaryButton') || 'View Our Work'}</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right — contact channels */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className={isRTL ? 'lg:col-start-1 lg:row-start-1' : ''}
          >
            <div
              className="p-7 rounded-2xl backdrop-blur-xl shadow-2xl space-y-4"
              style={{
                background: 'var(--cta-card-bg)',
                border: '1px solid var(--cta-card-border)',
              }}
            >
              <h3 className="text-2xl font-bold text-cta-card-heading mb-5">
                {t('home.cta.contactTitle') || 'Get In Touch'}
              </h3>

              <ContactChannel icon={Mail}           label={t('home.cta.email')    || 'Email'}    value={email}    href={`mailto:${email}`}                           isRTL={isRTL} />
              <ContactChannel icon={Phone}          label={t('home.cta.phone')    || 'Phone'}    value={phone}    href={`tel:${phone.replace(/\s/g, '')}`}            isRTL={isRTL} />
              <ContactChannel icon={MessageCircle}  label={t('home.cta.whatsapp') || 'WhatsApp'} value={whatsapp} href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} isRTL={isRTL} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PremiumCTA;
