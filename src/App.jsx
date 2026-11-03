
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '@/components/Header';
import HomePage from '@/pages/HomePage';
import ServicesPage from '@/pages/ServicesPage';
import OurWorkPage from '@/pages/OurWorkPage';
import MockupsPage from '@/pages/MockupsPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import BlogPage from '@/pages/BlogPage';
import ServiceDetailPage from '@/pages/ServiceDetailPage';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

function App() {
  const location = useLocation();

  return (
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
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
        </Routes>
      </AnimatePresence>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default App;
