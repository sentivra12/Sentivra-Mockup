import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

const BlogPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      <Helmet>
        <title>Blog - Coming Soon | Sentivra</title>
        <meta name="description" content="Our blog is coming soon. Stay tuned for insights, tutorials, and updates." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-br from-white to-frost-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider">
              BLOG
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-deep">
              Coming Soon
            </h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              We're working on bringing you valuable insights, tutorials, and updates about digital solutions, technology trends, and our work. Stay tuned!
            </p>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default BlogPage;
