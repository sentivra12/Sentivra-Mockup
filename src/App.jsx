
import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import HomePage from '@/pages/HomePage';
import ServicesPage from '@/pages/ServicesPage';
import OurWorkPage from '@/pages/OurWorkPage';
import MockupsPage from '@/pages/MockupsPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import ServiceDetailPage from '@/pages/ServiceDetailPage';
import NotFoundPage from '@/pages/NotFoundPage';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

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
const AdminMockupsPage = lazy(() => import('@/admin/pages/MockupsPage'));
const HeroSectionPage = lazy(() => import('@/admin/pages/HeroSectionPage'));
const FAQsPage = lazy(() => import('@/admin/pages/FAQsPage'));

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
        <div className="min-h-screen bg-frost-soft">
          <Header />
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/our-work" element={<OurWorkPage />} />
              <Route path="/mockups" element={<MockupsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AnimatePresence>
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
              <Route path="testimonials" element={<TestimonialsPage />} />
              <Route path="client-logos" element={<ClientLogosPage />} />
              <Route path="faqs" element={<FAQsPage />} />
              <Route path="messages" element={<AdminMessagesPage />} />
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
