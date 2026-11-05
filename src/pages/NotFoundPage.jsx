import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-frost-soft flex items-center justify-center px-4"
    >
      <Helmet>
        <title>404 - Page Not Found | Sentivra</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>

      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Number */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-[150px] md:text-[200px] font-bold text-primary leading-none">
            404
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary-deep mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-text-muted mb-8 max-w-md mx-auto">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="lg" asChild>
            <Link to="/" className="inline-flex items-center gap-2">
              <Home className="h-5 w-5" />
              Back to Home
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/services" className="inline-flex items-center gap-2">
              <Search className="h-5 w-5" />
              Browse Services
            </Link>
          </Button>
        </motion.div>

        {/* Helpful Links */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 pt-8 border-t border-frost"
        >
          <p className="text-sm text-text-muted mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/services" className="text-primary hover:text-primary-strong transition-colors">
              Services
            </Link>
            <Link to="/our-work" className="text-primary hover:text-primary-strong transition-colors">
              Our Work
            </Link>
            <Link to="/mockups" className="text-primary hover:text-primary-strong transition-colors">
              Mockups
            </Link>
            <Link to="/about" className="text-primary hover:text-primary-strong transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="text-primary hover:text-primary-strong transition-colors">
              Contact
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFoundPage;
