/**
 * ServicesBentoGrid - Premium bento layout with mini live visuals
 * 
 * Features:
 * - Bento layout: featured/first service as large 2x2 tile (if 4+ services)
 * - Each card has mini live visual based on service type
 * - Monospace index label, glowing icon, title, description, feature chips
 * - Magnetic button, gradient border, pointer glare, lift, tilt
 * - Search with debounce, optional category filter
 * - Whole card clickable via stretched link
 * - Full RTL, dark mode, a11y, reduced-motion
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Search, X, ArrowRight,
  Code, Smartphone, Layers, Database, BarChart3, Bot,
  Terminal, MessageSquare, Cpu
} from 'lucide-react';
import InverseSurface from '@/components/ui/InverseSurface';
import SectionHeader from '@/components/ui/SectionHeader';
import { RevealStagger } from '@/components/ui/Reveal';

// Icon mapping
const iconMap = {
  Code, Smartphone, Layers, Database, BarChart3, Bot, Terminal, MessageSquare, Cpu
};

export default function ServicesBentoGrid({ 
  services = [],
  language = 'en',
  dir = 'ltr'
}) {
  const shouldReduceMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchInputRef = useRef(null);
  const [resultCount, setResultCount] = useState(services.length);
  
  // Debounce search (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // "/" keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Filter services
  const filteredServices = useMemo(() => {
    if (!debouncedQuery.trim()) return services;
    
    const query = debouncedQuery.toLowerCase().trim();
    return services.filter(service => {
      const title = (language === 'ar' && service.title_ar ? service.title_ar : service.title_en || service.title).toLowerCase();
      const shortDesc = (language === 'ar' && service.short_description_ar ? service.short_description_ar : service.short_description_en || service.short_description || '').toLowerCase();
      const category = (service.category || '').toLowerCase();
      
      return title.includes(query) || shortDesc.includes(query) || category.includes(query);
    });
  }, [services, debouncedQuery, language]);
  
  useEffect(() => {
    setResultCount(filteredServices.length);
  }, [filteredServices]);
  
  const eyebrowText = language === 'ar' ? 'خدماتنا' : 'OUR SERVICES';
  const headingText = language === 'ar' ? 'حلول برمجية شاملة' : 'Comprehensive Software Solutions';
  const descriptionText = language === 'ar'
    ? 'نقدم مجموعة متكاملة من الخدمات التقنية المصممة خصيصاً لتلبية احتياجات عملك وتحقيق أهدافك الرقمية'
    : 'We offer a comprehensive suite of technology services tailored to meet your business needs and achieve your digital goals';
  
  return (
    <section id="services-grid" className="relative scroll-mt-20 py-16 sm:py-20 lg:py-24 bg-color-background dark:bg-surface">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
        backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
        backgroundSize: '64px 64px'
      }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header with search */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
            <div className="flex-1">
              <SectionHeader
                eyebrow={eyebrowText}
                heading={headingText}
                description={descriptionText}
                align={dir === 'rtl' ? 'right' : 'left'}
                language={language}
              />
            </div>
            
            {/* Search */}
            <div className="lg:w-80">
              <div className="relative">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm focus-within:ring-2 focus-within:ring-cyan-500/50 transition-shadow">
                  <Search 
                    className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" 
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'ar' ? 'ابحث... (/)' : 'Search... (/)'}
                    className="flex-1 bg-transparent border-none outline-none text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    aria-label={language === 'ar' ? 'بحث الخدمات' : 'Search services'}
                    dir={dir}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      aria-label={language === 'ar' ? 'مسح' : 'Clear'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {/* Result count (aria-live) */}
                <div
                  className="sr-only"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {language === 'ar'
                    ? `تم العثور على ${resultCount} ${resultCount === 1 ? 'خدمة' : 'خدمات'}`
                    : `Found ${resultCount} ${resultCount === 1 ? 'service' : 'services'}`}
                </div>
              </div>
            </div>
          </div>
          
          {/* Bento Grid */}
          {filteredServices.length > 0 ? (
            <RevealStagger staggerDelay={0.1}>
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredServices.map((service, idx) => {
                  // Featured logic: first service spans 2 columns only if we have 4+ services
                  // and it's at position 0, and we're on desktop
                  const canBeFeatured = filteredServices.length >= 4 && idx === 0;
                  
                  return (
                    <ServiceBentoCard
                      key={service.id}
                      service={service}
                      index={idx}
                      isFeatured={canBeFeatured}
                      language={language}
                      dir={dir}
                      shouldReduceMotion={shouldReduceMotion}
                    />
                  );
                })}
              </div>
            </RevealStagger>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-deep dark:text-white">
                {language === 'ar' ? 'لا توجد نتائج' : 'No Results Found'}
              </h3>
              <p className="mb-6 text-text-muted dark:text-slate-400">
                {language === 'ar' 
                  ? `لا توجد خدمات تطابق "${searchQuery}"`
                  : `No services match "${searchQuery}"`}
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors"
              >
                {language === 'ar' ? 'مسح البحث' : 'Clear Search'}
              </button>
            </motion.div>
          )}
      </div>
    </section>
  );
}

