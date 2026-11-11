import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('HomePage Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: 'white', minHeight: '100vh' }}>
          <h1 style={{ color: 'red' }}>❌ HomePage Error</h1>
          <pre style={{ color: 'black', background: '#f5f5f5', padding: '20px', overflow: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
          <p style={{ color: 'black' }}>Check browser console for more details (F12)</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Import the real HomePage
import HomePage from './HomePage';

const HomePageSafe = () => {
  return (
    <ErrorBoundary>
      <HomePage />
    </ErrorBoundary>
  );
};

export default HomePageSafe;
