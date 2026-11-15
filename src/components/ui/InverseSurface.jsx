import React from 'react';
import PropTypes from 'prop-types';

/**
 * InverseSurface — SP brand edition
 *
 * Always-dark emerald surface that stays dark in both light and dark themes.
 * Wraps footer, CTA, mockup-detail hero, etc.
 *
 * The CSS class `inverse-surface` remaps semantic tokens (see index.css).
 *
 * Props:
 *   as          — HTML element to render                 default: 'div'
 *   withTopGlow — teal hairline glow at the top edge     default: false
 *   withGrid    — faint perspective dot-grid             default: false
 *   withAurora  — drifting brand glow blobs              default: false
 *   className   — extra classes
 */
const InverseSurface = React.forwardRef(({
  children,
  className  = '',
  as: Component = 'div',
  withTopGlow = false,
  withGrid    = false,
  withAurora  = false,
  ...props
}, ref) => {
  return (
    <Component
      ref={ref}
      className={[
        'inverse-surface',
        'bg-[var(--inverse-bg)]',
        'relative overflow-hidden',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {/* Top hairline glow */}
      {withTopGlow && (
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
          style={{
            background:
              'linear-gradient(to right, transparent, var(--inverse-hairline), transparent)',
          }}
        />
      )}

      {/* Perspective grid */}
      {withGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
          aria-hidden="true"
        >
          <div
            className="h-full w-full"
            style={{
              backgroundImage: [
                'linear-gradient(to right, rgba(13,158,130,0.4) 1px, transparent 1px)',
                'linear-gradient(to bottom, rgba(13,158,130,0.4) 1px, transparent 1px)',
              ].join(', '),
              backgroundSize: '80px 80px',
              transform: 'perspective(500px) rotateX(60deg) scale(2)',
              transformOrigin: 'center top',
            }}
          />
        </div>
      )}

      {/* Aurora blobs */}
      {withAurora && (
        <>
          <div
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse-slow"
            style={{ background: 'radial-gradient(circle, rgba(13,158,130,0.18) 0%, transparent 70%)' }}
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse-slow"
            style={{
              background: 'radial-gradient(circle, rgba(4,77,64,0.18) 0%, transparent 70%)',
              animationDelay: '1.2s',
            }}
            aria-hidden="true"
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </Component>
  );
});

InverseSurface.propTypes = {
  children:    PropTypes.node,
  className:   PropTypes.string,
  as:          PropTypes.elementType,
  withTopGlow: PropTypes.bool,
  withGrid:    PropTypes.bool,
  withAurora:  PropTypes.bool,
};

export default InverseSurface;

InverseSurface.displayName = 'InverseSurface';
