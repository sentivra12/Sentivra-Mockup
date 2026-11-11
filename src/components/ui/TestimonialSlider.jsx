import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

const TestimonialSlider = ({ testimonials = [] }) => {
  const { t, language } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Safety check for empty testimonials
  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">{t('testimonials.noTestimonials')}</p>
      </div>
    );
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  const currentTestimonial = testimonials[currentIndex] || {};

  return (
    <div 
      className="relative max-w-4xl mx-auto"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={t('testimonials.ariaLabel')}
    >
      {/* Main Testimonial Card */}
      <div className="relative bg-color-background rounded-2xl shadow-dropdown border border-frost p-8 md:p-12">
        {/* Quote Icon */}
        <div className="absolute top-6 right-6 opacity-10">
          <Quote className="h-20 w-20 text-primary" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            {/* Testimonial Text */}
            <p className="text-lg md:text-xl text-text-muted leading-relaxed mb-8 italic">
              "{currentTestimonial.text}"
            </p>

            {/* Client Info */}
            <div className="flex items-center gap-4">
              <img
                src={currentTestimonial.clientPhoto}
                alt={currentTestimonial.clientName}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                width="64"
                height="64"
              />
              <div>
                <h4 className="font-bold text-primary-deep text-lg">
                  {currentTestimonial.clientName}
                </h4>
                <p className="text-text-muted text-sm">
                  {currentTestimonial.clientRole}, {currentTestimonial.clientCompany}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {testimonials.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            aria-label={t('testimonials.previous')}
            className={`absolute ${language === 'ar' ? 'right-0 translate-x-4 md:translate-x-12' : 'left-0 -translate-x-4 md:-translate-x-12'} top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-color-background shadow-lg border border-frost flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300`}
          >
            <ChevronLeft className={`h-5 w-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={goToNext}
            aria-label={t('testimonials.next')}
            className={`absolute ${language === 'ar' ? 'left-0 -translate-x-4 md:-translate-x-12' : 'right-0 translate-x-4 md:translate-x-12'} top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-color-background shadow-lg border border-frost flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300`}
          >
            <ChevronRight className={`h-5 w-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {testimonials.length > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`${t('testimonials.goTo')} ${index + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-primary w-8'
                  : 'bg-muted hover:bg-text-muted'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TestimonialSlider;


