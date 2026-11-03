import React from 'react';
import { motion } from 'framer-motion';

const ProcessStep = ({ number, icon: Icon, title, description, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-10 w-10 text-primary" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
            {number}
          </div>
        </div>
        <h3 className="text-xl font-bold text-primary-deep mb-3">
          {title}
        </h3>
        <p className="text-text-muted leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default ProcessStep;


