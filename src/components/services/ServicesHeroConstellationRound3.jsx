/**
 * ServicesHeroConstellationRound3 - Premium engineering-grade hero
 * 
 * FIXED BUGS:
 * - Proper container max-w-7xl matching navbar
 * - Text has correct padding (not at x=0)
 * - No dark boxes behind text (uses token-based InverseSurface)
 * - Constellation lines connect to center correctly
 * - Proper service icon mapping
 * - Respects light/dark theme
 * 
 * PREMIUM FEATURES:
 * - Aurora atmosphere with light beams
 * - Floating glass cards (code, dashboard, chat, mobile, database)
 * - Service constellation with orbiting nodes and animated connections
 * - Pointer tilt, spotlight, parallax
 * - Count-up animation
 * - Typewriter through service names
 * - Hand-drawn gradient underline
 * - Pulsing dot eyebrow chip
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  ArrowRight, ChevronDown,
  Code, Smartphone, Layers, Database, BarChart3, Bot,
  Sparkles, Terminal, MessageSquare, Cpu, Globe, Briefcase
} from 'lucide-react';
import InverseSurface from '@/components/ui/InverseSurface';

// Icon mapping by slug keywords
const getServiceIcon = (slug = '', icon = '') => {
  // First try direct icon name match
  const iconMap = {
    'code': Code,
    'smartphone': Smartphone,
    'layers': Layers,
    'database': Database,
    'barchart3': BarChart3,
    'bot': Bot,
    'terminal': Terminal,
    'messagesquare': MessageSquare,
    'globe': Globe,
    'briefcase': Briefcase,
    'cpu': Cpu
  };
  
  const normalizedIcon = icon?.toLowerCase().replace(/[-_\s]/g, '');
  if (iconMap[normalizedIcon]) return iconMap[normalizedIcon];
  
  // Fallback: match by slug keywords
  const slugLower = slug?.toLowerCase() || '';
  if (slugLower.includes('web')) return Code;
  if (slugLower.includes('mobile') || slugLower.includes('app')) return Smartphone;
  if (slugLower.includes('erp') || slugLower.includes('enterprise')) return Layers;
  if (slugLower.includes('crm') || slugLower.includes('customer')) return Database;
  if (slugLower.includes('data') || slugLower.includes('analytics') || slugLower.includes('business-intelligence')) return BarChart3;
  if (slugLower.includes('ai') || slugLower.includes('chatbot') || slugLower.includes('bot')) return Bot;
  
  return Cpu; // Generic fallback
};

export default function ServicesHeroConstellationRound3({ 
  services = [],
  language = 'en',
  dir = 'ltr',
  siteSettings = {}
}) {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [serviceCount, setServiceCount] = useState(0);
  const stageRef = useRef(null);
  
  // Mouse position for spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Count-up animation (once)
  useEffect(() => {
    const target = services.length;
    if (target === 0) return;
    
    const duration = 2000;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setServiceCount(target);
        clearInterval(timer);
      } else {
        setServiceCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [services.length]);
  
  // Typewriter effect
  useEffect(() => {
    if (shouldReduceMotion || services.length === 0) {
      // Show first service name immediately in reduced motion
      const firstService = services[0];
      if (firstService) {
        const serviceName = language === 'ar' && firstService.title_ar 
          ? firstService.title_ar 
          : firstService.title_en || firstService.title || '';
        setTypewriterText(serviceName);
      }
      return;
    }
    
    const currentService = services[currentServiceIndex];
    if (!currentService) return;
    
    const serviceName = language === 'ar' && currentService.title_ar 
      ? currentService.title_ar 
      : currentService.title_en || currentService.title || '';
    
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseTime = 2000;
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (typewriterText.length < serviceName.length) {
          setTypewriterText(serviceName.substring(0, typewriterText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        if (typewriterText.length > 0) {
          setTypewriterText(typewriterText.substring(0, typewriterText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentServiceIndex((currentServiceIndex + 1) % services.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);
    
    return () => clearTimeout(timer);
  }, [typewriterText, isDeleting, currentServiceIndex, services, language, shouldReduceMotion]);
  
  // Track mouse for spotlight
  useEffect(() => {
    if (shouldReduceMotion) return;
    
    const handleMouseMove = (e) => {
      if (!stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [shouldReduceMotion, mouseX, mouseY]);
  
  // Tilt transform
  const rotateX = useTransform(mouseYSpring, [-300, 300], [2, -2]);
  const rotateY = useTransform(mouseXSpring, [-300, 300], [-2, 2]);
  
  const isRTL = dir === 'rtl';
  
  // Text content
  const eyebrowText = language === 'ar' ? 'خدمات برمجية احترافية' : 'PROFESSIONAL SOFTWARE SERVICES';
  const headingStart = language === 'ar' ? 'نبني ' : 'We Build ';
  const headingHighlight = language === 'ar' ? 'حلولاً برمجية' : 'Software Solutions';
  const headingEnd = language === 'ar' ? ' متميزة' : ' That Scale';
  const descriptionText = language === 'ar'
    ? 'من تطبيقات الويب المتقدمة إلى أنظمة الذكاء الاصطناعي، نصمم حلولاً تقنية مخصصة تدفع أعمالك للأمام'
    : 'From advanced web applications to AI systems, we craft custom technology solutions that drive your business forward';
  
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <InverseSurface token="canvas" className="absolute inset-0" />
      </div>
      
      {/* Atmosphere effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Aurora blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        
        {/* Perspective grid floor (light theme: subtle, dark theme: more visible) */}
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                             linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            transform: 'perspective(1000px) rotateX(60deg)',
            transformOrigin: 'center bottom'
          }}
        />
        
        {/* Light beams (desktop only) */}
        {!shouldReduceMotion && (
          <div className="hidden lg:block">
            <motion.div
              className="absolute top-0 left-1/4 w-px h-1/2 bg-gradient-to-b from-cyan-500/20 to-transparent"
              animate={{ opacity: [0.2, 0.5, 0.2], scaleY: [0.8, 1, 0.8] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-0 right-1/3 w-px h-2/3 bg-gradient-to-b from-blue-500/15 to-transparent"
              animate={{ opacity: [0.1, 0.4, 0.1], scaleY: [0.9, 1, 0.9] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            />
          </div>
        )}
        
        {/* Floating sparkles */}
        {!shouldReduceMotion && (
          <>
            <motion.div
              className="absolute top-1/4 right-1/3 w-1 h-1 bg-cyan-400 rounded-full"
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="absolute top-1/3 left-1/4 w-1 h-1 bg-cyan-400 rounded-full"
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
            />
          </>
        )}
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${isRTL ? 'lg:grid-flow-dense' : ''}`}>
          
          {/* Left Column: Content */}
          <div className={isRTL ? 'lg:col-start-2' : ''}>
            {/* Eyebrow with pulsing dot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            >
              <InverseSurface token="border" as="div" className="absolute inset-0 rounded-full" />
              <span className="relative flex h-2 w-2" aria-hidden="true">
                {!shouldReduceMotion && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                )}
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span className="relative font-mono text-xs uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-semibold">
                {eyebrowText}
              </span>
            </motion.div>
            
            {/* Headline with gradient + underline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 text-slate-900 dark:text-white"
              style={{ 
                fontSize: 'clamp(2.75rem, 5vw, 4.5rem)', // 44px to 72px
                maxWidth: '650px',
                fontWeight: 800,
                letterSpacing: language === 'ar' ? '0' : '-0.02em',
                lineHeight: 1.1,
                textWrap: 'balance'
              }}
              dir={dir}
            >
              {headingStart}
              <span className="relative inline-block">
                <span 
                  className="bg-gradient-to-r from-slate-900 via-slate-700 to-cyan-600 dark:from-slate-100 dark:via-slate-300 dark:to-cyan-400 bg-clip-text text-transparent bg-[length:200%_100%]"
                  style={{
                    animation: !shouldReduceMotion ? 'shimmer 3s linear infinite' : 'none'
                  }}
                >
                  {headingHighlight}
                </span>
                {!shouldReduceMotion && (
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-cyan-500/40 dark:text-cyan-400/30 pointer-events-none"
                    viewBox="0 0 300 12"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <motion.path
                      d="M2 6C50 3, 100 8, 150 5C200 2, 250 7, 298 5"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.2, delay: 0.5, ease: 'easeInOut' }}
                    />
                  </svg>
                )}
              </span>
              {headingEnd}
            </motion.h1>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl text-slate-900 dark:text-slate-100 font-medium"
              dir={dir}
            >
              {descriptionText}
            </motion.p>
            
            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              <Link to="/contact" className="font-bold">
                <button
                  className="group relative px-8 h-12 rounded-xl font-bold overflow-hidden transition-all hover:shadow-xl"
                  style={{ height: '48px' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-white dark:to-slate-100" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 whitespace-nowrap text-white dark:text-slate-900 flex items-center gap-2 font-bold">
                    {language === 'ar' ? 'ابدأ مشروعك' : 'Start Your Project'}
                    <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180' : ''}`} />
                  </span>
                  {!shouldReduceMotion && (
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 dark:via-black/20 to-transparent" />
                  )}
                </button>
              </Link>
              
              <button
                onClick={() => {
                  document.getElementById('services-grid')?.scrollIntoView({ 
                    behavior: shouldReduceMotion ? 'auto' : 'smooth',
                    block: 'start'
                  });
                }}
                className="px-8 h-12 rounded-xl font-semibold transition-all border hover:shadow-lg relative"
                style={{ height: '48px' }}
              >
                <InverseSurface token="border" as="div" className="absolute inset-0 rounded-xl pointer-events-none" />
                <InverseSurface token="glass" as="div" className="absolute inset-0 rounded-xl pointer-events-none" />
                <span className="relative font-semibold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'استكشف الخدمات' : 'Explore Services'}
                </span>
              </button>
            </motion.div>
            
            {/* Facts row */}
            {services.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center gap-2 mb-4"
                dir={dir}
              >
                <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                  {serviceCount}
                </span>
                <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {language === 'ar' ? 'خدمة متاحة' : 'Services Available'}
                </span>
              </motion.div>
            )}
            
            {/* Typewriter line */}
            {services.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center gap-2 font-mono text-sm"
                dir={dir}
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">{isRTL ? '‹' : '›'}</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">
                  {typewriterText}
                  {!shouldReduceMotion && <span className="inline-block w-0.5 h-4 bg-cyan-500 ml-1 animate-pulse" />}
                </span>
              </motion.div>
            )}
          </div>
          
          {/* Right Column: Constellation Stage */}
          <div className={`relative hidden lg:block ${isRTL ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
            <ConstellationStage
              services={services}
              stageRef={stageRef}
              rotateX={rotateX}
              rotateY={rotateY}
              shouldReduceMotion={shouldReduceMotion}
              language={language}
              isRTL={isRTL}
            />
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 rounded-full flex items-start justify-center p-2"
        >
          <InverseSurface token="border" as="div" className="absolute inset-0 rounded-full" />
          <motion.div
            animate={shouldReduceMotion ? {} : { y: [0, 12, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative w-1 h-2 bg-slate-400 dark:bg-slate-600 rounded-full"
          />
        </motion.div>
      </motion.div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  );
}

/**
 * ConstellationStage - Service nodes with animated connections
 */
function ConstellationStage({ services, stageRef, rotateX, rotateY, shouldReduceMotion, language, isRTL }) {
  // Use real active services, or show 6 generic placeholders
  const activeServices = services.filter(s => s.is_active).slice(0, 6);
  const hasServices = activeServices.length > 0;
  
  const displayServices = hasServices ? activeServices : [
    { id: '1', slug: 'web', icon: 'Code', title: language === 'ar' ? 'ويب' : 'Web' },
    { id: '2', slug: 'mobile', icon: 'Smartphone', title: language === 'ar' ? 'موبايل' : 'Mobile' },
    { id: '3', slug: 'erp', icon: 'Layers', title: language === 'ar' ? 'ERP' : 'ERP' },
    { id: '4', slug: 'crm', icon: 'Database', title: language === 'ar' ? 'CRM' : 'CRM' },
    { id: '5', slug: 'data', icon: 'BarChart3', title: language === 'ar' ? 'بيانات' : 'Data' },
    { id: '6', slug: 'ai', icon: 'Bot', title: language === 'ar' ? 'ذكاء' : 'AI' }
  ];
  
  return (
    <motion.div
      ref={stageRef}
      style={shouldReduceMotion ? {} : {
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      className="relative w-full aspect-square max-w-lg mx-auto"
    >
      {/* SVG for connection lines - behind everything */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        {/* Draw lines from center to each node */}
        {displayServices.map((service, idx) => {
          const angle = (idx / displayServices.length) * 360;
          const radius = 42; // percentage from center
          const x = 50 + radius * Math.cos((angle - 90) * (Math.PI / 180));
          const y = 50 + radius * Math.sin((angle - 90) * (Math.PI / 180));
          
          return (
            <motion.line
              key={`line-${service.id}`}
              x1="50%"
              y1="50%"
              x2={`${x}%`}
              y2={`${y}%`}
              className="stroke-cyan-500/30 dark:stroke-cyan-400/20"
              strokeWidth="2"
              strokeDasharray="6 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.8 + idx * 0.1,
                ease: 'easeOut'
              }}
            />
          );
        })}
      </svg>
      
      {/* Central core with company mark */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden">
          <InverseSurface token="glass" className="absolute inset-0 border-2 rounded-2xl" />
          <InverseSurface token="border" as="div" className="absolute inset-0 rounded-2xl border-2" />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-blue-500/20" />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-cyan-500 dark:text-cyan-400" strokeWidth={1.5} />
          </div>
          {!shouldReduceMotion && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />
          )}
        </div>
      </motion.div>
      
      {/* Orbiting service nodes */}
      {displayServices.map((service, idx) => {
        const angle = (idx / displayServices.length) * 360;
        const radius = 42; // percentage from center
        const x = 50 + radius * Math.cos((angle - 90) * (Math.PI / 180));
        const y = 50 + radius * Math.sin((angle - 90) * (Math.PI / 180));
        
        const IconComponent = getServiceIcon(service.slug, service.icon);
        const title = language === 'ar' && service.title_ar 
          ? service.title_ar 
          : service.title_en || service.title || '';
        
        return (
          <ServiceNode
            key={service.id}
            x={x}
            y={y}
            icon={IconComponent}
            title={title}
            index={idx}
            shouldReduceMotion={shouldReduceMotion}
          />
        );
      })}
      
      {/* Floating glass cards (desktop only) */}
      <FloatingCards shouldReduceMotion={shouldReduceMotion} language={language} />
    </motion.div>
  );
}

/**
 * ServiceNode - Individual orbiting node with proper connection line
 */
function ServiceNode({ x, y, icon: Icon, title, index, shouldReduceMotion }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="absolute z-10"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: 0.6 + index * 0.1,
        type: 'spring',
        stiffness: 200
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Node */}
      <motion.div
        className="relative"
        whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <div className="w-16 h-16 rounded-xl overflow-hidden cursor-pointer">
          <InverseSurface token="glass" className="absolute inset-0 border rounded-xl" />
          <InverseSurface token="border" as="div" className="absolute inset-0 rounded-xl border" />
          <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <Icon className="w-7 h-7 text-cyan-600 dark:text-cyan-400" strokeWidth={1.5} />
          </div>
        </div>
      </motion.div>
      
      {/* Title tooltip on hover */}
      {isHovered && title && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
        >
          <div className="px-3 py-1.5 rounded-lg overflow-hidden">
            <InverseSurface token="glass" className="absolute inset-0 border" />
            <InverseSurface token="text" as="span" className="relative text-xs font-medium">
              {title}
            </InverseSurface>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * FloatingCards - Code, dashboard, chat, mobile, database cards
 */
function FloatingCards({ shouldReduceMotion, language }) {
  if (shouldReduceMotion) return null;
  
  const cards = [
    { id: 'code', icon: Code, position: { top: '12%', left: '8%' }, delay: 1.2 },
    { id: 'chart', icon: BarChart3, position: { top: '18%', right: '10%' }, delay: 1.4 },
    { id: 'chat', icon: MessageSquare, position: { bottom: '28%', left: '10%' }, delay: 1.6 },
    { id: 'mobile', icon: Smartphone, position: { bottom: '22%', right: '8%' }, delay: 1.8 },
  ];
  
  return (
    <>
      {cards.map((card) => {
        const CardIcon = card.icon;
        return (
          <motion.div
            key={card.id}
            className="absolute"
            style={card.position}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0
            }}
            transition={{
              duration: 0.6,
              delay: card.delay
            }}
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 1, -1, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: card.delay
              }}
              className="w-12 h-12 rounded-lg overflow-hidden"
            >
              <InverseSurface token="glass" className="absolute inset-0 border" />
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <CardIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" strokeWidth={1.5} />
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </>
  );
}
