import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Section component for consistent vertical spacing and background colors
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to be wrapped
 * @param {string} props.className - Additional CSS classes
 * @param {('sm'|'md'|'lg'|'xl'|'none')} props.spacing - Vertical padding size
 * @param {('white'|'frost'|'frost-soft'|'dark')} props.background - Background color variant
 * @param {string} props.id - Section ID for anchor links
 * @param {string} props.as - HTML element to render as (default: 'section')
 */
const Section = ({ 
  children, 
  className = '', 
  spacing = 'lg',
  background = 'white',
  id,
  as: Component = 'section',
  ...props 
}) => {
  // Responsive vertical spacing
  const spacingClasses = {
    none: '',
    sm: 'py-8 md:py-12',      // Small sections (trust badges, simple content)
    md: 'py-12 md:py-16',     // Medium sections (standard content blocks)
    lg: 'py-16 md:py-20',     // Large sections (main content areas) - DEFAULT
    xl: 'py-20 md:py-28',     // Extra large (hero-like sections)
  };

  // Background color variants
  const backgroundClasses = {
    white: 'bg-white',
    frost: 'bg-frost',
    'frost-soft': 'bg-frost-soft',
    dark: 'bg-primary-deep text-white',
  };

  return (
    <Component
      id={id}
      className={cn(
        spacingClasses[spacing],
        backgroundClasses[background],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Section;
