import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import Header from '@/components/Header';
import HomePage from '@/pages/HomePage'; // Keep home eager for LCP
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import ScrollProgress from '@/components/ScrollProgress';
import WhatsAppFloat from '@/components/common/WhatsAppFloat';
import { SkipToContent } from '@/components/SkipToContent';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { lazyWithRetry } from '@/utils/lazyWithRetry';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';

// Lazy load PUBLIC pages with retry
const ServicesPageRound2 = lazy(lazyWithRetry(() => import('@/pages/ServicesPageRound2')));
const ServicesPage = lazy(lazyWithRetry(() => import('@/pages/ServicesPage')));
const ServicesPageRound1 = lazy(lazyWithRetry(() => import('@/pages/ServicesPageRound1')));
const MockupsPageRound5 = lazy(lazyWithRetry(() => import('@/pages/MockupsPageRound5')));
const MockupDetailPage = lazy(lazyWithRetry(() => import('@/pages/MockupDetailPage')));
const AboutPage = lazy(lazyWithRetry(() => import('@/pages/AboutPage')));
const ContactPage = lazy(lazyWithRetry(() => import('@/pages/ContactPage')));
const ServiceDetailPage = lazy(lazyWithRetry(() => import('@/pages/ServiceDetailPage')));
const NotFoundPage = lazy(lazyWithRetry(() => import('@/pages/NotFoundPage')));

// Lazy load admin components with retry for stale chunks
const LoginPage = lazy(lazyWithRetry(() => import('@/admin/pages/LoginPage')));
const AdminLayout = lazy(lazyWithRetry(() => import('@/admin/components/AdminLayout')));
const DashboardPage = lazy(lazyWithRetry(() => import('@/admin/pages/DashboardPage')));
const AdminServicesPage = lazy(lazyWithRetry(() => import('@/admin/pages/ServicesPage')));
const AdminProjectsPage = lazy(lazyWithRetry(() => import('@/admin/pages/ProjectsPage')));
const AdminMessagesPage = lazy(lazyWithRetry(() => import('@/admin/pages/MessagesPage')));
const SiteSettingsPage = lazy(lazyWithRetry(() => import('@/admin/pages/SiteSettingsPage')));
const TestimonialsPage = lazy(lazyWithRetry(() => import('@/admin/pages/TestimonialsPage')));
const ClientLogosPage = lazy(lazyWithRetry(() => import('@/admin/pages/ClientLogosPage')));
const MarqueeItemsPage = lazy(lazyWithRetry(() => import('@/admin/pages/MarqueeItemsPage')));
const StatsPage = lazy(lazyWithRetry(() => import('@/admin/pages/StatsPage')));
const AdminMockupsPage = lazy(lazyWithRetry(() => import('@/features/mockups/AdminMockupsPage')));
const MockupCategoriesPage = lazy(lazyWithRetry(() => import('@/admin/pages/MockupCategoriesPage')));
const HeroSectionPage = lazy(lazyWithRetry(() => import('@/admin/pages/HeroSectionPage')));
const FAQsPage = lazy(lazyWithRetry(() => import('@/admin/pages/FAQsPage')));
const PageContentPage = lazy(lazyWithRetry(() => import('@/admin/pages/PageContentPage')));
const ServiceCategoriesPage = lazy(lazyWithRetry(() => import('@/admin/pages/ServiceCategoriesPage')));
const ProjectCategoriesPage = lazy(lazyWithRetry(() => import('@/admin/pages/ProjectCategoriesPage')));
const CountriesPage = lazy(lazyWithRetry(() => import('@/admin/pages/CountriesPage')));
const TimelinePage = lazy(lazyWithRetry(() => import('@/admin/pages/TimelinePage')));
const ValuesPage = lazy(lazyWithRetry(() => import('@/admin/pages/ValuesPage')));

// Loading fallback with fixed height to prevent CLS
const PageLoadingFallback = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-brand-accent mx-auto mb-4"></div>
      <p className="text-text-muted">Loading...</p>
    </div>
  </div>
);

