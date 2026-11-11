import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Always log to console
    if (typeof console !== 'undefined' && console.error) {
      console.error('=== ERROR BOUNDARY CAUGHT AN ERROR ===');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('=====================================');
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Something went wrong
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                The page encountered an error and couldn't be displayed
              </p>
            </div>

            {isDev && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">
                  Error Details (Development Only):
                </h3>
                <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto max-h-40 font-mono whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-700 dark:text-red-300 cursor-pointer hover:underline">
                      Component Stack
                    </summary>
                    <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto max-h-40 mt-2 font-mono whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
              >
                Reload Page
              </button>
              <a
                href="/"
                className="px-6 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
