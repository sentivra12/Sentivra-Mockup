import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';

const ServiceCardWithImage = ({ service, delay = 0, variant = 'desktop' }) => {
  const { t, language } = useTranslation();
  
  if (variant === 'mobile') {
    // Mobile: horizontal card with small image on left
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="bg-color-background rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-frost overflow-hidden"
      >
        <div className="flex gap-4 p-4">
          <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-frost-soft">
            <img
              src={service.image}
              alt={service.title}
              loading="lazy"
              className="w-full h-full object-cover"
              width="80"
              height="80"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-primary-deep mb-1 line-clamp-1">
              {service.title}
            </h3>
            <p className="text-sm text-text-muted mb-2 line-clamp-2">
              {service.shortDescription}
            </p>
            <Link 
              to={`/services/${service.slug}`}
              className={`inline-flex items-center gap-1 text-primary text-sm font-medium group ${language === 'ar' ? 'flex-row-reverse' : ''}`}
            >
              {t('services.card.learnMore')}
              <ArrowRight className={`h-3 w-3 ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // Desktop: vertical card with large image on top
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group bg-color-background rounded-2xl shadow-card hover:shadow-dropdown transition-all duration-300 border border-frost overflow-hidden"
    >
      <div className="relative overflow-hidden aspect-[4/3] bg-frost-soft">
        <img
          src={service.image}
          alt={service.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          width="400"
          height="300"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-primary-deep mb-3 group-hover:text-primary transition-colors">
          {service.title}
        </h3>
        <p className="text-text-muted leading-relaxed mb-4 line-clamp-2">
          {service.shortDescription}
        </p>
        <Link 
          to={`/services/${service.slug}`}
          className={`inline-flex items-center gap-2 text-primary font-medium group/link ${language === 'ar' ? 'flex-row-reverse' : ''}`}
        >
          {t('services.card.learnMore')}
          <ArrowRight className={`h-4 w-4 ${language === 'ar' ? 'rotate-180 group-hover/link:-translate-x-1' : 'group-hover/link:translate-x-1'} transition-transform`} />
        </Link>
      </div>
    </motion.div>
  );
};

export default ServiceCardWithImage;


