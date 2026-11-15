/**
 * PremiumServices — SP brand edition
 * Glass cards with emerald gradient accents. No old slate/blue tokens.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useMotionPreference';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../ui/GlassCard';
import SectionHeader from '../ui/SectionHeader';
import { useTranslation } from '../../i18n/useTranslation';
import * as LucideIcons from 'lucide-react';

const ServiceCard = ({ service, index, language }) => {
  const [hovered, setHovered] = useState(false);
  const shouldReduceMotion    = useReducedMotion();
  const isRTL = language === 'ar';

  const IconComponent =
    service.icon && LucideIcons[service.icon]
      ? LucideIcons[service.icon]
      : LucideIcons.Code;

  const title = language === 'ar'
    ? (service.title_ar || service.title)
    : (service.title_en || service.title);

  const description = language === 'ar'
    ? (service.short_description_ar || service.short_description)
    : (service.short_description_en || service.short_description);

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.55, delay: index * 0.08, type: 'spring', stiffness: 90 }
      }
    >
      <Link
        to={`/services/${service.slug}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-2xl"
        aria-label={title}
      >
        <GlassCard className={`h-full p-7 group relative overflow-hidden transition-all duration-400 ${hovered ? 'shadow-glow-sm -translate-y-1 border-brand-400/40' : ''}`}>

          {/* Gradient wash on hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
            style={{ background: 'linear-gradient(135deg, rgba(13,158,130,0.07) 0%, rgba(4,77,64,0.05) 100%)' }}
          />

          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transition-opacity duration-400"
            style={{
              background: 'linear-gradient(to right, transparent, #0D9E82, transparent)',
              opacity: hovered ? 1 : 0,
            }}
          />

          <div className="relative space-y-4">
            {/* Icon */}
            <motion.div
              animate={shouldReduceMotion ? {} : { rotate: hovered ? [0, -8, 8, 0] : 0, scale: hovered ? 1.08 : 1 }}
              transition={{ duration: 0.45 }}
              className="w-14 h-14 rounded-xl flex items-center justify-center border border-brand-200/60 dark:border-brand-700/50 shadow-sm"
              style={{ background: 'linear-gradient(135deg, rgba(13,158,130,0.15), rgba(5,90,79,0.08))' }}
            >
              <IconComponent className="w-7 h-7 text-brand-600 dark:text-brand-400" aria-hidden="true" />
            </motion.div>

            {/* Title */}
            <h3
              className={`text-xl font-bold text-brand-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300 ${isRTL ? 'text-right' : 'text-left'}`}
              dir="auto"
            >
              {title}
            </h3>

            {/* Description */}
            {description && (
              <p
                className={`text-brand-700/65 dark:text-brand-300/65 leading-relaxed line-clamp-3 text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                dir="auto"
              >
                {description}
              </p>
            )}

            {/* Features */}
            {service.features && service.features.length > 0 && (
              <ul className="space-y-1.5 pt-1">
                {service.features.slice(0, 3).map((feature, i) => (
                  <li key={i} className={`flex items-center gap-2 text-sm text-brand-700/60 dark:text-brand-300/60 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                    <span dir="auto">{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Learn more */}
            <div className={`flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-sm pt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span>{language === 'ar' ? 'اعرف المزيد' : 'Learn more'}</span>
              <motion.span
                animate={shouldReduceMotion ? {} : { x: hovered ? (isRTL ? -4 : 4) : 0 }}
                transition={{ duration: 0.25 }}
              >
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} aria-hidden="true" />
              </motion.span>
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
};

const PremiumServices = ({ services = [], featured = false }) => {
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  const shouldReduceMotion = useReducedMotion();

  const displayServices = featured
    ? services.filter(s => s.is_featured)
    : services;

  if (!displayServices || displayServices.length === 0) return null;

  return (
    <section
      id="services"
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, var(--color-background) 0%, var(--color-surface-raised) 100%)' }}
    >
      {/* Subtle brand tint orbs */}
      <div className="absolute top-0 end-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-20"
           style={{ background: 'radial-gradient(circle, #0D9E82 0%, transparent 70%)' }} aria-hidden="true" />
      <div className="absolute bottom-0 start-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-10"
           style={{ background: 'radial-gradient(circle, #055A4F 0%, transparent 70%)' }} aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        <SectionHeader
          eyebrow={t('home.services.label')}
          heading={t('home.services.title')}
          description={t('home.services.subtitle')}
          className="mb-16"
          language={language}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayServices.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} language={language} />
          ))}
        </div>

        {/* View all */}
        {featured && services.length > displayServices.length && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.3 }}
            className="text-center mt-14"
          >
            <Link
              to="/services"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-brand-500/25 hover:border-brand-500/60 bg-brand-500/5 hover:bg-brand-500/10 text-brand-700 dark:text-brand-300 font-semibold transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <span>{t('home.services.viewAll')}</span>
              <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} aria-hidden="true" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PremiumServices;
