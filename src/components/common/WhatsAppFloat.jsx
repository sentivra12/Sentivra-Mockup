/**
 * WhatsAppFloat — Site-wide floating WhatsApp button
 */

import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { useSiteSettings } from '@/hooks/useContent';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 24, height: 24 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export default function WhatsAppFloat() {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t, language } = useTranslation();
  const { data: siteSettings } = useSiteSettings();
  const isRTL = language === 'ar';

  // Hide on admin routes first
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Detect mobile menu state
  useEffect(() => {
    const checkMenu = () => {
      const menu = document.getElementById('mobile-menu-panel');
      setIsMobileMenuOpen(!!menu);
    };
    
    const observer = new MutationObserver(checkMenu);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

  // Fallback chain: site settings > hardcoded default (same as old hero button)
  const phoneNumber = useMemo(() => {
    const num = siteSettings?.whatsapp_number || siteSettings?.whatsapp || siteSettings?.primary_phone || '201558952126';
    return String(num).replace(/\D/g, '');
  }, [siteSettings]);

  const message = encodeURIComponent(
    language === 'ar'
      ? 'مرحباً Sentivra، أود الاستفسار عن خدماتكم.'
      : "Hello Sentivra, I'd like to ask about your services."
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const href = `https://wa.me/${phoneNumber}?text=${message}`;
  const ariaLabel = isRTL ? 'تواصل عبر واتساب' : 'Chat on WhatsApp';

  // Hide if mobile menu is open
  if (isMobileMenuOpen) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      title={ariaLabel}
      style={{
        position: 'fixed',
        [isRTL ? 'right' : 'left']: '16px',
        bottom: 'calc(16px + env(safe-area-inset-bottom))',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'rgb(16, 185, 129)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        zIndex: 50,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'scale(1)' : 'scale(0.9)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
    >
      <WhatsAppIcon />
    </a>
  );
}
