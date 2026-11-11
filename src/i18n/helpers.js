/**
 * Format numbers according to locale
 */
export const formatNumber = (number, language = 'en') => {
  return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(number);
};

/**
 * Format dates according to locale
 */
export const formatDate = (date, language = 'en', options = {}) => {
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(new Date(date));
};

/**
 * Format currency according to locale
 */
export const formatCurrency = (amount, currency = 'USD', language = 'en') => {
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Get direction for language
 */
export const getDirection = (language) => {
  return language === 'ar' ? 'rtl' : 'ltr';
};

/**
 * Check if language is RTL
 */
export const isRTL = (language) => {
  return language === 'ar';
};
