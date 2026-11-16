import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';

/**
 * Route-level error boundary with "Try again" button
 * Resets on navigation to prevent stale error state
 */
class RouteErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorKey: 0 };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error });
    console.error('[RouteErrorBoundary]', error, errorInfo);
  }

  handleTryAgain = () => {
    // Re-mount the route by incrementing key
    this.setState(prev => ({ 
      hasError: false, 
      error: null,
      errorKey: prev.errorKey + 1 
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <RouteErrorScreen 
          error={this.state.error}
          onTryAgain={this.handleTryAgain}
        />
      );
    }

    // Pass errorKey to children to force re-mount
    return <div key={this.state.errorKey}>{this.props.children}</div>;
  }
}

function RouteErrorScreen({ error, onTryAgain }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-50 dark:bg-brand-900/30 rounded-full mb-4">
          <svg className="w-8 h-8 text-primary dark:text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-bold text-primary-deep dark:text-primary-light mb-2">
          {t('errors.route.title') || 'This section encountered an error'}
        </h2>
        
        <p className="text-text-muted mb-6">
          {t('errors.route.description') || 'Try reloading this section'}
        </p>

        {import.meta.env.DEV && error && (
          <details className="mb-4 text-xs text-left text-text-muted bg-frost-soft dark:bg-brand-900/20 p-3 rounded">
            <summary className="cursor-pointer font-semibold mb-1">Error Details</summary>
            <pre className="overflow-auto">{error.toString()}</pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={onTryAgain}
            className="px-6 py-3 bg-primary hover:bg-primary-dark dark:bg-brand-accent dark:hover:bg-brand-600 text-white rounded-lg font-semibold transition-colors"
          >
            {t('errors.route.tryAgain') || 'Try Again'}
          </button>
          
          <a
            href="/"
            className="px-6 py-3 bg-color-background text-primary-deep dark:text-primary-light border-2 border-frost dark:border-brand-800 hover:bg-frost-soft dark:hover:bg-brand-900/30 rounded-lg font-semibold transition-colors"
          >
            {t('errors.route.home') || 'Go Home'}
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Wrapper that resets boundary on route change
 */
export function RouteErrorBoundary({ children }) {
  const location = useLocation();
  const [locationKey, setLocationKey] = useState(location.key);

  useEffect(() => {
    // Reset boundary on navigation
    setLocationKey(location.key);
  }, [location]);

  return (
    <RouteErrorBoundaryInner key={locationKey}>
      {children}
    </RouteErrorBoundaryInner>
  );
}
