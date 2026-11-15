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
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useMotionPreference';
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
    // Initialize with first service immediately on mount
    if (services.length > 0 && typewriterText === '') {
      const firstService = services[0];
      if (firstService) {
        const serviceName = language === 'ar' && firstService.title_ar 
          ? firstService.title_ar 
          : firstService.title_en || firstService.title || '';
        
        if (shouldReduceMotion) {
          // Show full name immediately in calm mode
          setTypewriterText(serviceName);
        } else {
          // Start typing animation
          setTypewriterText(serviceName.substring(0, 1));
        }
      }
      return;
    }
    
    if (shouldReduceMotion || services.length === 0) {
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
  const headingPart1 = language === 'ar' ? 'نبني حلولاً ' : 'We Build Software ';
  const headingHighlight = language === 'ar' ? 'برمجية' : 'Solutions'; // Only the key word
  const headingPart2 = language === 'ar' ? ' متميزة' : ' That Scale';
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-accent/10 dark:bg-brand-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
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
              className="absolute top-0 left-1/4 w-px h-1/2 bg-gradient-to-b from-brand-accent/20 to-transparent"
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
              className="absolute top-1/4 right-1/3 w-1 h-1 bg-brand-accent rounded-full"
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="absolute top-1/3 left-1/4 w-1 h-1 bg-brand-accent rounded-full"
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
              className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-accent/20 dark:border-brand-accent/30 bg-brand-accent/5 dark:bg-brand-accent/10 mb-6"
            >
              <Sparkles className="w-3 h-3 text-brand-accent dark:text-brand-accent-muted flex-shrink-0" aria-hidden="true" />
              <span className="relative flex h-2 w-2" aria-hidden="true">
                {!shouldReduceMotion && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75" />
                )}
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent" />
              </span>
              <span className="relative text-xs uppercase tracking-wider text-brand-accent dark:text-brand-accent-muted font-semibold">
                {eyebrowText}
              </span>
            </motion.div>
            
            {/* Headline with gradient + underline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 text-primary-deep dark:text-white"
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
              {headingPart1}
              <span 
                className="relative inline-block text-brand-accent dark:text-brand-accent-muted"
                style={{
                  background: 'linear-gradient(to right, rgb(13, 158, 130), rgb(4, 77, 64))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {headingHighlight}
                {!shouldReduceMotion && (
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 pointer-events-none"
                    viewBox="0 0 300 12"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <motion.path
                      d="M2 6C50 3, 100 8, 150 5C200 2, 250 7, 298 5"
                      stroke="rgba(13, 158, 130, 0.4)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.2, delay: 0.5, ease: 'easeInOut' }}
                    />
                  </svg>
                )}
              </span>
              {headingPart2}
            </motion.h1>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl text-primary-deep dark:text-text-base font-medium"
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
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-deep via-primary to-primary-deep dark:from-text-base dark:via-white dark:to-text-base" />
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/20 via-brand-primary/20 to-brand-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 whitespace-nowrap text-white dark:text-primary-deep flex items-center gap-2 font-bold">
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
                className="px-8 h-12 rounded-xl font-semibold transition-all border-2 bg-brand-accent/5 dark:bg-brand-accent/10 hover:bg-brand-accent/10 dark:hover:bg-brand-accent/20 hover:shadow-lg"
                style={{ 
                  height: '48px',
                  borderColor: 'rgba(13, 158, 130, 0.3)',
                  color: 'rgb(13, 158, 130)'
                }}
              >
                <span className="relative font-semibold">
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
                <span 
                  className="text-4xl sm:text-5xl font-bold text-brand-accent dark:text-brand-accent-muted"
                  style={{
                    background: 'linear-gradient(to right, rgb(13, 158, 130), rgb(4, 77, 64))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {serviceCount}
                </span>
                <span className="text-base font-semibold text-primary-deep dark:text-text-base">
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
                className="flex items-center gap-2 text-base sm:text-lg"
                dir={dir}
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <span className="text-brand-accent dark:text-brand-accent-muted font-bold">{isRTL ? '‹' : '›'}</span>
                <span className="text-primary-deep dark:text-text-base font-medium">
                  {typewriterText}
                  {!shouldReduceMotion && <span className="inline-block w-0.5 h-4 bg-brand-accent ml-1 animate-pulse" />}
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
            className="relative w-1 h-2 bg-text-muted/40 rounded-full"
          />
        </motion.div>
      </motion.div>
      
      <style>{`
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
              className="stroke-brand-accent/30 dark:stroke-brand-accent/20"
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
        <div 
          className="relative w-24 h-24 rounded-2xl overflow-hidden border-2"
          style={{
            backgroundColor: 'rgba(13, 158, 130, 0.12)',
            borderColor: 'rgba(13, 158, 130, 0.4)',
            boxShadow: '0 8px 24px rgba(13, 158, 130, 0.15), 0 0 60px rgba(13, 158, 130, 0.1)'
          }}
        >
          <div 
            className="absolute inset-0 bg-gradient-to-br rounded-2xl"
            style={{
              backgroundImage: 'linear-gradient(135deg, rgba(13, 158, 130, 0.2), transparent, rgba(4, 77, 64, 0.2))'
            }}
          />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-brand-accent dark:text-brand-accent-muted" strokeWidth={1.5} />
          </div>
          {!shouldReduceMotion && (
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                backgroundImage: 'linear-gradient(90deg, transparent, rgba(13, 158, 130, 0.2), transparent)'
              }}
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
        <div 
          className="w-16 h-16 rounded-xl overflow-hidden cursor-pointer relative border transition-all duration-300"
          style={{
            backgroundColor: 'rgba(13, 158, 130, 0.08)',
            borderColor: 'rgba(13, 158, 130, 0.3)',
            boxShadow: '0 4px 12px rgba(13, 158, 130, 0.1)'
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br from-brand-accent/10 to-transparent rounded-xl transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <Icon className="w-7 h-7 text-brand-accent dark:text-brand-accent-muted" strokeWidth={1.5} />
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
                <CardIcon className="w-5 h-5 text-brand-accent dark:text-brand-accent-muted" strokeWidth={1.5} />
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </>
  );
}
