/**
 * Premium Projects Section - Stripe/Linear Quality
 * Features:
 * - Optimized images with lazy loading
 * - Glass morphism overlay on hover
 * - Smooth reveal animations
 * - Category badges
 * - Tech stack tags
 * - Bilingual support (EN/AR)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OptimizedImage } from '../ui/OptimizedImage';
import { GlassCard } from '../ui/GlassCard';
import SectionHeader from '../ui/SectionHeader';
import { useTranslation } from '../../i18n/useTranslation';

const PremiumProjectCard = ({ project, index, language }) => {
  const [isHovered, setIsHovered] = useState(false);

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      <Link to={`/work/${project.slug}`}>
        <GlassCard className="overflow-hidden p-0 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
          {/* Image Container */}
          <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-surface to-surface-raised">
            <OptimizedImage
              src={project.image_url || project.image}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />

            {/* Gradient Overlay on Hover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
            />

            {/* Hover Content */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-0 left-0 right-0 p-6 text-white"
                >
                  {/* Tech Stack */}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.techStack.slice(0, 4).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full border border-white/30"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* View Project Link */}
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>View Project</span>
                    <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Category Badge */}
            <div className="absolute top-4 start-4">
              <span className="inline-block px-4 py-1.5 text-xs font-bold bg-white/95 dark:bg-gray-900/95 text-foreground rounded-full backdrop-blur-sm border border-white/30 dark:border-white/10 shadow-lg">
                {project.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-3">
            {/* Title */}
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
              {project.title}
            </h3>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed line-clamp-2">
              {project.shortDescription || project.short_description}
            </p>

            {/* Type/Category Pills */}
            <div className="flex items-center gap-2 pt-2">
              {project.type && (
                <span className="text-xs font-medium text-primary">
                  {project.type}
                </span>
              )}
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
};

const PremiumProjects = ({ projects = [], featured = false }) => {
  const { t, language } = useTranslation();

  // Filter featured projects if needed
  const displayProjects = featured 
    ? projects.filter(p => p.featured || p.is_featured).slice(0, 6)
    : projects.slice(0, 6);

  // Hide section if no projects - AFTER all hooks
  if (!displayProjects || displayProjects.length === 0) {
    return null;
  }

  return (
    <section id="work" className="py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface/30 via-surface/20 to-transparent pointer-events-none" />
      
      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
        backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
        backgroundSize: '64px 64px'
      }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <SectionHeader 
          label={t('home.projects.label')}
          title={t('home.projects.title')} 
          subtitle={t('home.projects.subtitle')}
        />

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayProjects.map((project, index) => (
            <PremiumProjectCard
              key={project.id}
              project={project}
              index={index}
              language={language}
            />
          ))}
        </div>

        {/* View All Link */}
        {projects.length > displayProjects.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link
              to="/work"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-medium transition-all duration-300 group"
            >
              <span>{t('home.projects.viewAll')}</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-y-[-2px] group-hover:translate-x-[2px] transition-transform duration-300" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PremiumProjects;
