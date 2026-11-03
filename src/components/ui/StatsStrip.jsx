import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Briefcase, Users, Globe, UserCheck, Award } from 'lucide-react';

const iconMap = {
  Briefcase,
  Users,
  Globe,
  UserCheck,
  Award
};

const StatItem = ({ stat, index }) => {
  const ref = useRef(null);
  const [displayValue, setDisplayValue] = useState('0');
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const Icon = iconMap[stat.icon] || Briefcase;

  useEffect(() => {
    if (isInView) {
      if (prefersReducedMotion) {
        setDisplayValue(stat.value.toString());
      } else {
        motionValue.set(parseInt(stat.value));
      }
    }
  }, [motionValue, isInView, stat.value, prefersReducedMotion]);

  useEffect(() => {
    if (!prefersReducedMotion) {
      const unsubscribe = springValue.on('change', (latest) => {
        setDisplayValue(Math.floor(latest).toString());
      });
      return unsubscribe;
    }
  }, [springValue, prefersReducedMotion]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="flex items-center gap-3 px-4"
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>

      {/* Number and Label */}
      <div className="flex flex-col">
        <div className="text-2xl md:text-3xl font-bold text-primary-deep">
          {displayValue}{stat.suffix}
        </div>
        <p className="text-xs text-text-muted font-medium">
          {stat.label}
        </p>
      </div>
    </motion.div>
  );
};

const StatsStrip = ({ stats }) => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-frost-soft rounded-2xl py-8 px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 divide-x-0 md:divide-x divide-frost">
            {stats.map((stat, index) => (
              <StatItem key={stat.id} stat={stat} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsStrip;


