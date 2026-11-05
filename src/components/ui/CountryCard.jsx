import React from 'react';
import { motion } from 'framer-motion';

const CountryCard = ({ country, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="bg-white rounded-xl overflow-hidden shadow-card-hover hover:shadow-dropdown transition-shadow duration-300 group"
    >
      {/* Country Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={country.image}
          alt={country.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          width="300"
          height="160"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Flag Badge - Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-md px-2 py-1 flex items-center justify-center text-xl shadow-card-hover">
          {country.flag}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-primary-deep mb-2 group-hover:text-primary transition-colors">
          {country.name}
        </h3>
        <p className="text-sm text-text-muted leading-relaxed">
          {country.description}
        </p>
      </div>
    </motion.div>
  );
};

export default CountryCard;


