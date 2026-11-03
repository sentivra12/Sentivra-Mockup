import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const CTABand = ({ title, description, primaryButton, secondaryButton, className = '' }) => {
  return (
    <section className={`py-20 bg-primary-deep relative overflow-hidden ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              {description}
            </p>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {primaryButton && (
              <a href={primaryButton.href} onClick={primaryButton.onClick}>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-6 text-lg rounded-lg group"
                >
                  {primaryButton.label}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
            )}
            {secondaryButton && (
              <a href={secondaryButton.href} onClick={secondaryButton.onClick}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-deep px-8 py-6 text-lg rounded-lg"
                >
                  {secondaryButton.label}
                </Button>
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABand;


