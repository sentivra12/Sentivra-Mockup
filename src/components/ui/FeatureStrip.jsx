import React from 'react';
import { motion } from 'framer-motion';

const FeatureStrip = ({ features = [] }) => {
  return (
    <section className="py-12 bg-white border-y border-frost">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <React.Fragment key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-primary-deep text-sm md:text-base mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs md:text-sm text-text-muted">
                  {feature.description}
                </p>
              </motion.div>
              
              {/* Divider - hide on mobile for last item, hide on last item desktop */}
              {index < features.length - 1 && (
                <div 
                  className={`hidden md:block absolute left-full top-1/2 -translate-y-1/2 w-px h-12 bg-frost ${
                    index === features.length - 1 ? 'md:hidden' : ''
                  }`}
                  style={{ 
                    position: 'absolute',
                    display: index >= 2 ? 'none' : 'block' // Show only first 2 dividers on mobile (3 items)
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureStrip;


