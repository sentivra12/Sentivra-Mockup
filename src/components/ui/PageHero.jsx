import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/useTranslation';

const PageHero = ({ 
  breadcrumbs = [], 
  label, 
  title, 
  titleAccent, 
  description, 
  primaryButton, 
  secondaryButton,
  backgroundImage,
  floatingIcons = [],
  floatingCard = null, // New prop for About page
  teamAvatars = [], // New prop for team avatars
  featureBadges = [] // New prop for Contact page feature badges
}) => {
  const { t, language } = useTranslation();
  
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-frost-soft to-frost overflow-hidden">
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 opacity-20">
          <img 
            src={backgroundImage} 
            alt="" 
            className="w-full h-full object-cover"
            width="1200"
            height="800"
          />
        </div>
      )}

      {/* Floating Icon Cards - Desktop Only */}
      <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full pointer-events-none">
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.1,
              rotate: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="absolute bg-color-background/80 backdrop-blur-md rounded-2xl shadow-dropdown p-6 border border-frost"
            style={{
              top: `${item.top}%`,
              left: `${item.left}%`,
              transform: `translateX(-50%) translateY(-50%)`
            }}
          >
            <item.icon className="h-10 w-10 text-primary mb-3" />
            <p className="text-sm font-semibold text-primary-deep whitespace-nowrap">
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Breadcrumb */}
            {breadcrumbs.length > 0 && (
              <nav className={`flex items-center text-sm text-text-muted ${language === 'ar' ? 'space-x-reverse' : ''} space-x-2`}>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <ChevronRight className="h-4 w-4" />}
                    {crumb.href ? (
                      <Link 
                        to={crumb.href} 
                        className="hover:text-primary transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-primary-deep font-medium">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}

            {/* Label */}
            {label && (
              <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider">
                {label}
              </span>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-deep leading-tight">
              {title}
              {titleAccent && (
                <>
                  <br />
                  <span className="text-primary">{titleAccent}</span>
                </>
              )}
            </h1>

            {/* Description */}
            {description && (
              <p className="text-lg text-text-muted leading-relaxed">
                {description}
              </p>
            )}

            {/* Feature Badges */}
            {featureBadges.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {featureBadges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2.5 bg-color-background border border-frost rounded-lg shadow-card hover:shadow-card-hover transition-shadow"
                  >
                    {badge.icon && <badge.icon className="h-5 w-5 text-primary flex-shrink-0" />}
                    <span className="text-sm font-medium text-primary-deep whitespace-nowrap">
                      {badge.text || badge.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Buttons */}
            {(primaryButton || secondaryButton) && (
              <div className={`flex flex-col sm:flex-row gap-4 pt-4 ${language === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
                {primaryButton && (
                  <a href={primaryButton.href} onClick={primaryButton.onClick}>
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary-dark text-white px-8 py-6 text-lg rounded-lg group"
                    >
                      {primaryButton.label}
                      <ArrowRight className={`h-5 w-5 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
                    </Button>
                  </a>
                )}
                {secondaryButton && (
                  <a href={secondaryButton.href} onClick={secondaryButton.onClick}>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 text-lg rounded-lg group"
                    >
                      {secondaryButton.label}
                      <ArrowRight className={`h-5 w-5 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
                    </Button>
                  </a>
                )}
              </div>
            )}
          </motion.div>

          {/* Right Content - Mobile Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:hidden relative"
          >
            {backgroundImage && (
              <img 
                src={backgroundImage} 
                alt="Services" 
                className="w-full h-auto rounded-2xl shadow-lg-primary"
                width="800"
                height="600"
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* Floating Team Card - About Page Only */}
      {floatingCard && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="hidden lg:block absolute right-8 xl:right-16 top-1/2 -translate-y-1/2 bg-color-background rounded-2xl shadow-lg-primary p-6 max-w-xs z-20"
        >
          {/* Card Title */}
          <h3 className="text-lg font-bold text-primary-deep mb-4">
            {floatingCard.title}
          </h3>

          {/* Team Avatars */}
          <div className="flex items-center mb-4">
            <div className="flex -space-x-3">
              {teamAvatars.slice(0, 5).map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt={`Team member ${index + 1}`}
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
            <div className="ml-3 flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">20+</span>
            </div>
          </div>

          {/* Arrow Button */}
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors group">
            <span className="font-medium">{t('common.learnMore')}</span>
            <ArrowRight className={`h-4 w-4 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </motion.div>
      )}
    </section>
  );
};

export default PageHero;


