import React from 'react';

/**
 * SectionErrorBoundary - Granular error boundary for page sections
 * 
 * Prevents one broken section from crashing the entire page.
 * In development: shows error details and component stack.
 * In production: hides the section silently.
 */
class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('=== SECTION ERROR BOUNDARY CAUGHT AN ERROR ===');
      console.error('Section:', this.props.name);
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('=============================================');
    } else {
      // In production, log minimal info
      console.warn(`Section "${this.props.name}" failed to render and was hidden.`);
    }
  }

  render() {
    if (this.state.hasError) {
      // Development: show error details
      if (import.meta.env.DEV) {
        return (
          <div className="my-8 p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="text-red-500 text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">
                  Section Error: {this.props.name}
                </h3>
                <p className="text-sm text-red-600 dark:text-red-300 mb-3">
                  {this.state.error?.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <details className="text-xs text-red-500 dark:text-red-400">
                    <summary className="cursor-pointer font-semibold mb-1">
                      Component Stack
                    </summary>
                    <pre className="bg-red-100 dark:bg-red-900/30 p-3 rounded overflow-x-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        );
      }

      // Production: hide section silently (return null)
      return null;
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
