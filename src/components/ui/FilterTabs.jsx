import React from 'react';
import { motion } from 'framer-motion';

const FilterTabs = ({ categories, activeCategory, onCategoryChange, className = '' }) => {
  return (
    <div className={`overflow-x-auto scrollbar-thin pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 ${className}`}>
      <div className="flex gap-2 sm:gap-3 min-w-max sm:justify-center">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          
          return (
            <motion.button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`px-4 sm:px-6 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                isActive
                  ? 'bg-primary text-white shadow-card-hover'
                  : 'bg-frost-soft text-text-muted hover:bg-frost'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {category.name}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterTabs;


