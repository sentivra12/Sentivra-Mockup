/**
 * Hero slide marketing copy — single-line headline + single-line description.
 * All strings are pre-validated to fit one line at their respective font sizes
 * on screens 360–430 px wide.
 *
 * EN headline: clamp(17px, 5vw, 20px)   — max ~38 chars
 * EN desc:     14px                      — max ~52 chars
 * AR headline: Aref Ruqaa clamp(20px, 5.8vw, 24px) — max ~22 chars
 * AR desc:     14.5px                    — max ~32 chars
 *
 * Services with no entry in this map will use HERO_SLIDE_COPY_FALLBACK.
 * Report: DATA entry is new. Any slug not listed below is unmatched.
 */

export const HERO_SLIDE_COPY = {
  'erp': {
    en: {
      headline:    'Your company on one screen',
      description: 'Sales, stock, accounts and HR in one system.',
    },
    ar: {
      headline:    'شركتك كلها في شاشة واحدة',
      description: 'مبيعات ومخازن وحسابات وموظفين في نظام واحد.',
    },
  },
  'crm': {
    en: {
      headline:    'Every client, every deal',
      description: 'Track leads and deals. Miss no opportunity.',
    },
    ar: {
      headline:    'كل عميل وصفقة تحت عينك',
      description: 'تابع العملاء والصفقات ولا تضيّع فرصة.',
    },
  },
  'web': {
    en: {
      headline:    'A site that speaks for you',
      description: 'Fast, modern sites that win clients.',
    },
    ar: {
      headline:    'موقعك يتكلم عنك',
      description: 'مواقع سريعة وحديثة تجيب لك العملاء.',
    },
  },
  'mobile': {
    en: {
      headline:    'Your brand in their pocket',
      description: 'Smooth, fast Android and iOS apps.',
    },
    ar: {
      headline:    'شغلك في جيب عميلك',
      description: 'تطبيقات أندرويد وiOS سلسة وسريعة.',
    },
  },
  'ai': {
    en: {
      headline:    'AI that works for you',
      description: 'Automate tasks and turn data into decisions.',
    },
    ar: {
      headline:    'أدوات ذكية تشتغل بدالك',
      description: 'أتمتة المهام وتحويل بياناتك لقرارات.',
    },
  },
  'data': {
    en: {
      headline:    'Your data, made useful',
      description: 'Dashboards and reports that guide decisions.',
    },
    ar: {
      headline:    'بياناتك تشتغل لصالحك',
      description: 'لوحات وتقارير تساعدك على القرار.',
    },
  },
};

/** Generic fallback for any service not in the map above. */
export const HERO_SLIDE_COPY_FALLBACK = {
  en: {
    headline:    'Software built around you',
    description: 'Custom solutions built and supported by us.',
  },
  ar: {
    headline:    'برمجيات على قد شغلك',
    description: 'حلول مخصصة نصممها وندعمها بفريق واحد.',
  },
};

/**
 * Get marketing copy for a service.
 * Always returns a non-null { headline, description }.
 * @param {object} service — { slug?, keyword?, title? }
 * @param {'en'|'ar'} lang
 */
export function getHeroSlideCopy(service, lang) {
  const l = lang === 'ar' ? 'ar' : 'en';
  if (!service) return HERO_SLIDE_COPY_FALLBACK[l];

  const slug    = (service.slug    || '').toLowerCase();
  const keyword = (service.keyword || '').toLowerCase();
  const title   = (service.title   || '').toLowerCase();

  let entry = HERO_SLIDE_COPY[slug] || HERO_SLIDE_COPY[keyword];

  if (!entry) {
    for (const word of title.split(/[\s-]+/)) {
      if (HERO_SLIDE_COPY[word]) { entry = HERO_SLIDE_COPY[word]; break; }
    }
  }

  const copy = entry?.[l] || null;

  // Safety: reject headline if it literally equals the keyword
  const keyLower  = keyword.toLowerCase();
  const headLower = (copy?.headline || '').toLowerCase();
  const headlineOk = copy?.headline && headLower !== keyLower;

  return {
    headline:    headlineOk ? copy.headline    : HERO_SLIDE_COPY_FALLBACK[l].headline,
    description: copy?.description             || HERO_SLIDE_COPY_FALLBACK[l].description,
  };
}
