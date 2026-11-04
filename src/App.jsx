
import React from 'react';
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
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

// Admin Components
import LoginPage from '@/admin/pages/LoginPage';
import AdminLayout from '@/admin/components/AdminLayout';
import DashboardPage from '@/admin/pages/DashboardPage';
import AdminServicesPage from '@/admin/pages/ServicesPage';
import AdminProjectsPage from '@/admin/pages/ProjectsPage';
import AdminMessagesPage from '@/admin/pages/MessagesPage';
import SiteSettingsPage from '@/admin/pages/SiteSettingsPage';
import TestimonialsPage from '@/admin/pages/TestimonialsPage';
import ClientLogosPage from '@/admin/pages/ClientLogosPage';
import AdminMockupsPage from '@/admin/pages/MockupsPage';
import HeroSectionPage from '@/admin/pages/HeroSectionPage';
import FAQsPage from '@/admin/pages/FAQsPage';

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
            </Routes>
          </AnimatePresence>
          <Footer />
          <ScrollToTop />
        </div>
      )}

      {/* Admin Routes */}
      {isAdminRoute && (
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
      )}
    </>
  );
}

export default App;
