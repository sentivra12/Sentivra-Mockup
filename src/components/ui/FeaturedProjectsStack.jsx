import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

/**
 * FeaturedProjectsStack - Tilted glass project cards for Premium Hero
 * 
 * Features:
 * - 3 featured project cards in tilted stack
 * - Glass morphism effect
 * - Parallax on mouse move (desktop)
 * - Smooth float animation
 * - Horizontal row on mobile
 * - RTL support
 * - Falls back to empty state if no featured projects
 * 
 * Props:
 * @param {Array} projects - Featured projects array [max 3]
 * @param {String} className - Additional CSS classes
 */
const FeaturedProjectsStack = ({ projects = [], className = '' }) => {
  const { language } = useTranslation();
  const isRTL = language === 'ar';
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  // Parallax mouse tracking (desktop only)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 100 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 100 });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    const checkMotion = () => setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    
    checkMobile();
    checkMotion();
    
    window.addEventListener('resize', checkMobile);
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', checkMotion);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.matchMedia('(prefers-reduced-motion: reduce)').removeEventListener('change', checkMotion);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile || reduceMotion || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 30;
    const y = (e.clientY - rect.top - rect.height / 2) / 30;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  // Get up to 3 featured projects
  const featuredProjects = projects.slice(0, 3);

  // If no featured projects, don't render
  if (featuredProjects.length === 0) {
    return null;
  }

  // Helper to get icon component
  const getIcon = (iconName) => {
    const Icon = LucideIcons[iconName];
    return Icon || LucideIcons.Folder;
  };

  // Helper to get category from project
  const getCategory = (project) => {
    if (project.project_categories) {
      return isRTL ? project.project_categories.name_ar : project.project_categories.name_en;
    }
    return project.category || 'Project';
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative ${className}`}
    >
      {/* Desktop: Tilted stack */}
      {!isMobile && (
        <div className="relative h-96 flex items-center justify-center">
          {featuredProjects.map((project, index) => {
            // Calculate position and rotation for stack effect
            const zIndex = 3 - index;
            const rotation = (index - 1) * 8; // -8, 0, +8 degrees
            const yOffset = index * 20; // Vertical spacing
            const xOffset = (index - 1) * 40; // Horizontal spacing

            const parallaxX = useTransform(smoothMouseX, (val) => 
              val * (index === 1 ? 1 : index === 0 ? 0.7 : 0.5)
            );
            const parallaxY = useTransform(smoothMouseY, (val) => 
              val * (index === 1 ? 1 : index === 0 ? 0.5 : 0.7)
            );

            const Icon = getIcon(project.icon || 'Folder');

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: yOffset }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.15,
                  type: 'spring',
                  stiffness: 100,
                }}
                style={{
                  x: reduceMotion ? xOffset : parallaxX,
                  y: reduceMotion ? yOffset : parallaxY,
                  rotate: reduceMotion ? rotation : rotation,
                  zIndex,
                }}
                className={`absolute ${isRTL ? 'right-1/2 translate-x-1/2' : 'left-1/2 -translate-x-1/2'}`}
              >
                <motion.div
                  animate={reduceMotion ? {} : { 
                    y: [0, -12, 0],
                  }}
                  transition={{
                    duration: 4 + index * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-80 rounded-2xl bg-inverse-fg/10 backdrop-blur-xl border border-inverse-border-subtle shadow-2xl overflow-hidden hover:shadow-3xl hover:scale-105 transition-all cursor-default"
                >
                  {/* Card content */}
                  <div className="p-6">
                    {/* Category pill */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-inverse-accent/20 text-inverse-accent text-xs font-semibold">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{getCategory(project)}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-inverse-fg mb-2 line-clamp-2">
                      {isRTL 
                        ? (project.title_ar || project.title) 
                        : (project.title_en || project.title)}
                    </h3>

                    {/* Tech stack pills (max 3) */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, 3).map((tech, i) => (
                          <span 
                            key={i}
                            className="px-2 py-0.5 rounded bg-inverse-fg/5 text-inverse-fg-muted text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="px-2 py-0.5 rounded bg-inverse-fg/5 text-inverse-fg-muted text-xs font-medium">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* View indicator */}
                    <div className="mt-4 pt-4 border-t border-inverse-border-subtle flex items-center justify-between text-inverse-fg-muted">
                      <span className="text-xs font-medium">
                        {isRTL ? 'شاهد التفاصيل' : 'View Details'}
                      </span>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Mobile: Horizontal scrollable row */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="overflow-x-auto scrollbar-hide -mx-4 px-4"
        >
          <div className={`flex gap-4 pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {featuredProjects.map((project, index) => {
              const Icon = getIcon(project.icon || 'Folder');

              return (
                <div
                  key={project.id}
                  className="flex-shrink-0 w-72 rounded-2xl bg-inverse-fg/10 backdrop-blur-xl border border-inverse-border-subtle shadow-lg overflow-hidden"
                >
                  <div className="p-5">
                    {/* Category */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-inverse-accent/20 text-inverse-accent text-xs font-semibold">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{getCategory(project)}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-inverse-fg mb-2 line-clamp-2">
                      {isRTL 
                        ? (project.title_ar || project.title) 
                        : (project.title_en || project.title)}
                    </h3>

                    {/* Tech stack */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, 3).map((tech, i) => (
                          <span 
                            key={i}
                            className="px-2 py-0.5 rounded bg-inverse-fg/5 text-inverse-fg-muted text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="px-2 py-0.5 rounded bg-inverse-fg/5 text-inverse-fg-muted text-xs">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FeaturedProjectsStack;
