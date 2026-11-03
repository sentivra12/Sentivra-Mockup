import React from 'react';
import { motion } from 'framer-motion';

const ProjectCard = ({ image, title, category, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6">
        <span className="inline-block px-3 py-1 text-sm font-medium text-primary bg-frost-soft rounded-full mb-3">
          {category}
        </span>
        <h3 className="text-xl font-bold text-primary-deep group-hover:text-primary transition-colors">
          {title}
        </h3>
      </div>
    </motion.div>
  );
};

export default ProjectCard;


