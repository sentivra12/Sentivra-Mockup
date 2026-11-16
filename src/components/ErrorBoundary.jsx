import React from 'react';
import { useTranslation } from '@/i18n/useTranslation';

// In-memory error ring buffer (last 10 errors)
if (typeof window !== 'undefined') {
  window.__lastErrors = window.__lastErrors || [];
}

const logError = (error, errorInfo, route) => {
  const errorEntry = {
    timestamp: new Date().toISOString(),
    name: error?.name || 'Unknown',
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    componentStack: errorInfo?.componentStack,
    route: route || window.location.pathname,
    isChunkError: error?.message?.includes('Failed to fetch') || 
                  error?.message?.includes('Importing a module script failed') ||
                  error?.message?.includes('dynamically imported module') ||
                  error?.name === 'ChunkLoadError'
  };

  // Log to console
  console.error('=== ERROR BOUNDARY CAUGHT AN ERROR ===');
  console.error('Timestamp:', errorEntry.timestamp);
  console.error('Route:', errorEntry.route);
  console.error('Error:', error);
  console.error('Component Stack:', errorInfo?.componentStack);
  console.error('Is Chunk Error:', errorEntry.isChunkError);
  console.error('=====================================');

  // Add to ring buffer
  if (typeof window !== 'undefined' && window.__lastErrors) {
    window.__lastErrors.push(errorEntry);
    if (window.__lastErrors.length > 10) {
      window.__lastErrors.shift();
    }
  }

  return errorEntry;
};

const isChunkError = (error) => {
  return error?.message?.includes('Failed to fetch') || 
         error?.message?.includes('Importing a module script failed') ||
         error?.message?.includes('dynamically imported module') ||
         error?.name === 'ChunkLoadError';
};

const attemptRecovery = () => {
  // Guard against reload loops with sessionStorage
  const RELOAD_KEY = '__errorBoundaryReload';
  const lastReload = sessionStorage.getItem(RELOAD_KEY);
  const now = Date.now();
  
  // Allow reload if more than 10 seconds have passed since last one
  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
    sessionStorage.setItem(RELOAD_KEY, now.toString());
    window.location.reload();
    return true;
  }
  
  return false;
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorEntry: null,
      attemptedRecovery: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorEntry = logError(error, errorInfo, this.props.route);
    this.setState({ error, errorInfo, errorEntry });

    // Auto-recover from chunk errors (one attempt)
    if (isChunkError(error) && !this.state.attemptedRecovery) {
      this.setState({ attemptedRecovery: true });
      setTimeout(() => {
        if (attemptRecovery()) {
          // Will reload, no need to do anything else
        } else {
          // Reload loop detected, show error screen
          this.setState({ attemptedRecovery: false });
        }
      }, 500);
    }
  }

  handleReload = () => {
    sessionStorage.removeItem('__errorBoundaryReload');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // If attempting recovery, show loading
      if (this.state.attemptedRecovery && isChunkError(this.state.error)) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-frost-soft dark:bg-brand-950 p-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-brand-accent mx-auto mb-4"></div>
              <p className="text-text-muted">Recovering...</p>
            </div>
          </div>
        );
      }

      const isDev = import.meta.env.DEV;
      
      return (
        <ErrorBoundaryScreen 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorEntry={this.state.errorEntry}
          isDev={isDev}
          onReload={this.handleReload}
        />
      );
    }

    return this.props.children;
  }
}

// Separate component for the error screen with i18n
function ErrorBoundaryScreen({ error, errorInfo, errorEntry, isDev, onReload }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-frost-soft dark:bg-brand-950 p-4">
      <div className="max-w-2xl w-full bg-color-background rounded-2xl shadow-card-hover p-8 border border-frost dark:border-brand-900">
        <div className="text-center mb-6">
          {/* Brand-colored icon instead of red */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-50 dark:bg-brand-900/30 rounded-full mb-4">
            <svg className="w-8 h-8 text-primary dark:text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-primary-deep dark:text-primary-light mb-2">
            {t('errors.boundary.title') || 'Something went wrong'}
          </h1>
          <p className="text-text-muted mb-6">
            {t('errors.boundary.description') || 'The page encountered an error and couldn\'t be displayed'}
          </p>
        </div>

        {isDev && error && (
          <div className="mb-6 p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg">
            <h3 className="text-sm font-semibold text-primary dark:text-brand-accent mb-2">
              Error Details (Development Only):
            </h3>
            <pre className="text-xs text-text-muted overflow-auto max-h-40 font-mono whitespace-pre-wrap">
              {error.toString()}
            </pre>
            {errorInfo && (
              <details className="mt-2">
                <summary className="text-xs text-text-muted cursor-pointer hover:underline">
                  Component Stack
                </summary>
                <pre className="text-xs text-text-muted overflow-auto max-h-40 mt-2 font-mono whitespace-pre-wrap">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={onReload}
            className="px-6 py-3 bg-primary hover:bg-primary-dark dark:bg-brand-accent dark:hover:bg-brand-600 text-white rounded-lg font-semibold transition-colors"
          >
            {t('errors.boundary.reload') || 'Reload Page'}
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-color-background text-primary-deep dark:text-primary-light border-2 border-frost dark:border-brand-800 hover:bg-frost-soft dark:hover:bg-brand-900/30 rounded-lg font-semibold transition-colors"
          >
            {t('errors.boundary.home') || 'Go Home'}
          </a>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
