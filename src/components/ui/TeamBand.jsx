import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

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
  return (
    <section className={`py-16 md:py-20 bg-primary-deep relative overflow-hidden ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
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
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {title}
            </h2>
            
            {/* Description */}
            {description && (
              <p className="text-lg text-white/80 leading-relaxed">
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
                      className="bg-primary hover:bg-primary-dark text-white px-8 py-6 text-lg rounded-lg group"
                    >
                      {buttonLabel}
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </a>
                ) : (
                  <Button 
                    onClick={buttonOnClick}
                    size="lg" 
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-6 text-lg rounded-lg group"
                  >
                    {buttonLabel}
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </div>
            )}
          </motion.div>

          {/* Right Image with Fade Effect */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:ml-8"
          >
            {teamImage && (
              <div className="relative">
                <img
                  src={teamImage}
                  alt="Our team"
                  className="w-full h-auto rounded-2xl shadow-lg-primary"
                />
                {/* Gradient fade into navy on left side */}
                <div className="hidden lg:block absolute inset-y-0 -left-8 w-32 bg-gradient-to-r from-navy to-transparent" />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TeamBand;


