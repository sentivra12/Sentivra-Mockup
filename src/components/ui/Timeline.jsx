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
  
  return (
    <>
      {/* Desktop - Horizontal Timeline */}
      <div className="hidden lg:block relative pt-8">
        {/* Horizontal Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-frost">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </div>

        {/* Milestones Grid */}
        <ol className="grid grid-cols-5 gap-4" role="list">
          {milestones.map((milestone, index) => {
            const isActive = milestone.year === '2022'; // Highlight 2022
            
            return (
              <motion.li
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="flex flex-col"
              >
                {/* Dot */}
                <div className={`relative -top-2 w-3 h-3 rounded-full mb-6 ${
                  isActive 
                    ? 'bg-primary ring-4 ring-brand-blue/30' 
                    : 'bg-primary'
                }`} />

                {/* Content - Left/Right Aligned based on language */}
                <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                  <div className="text-lg font-bold text-primary mb-1">
                    <Bidi>{milestone.year}</Bidi>
                  </div>
                  <h4 className="text-base font-bold text-primary-deep mb-2">
                    {milestone.title}
                  </h4>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>

      {/* Mobile/Tablet - Vertical Timeline */}
      <div className="lg:hidden">
        <ol className={`relative border-l-2 border-frost ${language === 'ar' ? 'mr-6 border-r-2 border-l-0' : 'ml-6'} space-y-8`} role="list">
          {milestones.map((milestone, index) => {
            const Icon = iconMap[milestone.icon] || Lightbulb;
            
            return (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={language === 'ar' ? 'mr-6' : 'ml-6'}
              >
                {/* Dot */}
                <div className={`absolute ${language === 'ar' ? '-right-3' : '-left-3'} w-6 h-6 bg-primary rounded-full border-4 border-white`} />

                {/* Content Card */}
                <div className="bg-color-background rounded-lg p-5 shadow-card-hover hover:shadow-dropdown transition-shadow duration-300">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center gap-3 mb-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xl font-bold text-primary">
                          <Bidi>{milestone.year}</Bidi>
                        </span>
                        <ChevronRight className={`h-4 w-4 text-muted ${language === 'ar' ? 'rotate-180' : ''}`} />
                        <h4 className="text-base font-bold text-primary-deep">
                          {milestone.title}
                        </h4>
                      </div>
                      <p className="text-sm text-text-muted leading-relaxed">
                        {milestone.description}
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


