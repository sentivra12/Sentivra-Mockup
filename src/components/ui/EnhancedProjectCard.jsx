import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import ProjectCardFallback from './ProjectCardFallback';

const EnhancedProjectCard = ({ project, delay = 0 }) => {
  // ALL HOOKS FIRST - before any conditional returns
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Safety check for project data - AFTER hooks
  if (!project) return null;
  
  const hasCoverImage = project?.cover_image_url && !imageError;
  
  // Determine object-fit based on cover_fit field (default to 'cover')
  const objectFit = project?.cover_fit === 'contain' ? 'object-contain' : 'object-cover';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group cursor-pointer bg-color-background rounded-xl overflow-hidden shadow-card hover:shadow-dropdown transition-all duration-300 border border-frost"
    >
      {/* Image or Fallback */}
      <div className="relative overflow-hidden aspect-[4/3] bg-frost-soft">
        {hasCoverImage ? (
          <>
            <img
              src={project.cover_image_url}
              alt={project?.title || 'Project'}
              loading="lazy"
              className={`w-full h-full ${objectFit} group-hover:scale-105 transition-transform duration-500 ${
                !imageLoaded ? 'opacity-0' : 'opacity-100'
              }`}
              width="400"
              height="300"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        ) : (
          <ProjectCardFallback
            category={project?.category_name || project?.type || project?.category}
            title={project?.title}
            variant="cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category Badge */}
        <span className="inline-block px-3 py-1 text-xs font-semibold text-primary bg-frost-soft rounded-full mb-3">
          {project?.category_name || project?.type || project?.category || 'Uncategorized'}
        </span>

        {/* Title */}
        <h3 className="text-xl font-bold text-primary-deep mb-2 group-hover:text-primary transition-colors">
          {project?.title || 'Untitled Project'}
        </h3>

        {/* Description */}
        <p className="text-text-muted text-sm leading-relaxed mb-4 line-clamp-2">
          {project?.short_description || project?.shortDescription || ''}
        </p>

        {/* Tech Stack Tags */}
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(project?.tech_stack) 
            ? project.tech_stack 
            : Array.isArray(project?.techStack) 
            ? project.techStack 
            : []
          ).map((tech, index) => (
            <span
              key={index}
              className="px-2.5 py-1 text-xs font-medium text-text-muted bg-frost-soft rounded-md"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedProjectCard;


