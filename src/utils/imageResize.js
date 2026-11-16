/**
 * Client-side image resizing to WebP
 * No new dependencies - uses Canvas API
 */

/**
 * Resize image to WebP
 * @param {File} file - Original image file
 * @param {number} maxWidth - Maximum width
 * @param {number} quality - WebP quality 0-1
 * @returns {Promise<{blob: Blob, width: number, height: number, size: number}>}
 */
export async function resizeImageToWebP(file, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      try {
        URL.revokeObjectURL(url);
        
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create WebP'));
              return;
            }
            resolve({ 
              blob, 
              width, 
              height,
              size: blob.size 
            });
          },
          'image/webp',
          quality
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Create card and full WebP versions
 * @param {File} file - Original image
 * @returns {Promise<{card: Object, full: Object, original: {size: number}}>}
 */
export async function createOptimizedVersions(file) {
  const originalSize = file.size;
  
  const [card, full] = await Promise.all([
    resizeImageToWebP(file, 640, 0.75),
    resizeImageToWebP(file, 1600, 0.82)
  ]);
  
  return {
    card,
    full,
    original: { size: originalSize }
  };
}
