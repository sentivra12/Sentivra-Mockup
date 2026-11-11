/**
 * Analytics Tracking Wrapper
 * Unified interface for tracking events across multiple platforms
 * Only loads scripts if IDs are configured in site settings
 */

let initialized = false;
let config = {
  metaPixelId: null,
  ga4MeasurementId: null,
  googleAdsId: null,
  googleAdsLabel: null,
  tiktokPixelId: null,
};

/**
 * Initializes analytics with tracking IDs from site settings
 * @param {Object} settings - Site settings with tracking IDs
 */
export function initAnalytics(settings) {
  if (initialized || typeof window === 'undefined') return;
  
  config = {
    metaPixelId: settings?.meta_pixel_id || null,
    ga4MeasurementId: settings?.ga4_measurement_id || null,
    googleAdsId: settings?.google_ads_id || null,
    googleAdsLabel: settings?.google_ads_conversion_label || null,
    tiktokPixelId: settings?.tiktok_pixel_id || null,
  };
  
  // Load scripts after page is interactive (non-blocking)
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    loadScripts();
  } else {
    window.addEventListener('DOMContentLoaded', loadScripts);
  }
  
  initialized = true;
}

/**
 * Loads third-party tracking scripts (only if IDs are configured)
 */
function loadScripts() {
  // Meta Pixel
  if (config.metaPixelId) {
    loadMetaPixel(config.metaPixelId);
  }
  
  // Google Analytics 4
  if (config.ga4MeasurementId) {
    loadGA4(config.ga4MeasurementId);
  }
  
  // Google Ads
  if (config.googleAdsId) {
    loadGoogleAds(config.googleAdsId);
  }
  
  // TikTok Pixel
  if (config.tiktokPixelId) {
    loadTikTokPixel(config.tiktokPixelId);
  }
}

/**
 * Loads Meta (Facebook) Pixel
 */
function loadMetaPixel(pixelId) {
  if (window.fbq) return; // Already loaded
  
  const script = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  
  const scriptEl = document.createElement('script');
  scriptEl.innerHTML = script;
  document.head.appendChild(scriptEl);
  
  console.log('[Analytics] Meta Pixel loaded');
}

/**
 * Loads Google Analytics 4
 */
function loadGA4(measurementId) {
  if (window.gtag) return; // Already loaded
  
  // Load gtag.js
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
  
  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', measurementId);
  
  console.log('[Analytics] GA4 loaded');
}

/**
 * Loads Google Ads conversion tracking
 */
function loadGoogleAds(adsId) {
  if (window.gtag) return; // Uses same gtag as GA4
  
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${adsId}`;
  document.head.appendChild(script);
  
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', adsId);
  
  console.log('[Analytics] Google Ads loaded');
}

/**
 * Loads TikTok Pixel
 */
function loadTikTokPixel(pixelId) {
  if (window.ttq) return; // Already loaded
  
  const script = `
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load('${pixelId}');
      ttq.page();
    }(window, document, 'ttq');
  `;
  
  const scriptEl = document.createElement('script');
  scriptEl.innerHTML = script;
  document.head.appendChild(scriptEl);
  
  console.log('[Analytics] TikTok Pixel loaded');
}

/**
 * Tracks a custom event across all platforms
 * @param {string} eventName - Event name
 * @param {Object} params - Event parameters
 */
export function track(eventName, params = {}) {
  if (typeof window === 'undefined') return;
  
  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', eventName, params);
  }
  
  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
  
  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track(eventName, params);
  }
  
  // Console log in development
  if (import.meta.env.DEV) {
    console.log('[Analytics] Event:', eventName, params);
  }
}

/**
 * Tracks a conversion (form submission, purchase, etc.)
 * @param {string} conversionLabel - Conversion label (for Google Ads)
 * @param {Object} params - Conversion parameters
 */
export function trackConversion(conversionLabel, params = {}) {
  if (typeof window === 'undefined') return;
  
  // Google Ads conversion
  if (window.gtag && config.googleAdsId && conversionLabel) {
    window.gtag('event', 'conversion', {
      'send_to': `${config.googleAdsId}/${conversionLabel}`,
      ...params
    });
  }
  
  // Track as regular event too
  track('conversion', { ...params, label: conversionLabel });
}

// Pre-defined event helpers
export const analytics = {
  // Hero CTA clicks
  heroCTAClick: (buttonLabel) => track('hero_cta_click', { button: buttonLabel }),
  
  // Mockup interactions
  mockupView: (mockupId, mockupTitle) => track('mockup_view', { mockup_id: mockupId, mockup_title: mockupTitle }),
  
  // Design request flow
  designRequestStart: (mockupId) => track('design_request_start', { mockup_id: mockupId }),
  designRequestSubmit: (mockupId) => track('design_request_submit', { mockup_id: mockupId }),
  
  // WhatsApp
  whatsappClick: (source) => track('whatsapp_click', { source }),
  
  // Language switch
  languageSwitch: (fromLang, toLang) => track('language_switch', { from: fromLang, to: toLang }),
  
  // Contact form
  contactFormSubmit: () => track('contact_form_submit', {}),
};
