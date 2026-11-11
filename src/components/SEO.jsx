import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';

/**
 * SEO Component - Manages dynamic meta tags for bilingual site
 * Updates: title, description, og tags, language, and canonical URLs
 */
export function SEO({ 
  title, 
  description, 
  image = '/sentivra-logo.svg',
  type = 'website',
  noindex = false 
}) {
  const { language } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', language);

    // Update document title
    if (title) {
      document.title = title;
    }

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.setAttribute('content', description);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && title) {
      ogTitle.setAttribute('content', title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription && description) {
      ogDescription.setAttribute('content', description);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && image) {
      const fullImageUrl = image.startsWith('http') 
        ? image 
        : `${window.location.origin}${image}`;
      ogImage.setAttribute('content', fullImageUrl);
    }

    const ogType = document.querySelector('meta[property="og:type"]');
    if (ogType) {
      ogType.setAttribute('content', type);
    }

    // Update og:locale based on language
    let ogLocale = document.querySelector('meta[property="og:locale"]');
    if (!ogLocale) {
      ogLocale = document.createElement('meta');
      ogLocale.setAttribute('property', 'og:locale');
      document.head.appendChild(ogLocale);
    }
    ogLocale.setAttribute('content', language === 'ar' ? 'ar_EG' : 'en_US');

    // Add og:locale:alternate
    let ogLocaleAlternate = document.querySelector('meta[property="og:locale:alternate"]');
    if (!ogLocaleAlternate) {
      ogLocaleAlternate = document.createElement('meta');
      ogLocaleAlternate.setAttribute('property', 'og:locale:alternate');
      document.head.appendChild(ogLocaleAlternate);
    }
    ogLocaleAlternate.setAttribute('content', language === 'ar' ? 'en_US' : 'ar_EG');

    // Update og:url with current path
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', window.location.origin + location.pathname);
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + location.pathname);

    // Add hreflang tags for bilingual support
    // Remove existing hreflang tags first
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => link.remove());

    // Add English version
    const hreflangEn = document.createElement('link');
    hreflangEn.setAttribute('rel', 'alternate');
    hreflangEn.setAttribute('hreflang', 'en');
    hreflangEn.setAttribute('href', window.location.origin + location.pathname);
    document.head.appendChild(hreflangEn);

    // Add Arabic version
    const hreflangAr = document.createElement('link');
    hreflangAr.setAttribute('rel', 'alternate');
    hreflangAr.setAttribute('hreflang', 'ar');
    hreflangAr.setAttribute('href', window.location.origin + location.pathname);
    document.head.appendChild(hreflangAr);

    // Add x-default (fallback)
    const hreflangDefault = document.createElement('link');
    hreflangDefault.setAttribute('rel', 'alternate');
    hreflangDefault.setAttribute('hreflang', 'x-default');
    hreflangDefault.setAttribute('href', window.location.origin + location.pathname);
    document.head.appendChild(hreflangDefault);

    // Update robots meta tag
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', noindex ? 'noindex, nofollow' : 'index, follow');

    // Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle && title) {
      twitterTitle.setAttribute('content', title);
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription && description) {
      twitterDescription.setAttribute('content', description);
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage && image) {
      const fullImageUrl = image.startsWith('http') 
        ? image 
        : `${window.location.origin}${image}`;
      twitterImage.setAttribute('content', fullImageUrl);
    }
  }, [title, description, image, type, language, location.pathname, noindex]);

  return null; // This component doesn't render anything
}

/**
 * Hook to get SEO metadata based on current language
 */
export function useSEO() {
  const { t, language } = useTranslation();
  
  return {
    language,
    getMetadata: (pageKey) => {
      // Define SEO metadata for each page
      const metadata = {
        home: {
          en: {
            title: 'Sentivra - Building Modern Digital Solutions That Drive Results',
            description: 'Transform your business with custom web applications, mobile apps, ERP systems, and AI solutions. Trusted partner for businesses across Egypt, UAE, and Oman.',
          },
          ar: {
            title: 'سينتيفرا - نبني حلولاً رقمية حديثة تحقق النتائج',
            description: 'حوّل أعمالك مع تطبيقات ويب مخصصة، تطبيقات موبايل، أنظمة ERP، وحلول الذكاء الاصطناعي. شريكك الموثوق للشركات في مصر والإمارات وعُمان.',
          },
        },
        services: {
          en: {
            title: 'Our Services - Custom Software Development | Sentivra',
            description: 'Explore our comprehensive software development services: web apps, mobile apps, ERP systems, CRM solutions, AI chatbots, and data analysis.',
          },
          ar: {
            title: 'خدماتنا - تطوير برمجيات مخصصة | سينتيفرا',
            description: 'اكتشف خدمات التطوير البرمجي الشاملة: تطبيقات ويب، تطبيقات موبايل، أنظمة ERP، حلول CRM، روبوتات الذكاء الاصطناعي، وتحليل البيانات.',
          },
        },
        mockups: {
          en: {
            title: 'Ready-Made Mockups - Quick Start Templates | Sentivra',
            description: 'Browse our collection of professional, ready-made mockups for web and mobile applications. Fast, affordable, and customizable solutions.',
          },
          ar: {
            title: 'قوالب جاهزة - نماذج للبدء السريع | سينتيفرا',
            description: 'تصفح مجموعتنا من القوالب الاحترافية الجاهزة لتطبيقات الويب والموبايل. حلول سريعة وبأسعار معقولة وقابلة للتخصيص.',
          },
        },
        about: {
          en: {
            title: 'About Sentivra - Your Digital Transformation Partner',
            description: 'Learn about Sentivra, a full-service software company empowering businesses across MENA with cutting-edge digital solutions.',
          },
          ar: {
            title: 'عن سينتيفرا - شريكك في التحول الرقمي',
            description: 'تعرّف على سينتيفرا، شركة برمجيات متكاملة تمكّن الشركات في منطقة الشرق الأوسط بحلول رقمية متطورة.',
          },
        },
        contact: {
          en: {
            title: 'Contact Us - Get Your Free Consultation | Sentivra',
            description: 'Ready to start your project? Contact Sentivra today for a free consultation. We serve clients in Egypt, UAE, and Oman.',
          },
          ar: {
            title: 'تواصل معنا - احصل على استشارة مجانية | سينتيفرا',
            description: 'جاهز لبدء مشروعك؟ تواصل مع سينتيفرا اليوم للحصول على استشارة مجانية. نخدم العملاء في مصر والإمارات وعُمان.',
          },
        },
      };

      return metadata[pageKey]?.[language] || metadata.home[language];
    },
  };
}
