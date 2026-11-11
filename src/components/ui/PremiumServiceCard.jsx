import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import * as LucideIcons from 'lucide-react';

/**
 * PremiumServiceCard - Enhanced service card with fallback visual generator
 * 
 * Features:
 * - Whole card clickable with cursor-follow spotlight
 * - Border glow on hover
 * - When image missing/failed: generates gradient plate with category icon + pattern
 * - Featured variant spans 2 columns
 * - Equal heights in grid
 * - Category pill
 * - Technology pills (optional)
 * - Proper focus ring
 * - Full RTL support
 * 
 * Props:
 * @param {Object} service - Service data {id, slug, title_en, title_ar, short_description_en, short_description_ar, image_url, category, icon, technologies, is_featured}
 * @param {Number} delay - Animation delay
 * @param {Boolean} featured - Override for featured layout
 */
const PremiumServiceCard = ({ service, delay = 0, featured = false }) => {
  const { language } = useTranslation();
  const isRTL = language === 'ar';
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Spotlight effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const spotlightX = useTransform(mouseX, (val) => `${val}px`);
  const spotlightY = useTransform(mouseY, (val) => `${val}px`);

  // Get icon component
  const getIcon = (iconName) => {
    const Icon = LucideIcons[iconName];
    return Icon || LucideIcons.Box;
  };

  const Icon = getIcon(service.icon || 'Box');
  const isFeatured = featured || service.is_featured;

  // Service data
  const title = isRTL ? (service.title_ar || service.title) : (service.title_en || service.title);
  const description = isRTL 
    ? (service.short_description_ar || service.short_description) 
    : (service.short_description_en || service.short_description);
  const category = service.category?.name_en || service.category || 'Service';
  const hasImage = service.image_url && !imageError;

  // Category colors
  const categoryColors = {
    'Web & Mobile': { bg: 'from-blue-500 to-blue-600', border: 'border-blue-500/20', text: 'text-blue-600' },
    'Business Systems': { bg: 'from-purple-500 to-purple-600', border: 'border-purple-500/20', text: 'text-purple-600' },
    'AI & Data': { bg: 'from-pink-500 to-pink-600', border: 'border-pink-500/20', text: 'text-pink-600' },
  };
  
  const colorScheme = categoryColors[category] || categoryColors['Web & Mobile'];

  // Parse technologies
  const technologies = Array.isArray(service.technologies) 
    ? service.technologies 
    : (service.technologies ? JSON.parse(service.technologies) : []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className={isFeatured ? 'lg:col-span-2' : ''}
    >
      <Link
        to={`/services/${service.slug}`}
        className="block group relative h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        <div className="relative h-full bg-color-background rounded-2xl border border-frost overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          
          {/* Spotlight effect */}
          {isHovered && (
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `radial-gradient(600px circle at ${spotlightX} ${spotlightY}, rgba(59, 130, 246, 0.08), transparent 40%)`,
              }}
            />
          )}

          {/* Border glow on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/20" />
          </div>

          <div className={`flex ${isFeatured ? 'lg:flex-row' : 'flex-col'} h-full`}>
            {/* Image or Generated Visual */}
            <div className={`relative ${isFeatured ? 'lg:w-2/5' : 'w-full'} ${isFeatured ? 'aspect-[4/3] lg:aspect-auto' : 'aspect-[4/3]'} bg-frost-soft overflow-hidden flex-shrink-0`}>
              {hasImage ? (
                <img
                  src={service.image_url}
                  alt={title}
                  loading="lazy"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  width={isFeatured ? 600 : 400}
                  height={isFeatured ? 400 : 300}
                />
              ) : (
                // Generated fallback visual
                <div className={`relative w-full h-full bg-gradient-to-br ${colorScheme.bg} flex items-center justify-center overflow-hidden`}>
                  {/* Abstract UI pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id={`grid-${service.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
                          <circle cx="20" cy="20" r="1.5" fill="white" opacity="0.4" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#grid-${service.id})`} />
                    </svg>
                  </div>
                  
                  {/* Category icon */}
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                    </div>
                    
                    {/* Service number badge */}
                    <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-white text-sm font-semibold">
                        #{(service.display_order || 0).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Decorative shapes */}
                  <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-white/10 blur-2xl" />
                  <div className="absolute bottom-4 right-4 w-20 h-20 rounded-full bg-white/10 blur-2xl" />
                </div>
              )}

              {/* Category pill overlay */}
              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-color-background/90 backdrop-blur-sm border ${colorScheme.border} shadow-sm text-xs font-semibold ${colorScheme.text}`}>
                  <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                  {category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className={`flex flex-col ${isFeatured ? 'lg:w-3/5' : 'w-full'} p-6 ${isFeatured ? 'lg:p-8' : ''}`}>
              {/* Title */}
              <h3 className={`font-bold text-primary-deep mb-3 group-hover:text-primary transition-colors line-clamp-2 ${isFeatured ? 'text-2xl lg:text-3xl' : 'text-xl'}`}>
                {title}
              </h3>

              {/* Description */}
              <p className={`text-text-muted leading-relaxed mb-4 flex-grow ${isFeatured ? 'text-base line-clamp-3' : 'text-sm line-clamp-3'}`}>
                {description}
              </p>

              {/* Technologies */}
              {technologies.length > 0 && (
                <div className={`flex flex-wrap gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {technologies.slice(0, isFeatured ? 6 : 4).map((tech, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 rounded-md bg-frost-soft border border-frost text-xs font-medium text-text-muted"
                    >
                      {tech}
                    </span>
                  ))}
                  {technologies.length > (isFeatured ? 6 : 4) && (
                    <span className="px-2.5 py-1 rounded-md bg-frost-soft border border-frost text-xs font-medium text-text-muted">
                      +{technologies.length - (isFeatured ? 6 : 4)}
                    </span>
                  )}
                </div>
              )}

              {/* Learn More Link */}
              <div className={`flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>Learn More</span>
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Lift effect shadow */}
          <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-primary/10 rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl" />
        </div>
      </Link>
    </motion.div>
  );
};

export default PremiumServiceCard;
