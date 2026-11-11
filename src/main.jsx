
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/App';
import '@/index.css';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import EnvWarning from '@/components/EnvWarning';
import ConfigErrorScreen from '@/components/ConfigErrorScreen';
import { isMissingConfig } from '@/config/env';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { ThemeProvider } from '@/theme/ThemeContext';
import { initAttribution } from '@/lib/attribution';
import { initAnalytics } from '@/lib/analytics';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Bootstrap with error handling
try {
  // Initialize attribution tracking (captures UTM params from URL)
  initAttribution();
  
  // Check for missing configuration
  if (isMissingConfig()) {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <ConfigErrorScreen />
      </React.StrictMode>
    );
    window.__APP_MOUNTED__ = true;
  } else {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <ErrorBoundary>
          <ThemeProvider>
            <LanguageProvider>
              <QueryClientProvider client={queryClient}>
                <BrowserRouter
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                  }}
                >
                  <EnvWarning />
                  <App />
                  <Toaster />
                </BrowserRouter>
              </QueryClientProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
    window.__APP_MOUNTED__ = true;
  }
} catch (error) {
  console.error('Failed to bootstrap app:', error);
  document.getElementById('root').innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, -apple-system, sans-serif; padding: 20px; text-align: center;">
      <div>
        <h1 style="color: #ef4444; margin-bottom: 16px;">Application Error</h1>
        <p style="color: #6b7280; margin-bottom: 8px;">Failed to start the application.</p>
        <pre style="background: #f3f4f6; padding: 12px; border-radius: 8px; overflow: auto; text-align: left; max-width: 600px;">${error.message || error}</pre>
        <button onclick="location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">Reload Page</button>
      </div>
    </div>
  `;
}
