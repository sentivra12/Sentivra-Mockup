import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

/**
 * FloatingCategoryChip - Orbiting glass chip with category icon + name
 * Hidden on mobile, shows 4-5 categories around the showcase
 */
const FloatingCategoryChip = ({ 
  category, 
  index = 0, 
  total = 5,
  animate = true 
}) => {
  if (!category) return null;

  // Get icon component
  const IconComponent = LucideIcons[category.icon] || LucideIcons.LayoutGrid;

  // Calculate position in circle (evenly distributed)
  const angle = (360 / total) * index;
  const radius = 280; // Distance from center
  const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
  const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;

  // Orbit animation
  const orbitVariants = animate ? {
    animate: {
      rotate: 360,
      transition: {
        duration: 60,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  } : {};

  // Float animation
  const floatVariants = animate ? {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 3 + index * 0.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  } : {};

  return (
    <motion.div
      className="hidden xl:block absolute"
      style={{
        left: '50%',
        top: '50%',
        x: x,
        y: y,
      }}
      variants={orbitVariants}
      animate="animate"
    >
      <motion.div
        variants={floatVariants}
        animate="animate"
        className="px-4 py-2 rounded-full bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-lg flex items-center gap-2"
      >
        <div 
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ 
            backgroundColor: `${category.color}20`,
            color: category.color 
          }}
        >
          <IconComponent className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-primary-deep dark:text-white whitespace-nowrap">
          {category.name_en}
        </span>
      </motion.div>
    </motion.div>
  );
};

export default FloatingCategoryChip;
