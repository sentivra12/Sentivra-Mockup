/**
 * Bidi Component - Bidirectional Text Wrapper
 * 
 * Wraps content in <bdi> tag to prevent bidirectional text issues.
 * Essential for displaying numbers, phone numbers, and mixed-direction content
 * in RTL layouts (Arabic).
 * 
 * Usage:
 * <Bidi>+966 50 123 4567</Bidi>
 * <Bidi>{counterValue}</Bidi>
 */

import React from 'react';

export const Bidi = ({ children, className }) => {
  return (
    <bdi className={className}>
      {children}
    </bdi>
  );
};

export default Bidi;
