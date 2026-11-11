/**
 * Premium Services Section - Stripe/Linear Quality
 * Features:
 * - Glass morphism cards with gradient accents
 * - Smooth hover animations
 * - Grid layout with responsive design
 * - Icon animations on hover
 * - Category filtering (optional)
 * - Bilingual support (EN/AR)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../ui/GlassCard';
import SectionHeader from '../ui/SectionHeader';
import { useTranslation } from '../../i18n/useTranslation';
import * as LucideIcons from 'lucide-react';

const PremiumServiceCard = ({ service, index, language }) => {
  const [isHovered, setIsHovered] = useState(false);
  // Resolve icon name to component
  const IconComponent = service.icon && LucideIcons[service.icon] 
    ? LucideIcons[service.icon] 
    : LucideIcons.Code;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
    >
      <Link 
        to={`/services/${service.slug}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <GlassCard 
          className="h-full p-8 hover:border-primary/30 transition-all duration-500 group relative overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
        >
          {/* Gradient accent on hover */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: isHovered ? 0.15 : 0,
              scale: isHovered ? 1 : 0.8
            }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-gradient-to-br from-primary/30 to-blue-500/20 pointer-events-none"
          />
          
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative space-y-4">
            {/* Icon */}
            <motion.div
              animate={{ 
                rotate: isHovered ? [0, -10, 10, 0] : 0,
                scale: isHovered ? 1.1 : 1
              }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/10"
            >
              <IconComponent className="w-8 h-8 text-primary dark:text-primary-strong" />
            </motion.div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
              {service.title}
            </h3>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed line-clamp-3">
              {service.short_description || service.shortDescription}
            </p>

            {/* Features List */}
            {service.features && service.features.length > 0 && (
              <ul className="space-y-2 pt-2">
                {service.features.slice(0, 3).map((feature, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 * idx }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            )}

            {/* Arrow Icon */}
            <motion.div
              animate={{ 
                x: isHovered ? (language === 'ar' ? -4 : 4) : 0
              }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 text-primary font-medium pt-2"
            >
              <span className="text-sm">Learn more</span>
              <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </motion.div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
};

const PremiumServices = ({ services = [], featured = false }) => {
  const { t, language } = useTranslation();

  // Filter featured services if needed
  const displayServices = featured 
    ? services.filter(s => s.is_featured) 
    : services;

  // Hide section if no services - AFTER all hooks
  if (!displayServices || displayServices.length === 0) {
    return null;
  }

  return (
    <section id="services" className="py-32 bg-surface/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-transparent pointer-events-none" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 end-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 start-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <SectionHeader 
          label={t('home.services.label')}
          title={t('home.services.title')} 
          subtitle={t('home.services.subtitle')}
        />

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayServices.map((service, index) => (
            <PremiumServiceCard
              key={service.id}
              service={service}
              index={index}
              language={language}
            />
          ))}
        </div>

        {/* View All Link */}
        {featured && services.length > displayServices.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-medium transition-all duration-300 group"
            >
              <span>{t('home.services.viewAll')}</span>
              <ArrowRight className={`w-4 h-4 group-hover:${language === 'ar' ? '-translate-x-1' : 'translate-x-1'} transition-transform duration-300 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PremiumServices;
