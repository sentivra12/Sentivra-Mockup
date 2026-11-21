import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Github, Linkedin, Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import InverseSurface from '@/components/ui/InverseSurface';
import Logo from '@/components/ui/Logo';
import { useSiteSettings, useServices } from '@/hooks/useContent';
import { useTranslation } from '@/i18n/useTranslation';

/* ─── Compact Footer ────────────────────────────────────────────────────────
   Phone  ≤ 768 px  → target ≤ 320 px tall
   Desktop ≥ 769 px  → target ≤ 260 px tall (1440), ≤ 300 px (1024)
   ─────────────────────────────────────────────────────────────────────────── */

const Footer = () => {
  const navigate  = useNavigate();
  const { t, language } = useTranslation();
  const isRTL     = language === 'ar';

  const { data: siteSettings } = useSiteSettings();
  const { data: services = [] } = useServices();

  const publishedServices = services.filter(s => s.is_active).slice(0, 5);

  const email    = siteSettings?.primary_email  || 'info@sentivra.com';
  const phone    = siteSettings?.primary_phone  || '+20 123 456 7890';
  const loc      = siteSettings?.location       || t('footer.location');
  const tagline  = language === 'ar'
    ? (siteSettings?.footer_description_ar || t('footer.tagline'))
    : (siteSettings?.footer_description_en || t('footer.tagline'));

  const socialLinks = [
    { icon: Github,    url: siteSettings?.github_url    || 'https://github.com/sentivra12',              label: 'GitHub'    },
    { icon: Linkedin,  url: siteSettings?.linkedin_url  || 'https://www.linkedin.com/in/sentivra',       label: 'LinkedIn'  },
    { icon: Facebook,  url: siteSettings?.facebook_url  || 'https://www.facebook.com/share/16vwkvzbwi/', label: 'Facebook'  },
    { icon: Instagram, url: siteSettings?.instagram_url || 'https://instagram.com/sentivra',             label: 'Instagram' },
  ];

  const nav = (e, path) => {
    e.preventDefault();
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  /* ── Shared link class ─────────────────────────────────────────────────── */
  // Desktop: py-1 gives ~8px vertical padding each side → 27px line + 16px pad = 43px clickable
  // Mobile: min-h-[36px] with flex items-center
  const linkCls = [
    'text-inverse-fg-muted hover:text-inverse-accent transition-colors',
    'text-[13px]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-ring rounded',
  ].join(' ');

  /* ── Icon button (social / contact) ───────────────────────────────────── */
  const iconBtnCls = [
    'flex items-center justify-center w-10 h-10 rounded-lg shrink-0',
    'bg-inverse-glass-bg border border-inverse-glass-border',
    'hover:bg-inverse-glass-hover hover:border-inverse-accent',
    'transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-ring',
  ].join(' ');

  return (
    <InverseSurface as="footer" withTopGlow>
      {/* ── MAIN BODY ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3 md:pt-6 md:pb-4">

        {/* ── DESKTOP layout (md+): single row ──────────────────────────── */}
        <div className={`hidden md:flex items-start gap-10 ${isRTL ? 'flex-row-reverse' : ''}`}>

          {/* Brand col */}
          <div className={`flex flex-col gap-3 shrink-0 w-44 ${isRTL ? 'items-end' : 'items-start'}`}>
            <Link to="/" onClick={(e) => nav(e, '/')} aria-label="Sentivra home">
              <Logo variant="light" size={32} />
            </Link>
            <p className="text-inverse-fg-muted text-[12px] leading-snug line-clamp-2">
              {tagline}
            </p>
            {/* Social icons */}
            <div className={`flex gap-2 mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {socialLinks.map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                  className={iconBtnCls} aria-label={s.label}>
                  <s.icon className="w-4 h-4 text-inverse-fg-muted group-hover:text-inverse-accent" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav col */}
          <div className={`flex-1 flex gap-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Company links */}
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-inverse-fg-subtle mb-2">
                {t('footer.quickLinks')}
              </p>
              <ul className="space-y-0">
                {[
                  { label: t('nav.home'),       path: '/'        },
                  { label: t('footer.aboutUs'), path: '/about'   },
                  { label: t('nav.services'),   path: '/services'},
                  { label: t('nav.mockups'),    path: '/mockups' },
                  { label: t('nav.contact'),    path: '/contact' },
                ].map((link) => (
                  <li key={link.path}>
                    <a href={link.path} onClick={(e) => nav(e, link.path)}
                      className={`${linkCls} block py-1 leading-[1.6]`}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services links */}
            {publishedServices.length > 0 && (
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-inverse-fg-subtle mb-2">
                  {t('footer.ourServices')}
                </p>
                <ul className="space-y-0">
                  {publishedServices.map((svc) => (
                    <li key={svc.id}>
                      <Link to={`/services/${svc.slug}`}
                        onClick={(e) => nav(e, `/services/${svc.slug}`)}
                        className={`${linkCls} block py-1 leading-[1.6]`}>
                        {language === 'ar' ? (svc.title_ar || svc.title) : (svc.title_en || svc.title)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Contact col */}
          <div className={`shrink-0 flex flex-col gap-2 ${isRTL ? 'items-end text-right' : 'items-start text-left'}`}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-inverse-fg-subtle mb-0">
              {t('footer.contactUs')}
            </p>
            <a href={`mailto:${email}`}
              className={`flex items-center gap-2 text-inverse-fg-muted hover:text-inverse-accent text-[13px] min-h-[32px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-ring rounded ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Mail className="w-4 h-4 text-inverse-accent shrink-0" />
              <span dir="ltr" className="text-[12px]">{email}</span>
            </a>
            <a href={`tel:${phone.replace(/\s/g, '')}`}
              className={`flex items-center gap-2 text-inverse-fg-muted hover:text-inverse-accent text-[13px] min-h-[32px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-ring rounded ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Phone className="w-4 h-4 text-inverse-accent shrink-0" />
              <span dir="ltr" className="text-[12px]">{phone}</span>
            </a>
            <div className={`flex items-center gap-2 text-inverse-fg-muted text-[12px] ${isRTL ? 'flex-row-reverse' : ''}`}>
              <MapPin className="w-4 h-4 text-inverse-accent shrink-0" />
              <span>{loc}</span>
            </div>
          </div>
        </div>

        {/* ── MOBILE layout (<md): stacked compact ──────────────────────── */}
        <div className={`flex flex-col gap-3 md:hidden`}>

          {/* Row 1: logo + tagline */}
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link to="/" onClick={(e) => nav(e, '/')} aria-label="Sentivra home" className="shrink-0">
              <Logo variant="light" size={28} />
            </Link>
            <p className="text-inverse-fg-muted text-[13px] leading-tight truncate">
              {tagline}
            </p>
          </div>

          {/* Row 2: all nav links — 2 columns */}
          <div className={`grid grid-cols-2 gap-x-6 gap-y-0 ${isRTL ? 'text-right' : 'text-left'}`}>
            {[
              { label: t('nav.home'),       path: '/'        },
              { label: t('footer.aboutUs'), path: '/about'   },
              { label: t('nav.services'),   path: '/services'},
              { label: t('nav.mockups'),    path: '/mockups' },
              { label: t('nav.contact'),    path: '/contact' },
              ...publishedServices.slice(0, 3).map(svc => ({
                label: language === 'ar' ? (svc.title_ar || svc.title) : (svc.title_en || svc.title),
                path: `/services/${svc.slug}`,
              })),
            ].map((link) => (
              <a key={link.path} href={link.path} onClick={(e) => nav(e, link.path)}
                className={`${linkCls} flex items-center min-h-[32px] text-[13px] truncate overflow-hidden`}>
                {link.label}
              </a>
            ))}
          </div>

          {/* Row 3: contact + social icons in one row */}
          <div className={`flex items-center gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
            <a href={`mailto:${email}`} className={iconBtnCls} aria-label={email}>
              <Mail className="w-4 h-4 text-inverse-accent" />
            </a>
            <a href={`tel:${phone.replace(/\s/g, '')}`} className={iconBtnCls} aria-label={phone}>
              <Phone className="w-4 h-4 text-inverse-accent" />
            </a>
            <div className={iconBtnCls} aria-label={loc} title={loc}>
              <MapPin className="w-4 h-4 text-inverse-accent" />
            </div>
            {socialLinks.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                className={iconBtnCls} aria-label={s.label}>
                <s.icon className="w-4 h-4 text-inverse-fg-muted" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ──────────────────────────────────────────────────── */}
      <div className="border-t border-inverse-border-subtle">
        {/* Bottom bar — pb-20 on mobile clears the fixed 56px WhatsApp button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-20 md:py-2"
          style={{ paddingBottom: undefined }}
        >
          <div className={`flex items-center justify-between gap-x-3 gap-y-0 flex-nowrap ${isRTL ? 'flex-row-reverse' : ''}`}>
            <p className="text-inverse-fg-subtle text-[12px] whitespace-nowrap shrink-0">
              {t('footer.copyright', { year: currentYear })}
            </p>
            <div className={`flex items-center gap-3 shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {['/privacy', '/terms'].map((path, i) => (
                <a key={path} href={path} onClick={(e) => nav(e, path)}
                  className="text-inverse-fg-subtle hover:text-inverse-accent transition-colors text-[12px] whitespace-nowrap min-h-[32px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-ring rounded">
                  {i === 0 ? t('footer.privacyPolicy') : t('footer.termsOfService')}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </InverseSurface>
  );
};

export default Footer;
