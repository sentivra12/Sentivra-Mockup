import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Users, Shield, TrendingUp } from 'lucide-react';

const iconMap = {
  Lightbulb,
  Users,
  Shield,
  TrendingUp
};

const colorMap = {
  blue: 'bg-primary/10 text-primary',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600'
};

const ValueCard = ({ value, delay = 0, layout = 'card' }) => {
  const Icon = iconMap[value.icon] || Lightbulb;
  const colorClass = colorMap[value.color] || colorMap.blue;

  if (layout === 'compact') {
    // Mobile compact layout - icon on top, text below
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        className="flex flex-col items-center text-center"
      >
        <div className={`w-16 h-16 rounded-full ${colorClass} flex items-center justify-center mb-3`}>
          <Icon className="h-8 w-8" />
        </div>
        <h4 className="text-sm font-bold text-primary-deep mb-1">
          {value.title}
        </h4>
        <p className="text-xs text-text-muted leading-relaxed px-2">
          {value.description}
        </p>
      </motion.div>
    );
  }

  // Desktop card layout
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="bg-white rounded-xl p-8 shadow-lg hover:shadow-dropdown transition-all duration-300 group border border-frost hover:border-primary/30"
    >
      {/* Icon */}
      <div className={`w-16 h-16 rounded-full ${colorClass} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-8 w-8" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-primary-deep mb-3 group-hover:text-primary transition-colors">
        {value.title}
      </h3>

      {/* Description */}
      <p className="text-text-muted leading-relaxed">
        {value.description}
      </p>
    </motion.div>
  );
};

export default ValueCard;


