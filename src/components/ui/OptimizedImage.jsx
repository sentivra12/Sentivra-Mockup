import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * OptimizedImage - Smart image component with loading states and fallbacks
 * Features: skeleton loading, error handling, lazy loading, theme-aware fallback
 */
export function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  className = '',
  skeletonClassName = '',
  containerClassName = '',
  lazy = true,
  onLoad,
  onError,
  ...props
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = (e) => {
    setLoading(false);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setLoading(false);
    setError(true);
    
    // Try fallback if available
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setError(false);
      setLoading(true);
    }
    
    onError?.(e);
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Skeleton loader */}
      {loading && (
        <div
          className={`absolute inset-0 bg-gradient-to-r from-color-surface via-color-surface-raised to-color-surface animate-pulse ${skeletonClassName}`}
          aria-hidden="true"
        />
      )}

      {/* Actual image */}
      {!error ? (
        <img
          src={currentSrc}
          alt={alt}
          className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      ) : (
        /* Fallback for failed images */
        <div className="flex items-center justify-center w-full h-full bg-color-surface-raised text-color-text-muted">
          <div className="text-center p-4">
            <svg
              className="w-12 h-12 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">{alt || 'Image'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ImageWithFallback - Simple image with text fallback
 */
export function ImageWithFallback({ src, alt, fallbackText, className = '' }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-color-primary/10 to-color-primary/5 ${className}`}>
        <span className="text-color-text-muted font-medium">
          {fallbackText || alt || '🖼️'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
