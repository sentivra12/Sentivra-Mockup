import React from 'react';
import { motion } from 'framer-motion';

const FilterTabs = ({ categories, activeCategory, onCategoryChange, className = '' }) => {
  return (
    <div className={`flex gap-3 overflow-x-auto pb-4 ${className}`}>
      <div className="flex gap-3 mx-auto">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          
          return (
            <motion.button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`px-6 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-300 ${
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


