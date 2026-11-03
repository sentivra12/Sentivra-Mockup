import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const EnhancedProjectCard = ({ project, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-card hover:shadow-dropdown transition-all duration-300 border border-frost"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category Badge */}
        <span className="inline-block px-3 py-1 text-xs font-semibold text-primary bg-frost-soft rounded-full mb-3">
          {project.type || project.category}
        </span>

        {/* Title */}
        <h3 className="text-xl font-bold text-primary-deep mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-text-muted text-sm leading-relaxed mb-4 line-clamp-2">
          {project.shortDescription}
        </p>

        {/* Tech Stack Tags */}
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech, index) => (
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


