import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import InverseSurface from '@/components/ui/InverseSurface';

const TeamBand = ({ 
  label, 
  title, 
  description, 
  buttonLabel, 
  buttonHref, 
  buttonOnClick,
  teamImage,
  className = '' 
}) => {
  const { language } = useTranslation();
  
  return (
    <InverseSurface className={`py-16 md:py-20 ${className}`} withTopGlow withGrid>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: language === 'ar' ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Label */}
            {label && (
              <span className="inline-block text-sm font-semibold text-inverse-accent uppercase tracking-wider">
                {label}
              </span>
            )}

            {/* Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-inverse-fg leading-tight">
              {title}
            </h2>
            
            {/* Description */}
            {description && (
              <p className="text-lg text-inverse-fg-muted leading-relaxed">
                {description}
              </p>
            )}

            {/* Button */}
            {buttonLabel && (
              <div className="pt-4">
                {buttonHref ? (
                  <a href={buttonHref} onClick={buttonOnClick}>
                    <Button 
                      size="lg" 
                      className={`btn-inverse-primary px-8 py-6 text-lg rounded-lg group ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                    >
                      {buttonLabel}
                      <ArrowRight className={`h-5 w-5 ${language === 'ar' ? 'mr-2 group-hover:-translate-x-1 rotate-180' : 'ml-2 group-hover:translate-x-1'} transition-transform`} />
                    </Button>
                  </a>
                ) : (
                  <Button 
                    onClick={buttonOnClick}
                    size="lg" 
                    className={`btn-inverse-primary px-8 py-6 text-lg rounded-lg group ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                  >
                    {buttonLabel}
                    <ArrowRight className={`h-5 w-5 ${language === 'ar' ? 'mr-2 group-hover:-translate-x-1 rotate-180' : 'ml-2 group-hover:translate-x-1'} transition-transform`} />
                  </Button>
                )}
              </div>
            )}
          </motion.div>

          {/* Right Image with Fade Effect */}
          <motion.div
            initial={{ opacity: 0, x: language === 'ar' ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`relative ${language === 'ar' ? 'lg:mr-8' : 'lg:ml-8'}`}
          >
            {teamImage && (
              <div className="relative">
                <img
                  src={teamImage}
                  alt={title}
                  className="w-full h-auto rounded-2xl shadow-lg"
                  width="800"
                  height="600"
                />
                {/* Gradient fade into dark background */}
                <div 
                  className={`hidden lg:block absolute inset-y-0 ${language === 'ar' ? '-right-8' : '-left-8'} w-32`}
                  style={{
                    background: `linear-gradient(to ${language === 'ar' ? 'left' : 'right'}, var(--inverse-bg), transparent)`
                  }}
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </InverseSurface>
  );
};

export default TeamBand;
