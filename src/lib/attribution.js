/**
 * Attribution Tracking Utility
 * Captures and stores first-touch attribution data from URL parameters
 * Used for ad campaign tracking (UTM params, click IDs, referrer)
 */

const STORAGE_KEY = 'sentivra_attribution';
const MAX_STORAGE_SIZE = 2048; // 2KB limit for safety

/**
 * Sanitizes a string value to prevent XSS and limit size
 * @param {string} value - Raw value from URL
 * @returns {string} Sanitized value
 */
function sanitize(value) {
  if (!value || typeof value !== 'string') return '';
  
  // Remove any HTML tags and script content
  const clean = value
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
  
  // Limit length
  return clean.substring(0, 200);
}

/**
 * Extracts attribution data from current URL
 * @returns {Object} Attribution data object
 */
export function captureAttribution() {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer || '';
  
  const attribution = {
    // UTM parameters
    utm_source: sanitize(params.get('utm_source')),
    utm_medium: sanitize(params.get('utm_medium')),
    utm_campaign: sanitize(params.get('utm_campaign')),
    utm_content: sanitize(params.get('utm_content')),
    utm_term: sanitize(params.get('utm_term')),
    
    // Click IDs
    gclid: sanitize(params.get('gclid')), // Google Ads
    fbclid: sanitize(params.get('fbclid')), // Facebook
    ttclid: sanitize(params.get('ttclid')), // TikTok
    
    // Session info
    referrer: sanitize(referrer),
    landing_page: sanitize(window.location.href),
    timestamp: new Date().toISOString(),
  };
  
  // Remove empty values
  const cleaned = {};
  for (const [key, value] of Object.entries(attribution)) {
    if (value && value.length > 0) {
      cleaned[key] = value;
    }
  }
  
  return Object.keys(cleaned).length > 0 ? cleaned : null;
}

/**
 * Stores attribution data in localStorage (first-touch only)
 * @param {Object} attribution - Attribution data to store
 */
export function storeAttribution(attribution) {
  if (!attribution || typeof window === 'undefined') return;
  
  try {
    // Only store if we don't already have attribution (first-touch)
    const existing = getAttribution();
    if (existing && existing.timestamp) {
      return; // Already have first-touch data
    }
    
    const data = JSON.stringify(attribution);
    
    // Check size limit
    if (data.length > MAX_STORAGE_SIZE) {
      console.warn('[Attribution] Data exceeds size limit, truncating');
      return;
    }
    
    localStorage.setItem(STORAGE_KEY, data);
  } catch (error) {
    console.error('[Attribution] Failed to store:', error);
  }
}

/**
 * Retrieves stored attribution data
 * @returns {Object|null} Attribution data or null
 */
export function getAttribution() {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (error) {
    console.error('[Attribution] Failed to retrieve:', error);
    return null;
  }
}

/**
 * Clears stored attribution data (use after successful conversion)
 */
export function clearAttribution() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[Attribution] Failed to clear:', error);
  }
}

/**
 * Initializes attribution tracking on page load
 * Should be called once at app startup
 */
export function initAttribution() {
  if (typeof window === 'undefined') return;
  
  // Capture attribution from URL if present
  const attribution = captureAttribution();
  if (attribution) {
    storeAttribution(attribution);
    
    // Clean URL parameters (optional - removes UTM params from URL bar)
    if (window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      const hasParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'ttclid']
        .some(param => url.searchParams.has(param));
      
      if (hasParams) {
        // Remove tracking params but keep other params
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'ttclid']
          .forEach(param => url.searchParams.delete(param));
        
        window.history.replaceState({}, '', url.toString());
      }
    }
  }
}

/**
 * Gets attribution data formatted for form submission
 * @returns {Object} Attribution fields for API
 */
export function getAttributionForSubmission() {
  const attribution = getAttribution();
  if (!attribution) return {};
  
  return {
    utm_source: attribution.utm_source || null,
    utm_medium: attribution.utm_medium || null,
    utm_campaign: attribution.utm_campaign || null,
    utm_content: attribution.utm_content || null,
    utm_term: attribution.utm_term || null,
    gclid: attribution.gclid || null,
    fbclid: attribution.fbclid || null,
    ttclid: attribution.ttclid || null,
    referrer: attribution.referrer || null,
    landing_page: attribution.landing_page || null,
    attribution_timestamp: attribution.timestamp || null,
  };
}
