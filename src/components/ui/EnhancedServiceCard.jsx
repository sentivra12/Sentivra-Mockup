import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

/**
 * Enhanced Service Card with CSS-only mini visuals
 * - Unique animated visual per service type
 * - Premium glass effects with hover interactions
 * - Equal height cards with proper spacing
 * - RTL support, dark mode, reduced motion
 */

// Visual Components (CSS-only, no images)
const BrowserVisual = ({ animated }) => (
  <div className="absolute inset-0 p-2">
    <div className="w-full h-full border-2 rounded overflow-hidden border-slate-200 dark:border-slate-800">
      {/* Address bar */}
      <div className="h-4 border-b-2 flex items-center gap-1 px-2 border-slate-200 dark:border-slate-800 relative">
        <div className="absolute top-0 left-0 right-0 h-4 border-b-2 border-slate-200 dark:border-slate-800" />
        <div className="relative w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        <div className="relative w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        <div className="relative w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
      </div>
      {/* Content */}
      <div className="relative p-2 space-y-2">
        <motion.div
          className="h-2 bg-slate-300 dark:bg-slate-700 rounded"
          style={{ width: '75%' }}
          initial={{ width: 0 }}
          animate={animated ? { width: '75%' } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
        <motion.div
          className="h-2 bg-slate-300 dark:bg-slate-700 rounded"
          style={{ width: '55%' }}
          initial={{ width: 0 }}
          animate={animated ? { width: '55%' } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        />
        <motion.div
          className="h-2 bg-slate-300 dark:bg-slate-700 rounded"
          style={{ width: '65%' }}
          initial={{ width: 0 }}
          animate={animated ? { width: '65%' } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        />
      </div>
    </div>
  </div>
);

const MobileVisual = ({ animated }) => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="w-16 h-full border-2 rounded-lg overflow-hidden relative border-slate-200 dark:border-slate-800">
      {/* Screen content scrolling */}
      <motion.div
        className="relative w-full bg-gradient-to-b from-cyan-500/20 to-transparent"
        style={{ height: '100%' }}
        animate={animated ? { y: [0, -20, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  </div>
);

const ERPVisual = ({ animated }) => (
  <div className="absolute inset-0 p-3 flex flex-col gap-1">
    {/* Table rows */}
    {[40, 55, 70].map((width, i) => (
      <motion.div
        key={i}
        className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded"
        style={{ width: `${width}%` }}
        initial={{ opacity: 0, x: -10 }}
        animate={animated ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.4, delay: i * 0.1 }}
      />
    ))}
    {/* Bar chart */}
    <div className="flex items-end gap-1 mt-auto h-8">
      {[60, 80, 45, 70].map((height, i) => (
        <motion.div
          key={i}
          className="flex-1 bg-cyan-500/40 dark:bg-cyan-400/30 rounded-t"
          style={{ height: `${height}%` }}
          initial={{ height: 0 }}
          animate={animated ? { height: `${height}%` } : {}}
          transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
        />
      ))}
    </div>
  </div>
);

const CRMVisual = ({ animated }) => (
  <div className="absolute inset-0 p-2 flex gap-1">
    {/* Pipeline columns */}
    {[3, 2, 4].map((cards, colIndex) => (
      <div key={colIndex} className="flex-1 flex flex-col gap-1">
        {Array.from({ length: cards }).map((_, i) => (
          <motion.div
            key={i}
            className="h-3 bg-slate-300 dark:bg-slate-700 rounded"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={animated ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.3, delay: colIndex * 0.2 + i * 0.1 }}
          />
        ))}
      </div>
    ))}
  </div>
);

const DataVisual = ({ animated }) => (
  <div className="absolute inset-0 p-3 flex gap-2">
    {/* Bars */}
    <div className="flex-1 flex items-end gap-1">
      {[70, 45, 80, 55, 65].map((height, i) => (
        <motion.div
          key={i}
          className="flex-1 bg-cyan-500/40 dark:bg-cyan-400/30 rounded-t"
          style={{ height: `${height}%` }}
          initial={{ height: 0 }}
          animate={animated ? { height: `${height}%` } : {}}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        />
      ))}
    </div>
    {/* Line chart */}
    <div className="flex-1 relative">
      <svg className="w-full h-full" viewBox="0 0 60 40" preserveAspectRatio="none">
        <motion.polyline
          points="0,30 15,20 30,25 45,10 60,15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-cyan-500 dark:text-cyan-400"
          initial={{ pathLength: 0 }}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </svg>
    </div>
  </div>
);

const AIVisual = ({ animated }) => (
  <div className="absolute inset-0 p-3 flex flex-col gap-2 justify-end">
    {/* Chat bubbles */}
    <motion.div
      className="self-end w-3/4 h-2 bg-cyan-500/40 dark:bg-cyan-400/30 rounded-full"
      initial={{ opacity: 0, x: 10 }}
      animate={animated ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.3, delay: 0.2 }}
    />
    <motion.div
      className="self-start w-2/3 h-2 bg-slate-300 dark:bg-slate-700 rounded-full"
      initial={{ opacity: 0, x: -10 }}
      animate={animated ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.3, delay: 0.4 }}
    />
    {/* Typing indicator */}
    <motion.div
      className="self-start w-12 h-2 bg-slate-300 dark:bg-slate-700 rounded-full flex items-center justify-center gap-0.5"
      initial={{ opacity: 0 }}
      animate={animated ? { opacity: 1 } : {}}
      transition={{ duration: 0.3, delay: 0.6 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-0.5 h-0.5 bg-slate-500 rounded-full"
          animate={animated ? { y: [-1, 1, -1] } : {}}
          transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
        />
      ))}
    </motion.div>
  </div>
);

