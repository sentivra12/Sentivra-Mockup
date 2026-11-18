/**
 * Hero slide marketing copy - keyed by service slug/keyword (case-insensitive)
 * Each entry: { en: { headline, description }, ar: { headline, description } }
 */

export const HERO_SLIDE_COPY = {
  'erp': {
    en: {
      headline: 'Your whole company, on one screen',
      description: 'Sales, inventory, accounting and HR in one organized system.',
    },
    ar: {
      headline: 'شركتك كلها في شاشة واحدة',
      description: 'مبيعات، مخازن، حسابات وموظفين في نظام واحد مترتب.',
    },
  },
  'crm': {
    en: {
      headline: 'Every client in view, every deal on track',
      description: 'Track leads, follow-ups and deals so no opportunity slips away.',
    },
    ar: {
      headline: 'كل عميل في مكانه، وكل صفقة تحت عينك',
      description: 'تابع العملاء والمتابعات والصفقات من غير ما يضيع أي طلب.',
    },
  },
  'web': {
    en: {
      headline: 'A website that speaks before you do',
      description: 'Fast, modern, responsive sites that build trust and turn visitors into clients.',
    },
    ar: {
      headline: 'موقعك يتكلم عنك قبل ما تتكلم',
      description: 'مواقع سريعة وحديثة ومتجاوبة تبني الثقة وتحوّل الزائر لعميل.',
    },
  },
  'mobile': {
    en: {
      headline: 'Your business in your client\'s pocket',
      description: 'Android and iOS apps with a smooth experience and fast performance.',
    },
    ar: {
      headline: 'شغلك في جيب عميلك',
      description: 'تطبيقات أندرويد وiOS بتجربة سلسة وأداء سريع.',
    },
  },
};

/**
 * Get marketing copy for a service
 * @param {object} service - Service object with slug, title, keyword
 * @param {string} lang - 'en' or 'ar'
 * @returns {{ headline: string|null, description: string|null }}
 */
export function getHeroSlideCopy(service, lang) {
  if (!service) return { headline: null, description: null };
  
  // Try: slug → keyword → title (all lowercase)
  const slug = (service.slug || '').toLowerCase();
  const keyword = (service.keyword || '').toLowerCase();
  const title = (service.title || '').toLowerCase();
  
  let copy = HERO_SLIDE_COPY[slug] || HERO_SLIDE_COPY[keyword];
  
  // Try title fragments (e.g., "erp system" → "erp")
  if (!copy) {
    const titleWords = title.split(/[\s-]+/);
    for (const word of titleWords) {
      if (HERO_SLIDE_COPY[word]) {
        copy = HERO_SLIDE_COPY[word];
        break;
      }
    }
  }
  
  if (!copy || !copy[lang]) {
    return { headline: null, description: null };
  }
  
  const { headline, description } = copy[lang];
  
  // Safety: hide headline if it equals or starts with the keyword
  const keywordLower = keyword.toLowerCase();
  const headlineLower = (headline || '').toLowerCase();
  
  if (headlineLower === keywordLower || headlineLower.startsWith(keywordLower + ' ')) {
    return { headline: null, description };
  }
  
  return { headline, description };
}
