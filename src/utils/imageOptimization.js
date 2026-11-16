/**
 * Image Optimization Utilities
 * 
 * Supabase Storage Image Transformation
 * Docs: https://supabase.com/docs/guides/storage/image-transformations
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Get optimized image URL with transformations
 * @param {string} url - Original image URL
 * @param {object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url) return '';
  
  // If not a Supabase storage URL, return as-is
  if (!url.includes('/storage/v1/object/public/')) {
    return url;
  }

  const {
    width = null,
    height = null,
    quality = 75,
    format = 'webp',
    resize = 'cover', // cover, contain, fill
  } = options;

  // Build transformation params
  const params = new URLSearchParams();
  
  if (width) params.append('width', width);
  if (height) params.append('height', height);
  if (quality) params.append('quality', quality);
  if (format) params.append('format', format);
  if (resize) params.append('resize', resize);

  // If no transformations, return original
  if (params.toString() === '') return url;

  // Supabase transformation URL format:
  // https://{project}.supabase.co/storage/v1/render/image/public/{bucket}/{path}?{params}
  const transformedUrl = url.replace(
    '/storage/v1/object/public/',
    `/storage/v1/render/image/public/`
  ) + '?' + params.toString();

  return transformedUrl;
}

/**
 * Generate srcset for responsive images
 * @param {string} url - Original image URL
 * @param {array} widths - Array of widths for srcset
 * @param {object} options - Additional options
 * @returns {string} - srcset string
 */
export function generateSrcSet(url, widths = [400, 800, 1200], options = {}) {
  if (!url) return '';
  
  return widths
    .map(w => `${getOptimizedImageUrl(url, { ...options, width: w })} ${w}w`)
    .join(', ');
}

/**
 * Get placeholder image (small, low quality for blur-up)
 * @param {string} url - Original image URL
 * @returns {string} - Placeholder URL
 */
export function getPlaceholderImage(url) {
  return getOptimizedImageUrl(url, {
    width: 40,
    quality: 20,
    format: 'webp',
  });
}

/**
 * Check if Supabase transformations are available
 * @returns {boolean}
 */
export function supportsTransformations() {
  // Supabase transformation API is available on all projects
  return !!SUPABASE_URL;
}

/**
 * Responsive image props generator for common use cases
 */
export const imagePresets = {
  mockupCard: {
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px',
    widths: [400, 600, 800],
    quality: 75,
    format: 'webp',
  },
  mockupHero: {
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px',
    widths: [800, 1200, 1600],
    quality: 80,
    format: 'webp',
  },
  mockupThumbnail: {
    sizes: '200px',
    widths: [200, 400],
    quality: 70,
    format: 'webp',
  },
};
