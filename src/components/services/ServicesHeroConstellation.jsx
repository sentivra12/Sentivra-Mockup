/**
 * ServicesHeroConstellation - Engineering-grade hero with constellation showcase
 * 
 * Left: eyebrow chip, gradient headline with shimmer + underline, paragraph, buttons,
 *       facts row (service count), typewriter through service names
 * Right: SERVICE CONSTELLATION stage with orbiting nodes, floating glass cards
 * 
 * Features:
 * - Constellation with real service icons as orbiting nodes
 * - Animated dashed lines with traveling light pulses
 * - Floating code window, dashboard, chat, mobile, database cards
 * - Pointer tilt, spotlight, parallax (desktop only)
 * - Never empty (shows generic nodes if 0 services)
 * - Full RTL, dark mode, a11y, reduced-motion
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  ArrowRight, 
  Code, 
  Smartphone, 
  Layers, 
  Database, 
  BarChart3, 
  Bot,
  Sparkles,
  Terminal,
  MessageSquare,
  Cpu
} from 'lucide-react';
import InverseSurface from '@/components/ui/InverseSurface';
import GradientHeading from '@/components/ui/GradientHeading';
import { Button } from '@/components/ui/button';

// Icon mapping
const iconMap = {
  Code, Smartphone, Layers, Database, BarChart3, Bot, Terminal, MessageSquare, Cpu
};

export default function ServicesHeroConstellation({ 
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
    // Animate count-up
    const target = services.length;
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
  
  // Typewriter effect through service names
  useEffect(() => {
    if (shouldReduceMotion || services.length === 0) return;
    
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
        // Typing
        if (typewriterText.length < serviceName.length) {
          setTypewriterText(serviceName.substring(0, typewriterText.length + 1));
        } else {
          // Pause then start deleting
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        // Deleting
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
  const rotateX = useTransform(mouseYSpring, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseXSpring, [-300, 300], [-5, 5]);
  
  // Active services or generic fallback
  const activeServices = services.filter(s => s.is_active).slice(0, 6);
  const displayServices = activeServices.length > 0 ? activeServices : [
    { id: '1', icon: 'Code', title: 'Web' },
    { id: '2', icon: 'Smartphone', title: 'Mobile' },
    { id: '3', icon: 'Layers', title: 'ERP' },
    { id: '4', icon: 'Database', title: 'CRM' },
    { id: '5', icon: 'BarChart3', title: 'Data' },
    { id: '6', icon: 'Bot', title: 'AI' }
  ];
  
  const eyebrowText = language === 'ar' ? 'خدمات برمجية احترافية' : 'PROFESSIONAL SOFTWARE SERVICES';
  const headingStart = language === 'ar' ? 'نبني ' : 'We Build ';
  const headingHighlight = language === 'ar' ? 'حلولاً برمجية' : 'Software Solutions';
  const headingEnd = language === 'ar' ? ' متميزة' : ' That Scale';
  const descriptionText = language === 'ar'
    ? 'من تطبيقات الويب المتقدمة إلى أنظمة الذكاء الاصطناعي، نصمم حلولاً تقنية مخصصة تدفع أعمالك للأمام'
    : 'From advanced web applications to AI systems, we craft custom technology solutions that drive your business forward';
  
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden">
      <InverseSurface token="canvas" className="absolute inset-0" />
      
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Aurora blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        
        {/* Grid floor with perspective */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                             linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            transform: 'perspective(1000px) rotateX(60deg)',
            transformOrigin: 'center bottom'
          }}
        />
        
        {/* Sparkles */}
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
            <motion.div
              className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-cyan-400 rounded-full"
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.4 }}
            />
          </>
        )}
      </div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${dir === 'rtl' ? 'lg:grid-flow-dense' : ''}`}>
          
          {/* Left Column: Content */}
          <div className={dir === 'rtl' ? 'lg:col-start-2' : ''}>
            {/* Eyebrow with pulsing dot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                {!shouldReduceMotion && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                )}
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                {eyebrowText}
              </span>
            </motion.div>
            
            {/* Headline with gradient + underline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl mb-6"
              style={{ 
                fontWeight: 800,
                letterSpacing: language === 'ar' ? '0' : '-0.02em',
                lineHeight: 1.1
              }}
            >
              <InverseSurface token="text">
                {headingStart}
              </InverseSurface>
              <GradientHeading shimmer underline language={language}>
                {headingHighlight}
              </GradientHeading>
              <InverseSurface token="text">
                {headingEnd}
              </InverseSurface>
            </motion.h1>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg leading-relaxed mb-8"
            >
              <InverseSurface token="secondaryText">
                {descriptionText}
              </InverseSurface>
            </motion.p>
            
            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              <Link to="/contact">
                <Button
                  size="lg"
                  className="relative group overflow-hidden bg-gradient-to-r from-slate-100 to-white dark:from-slate-800 dark:to-slate-700 text-slate-900 dark:text-slate-50 hover:shadow-lg transition-all"
                  style={{ height: '48px' }}
                >
                  <span className="relative z-10 whitespace-nowrap">
                    {language === 'ar' ? 'ابدأ مشروعك' : 'Start Your Project'}
                  </span>
                  <ArrowRight className={`relative z-10 w-5 h-5 ml-2 transition-transform group-hover:translate-x-1 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                  {!shouldReduceMotion && (
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  )}
                </Button>
              </Link>
              
              <button
                onClick={() => {
                  document.getElementById('services-grid')?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
                className="px-6 h-12 rounded-lg font-semibold transition-all border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur hover:bg-white dark:hover:bg-slate-900"
              >
                <InverseSurface token="text" className="whitespace-nowrap">
                  {language === 'ar' ? 'استكشف الخدمات' : 'Explore Services'}
                </InverseSurface>
              </button>
            </motion.div>
            
            {/* Facts row */}
            {services.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center gap-4 mb-6"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                    {serviceCount}
                  </span>
                  <InverseSurface token="secondaryText" className="text-sm">
                    {language === 'ar' ? 'خدمة متاحة' : 'Services Available'}
                  </InverseSurface>
                </div>
              </motion.div>
            )}
            
            {/* Typewriter line */}
            {services.length > 0 && !shouldReduceMotion && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center gap-2 font-mono text-sm"
              >
                <span className="text-cyan-600 dark:text-cyan-400">›</span>
                <InverseSurface token="secondaryText">
                  <span>{typewriterText}</span>
                  <span className="inline-block w-0.5 h-4 bg-cyan-500 ml-1 animate-pulse" />
                </InverseSurface>
              </motion.div>
            )}
          </div>
          
          {/* Right Column: Constellation Stage */}
          <div className={`relative ${dir === 'rtl' ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
            <ConstellationStage
              services={displayServices}
              stageRef={stageRef}
              rotateX={rotateX}
              rotateY={rotateY}
              shouldReduceMotion={shouldReduceMotion}
              language={language}
            />
          </div>
        </div>
      </div>
      
      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-slate-300 dark:border-slate-700 rounded-full flex items-start justify-center p-2"
        >
          <motion.div
            animate={shouldReduceMotion ? {} : { y: [0, 12, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2 bg-slate-400 dark:bg-slate-600 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

/**
 * ConstellationStage - The visual centerpiece
 */
function ConstellationStage({ services, stageRef, rotateX, rotateY, shouldReduceMotion, language }) {
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
      {/* Central core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <InverseSurface
          token="glass"
          className="relative w-24 h-24 rounded-2xl border flex items-center justify-center shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-2xl" />
          <Sparkles className="relative z-10 w-10 h-10 text-cyan-500 dark:text-cyan-400" strokeWidth={1.5} />
        </InverseSurface>
      </div>
      
      {/* Orbiting service nodes */}
      {services.map((service, idx) => {
        const angle = (idx / services.length) * 360;
        const radius = 42; // percentage
        const x = 50 + radius * Math.cos((angle - 90) * (Math.PI / 180));
        const y = 50 + radius * Math.sin((angle - 90) * (Math.PI / 180));
        
        const IconComponent = iconMap[service.icon] || Code;
        
        return (
          <ServiceNode
            key={service.id}
            x={x}
            y={y}
            angle={angle}
            icon={IconComponent}
            title={language === 'ar' && service.title_ar ? service.title_ar : service.title_en || service.title}
            index={idx}
            shouldReduceMotion={shouldReduceMotion}
          />
        );
      })}
      
      {/* Floating cards - desktop only */}
      <FloatingCards shouldReduceMotion={shouldReduceMotion} language={language} />
    </motion.div>
  );
}

/**
 * ServiceNode - Orbiting service icon with connection line
 */
function ServiceNode({ x, y, angle, icon: Icon, title, index, shouldReduceMotion }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        rotate: shouldReduceMotion ? 0 : [0, 360]
      }}
      transition={{
        opacity: { duration: 0.4, delay: 0.6 + index * 0.1 },
        scale: { duration: 0.4, delay: 0.6 + index * 0.1 },
        rotate: shouldReduceMotion ? { duration: 0 } : {
          duration: 30,
          repeat: Infinity,
          ease: 'linear'
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <InverseSurface
        token="glass"
        className="relative w-16 h-16 rounded-xl border flex items-center justify-center group hover:scale-110 transition-all cursor-pointer"
      >
        <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        <Icon className="relative z-10 w-7 h-7 text-cyan-500 dark:text-cyan-400" strokeWidth={1.5} />
      </InverseSurface>
      
      {/* Connection line to center */}
      {!shouldReduceMotion && (
        <svg
          className="absolute top-1/2 left-1/2 pointer-events-none"
          style={{
            width: '200%',
            height: '200%',
            transform: 'translate(-50%, -50%)'
          }}
          aria-hidden="true"
        >
          <motion.line
            x1="50%"
            y1="50%"
            x2={`${100 - x}%`}
            y2={`${100 - y}%`}
            className="stroke-current text-cyan-500/20 dark:text-cyan-400/20"
            strokeWidth="1"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: isHovered ? 0.5 : 0.2 }}
            transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
          />
        </svg>
      )}
      
      {/* Title on hover */}
      {isHovered && title && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <InverseSurface
            token="glass"
            className="px-3 py-1 rounded-lg border text-xs font-medium"
          >
            <InverseSurface token="text">
              {title}
            </InverseSurface>
          </InverseSurface>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * FloatingCards - Code window, dashboard, chat, mobile, database
 */
function FloatingCards({ shouldReduceMotion, language }) {
  const cards = [
    {
      id: 'code',
      icon: Code,
      position: { top: '10%', left: '5%' },
      delay: 1.2
    },
    {
      id: 'dashboard',
      icon: BarChart3,
      position: { top: '15%', right: '8%' },
      delay: 1.4
    },
    {
      id: 'chat',
      icon: MessageSquare,
      position: { bottom: '25%', left: '8%' },
      delay: 1.6
    },
    {
      id: 'mobile',
      icon: Smartphone,
      position: { bottom: '20%', right: '5%' },
      delay: 1.8
    }
  ];
  
  if (shouldReduceMotion) return null;
  
  return (
    <>
      {cards.map((card) => {
        const CardIcon = card.icon;
        return (
          <motion.div
            key={card.id}
            className="absolute hidden lg:block"
            style={card.position}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              rotate: [0, 2, -2, 0]
            }}
            transition={{
              opacity: { duration: 0.6, delay: card.delay },
              scale: { duration: 0.6, delay: card.delay },
              y: { duration: 0.6, delay: card.delay },
              rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
            }}
          >
            <InverseSurface
              token="glass"
              className="w-12 h-12 rounded-lg border flex items-center justify-center shadow-lg backdrop-blur"
            >
              <CardIcon className="w-5 h-5 text-cyan-500 dark:text-cyan-400" strokeWidth={1.5} />
            </InverseSurface>
          </motion.div>
        );
      })}
    </>
  );
}
