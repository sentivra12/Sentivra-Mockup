import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutGrid, 
  Building2, 
  Coffee, 
  Shirt, 
  GraduationCap, 
  Heart, 
  Factory, 
  Briefcase, 
  MoreHorizontal 
} from 'lucide-react';

// Icon mapping
const iconMap = {
  LayoutGrid,
  Building2,
  Coffee,
  Shirt,
  GraduationCap,
  Heart,
  Factory,
  Briefcase,
  MoreHorizontal
};

const CategoryFilterWithIcons = ({ 
  categories, 
  activeCategory, 
  onCategoryChange, 
  className = '' 
}) => {
  return (
    <div className={`w-full overflow-x-auto scrollbar-thin pb-2 -mx-4 sm:mx-0 ${className}`}>
      <div className="flex gap-2 sm:gap-3 min-w-max px-4 sm:px-0 sm:justify-center">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          const IconComponent = iconMap[category.icon] || LayoutGrid;
          
          return (
            <motion.button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              whileTap={{ scale: 0.95 }}
              aria-pressed={isActive}
              role="button"
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                isActive
                  ? 'bg-primary text-white shadow-card-hover'
                  : 'bg-white text-text-muted hover:bg-frost-soft border border-frost hover:border-primary/30'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{category.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilterWithIcons;


