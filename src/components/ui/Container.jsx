import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Container component for consistent max-width and padding across all sections
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to be wrapped
 * @param {string} props.className - Additional CSS classes
 * @param {('default'|'narrow'|'wide'|'full')} props.size - Container size variant
 * @param {boolean} props.noPadding - Remove horizontal padding
 * @param {string} props.as - HTML element to render as (default: 'div')
 */
const Container = ({ 
  children, 
  className = '', 
  size = 'default',
  noPadding = false,
  as: Component = 'div',
  ...props 
}) => {
  const sizeClasses = {
    narrow: 'max-w-4xl',    // ~896px - for focused content (contact forms, single column)
    default: 'max-w-7xl',   // ~1280px - standard content width
    wide: 'max-w-[1400px]', // ~1400px - for grid-heavy layouts
    full: 'max-w-full',     // 100% - for full-width sections
  };

  const paddingClasses = noPadding ? '' : 'px-4 sm:px-6 lg:px-8';

  return (
    <Component
      className={cn(
        'mx-auto w-full',
        sizeClasses[size],
        paddingClasses,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Container;
