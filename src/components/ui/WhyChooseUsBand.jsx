import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import StatCounter from '@/components/ui/StatCounter';
import { ArrowRight } from 'lucide-react';

const WhyChooseUsBand = ({ stats = [], label, title, description, ctaButton }) => {
  return (
    <section className="py-20 md:py-28 bg-primary-deep relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {label && (
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              {label}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {title}
          </h2>
          {description && (
            <p className="text-lg text-white/80 max-w-3xl mx-auto mb-8">
              {description}
            </p>
          )}
          {ctaButton && (
            <a href={ctaButton.href} onClick={ctaButton.onClick}>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-dark text-white px-8 py-6 text-lg rounded-lg group"
              >
                {ctaButton.label}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <StatCounter
                value={stat.value}
                suffix={stat.suffix}
                icon={stat.icon}
                label={stat.label}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsBand;


