import React from 'react';
import PropTypes from 'prop-types';

/**
 * InverseSurface - Wrapper that applies inverse theme (dark surface with light text) in BOTH light and dark themes
 * 
 * This component creates a "dark mode island" that stays dark regardless of the user's theme preference.
 * Perfect for footer and final CTA sections.
 * 
 * Features:
 * - Applies CSS variable-based inverse background and text colors
 * - Optional top glow effect
 * - Optional perspective grid
 * - Optional aurora/atmospheric effects
 * - Ensures proper contrast for accessibility
 * 
 * Usage:
 * <InverseSurface as="footer" withTopGlow withGrid>
 *   <YourContent />
 * </InverseSurface>
 */
const InverseSurface = ({ 
  children, 
  className = '', 
  as: Component = 'div',
  withTopGlow = false,
  withGrid = false,
  withAurora = false,
  ...props 
}) => {
  // Build class list
  const classes = [
    // Core inverse surface class that activates CSS variables
    'inverse-surface',
    // Apply background using CSS variable
    'bg-[var(--inverse-bg)]',
    // Relative positioning for decorative elements
    'relative',
    // Overflow hidden for clean edges
    'overflow-hidden',
    // User className
    className
  ].filter(Boolean).join(' ');

  return (
    <Component 
      className={classes}
      {...props}
    >
      {/* Top Glow - subtle hairline highlight */}
      {withTopGlow && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-inverse-accent/30 to-transparent" />
      )}

      {/* Perspective Grid */}
      {withGrid && (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div 
            className="h-full w-full" 
            style={{
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
              transform: 'perspective(500px) rotateX(60deg) scale(2)',
              transformOrigin: 'center top'
            }}
          />
        </div>
      )}

      {/* Aurora Blobs - drifting gradient orbs */}
      {withAurora && (
        <>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-inverse-accent/10 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
};

InverseSurface.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  as: PropTypes.elementType,
  withTopGlow: PropTypes.bool,
  withGrid: PropTypes.bool,
  withAurora: PropTypes.bool,
};

export default InverseSurface;
