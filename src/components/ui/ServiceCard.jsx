import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

const ServiceCard = ({ icon: Icon, title, description, delay = 0 }) => {
  const { t, language } = useTranslation();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-color-background p-8 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-frost h-full flex flex-col"
    >
      <div className="mb-6">
        <Icon className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-primary-deep mb-3">
        {title}
      </h3>
      <p className="text-text-muted leading-relaxed mb-4 flex-grow">
        {description}
      </p>
      <button className="text-primary font-medium flex items-center gap-2 group">
        {t('common.learnMore')}
        <ArrowRight className={`h-4 w-4 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180' : ''}`} />
      </button>
    </motion.div>
  );
};

export default ServiceCard;


