/**
 * Hero slide marketing copy - keyed by service slug/keyword (case-insensitive)
 * Each entry: { en: { headline, description }, ar: { headline, description } }
 *
 * Copy rules (task 1):
 *  - headline: max ~30 chars EN, ~18 chars AR — fits 2 lines at clamp(22px, 6vw, 26px)
 *  - description: max ~65 chars EN, ~50 chars AR — fits 2 lines at 15/16px lh 1.6/1.8
 */

export const HERO_SLIDE_COPY = {
  'erp': {
    en: {
      headline:    'Your company on one screen',
      description: 'Sales, inventory, accounting and HR in one organized system.',
    },
    ar: {
      headline:    'شركتك كلها في شاشة واحدة',
      description: 'مبيعات ومخازن وحسابات وموظفين في نظام واحد مترتب.',
    },
  },
  'crm': {
    en: {
      headline:    'Every client and deal in view',
      description: 'Track leads, follow-ups and deals so no opportunity slips away.',
    },
    ar: {
      headline:    'كل عميل وصفقة تحت عينك',
      description: 'تابع العملاء والصفقات من غير ما يضيع أي طلب.',
    },
  },
  'web': {
    en: {
      headline:    'A website that speaks for you',
      description: 'Fast, modern, responsive sites that turn visitors into clients.',
    },
    ar: {
      headline:    'موقعك يتكلم عنك',
      description: 'مواقع سريعة وحديثة تحوّل الزائر لعميل.',
    },
  },
  'mobile': {
    en: {
      headline:    'Your business in their pocket',
      description: 'Android and iOS apps with a smooth experience and fast performance.',
    },
    ar: {
      headline:    'شغلك في جيب عميلك',
      description: 'تطبيقات أندرويد وiOS بتجربة سلسة وأداء سريع.',
    },
  },
  'ai': {
    en: {
      headline:    'Smart tools that work for you',
      description: 'AI features that automate tasks and turn your data into decisions.',
    },
    ar: {
      headline:    'أدوات ذكية تشتغل بدالك',
      description: 'حلول ذكاء اصطناعي تؤتمت المهام وتحوّل بياناتك لقرارات.',
    },
  },
};

/**
 * Fallback copy for services not in the map above.
 * Report: AI was missing from the original map; added above.
 * Any other service slug not in the map gets this generic pair.
 */
export const HERO_SLIDE_COPY_FALLBACK = {
  en: {
    headline:    'Software built around your business',
    description: 'Custom solutions designed, built and supported by one team.',
  },
  ar: {
    headline:    'برمجيات مصممة على قد شغلك',
    description: 'حلول مخصصة نصممها وننفذها وندعمها بفريق واحد.',
  },
};

/**
 * Get marketing copy for a service. Always returns a non-null headline and description.
 * @param {object} service - Service object with slug, title, keyword
 * @param {string} lang - 'en' or 'ar'
 * @returns {{ headline: string, description: string }}
 */
export function getHeroSlideCopy(service, lang) {
  const l = lang === 'ar' ? 'ar' : 'en';

  if (!service) return HERO_SLIDE_COPY_FALLBACK[l];

  // Try: slug → keyword → title words (all lowercase)
  const slug    = (service.slug    || '').toLowerCase();
  const keyword = (service.keyword || '').toLowerCase();
  const title   = (service.title   || '').toLowerCase();

  let entry =
    HERO_SLIDE_COPY[slug] ||
    HERO_SLIDE_COPY[keyword];

  if (!entry) {
    for (const word of title.split(/[\s-]+/)) {
      if (HERO_SLIDE_COPY[word]) { entry = HERO_SLIDE_COPY[word]; break; }
    }
  }

  const copy = entry?.[l] || null;

  // Safety: skip headline only if it literally equals the keyword
  const keyLower = keyword.toLowerCase();
  const headLower = (copy?.headline || '').toLowerCase();
  const headlineOk = copy?.headline && headLower !== keyLower;

  return {
    headline:    headlineOk ? copy.headline : HERO_SLIDE_COPY_FALLBACK[l].headline,
    description: copy?.description      || HERO_SLIDE_COPY_FALLBACK[l].description,
  };
}
