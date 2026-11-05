import React from 'react';
import { motion } from 'framer-motion';

const ProcessStepsList = ({ steps = [] }) => {
  // Safety check for empty steps
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative flex flex-col items-center text-center"
          >
            {/* Number Badge */}
            <div className="absolute -top-2 -left-2 md:relative md:top-0 md:left-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mb-4 z-10">
              {String(index + 1).padStart(2, '0')}
            </div>

            {/* Icon Circle */}
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Icon className="h-10 w-10 text-primary" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-primary-deep mb-2">
              {step.title}
            </h3>

            {/* Description */}
            <p className="text-text-muted text-sm leading-relaxed">
              {step.description}
            </p>

            {/* Connector Line - Desktop Only */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-brand-blue to-transparent"></div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProcessStepsList;


