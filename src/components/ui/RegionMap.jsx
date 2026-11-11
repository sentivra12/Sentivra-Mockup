import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const RegionMap = ({ countries }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-frost-soft to-frost rounded-2xl p-8 shadow-card-hover"
      role="img"
      aria-label="Map showing Sentivra's presence in Egypt, UAE, and Oman"
    >
      {/* Simplified Regional Map Outline */}
      <svg
        className="w-full h-full"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background region shape (Middle East simplified) */}
        <path
          d="M 100 150 Q 150 120, 200 140 T 300 160 Q 320 180, 310 220 T 280 280 Q 240 300, 180 290 T 120 250 Q 90 220, 100 180 Z"
          fill="#D4DDE2"
          opacity="0.5"
          className="animate-pulse"
          style={{ animationDuration: '4s' }}
        />

        {/* Connecting path between countries */}
        <motion.path
          d="M 200 240 Q 240 200, 240 220 Q 250 200, 260 260"
          stroke="#5C7E8F"
          strokeWidth="2"
          strokeDasharray="8 4"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.5 }}
          viewport={{ once: true }}
          transition={{ duration: 2, delay: 0.5 }}
        />

        {/* Country location pins */}
        {countries.map((country, index) => {
          const x = (country.coordinates.x / 100) * 400;
          const y = (country.coordinates.y / 100) * 400;

          return (
            <motion.g
              key={country.id}
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Pin circle background */}
              <circle
                cx={x}
                cy={y}
                r="25"
                fill="#5C7E8F"
                opacity="0.2"
                className="animate-ping"
                style={{ animationDuration: '3s', animationDelay: `${index * 0.3}s` }}
              />
              
              {/* Pin circle */}
              <circle
                cx={x}
                cy={y}
                r="20"
                fill="white"
                stroke="#5C7E8F"
                strokeWidth="3"
              />
              
              {/* Flag emoji in center */}
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="20"
              >
                {country.flag}
              </text>

              {/* Country name label */}
              <text
                x={x}
                y={y + 45}
                textAnchor="middle"
                fill="#1f2937"
                fontSize="14"
                fontWeight="600"
              >
                {country.name}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-color-background/90 backdrop-blur-sm rounded-lg p-3 shadow-card-hover">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-medium">Our Locations</span>
        </div>
      </div>
    </motion.div>
  );
};

export default RegionMap;


