import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Github, Linkedin, Facebook, Instagram, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';
import InverseSurface from '@/components/ui/InverseSurface';
import Logo from '@/components/ui/Logo';
import { useSiteSettings, useServices } from '@/hooks/useContent';
import { useTranslation } from '@/i18n/useTranslation';
import { useTheme } from '@/theme/useTheme';
import MotionSettingsToggle from '@/components/MotionSettingsToggle';

const Footer = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { theme, setTheme } = useTheme();
  const isRTL = language === 'ar';

  const { data: siteSettings } = useSiteSettings();
  const { data: services = [] } = useServices();

  const publishedServices = services.filter(s => s.is_active).slice(0, 6);

  const email    = siteSettings?.primary_email  || 'info@sentivra.com';
  const phone    = siteSettings?.primary_phone  || '+20 123 456 7890';
  const location = siteSettings?.location       || t('footer.location');
  const footerDesc = language === 'ar'
    ? (siteSettings?.footer_description_ar || t('footer.tagline'))
    : (siteSettings?.footer_description_en || t('footer.tagline'));

  const socialLinks = [
    { icon: Github,    url: siteSettings?.github_url    || 'https://github.com/sentivra12',                 label: 'GitHub'    },
    { icon: Linkedin,  url: siteSettings?.linkedin_url  || 'https://www.linkedin.com/in/sentivra',          label: 'LinkedIn'  },
    { icon: Facebook,  url: siteSettings?.facebook_url  || 'https://www.facebook.com/share/16vwkvzbwi/',    label: 'Facebook'  },
    { icon: Instagram, url: siteSettings?.instagram_url || 'https://instagram.com/sentivra',                label: 'Instagram' },
  ];

  const handleNavClick = (e, path) => {
    e.preventDefault();
    navigate(path);
    if (path.includes('#')) {
      const id = path.split('#')[1];
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <InverseSurface as="footer" withTopGlow withGrid>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 ${isRTL ? 'text-right' : 'text-left'}`}>

          {/* Col 1 — Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="space-y-6"
          >
            <Link to="/" onClick={(e) => handleNavClick(e, '/')}>
              {/* Use light variant — white mark + white text on dark surface */}
              <Logo variant="light" size={36} />
            </Link>

            <p className="text-inverse-fg-muted text-sm leading-relaxed max-w-xs">
              {footerDesc}
            </p>

            <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-inverse-glass-bg border border-inverse-glass-border hover:bg-inverse-glass-hover hover:border-inverse-accent transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-ring"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-inverse-fg-muted group-hover:text-inverse-accent transition-colors" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Col 2 — Quick links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.08 }}
          >
            <h3 className="text-base font-bold mb-6 text-inverse-fg">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3">
              {[
                { label: t('nav.home'),     path: '/'        },
                { label: t('footer.aboutUs'), path: '/about' },
                { label: t('nav.services'), path: '/services' },
                { label: t('nav.mockups'),  path: '/mockups'  },
                { label: t('nav.contact'),  path: '/contact'  },
              ].map((link) => (
                <li key={link.path}>
                  <a
                    href={link.path}
                    onClick={(e) => handleNavClick(e, link.path)}
                    className="text-inverse-fg-muted hover:text-inverse-accent transition-colors text-sm inline-flex items-center min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-ring rounded"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Col 3 — Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.16 }}
          >
            <h3 className="text-base font-bold mb-6 text-inverse-fg">{t('footer.ourServices')}</h3>
            <ul className="space-y-3">
              {publishedServices.map((service) => (
                <li key={service.id}>
                  <Link
                    to={`/services/${service.slug}`}
                    onClick={(e) => handleNavClick(e, `/services/${service.slug}`)}
                    className="text-inverse-fg-muted hover:text-inverse-accent transition-colors text-sm inline-flex items-center min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-ring rounded"
                  >
                    {language === 'ar'
                      ? (service.title_ar || service.title)
                      : (service.title_en || service.title)}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Col 4 — Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.24 }}
          >
            <h3 className="text-base font-bold mb-6 text-inverse-fg">{t('footer.contactUs')}</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={`mailto:${email}`}
                  className={`flex items-start gap-3 text-inverse-fg-muted hover:text-inverse-accent transition-colors text-sm group min-h-[44px] p-1 -m-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-ring ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                >
                  <Mail className="w-5 h-5 text-inverse-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="break-all" dir="ltr">{email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className={`flex items-start gap-3 text-inverse-fg-muted hover:text-inverse-accent transition-colors text-sm group min-h-[44px] p-1 -m-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-ring ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                >
                  <Phone className="w-5 h-5 text-inverse-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span dir="ltr">{phone}</span>
                </a>
              </li>
              <li>
                <div className={`flex items-start gap-3 text-inverse-fg-muted text-sm ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <MapPin className="w-5 h-5 text-inverse-accent flex-shrink-0 mt-0.5" />
                  <span>{location}</span>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-inverse-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className={`flex flex-col md:flex-row justify-between items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <p className="text-inverse-fg-subtle text-sm">
              {t('footer.copyright', { year: currentYear })}
            </p>

            <div className={`flex flex-wrap items-center gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {['/privacy', '/terms'].map((path, i) => (
                  <a
                    key={path}
                    href={path}
                    onClick={(e) => handleNavClick(e, path)}
                    className="text-inverse-fg-subtle hover:text-inverse-accent transition-colors text-sm min-h-[44px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-ring rounded"
                  >
                    {i === 0 ? t('footer.privacyPolicy') : t('footer.termsOfService')}
                  </a>
                ))}
              </div>

              {/* Motion Settings Toggle */}
              <MotionSettingsToggle />

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-inverse-fg-subtle hover:text-inverse-accent transition-colors text-sm px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-ring rounded"
                aria-label={t('theme.title')}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-inverse-glass-bg border border-inverse-glass-border hover:bg-inverse-glass-hover hover:border-inverse-accent transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-ring"
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
