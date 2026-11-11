import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/useTranslation';

const MockupCard = ({ 
  mockup, 
  onViewMockup, 
  onRequestDesign, 
  delay = 0,
  layout = 'grid' // 'grid' or 'list'
}) => {
  const { t, language } = useTranslation();
  const { title, category, description } = mockup;
  // Fix: Use correct image field from database (cover_image_url or desktop_screenshot_url)
  const image = mockup.cover_image_url || mockup.desktop_screenshot_url || mockup.image;

  if (layout === 'list') {
    // Mobile horizontal layout
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="bg-color-background rounded-xl border border-frost overflow-hidden hover:shadow-card-hover transition-shadow duration-300"
      >
        <div className="flex gap-4 p-4">
          {/* Image */}
          <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-frost-soft">
            <img 
              src={image} 
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              width="128"
              height="128"
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-primary-deep text-base line-clamp-1">
                  {title}
                </h3>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0">
                  {category}
                </span>
              </div>
              <p className="text-sm text-text-muted line-clamp-2">
                {description}
              </p>
            </div>

            {/* Buttons */}
            <div className={`flex gap-2 mt-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <Button
                onClick={() => onViewMockup(mockup)}
                size="sm"
                className={`bg-primary hover:bg-primary-dark text-white text-xs px-3 py-2 rounded-lg min-w-0 ${language === 'ar' ? 'flex-row-reverse' : ''}`}
              >
                <Eye className={`h-3 w-3 ${language === 'ar' ? 'ml-1' : 'mr-1'} flex-shrink-0`} />
                <span className="whitespace-nowrap">{t('mockups.card.view')}</span>
              </Button>
              <Button
                onClick={() => onRequestDesign(mockup)}
                size="sm"
                variant="outline"
                className={`border border-primary text-primary hover:bg-primary hover:text-white text-xs px-2 py-2 rounded-lg flex-1 min-w-0 ${language === 'ar' ? 'flex-row-reverse' : ''}`}
              >
                <span className="truncate">{t('mockups.card.request')}</span>
                <ArrowRight className={`h-3 w-3 ${language === 'ar' ? 'mr-1 rotate-180' : 'ml-1'} flex-shrink-0`} />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Desktop grid layout
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group bg-color-background rounded-xl border border-frost overflow-hidden hover:shadow-dropdown hover:border-primary/30 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-56 bg-frost-soft overflow-hidden">
        <img 
          src={image} 
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          width="400"
          height="224"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-primary-deep text-lg group-hover:text-primary transition-colors">
              {title}
            </h3>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full whitespace-nowrap">
              {category}
            </span>
          </div>
          <p className="text-sm text-text-muted leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={() => onViewMockup(mockup)}
            size="sm"
            className={`bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg group/btn w-full ${language === 'ar' ? 'flex-row-reverse' : ''}`}
          >
            <Eye className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
            <span className="whitespace-nowrap">{t('mockups.card.viewMockup')}</span>
          </Button>
          <Button
            onClick={() => onRequestDesign(mockup)}
            size="sm"
            variant="outline"
            className={`border-2 border-primary text-primary hover:bg-primary hover:text-white px-4 py-2.5 rounded-lg group/btn w-full ${language === 'ar' ? 'flex-row-reverse' : ''}`}
          >
            <span className="whitespace-nowrap">{t('mockups.card.requestDesign')}</span>
            <ArrowRight className={`h-4 w-4 ${language === 'ar' ? 'mr-2 group-hover/btn:-translate-x-1 rotate-180' : 'ml-2 group-hover/btn:translate-x-1'} transition-transform`} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MockupCard;


