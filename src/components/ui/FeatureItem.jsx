import React from 'react';
import { motion } from 'framer-motion';

const FeatureItem = ({ icon: Icon, title, description, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center text-center p-6"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-primary-deep mb-2">
        {title}
      </h3>
      <p className="text-text-muted leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

export default FeatureItem;


