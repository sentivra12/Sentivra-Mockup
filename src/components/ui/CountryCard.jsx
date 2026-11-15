import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';

const CountryCard = ({ country, delay = 0 }) => {
  const { language } = useTranslation();
  const [imageError, setImageError] = useState(false);
  
  // Get localized values
  const name = language === 'ar' ? (country.name_ar || country.name_en) : (country.name_en || country.name);
  const description = language === 'ar' ? (country.description_ar || country.description_en) : (country.description_en || country.description);
  const flag = country.flag_emoji || country.flag || '🌍';
  const imageUrl = country.image_url || country.image;
  
  // Show flag fallback if no image or image failed to load
  const showFallback = !imageUrl || imageError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="bg-color-background rounded-xl overflow-hidden shadow-card-hover hover:shadow-dropdown transition-shadow duration-300 group"
    >
      {/* Country Visual */}
      <div className="relative h-40 overflow-hidden">
        {showFallback ? (
          // Fallback: Brand glass card with large flag emoji
          <div className="w-full h-full bg-gradient-to-br from-brand-50 via-frost-soft to-brand-100 dark:from-brand-950 dark:via-brand-900 dark:to-brand-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
            <div className="text-6xl" role="img" aria-label={`${name} flag`}>
              {flag}
            </div>
          </div>
        ) : (
          // Image if available
          <>
            <img
              src={imageUrl}
              alt={`${name} flag`}
              loading="lazy"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              width="300"
              height="160"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/40 to-transparent dark:from-brand-950/60" />
            
            {/* Flag Badge - Bottom Left */}
            <div className="absolute bottom-3 left-3 bg-color-background/95 backdrop-blur-sm rounded-md px-2 py-1 flex items-center justify-center text-xl shadow-card-hover">
              {flag}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-primary-deep dark:text-primary-light mb-2 group-hover:text-primary dark:group-hover:text-brand-accent transition-colors">
          {name}
        </h3>
        {description && (
          <p className="text-sm text-text-muted leading-relaxed" dir="auto">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default CountryCard;