const GenericVisual = ({ animated, icon: Icon }) => (
  <div className="absolute inset-0 flex items-center justify-center">
    <motion.div
      className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-transparent flex items-center justify-center"
      animate={animated ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Icon className="w-6 h-6 text-cyan-500 dark:text-cyan-400" strokeWidth={1.5} />
    </motion.div>
  </div>
);

// Visual mapper by slug/keyword
const getVisual = (slug, title, icon) => {
  const normalized = `${slug} ${title}`.toLowerCase();
  
  if (normalized.includes('web') || normalized.includes('website') || normalized.includes('application')) {
    return BrowserVisual;
  }
  if (normalized.includes('mobile') || normalized.includes('app') || normalized.includes('ios') || normalized.includes('android')) {
    return MobileVisual;
  }
  if (normalized.includes('erp')) {
    return ERPVisual;
  }
  if (normalized.includes('crm')) {
    return CRMVisual;
  }
  if (normalized.includes('data') || normalized.includes('analys') || normalized.includes('analytics') || normalized.includes('intelligence') || normalized.includes('بيانات')) {
    return DataVisual;
  }
  if (normalized.includes('ai') || normalized.includes('chatbot') || normalized.includes('chat') || normalized.includes('ذكاء')) {
    return AIVisual;
  }
  
  return (props) => <GenericVisual {...props} icon={icon} />;
};

// Icon mapper by slug/keyword - UNIQUE ICONS
const getServiceIcon = (slug, title) => {
  const normalized = `${slug} ${title}`.toLowerCase();
  
  if (normalized.includes('web-development') && !normalized.includes('application')) {
    return LucideIcons.Globe; // Web Development
  }
  if (normalized.includes('web') && normalized.includes('application')) {
    return LucideIcons.Layout; // Web Application Development
  }
  if (normalized.includes('mobile') && !normalized.includes('application-development')) {
    return LucideIcons.Smartphone; // Mobile Applications
  }
  if (normalized.includes('mobile') && normalized.includes('application-development')) {
    return LucideIcons.TabletSmartphone; // Mobile Application Development
  }
  if (normalized.includes('erp')) {
    return LucideIcons.PackageSearch;
  }
  if (normalized.includes('crm')) {
    return LucideIcons.Users;
  }
  if (normalized.includes('data') || normalized.includes('analys') || normalized.includes('intelligence')) {
    return LucideIcons.BarChart3;
  }
  if (normalized.includes('ai') || normalized.includes('chatbot')) {
    return LucideIcons.Bot;
  }
  
  return LucideIcons.Box;
};

const EnhancedServiceCard = ({ service, delay = 0, featured = false, language = 'en' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const isRTL = language === 'ar';
  
  // Mouse position for spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  
  // Reduced motion check
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  
  const handleMouseMove = (e) => {
    if (!cardRef.current || prefersReducedMotion || isTouchDevice) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    mouseX.set(x);
    mouseY.set(y);
    
    // Tilt effect (max 6deg)
    const tiltX = ((y - centerY) / centerY) * -6;
    const tiltY = ((x - centerX) / centerX) * 6;
    rotateX.set(tiltX);
    rotateY.set(tiltY);
  };
  
  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };
  
  // Get visual and icon
  const title = isRTL ? (service.title_ar || service.title_en || service.title) : (service.title_en || service.title);
  const description = isRTL ? (service.short_description_ar || service.short_description_en || service.short_description) : (service.short_description_en || service.short_description);
  const slug = service.slug || '';
  
  const Visual = getVisual(slug, title, getServiceIcon(slug, title));
  const Icon = getServiceIcon(slug, title);
  
  // Technologies (max 3-4)
  const technologies = Array.isArray(service.technologies) 
    ? service.technologies 
    : (typeof service.technologies === 'string' ? JSON.parse(service.technologies) : []);
  const displayTechs = technologies.slice(0, featured ? 4 : 3);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className={featured ? 'lg:col-span-2' : ''}
    >
      <Link
        to={`/services/${slug}`}
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); handleMouseLeave(); }}
        onMouseMove={handleMouseMove}
        className="block group h-full"
        aria-label={`View details for ${title}`}
      >
        <motion.div
          className="relative h-full p-6 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col min-h-[400px]"
          style={!prefersReducedMotion && !isTouchDevice ? {
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d'
          } : {}}
        >
          {/* Glass background */}
          <span className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm absolute inset-0 rounded-2xl" />
          
          {/* Border */}
          <div className="border-slate-200 dark:border-slate-800 absolute inset-0 rounded-2xl border" />
          
          {/* Gradient border glow on hover */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            aria-hidden="true"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.4), transparent 50%, rgba(100, 116, 139, 0.3))',
              padding: '1px',
              mask: 'linear-gradient(#fff 0 0) content-box exclude, linear-gradient(#fff 0 0)'
            }}
          />
          
          {/* Spotlight effect */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            aria-hidden="true"
            style={{
              background: `radial-gradient(600px, rgba(6, 182, 212, 0.1), transparent 40%)`
            }}
          />
          
          {/* Service number */}
          <div className="relative mb-4 flex items-center justify-between">
            <span className="font-mono text-xs text-cyan-600 dark:text-cyan-400">
              {String(service.display_order || 0).padStart(2, '0')}
            </span>
          </div>
          
          {/* Visual (16:9 aspect ratio) */}
          <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
            <span className="bg-slate-50 dark:bg-slate-900 absolute inset-0 rounded-lg" />
            <div className="border-slate-200 dark:border-slate-800 absolute inset-0 rounded-lg border" />
            <div className="absolute inset-0" aria-hidden="true">
              <Visual animated={isHovered && !prefersReducedMotion} />
            </div>
          </div>
          
          {/* Icon */}
          <div className="relative mb-4">
            <span className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm inline-flex items-center justify-center w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl group-hover:from-cyan-500/20 transition-all duration-300" />
              <Icon className="relative z-10 w-7 h-7 text-cyan-500 dark:text-cyan-400" strokeWidth={1.5} />
            </span>
          </div>
          
          {/* Title */}
          <h3 
            className="text-xl lg:text-2xl font-bold mb-3 line-clamp-2 relative z-10"
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{ hyphens: 'none', wordBreak: 'normal' }}
          >
            <span className="text-slate-900 dark:text-white">{title}</span>
          </h3>
          
          {/* Description */}
          <p 
            className="text-base leading-relaxed mb-4 line-clamp-3 relative z-10 flex-1"
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{ hyphens: 'none', wordBreak: 'normal', lineHeight: '1.6' }}
          >
            <span className="text-slate-600 dark:text-slate-400">{description}</span>
          </p>
          
          {/* Technologies */}
          {displayTechs.length > 0 && (
            <div className={`relative z-10 flex flex-wrap gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {displayTechs.map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  {tech}
                </span>
              ))}
              {technologies.length > displayTechs.length && (
                <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                  +{technologies.length - displayTechs.length}
                </span>
              )}
            </div>
          )}
          
          {/* Learn More Link */}
          <div 
            className={`relative z-10 flex items-center gap-2 text-base font-semibold text-cyan-600 dark:text-cyan-400 group-hover:gap-3 transition-all mt-auto ${isRTL ? 'flex-row-reverse' : ''}`}
            style={{ minHeight: '44px' }}
          >
            <span className="whitespace-nowrap">
              {isRTL ? 'اعرف المزيد' : 'Learn More'}
            </span>
            <ArrowRight 
              className={`w-5 h-5 flex-shrink-0 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}
              strokeWidth={2.5}
            />
          </div>
          
          {/* Lift shadow */}
          <div 
            className="absolute -inset-0.5 bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/20 group-hover:via-cyan-500/10 group-hover:to-cyan-500/20 rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl"
            aria-hidden="true"
          />
          
          {/* Focus ring */}
          <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-focus-visible:ring-cyan-500 transition-all pointer-events-none" />
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default EnhancedServiceCard;