// Admin loading fallback
const AdminLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-navy">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-frost">Loading admin panel...</p>
    </div>
  </div>
);

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const motionPreference = useMotionPreference();

  // Apply motion mode to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-motion', motionPreference.mode);
  }, [motionPreference.mode]);

  // Listen for Vite preload errors (stale chunks after deploy)
  useEffect(() => {
    const handlePreloadError = (event) => {
      console.error('[vite:preloadError] Detected stale chunk:', event);
      
      // Guard against reload loops
      const RELOAD_KEY = '__vitePreloadErrorReload';
      const lastReload = sessionStorage.getItem(RELOAD_KEY);
      const now = Date.now();
      
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        console.warn('[vite:preloadError] Performing guarded hard reload');
        sessionStorage.setItem(RELOAD_KEY, now.toString());
        window.location.reload();
      } else {
        console.error('[vite:preloadError] Reload loop detected, not reloading');
      }
    };

    window.addEventListener('vite:preloadError', handlePreloadError);
    
    return () => {
      window.removeEventListener('vite:preloadError', handlePreloadError);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="never">
      {/* Public Site Routes */}
      {!isAdminRoute && (
        <div className="min-h-screen bg-frost-soft dark:bg-gray-900">
          <SkipToContent />
          <ScrollProgress />
          <Header />
          <main id="main-content" tabIndex="-1" className="focus:outline-none">
            <AnimatePresence mode="wait">
              <Suspense fallback={<PageLoadingFallback />}>
                <RouteErrorBoundary>
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/services" element={<ServicesPageRound2 />} />
                    <Route path="/services-round1" element={<ServicesPageRound1 />} />
                    <Route path="/services-old" element={<ServicesPage />} />
                    <Route path="/services/:slug" element={<ServiceDetailPage />} />
                    {/* Redirect old Our Work routes to Mockups (showcases our design work) */}
                    <Route path="/our-work" element={<Navigate to="/mockups" replace />} />
                    <Route path="/our-work/*" element={<Navigate to="/mockups" replace />} />
                    <Route path="/mockups" element={<MockupsPageRound5 />} />
                    <Route path="/mockups/:slug" element={<MockupDetailPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </RouteErrorBoundary>
              </Suspense>
            </AnimatePresence>
          </main>
          <Footer />
          <ScrollToTop />
          <WhatsAppFloat />
        </div>
      )}

      {/* Admin Routes */}
      {isAdminRoute && (
        <Suspense fallback={<AdminLoadingFallback />}>
          <Routes location={location}>
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="settings" element={<SiteSettingsPage />} />
              <Route path="hero" element={<HeroSectionPage />} />
              <Route path="services" element={<AdminServicesPage />} />
              <Route path="projects" element={<AdminProjectsPage />} />
              <Route path="mockups" element={<AdminMockupsPage />} />
              <Route path="mockup-categories" element={<MockupCategoriesPage />} />
              <Route path="testimonials" element={<TestimonialsPage />} />
              <Route path="client-logos" element={<ClientLogosPage />} />
              <Route path="marquee" element={<MarqueeItemsPage />} />
              <Route path="stats" element={<StatsPage />} />
              <Route path="faqs" element={<FAQsPage />} />
              <Route path="messages" element={<AdminMessagesPage />} />
              <Route path="page-content" element={<PageContentPage />} />
              <Route path="service-categories" element={<ServiceCategoriesPage />} />
              <Route path="project-categories" element={<ProjectCategoriesPage />} />
              <Route path="countries" element={<CountriesPage />} />
              <Route path="timeline" element={<TimelinePage />} />
              <Route path="values" element={<ValuesPage />} />
              {/* More admin routes */}
              <Route path="blog" element={<div className="text-2xl">Blog Posts (Coming Soon)</div>} />
              <Route path="media" element={<div className="text-2xl">Media Library (Coming Soon)</div>} />
            </Route>
          </Routes>
        </Suspense>
      )}
    </MotionConfig>
  );
}

export default App;
