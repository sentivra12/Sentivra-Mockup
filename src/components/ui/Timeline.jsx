import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Rocket, Globe, Users, TrendingUp, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { Bidi } from './Bidi';

const iconMap = {
  Lightbulb,
  Rocket,
  Globe,
  Users,
  TrendingUp
};

const Timeline = ({ milestones }) => {
  const { language } = useTranslation();
  
  // Get localized values
  const getTitle = (milestone) => {
    return language === 'ar' ? (milestone.title_ar || milestone.title) : (milestone.title_en || milestone.title);
  };
  
  const getDescription = (milestone) => {
    return language === 'ar' ? (milestone.description_ar || milestone.description) : (milestone.description_en || milestone.description);
  };
  
  return (
    <>
      {/* Desktop - Horizontal Timeline */}
      <div className="hidden lg:block relative pt-8">
        {/* Horizontal Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-frost dark:bg-brand-900">
          <motion.div
            className="h-full bg-primary dark:bg-brand-accent"
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </div>

        {/* Milestones Grid */}
        <ol className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" role="list">
          {milestones.map((milestone, index) => {
            
            return (
              <motion.li
                key={milestone.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="flex flex-col"
              >
                {/* Dot */}
                <div className="relative -top-2 w-3 h-3 rounded-full mb-6 bg-primary dark:bg-brand-accent" />

                {/* Content */}
                <div className={language === 'ar' ? 'text-right' : 'text-left'} dir="auto">
                  <div className="text-lg font-bold text-primary dark:text-brand-accent mb-1">
                    <Bidi>{milestone.year}</Bidi>
                  </div>
                  <h4 className="text-base font-bold text-primary-deep dark:text-primary-light mb-2">
                    {getTitle(milestone)}
                  </h4>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {getDescription(milestone)}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>

      {/* Mobile/Tablet - Vertical Timeline */}
      <div className="lg:hidden">
        <ol className={`relative border-l-2 border-frost dark:border-brand-900 ${language === 'ar' ? 'mr-6 border-r-2 border-l-0' : 'ml-6'} space-y-8`} role="list">
          {milestones.map((milestone, index) => {
            const Icon = iconMap[milestone.icon] || Lightbulb;
            
            return (
              <motion.li
                key={milestone.id || index}
                initial={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={language === 'ar' ? 'mr-6' : 'ml-6'}
              >
                {/* Dot */}
                <div className={`absolute ${language === 'ar' ? '-right-3' : '-left-3'} w-6 h-6 bg-primary dark:bg-brand-accent rounded-full border-4 border-color-background`} />

                {/* Content Card */}
                <div className="bg-color-background rounded-lg p-5 shadow-card-hover hover:shadow-dropdown transition-shadow duration-300">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 dark:bg-brand-accent/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary dark:text-brand-accent" />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0" dir="auto">
                      <div className={`flex items-center gap-3 mb-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xl font-bold text-primary dark:text-brand-accent">
                          <Bidi>{milestone.year}</Bidi>
                        </span>
                        <ChevronRight className={`h-4 w-4 text-muted ${language === 'ar' ? 'rotate-180' : ''}`} />
                        <h4 className="text-base font-bold text-primary-deep dark:text-primary-light">
                          {getTitle(milestone)}
                        </h4>
                      </div>
                      <p className="text-sm text-text-muted leading-relaxed">
                        {getDescription(milestone)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </>
  );
};

export default Timeline;


