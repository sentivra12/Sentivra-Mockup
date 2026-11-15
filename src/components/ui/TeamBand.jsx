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
  className = '',
  inverse = true // New prop: set to false for light surface
}) => {
  const { language } = useTranslation();
  
  // If inverse=false, render on light brand-tinted surface
  if (!inverse) {
    return (
      <section className={`py-16 md:py-20 bg-frost-soft dark:bg-brand-950 ${className}`}>
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
                <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider">
                  {label}
                </span>
              )}

              {/* Title */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-deep dark:text-primary-light leading-tight">
                {title}
              </h2>
              
              {/* Description */}
              {description && (
                <p className="text-lg text-text-muted leading-relaxed" dir="auto">
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
                        className={`bg-primary hover:bg-primary-dark text-white dark:bg-brand-accent dark:hover:bg-brand-600 px-8 py-6 text-lg rounded-lg group ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                      >
                        {buttonLabel}
                        <ArrowRight className={`h-5 w-5 ${language === 'ar' ? 'mr-2 group-hover:-translate-x-1 rotate-180' : 'ml-2 group-hover:translate-x-1'} transition-transform`} />
                      </Button>
                    </a>
                  ) : (
                    <Button 
                      onClick={buttonOnClick}
                      size="lg" 
                      className={`bg-primary hover:bg-primary-dark text-white dark:bg-brand-accent dark:hover:bg-brand-600 px-8 py-6 text-lg rounded-lg group ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                    >
                      {buttonLabel}
                      <ArrowRight className={`h-5 w-5 ${language === 'ar' ? 'mr-2 group-hover:-translate-x-1 rotate-180' : 'ml-2 group-hover:translate-x-1'} transition-transform`} />
                    </Button>
                  )}
                </div>
              )}
            </motion.div>

            {/* Right Image or Brand Illustration */}
            {teamImage ? (
              <motion.div
                initial={{ opacity: 0, x: language === 'ar' ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <img
                  src={teamImage}
                  alt={title}
                  className="w-full h-auto rounded-2xl shadow-card-hover"
                  width="800"
                  height="600"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: language === 'ar' ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative h-[400px] rounded-2xl overflow-hidden bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200 dark:from-brand-950 dark:via-brand-900 dark:to-brand-800 border border-frost shadow-card-hover"
              >
                {/* Abstract brand illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Animated circles */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 w-64 h-64 rounded-full bg-gradient-to-br from-brand-200 to-brand-300 dark:from-brand-700 dark:to-brand-600 blur-3xl"
                    />
                    <motion.div
                      animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                      }}
                      className="absolute inset-0 w-48 h-48 rounded-full bg-gradient-to-br from-brand-300 to-brand-400 dark:from-brand-600 dark:to-brand-500 blur-2xl transform translate-x-12 translate-y-12"
                    />
                    {/* Icon/Symbol */}
                    <div className="relative z-10 text-center">
                      <div className="text-8xl mb-4">👥</div>
                      <p className="text-lg font-semibold text-primary dark:text-brand-accent">
                        {language === 'ar' ? 'فريقنا المتميز' : 'Our Team'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    );
  }
  
  // Original inverse (dark) surface
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
