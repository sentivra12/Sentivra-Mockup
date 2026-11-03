import React from 'react';
import { motion } from 'framer-motion';

const CategorySidebar = ({ categories = [], activeCategory, onCategoryChange }) => {
  return (
    <div className="hidden lg:block w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl shadow-card border border-frost p-2">
        {categories.map((category, index) => {
          const isActive = activeCategory === category.id;
          const Icon = category.icon;
          
          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-card-hover'
                  : 'text-text-muted hover:bg-frost-soft'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-primary'}`} />
              <span className="font-medium text-sm">{category.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySidebar;


