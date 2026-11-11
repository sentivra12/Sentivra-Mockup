import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import HomePage from '@/pages/HomePage';
import ServicesPage from '@/pages/ServicesPage';
import ServicesPageRound1 from '@/pages/ServicesPageRound1';
import ServicesPageRound2 from '@/pages/ServicesPageRound2';
import MockupsPageRound5 from '@/pages/MockupsPageRound5';
import MockupDetailPage from '@/pages/MockupDetailPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import ServiceDetailPage from '@/pages/ServiceDetailPage';
import NotFoundPage from '@/pages/NotFoundPage';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import ScrollProgress from '@/components/ScrollProgress';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { SkipToContent } from '@/components/SkipToContent';

// Lazy load admin components for code splitting
const LoginPage = lazy(() => import('@/admin/pages/LoginPage'));
const AdminLayout = lazy(() => import('@/admin/components/AdminLayout'));
const DashboardPage = lazy(() => import('@/admin/pages/DashboardPage'));
const AdminServicesPage = lazy(() => import('@/admin/pages/ServicesPage'));
const AdminProjectsPage = lazy(() => import('@/admin/pages/ProjectsPage'));
const AdminMessagesPage = lazy(() => import('@/admin/pages/MessagesPage'));
const SiteSettingsPage = lazy(() => import('@/admin/pages/SiteSettingsPage'));
const TestimonialsPage = lazy(() => import('@/admin/pages/TestimonialsPage'));
const ClientLogosPage = lazy(() => import('@/admin/pages/ClientLogosPage'));
const MarqueeItemsPage = lazy(() => import('@/admin/pages/MarqueeItemsPage'));
const StatsPage = lazy(() => import('@/admin/pages/StatsPage'));
const AdminMockupsPage = lazy(() => import('@/admin/pages/MockupsPage'));
const MockupCategoriesPage = lazy(() => import('@/admin/pages/MockupCategoriesPage'));
const HeroSectionPage = lazy(() => import('@/admin/pages/HeroSectionPage'));
const FAQsPage = lazy(() => import('@/admin/pages/FAQsPage'));
const PageContentPage = lazy(() => import('@/admin/pages/PageContentPage'));
const ServiceCategoriesPage = lazy(() => import('@/admin/pages/ServiceCategoriesPage'));
const ProjectCategoriesPage = lazy(() => import('@/admin/pages/ProjectCategoriesPage'));
const CountriesPage = lazy(() => import('@/admin/pages/CountriesPage'));
const TimelinePage = lazy(() => import('@/admin/pages/TimelinePage'));
const ValuesPage = lazy(() => import('@/admin/pages/ValuesPage'));

// Loading fallback component
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


  return (
    <>
      {/* Public Site Routes */}
      {!isAdminRoute && (
        <div className="min-h-screen bg-frost-soft dark:bg-gray-900">
          <SkipToContent />
          <ScrollProgress />
          <Header />
          <main id="main-content" tabIndex="-1" className="focus:outline-none">
            <AnimatePresence mode="wait">
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
            </AnimatePresence>
          </main>
          <Footer />
          <ScrollToTop />
          <WhatsAppButton />
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
    </>
  );
}

export default App;
