import React from 'react';
import { motion } from 'framer-motion';

const SectionHeader = ({ label, title, subtitle, className = '', centered = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className={`mb-16 ${centered ? 'text-center' : ''} ${className}`}
    >
      {label && (
        <span className="inline-block text-sm font-bold text-primary uppercase tracking-wider mb-4">
          {label}
        </span>
      )}
      <h2 className="text-4xl md:text-5xl font-bold text-primary-deep mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xl text-text-muted max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default SectionHeader;


