import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import InverseSurface from '@/components/ui/InverseSurface';

const CTABand = ({ title, description, primaryButton, secondaryButton, className = '' }) => {
  const { language } = useTranslation();
  
  return (
    <InverseSurface className={`py-20 ${className}`} withTopGlow withGrid>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-inverse-fg mb-4">
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p className="text-lg text-inverse-fg-muted mb-8 max-w-2xl mx-auto">
              {description}
            </p>
          )}

          {/* Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center ${language === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
            {primaryButton && (
              <a href={primaryButton.href} onClick={primaryButton.onClick}>
                <Button 
                  size="lg" 
                  className="btn-inverse-primary px-8 py-6 text-lg rounded-lg group"
                >
                  {primaryButton.label}
                  <ArrowRight className={`h-5 w-5 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </Button>
              </a>
            )}
            {secondaryButton && (
              <a href={secondaryButton.href} onClick={secondaryButton.onClick}>
                <Button 
                  size="lg" 
                  className="btn-inverse-secondary px-8 py-6 text-lg rounded-lg"
                >
                  {secondaryButton.label}
                </Button>
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </InverseSurface>
  );
};

export default CTABand;
