import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log to console in a clean, readable way
    console.group('%c🚨 Error Boundary Caught an Error', 'color: #ef4444; font-weight: bold; font-size: 14px');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo?.componentStack);
    console.groupEnd();
    
    this.setState({ hasError: true, error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV;

      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-frost-soft">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-dropdown border border-frost p-8">
            {/* Icon */}
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            {/* Title & Description */}
            <h1 className="text-3xl font-bold text-primary-deep mb-3">
              Something went wrong
            </h1>
            
            <p className="text-text-muted text-lg mb-6 leading-relaxed">
              The application encountered an error and couldn't continue. Please try refreshing the page or return to the home page.
            </p>

            {/* Development Error Details */}
            {isDevelopment && this.state.error && (
              <details className="bg-frost-soft p-4 rounded-xl mb-6 border border-frost">
                <summary className="cursor-pointer font-semibold text-primary-deep mb-3 hover:text-primary transition-colors">
                  📋 Error Details (Development Only)
                </summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Error Message:</p>
                    <pre className="text-sm bg-red-50 text-red-900 p-3 rounded-lg overflow-auto border border-red-200">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Component Stack:</p>
                      <pre className="text-xs bg-primary-deep text-frost p-3 rounded-lg overflow-auto max-h-48">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-primary-strong hover:bg-primary-deep text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                Refresh Page
              </button>
              
              <Link 
                to="/"
                className="flex-1 bg-frost hover:bg-frost-soft text-primary-deep px-6 py-3 rounded-lg font-semibold transition-colors duration-200 border border-frost text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
