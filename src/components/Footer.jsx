import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Github, Linkedin, Facebook, Instagram, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';
import InverseSurface from '@/components/ui/InverseSurface';
import { useSiteSettings, useServices } from '@/hooks/useContent';
import { useTranslation } from '@/i18n/useTranslation';
import { useTheme } from '@/theme/useTheme';

const Footer = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { theme, setTheme } = useTheme();
  const isRTL = language === 'ar';
  
  const { data: siteSettings } = useSiteSettings();
  const { data: services = [] } = useServices();
  
  // Get only published services, limit to 6
  const publishedServices = services.filter(s => s.is_active).slice(0, 6);
  
  // Get contact details from site_settings
  const email = siteSettings?.primary_email || 'info@sentivra.com';
  const phone = siteSettings?.primary_phone || '+20 123 456 7890';
  const whatsapp = siteSettings?.whatsapp_number || phone;
  const location = siteSettings?.location || t('footer.location');
  const footerDescription = language === 'ar' 
    ? (siteSettings?.footer_description_ar || t('footer.tagline'))
    : (siteSettings?.footer_description_en || t('footer.tagline'));
  
  // Social links from site_settings
  const socialLinks = [
    { 
      icon: Github, 
      url: siteSettings?.github_url || 'https://github.com/sentivra12',
      label: 'GitHub'
    },
    { 
      icon: Linkedin, 
      url: siteSettings?.linkedin_url || 'https://www.linkedin.com/in/sentivra',
      label: 'LinkedIn'
    },
    { 
      icon: Facebook, 
      url: siteSettings?.facebook_url || 'https://www.facebook.com/share/16vwkvzbwi/',
      label: 'Facebook'
    },
    { 
      icon: Instagram, 
      url: siteSettings?.instagram_url || 'https://instagram.com/sentivra',
      label: 'Instagram'
    },
  ];

  const handleNavClick = (e, path) => {
    e.preventDefault();
    navigate(path);
    if (path.includes('#')) {
      const id = path.split('#')[1];
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <InverseSurface as="footer" withTopGlow withGrid>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          
          {/* Column 1: Brand + Description + Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Logo */}
            <Link 
              to="/" 
              onClick={(e) => handleNavClick(e, '/')}
              className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''} group`}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-inverse-glass-bg border border-inverse-glass-border group-hover:bg-inverse-glass-hover transition-colors">
                <span className="text-2xl font-bold text-inverse-accent">S</span>
              </div>
              <span className="text-2xl font-bold text-inverse-fg">
                entivra
              </span>
            </Link>

            {/* Description */}
            <p className="text-inverse-fg-muted leading-relaxed text-sm max-w-xs">
              {footerDescription}
            </p>

            {/* Social Icons - Glass buttons */}
            <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-inverse-glass-bg border border-inverse-glass-border hover:bg-inverse-glass-hover hover:border-inverse-accent transition-all duration-200 group"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-inverse-fg-muted group-hover:text-inverse-accent transition-colors" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-6 text-inverse-fg">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-3">
              {[
                { label: t('nav.home'), path: '/' },
                { label: t('footer.aboutUs'), path: '/about' },
                { label: t('nav.services'), path: '/services' },
                { label: t('nav.mockups'), path: '/mockups' },
                { label: t('nav.contact'), path: '/contact' },
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href={link.path}
                    onClick={(e) => handleNavClick(e, link.path)}
                    className="text-inverse-fg-muted hover:text-inverse-accent transition-colors text-sm inline-block min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-inverse-ring rounded"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Our Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-6 text-inverse-fg">
              {t('footer.ourServices')}
            </h3>
            <ul className="space-y-3">
              {publishedServices.map((service) => (
                <li key={service.id}>
                  <Link
                    to={`/services/${service.slug}`}
                    onClick={(e) => handleNavClick(e, `/services/${service.slug}`)}
                    className="text-inverse-fg-muted hover:text-inverse-accent transition-colors text-sm inline-block min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-inverse-ring rounded"
                  >
                    {language === 'ar' ? (service.title_ar || service.title) : (service.title_en || service.title)}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Contact Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-6 text-inverse-fg">
              {t('footer.contactUs')}
            </h3>
            <ul className="space-y-4">
              {/* Email */}
              <li>
                <a
                  href={`mailto:${email}`}
                  className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''} text-inverse-fg-muted hover:text-inverse-accent transition-colors text-sm group min-h-[44px] focus:outline-none focus:ring-2 focus:ring-inverse-ring rounded p-1 -m-1`}
                >
                  <Mail className="w-5 h-5 text-inverse-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="break-all" dir="ltr">{email}</span>
                </a>
              </li>

              {/* Phone */}
              <li>
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''} text-inverse-fg-muted hover:text-inverse-accent transition-colors text-sm group min-h-[44px] focus:outline-none focus:ring-2 focus:ring-inverse-ring rounded p-1 -m-1`}
                >
                  <Phone className="w-5 h-5 text-inverse-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span dir="ltr">{phone}</span>
                </a>
              </li>

              {/* Location */}
              <li>
                <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''} text-inverse-fg-muted text-sm`}>
                  <MapPin className="w-5 h-5 text-inverse-accent flex-shrink-0 mt-0.5" />
                  <span>{location}</span>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar with subtle top border */}
      <div className="border-t border-inverse-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className={`flex flex-col md:flex-row justify-between items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            
            {/* Copyright */}
            <p className="text-inverse-fg-subtle text-sm text-center md:text-left">
              {t('footer.copyright', { year: currentYear })}
            </p>

            {/* Links + Controls */}
            <div className={`flex flex-wrap items-center gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Legal Links - only if routes exist */}
              <div className={`flex gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <a 
                  href="/privacy" 
                  onClick={(e) => handleNavClick(e, '/privacy')}
                  className="text-inverse-fg-subtle hover:text-inverse-accent transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-inverse-ring rounded min-h-[44px] flex items-center"
                >
                  {t('footer.privacyPolicy')}
                </a>
                <a 
                  href="/terms" 
                  onClick={(e) => handleNavClick(e, '/terms')}
                  className="text-inverse-fg-subtle hover:text-inverse-accent transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-inverse-ring rounded min-h-[44px] flex items-center"
                >
                  {t('footer.termsOfService')}
                </a>
              </div>

              {/* Theme Toggle - Compact */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-inverse-fg-subtle hover:text-inverse-accent transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-inverse-ring rounded px-2 py-1"
                aria-label={t('theme.title')}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              {/* Back to top button */}
              <button
                onClick={scrollToTop}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-inverse-glass-bg border border-inverse-glass-border hover:bg-inverse-glass-hover hover:border-inverse-accent transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-inverse-ring"
                aria-label={t('footer.backToTop')}
              >
                <ArrowUp className="w-5 h-5 text-inverse-fg-muted group-hover:text-inverse-accent transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </InverseSurface>
  );
};

export default Footer;