/**
 * ServiceBentoCard - Individual service card with mini visual
 */
function ServiceBentoCard({ service, index, isFeatured, language, dir, shouldReduceMotion }) {
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  
  const IconComponent = iconMap[service.icon] || Code;
  const title = language === 'ar' && service.title_ar ? service.title_ar : service.title_en || service.title;
  const shortDesc = language === 'ar' && service.short_description_ar 
    ? service.short_description_ar 
    : service.short_description_en || service.short_description || '';
  
  // Parse features if JSONB
  const features = Array.isArray(service.features) 
    ? service.features.slice(0, 4)
    : typeof service.features === 'object' && service.features !== null
    ? Object.values(service.features).slice(0, 4)
    : [];
  
  // Pointer glare
  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlarePosition({ x, y });
  };
  
  return (
    <motion.div
      className={isFeatured ? 'lg:col-span-2' : ''}
    >
      <Link
        to={`/services/${service.slug}`}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative block h-full"
        aria-label={`${language === 'ar' ? 'عرض تفاصيل' : 'View details for'} ${title}`}
      >
        <div className="relative h-full p-6 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col min-h-[400px]">
          {/* Glass background */}
          <div className="absolute inset-0 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm" />
          
          {/* Border */}
          <div className="absolute inset-0 rounded-2xl border border-slate-200 dark:border-slate-800" />
          {/* Gradient border on hover */}
          <div 
            className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.4), transparent 50%, rgba(100, 116, 139, 0.3))',
              padding: '1px',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude'
            }}
            aria-hidden="true"
          />
          
          {/* Pointer glare */}
          {!shouldReduceMotion && (
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `radial-gradient(600px circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(6, 182, 212, 0.1), transparent 40%)`
              }}
              aria-hidden="true"
            />
          )}
          
          {/* Index label */}
          <div className="relative mb-4 flex items-center justify-between">
            <span className="font-mono text-xs text-cyan-600 dark:text-cyan-400">
              {String(index + 1).padStart(2, '0')}
            </span>
            {service.is_featured && (
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-600 dark:text-cyan-400">
                {language === 'ar' ? 'مميز' : 'Featured'}
              </span>
            )}
          </div>
          
          {/* Mini visual based on service type */}
          <ServiceMiniVisual slug={service.slug} isHovered={isHovered} shouldReduceMotion={shouldReduceMotion} />
          
          {/* Icon */}
          <div className="relative mb-4">
            <InverseSurface
              token="glass"
              className="inline-flex items-center justify-center w-14 h-14 rounded-xl border"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl group-hover:from-cyan-500/20 transition-all duration-300" />
              <IconComponent 
                className="relative z-10 w-7 h-7 text-cyan-500 dark:text-cyan-400" 
                strokeWidth={1.5}
              />
            </InverseSurface>
          </div>
          
          {/* Title */}
          <h3 
            className="text-xl lg:text-2xl font-bold mb-3 line-clamp-2 relative z-10"
            style={{ 
              hyphens: 'none',
              wordBreak: 'normal'
            }}
            dir={dir}
          >
            {title}
          </h3>
          
          {/* Description */}
          <p 
            className="text-base leading-relaxed mb-4 line-clamp-3 relative z-10 flex-1"
            style={{ 
              hyphens: 'none',
              wordBreak: 'normal'
            }}
            dir={dir}
          >
            {shortDesc}
          </p>
          
          {/* Feature chips */}
          {features.length > 0 && (
            <div className="relative z-10 flex flex-wrap gap-2 mb-4">
              {features.map((feature, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
          
          {/* CTA */}
          <div className="relative z-10 flex items-center gap-2 text-base font-semibold text-cyan-600 dark:text-cyan-400 group-hover:gap-3 transition-all mt-auto">
            <span className="whitespace-nowrap">
              {language === 'ar' ? 'اعرف المزيد' : 'Learn More'}
            </span>
            <ArrowRight 
              className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:translate-x-1 ${dir === 'rtl' ? 'rotate-180' : ''}`}
              strokeWidth={2.5}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * ServiceMiniVisual - Animated visual based on service type
 * FIXED: Shows on mount, not only on hover
 */
function ServiceMiniVisual({ slug, isHovered, shouldReduceMotion }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Map slugs to visual types
  const getVisualType = (slug = '') => {
    const slugLower = slug.toLowerCase();
    if (slugLower.includes('web')) return 'browser';
    if (slugLower.includes('mobile') || slugLower.includes('app')) return 'mobile';
    if (slugLower.includes('erp')) return 'table';
    if (slugLower.includes('crm')) return 'pipeline';
    if (slugLower.includes('data') || slugLower.includes('analysis') || slugLower.includes('business-intelligence')) return 'chart';
    if (slugLower.includes('ai') || slugLower.includes('chat') || slugLower.includes('bot')) return 'chat';
    return 'generic';
  };
  
  const visualType = getVisualType(slug);
  
  if (shouldReduceMotion) {
    return (
      <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
        <InverseSurface token="subtleCanvas" className="absolute inset-0 rounded-lg" />
        <InverseSurface token="border" as="div" className="absolute inset-0 rounded-lg border" />
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
      <InverseSurface token="subtleCanvas" className="absolute inset-0 rounded-lg" />
      <InverseSurface token="border" as="div" className="absolute inset-0 rounded-lg border" />
      <div className="absolute inset-0">
        {visualType === 'browser' && <BrowserVisual isHovered={isHovered} mounted={mounted} />}
        {visualType === 'mobile' && <MobileVisual isHovered={isHovered} mounted={mounted} />}
        {visualType === 'table' && <TableVisual isHovered={isHovered} mounted={mounted} />}
        {visualType === 'pipeline' && <PipelineVisual isHovered={isHovered} mounted={mounted} />}
        {visualType === 'chart' && <ChartVisual isHovered={isHovered} mounted={mounted} />}
        {visualType === 'chat' && <ChatVisual isHovered={isHovered} mounted={mounted} />}
        {visualType === 'generic' && <GenericVisual isHovered={isHovered} mounted={mounted} />}
      </div>
    </div>
  );
}

// Mini visual components (FIXED: show on mount, enhance on hover)
function BrowserVisual({ isHovered, mounted }) {
  return (
    <div className="absolute inset-0 p-2">
      <div className="w-full h-full border-2 rounded overflow-hidden">
        <InverseSurface token="border" as="div" className="absolute inset-0 border-2 rounded" />
        <div className="h-4 border-b-2 flex items-center gap-1 px-2">
          <InverseSurface token="border" as="div" className="absolute top-0 left-0 right-0 h-4 border-b-2" />
          <div className="relative w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="relative w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="relative w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>
        <div className="relative p-2 space-y-2">
          <motion.div
            className="h-2 bg-slate-300 dark:bg-slate-700 rounded"
            initial={{ width: '0%' }}
            animate={{ width: mounted ? '75%' : '0%' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
          <motion.div
            className="h-2 bg-slate-300 dark:bg-slate-700 rounded"
            initial={{ width: '0%' }}
            animate={{ width: mounted ? '55%' : '0%' }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
          <motion.div
            className="h-2 bg-slate-300 dark:bg-slate-700 rounded"
            initial={{ width: '0%' }}
            animate={{ width: mounted ? '65%' : '0%' }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
}

function MobileVisual({ isHovered, mounted }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-16 h-full border-2 rounded-lg overflow-hidden relative">
        <InverseSurface token="border" as="div" className="absolute inset-0 border-2 rounded-lg" />
        <motion.div
          className="relative w-full bg-gradient-to-b from-cyan-500/20 to-transparent"
          initial={{ height: '0%' }}
          animate={{ height: mounted ? '100%' : '0%' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
    </div>
  );
}

function TableVisual({ isHovered, mounted }) {
  return (
    <div className="absolute inset-0 p-4 space-y-2">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="h-3 bg-slate-300 dark:bg-slate-700 rounded"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: mounted ? 1 : 0, x: mounted ? 0 : -20 }}
          transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
        />
      ))}
    </div>
  );
}

function PipelineVisual({ isHovered, mounted }) {
  return (
    <div className="absolute inset-0 flex gap-2 p-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex-1 space-y-2">
          <motion.div
            className="h-8 bg-slate-300 dark:bg-slate-700 rounded"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: mounted ? 0 : 20, opacity: mounted ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.15 }}
          />
        </div>
      ))}
    </div>
  );
}

function ChartVisual({ isHovered, mounted }) {
  return (
    <div className="absolute inset-0 flex items-end gap-2 p-4">
      {[40, 70, 50, 85, 60].map((height, i) => (
        <motion.div
          key={i}
          className="flex-1 bg-cyan-500/50 rounded-t"
          initial={{ height: '0%' }}
          animate={{ height: mounted ? `${height}%` : '0%' }}
          transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
        />
      ))}
    </div>
  );
}

function ChatVisual({ isHovered, mounted }) {
  return (
    <div className="absolute inset-0 p-4 space-y-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`h-6 bg-slate-300 dark:bg-slate-700 rounded-lg ${i % 2 === 0 ? 'w-3/4' : 'w-2/3 ml-auto'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 10 }}
          transition={{ duration: 0.4, delay: 0.2 + i * 0.2 }}
        />
      ))}
    </div>
  );
}

function GenericVisual({ isHovered, mounted }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="w-16 h-16 border-2 border-cyan-500/50 rounded-lg"
        initial={{ rotate: 0, scale: 0 }}
        animate={{ 
          rotate: mounted ? 45 : 0, 
          scale: mounted ? 1 : 0 
        }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />
    </div>
  );
}
