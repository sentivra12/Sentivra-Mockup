import React from 'react';
import { isMissingEnv } from '@/lib/supabase';

const EnvWarning = () => {
  if (!isMissingEnv) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      backgroundColor: '#fef3c7',
      borderBottom: '2px solid #f59e0b',
      padding: '1rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <span style={{ fontSize: '24px' }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <strong style={{ color: '#92400e', display: 'block', marginBottom: '0.25rem' }}>
            Missing Supabase Configuration
          </strong>
          <p style={{ color: '#78350f', margin: 0, fontSize: '14px' }}>
            The site is running in demo mode. Create a <code style={{
              backgroundColor: '#fde68a',
              padding: '2px 6px',
              borderRadius: '4px',
              fontFamily: 'monospace'
            }}>.env.local</code> file with your Supabase credentials to enable the backend.
          </p>
          <details style={{ marginTop: '0.5rem' }}>
            <summary style={{
              cursor: 'pointer',
              color: '#92400e',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Show setup instructions
            </summary>
            <pre style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              backgroundColor: '#fde68a',
              borderRadius: '6px',
              overflow: 'auto',
              fontSize: '12px',
              lineHeight: '1.5',
              fontFamily: 'monospace'
            }}>
{`1. Create .env.local in the project root
2. Add these variables:

VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

3. Get values from:
   https://app.supabase.com/project/_/settings/api

4. Restart dev server: npm run dev`}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
};

export default EnvWarning;
