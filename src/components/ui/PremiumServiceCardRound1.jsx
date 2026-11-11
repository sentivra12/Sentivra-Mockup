import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/useLanguage';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Code, 
  Smartphone, 
  Layers, 
  Database, 
  BarChart3, 
  Bot,
  Search,
  ArrowRight
} from 'lucide-react';

// Map icon names to components
const iconMap = {
  Code,
  Smartphone,
  Layers,
  Database,
  BarChart3,
  Bot
};

/**
 * PremiumServiceCardRound1
 * 
 * Premium service gallery with:
 * - Debounced search (250ms) with '/' shortcut and aria-live count
 * - Grid: repeat(auto-fit, minmax(300px, 1fr)), 3 columns desktop (4 at >=1600px)
 * - First/featured spans 2 columns if 4+ services and at 4-col breakpoint
 * - Card: icon in glowing glass tile, title clamped 2 lines, description 3 lines
 * - No hyphenation, no wrapped buttons, gradient border, pointer glare, whole card clickable
 * - InverseSurface tokens, RTL, dark mode, a11y, reduced-motion
 */
export default function PremiumServiceCardRound1({ services = [] }) {
  const { t, language, dir } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchInputRef = useRef(null);
  const announceRef = useRef(null);

  // Debounce search query (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // '/' keyboard shortcut to focus search
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

  // Announce results for screen readers
  useEffect(() => {
    if (announceRef.current) {
      const count = filteredServices.length;
      const message = language === 'ar'
        ? `تم العثور على ${count} ${count === 1 ? 'خدمة' : 'خدمات'}`
        : `Found ${count} ${count === 1 ? 'service' : 'services'}`;
      announceRef.current.textContent = message;
    }
  }, [filteredServices.length, language]);

  return (
    <section className="relative">
      <InverseSurface
        token="canvas"
        className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
      >
        <div className="max-w-7xl mx-auto">
          
          {/* Search box */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <InverseSurface
                token="glass"
                className="flex items-center gap-3 px-4 py-3 rounded-xl border focus-within:ring-2 focus-within:ring-cyan-500/50 transition-shadow"
              >
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
                  placeholder={language === 'ar' ? 'ابحث عن خدمة... (اضغط / للتركيز)' : 'Search services... (press / to focus)'}
                  className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  aria-label={language === 'ar' ? 'بحث الخدمات' : 'Search services'}
                  aria-describedby="search-results-count"
                  dir={dir}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-sm font-medium"
                    aria-label={language === 'ar' ? 'مسح البحث' : 'Clear search'}
                  >
                    {language === 'ar' ? 'مسح' : 'Clear'}
                  </button>
                )}
              </InverseSurface>
              
              {/* Screen reader announcement */}
              <div
                ref={announceRef}
                id="search-results-count"
                className="sr-only"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              />
            </div>

            {/* Result count (visual) */}
            {debouncedQuery && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-center text-sm"
              >
                <InverseSurface token="secondaryText">
                  {language === 'ar'
                    ? `تم العثور على ${filteredServices.length} ${filteredServices.length === 1 ? 'خدمة' : 'خدمات'}`
                    : `Found ${filteredServices.length} ${filteredServices.length === 1 ? 'service' : 'services'}`}
                </InverseSurface>
              </motion.p>
            )}
          </div>

          {/* Services grid */}
          {filteredServices.length > 0 ? (
            <div 
              className="grid gap-6 lg:gap-8"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                // 4 columns at >=1600px
                '@media (min-width: 1600px)': {
                  gridTemplateColumns: 'repeat(4, 1fr)'
                }
              }}
            >
              {filteredServices.map((service, idx) => {
                const isFeatured = service.is_featured && filteredServices.length >= 4;
                
                return (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    index={idx}
                    isFeatured={isFeatured}
                    language={language}
                    dir={dir}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <InverseSurface token="secondaryText" className="text-lg">
                {language === 'ar' ? 'لا توجد خدمات تطابق بحثك' : 'No services match your search'}
              </InverseSurface>
            </motion.div>
          )}

        </div>
      </InverseSurface>

      {/* Custom grid breakpoint for 4 columns */}
      <style>{`
        @media (min-width: 1600px) {
          .grid[style*="auto-fit"] {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}

/**
 * ServiceCard component
 * Whole card clickable, gradient border, pointer glare, equal height
 */
function ServiceCard({ service, index, isFeatured, language, dir, shouldReduceMotion }) {
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const cardRef = useRef(null);

  const IconComponent = iconMap[service.icon] || Code;
  const title = language === 'ar' && service.title_ar ? service.title_ar : service.title_en || service.title;
  const shortDesc = language === 'ar' && service.short_description_ar 
    ? service.short_description_ar 
    : service.short_description_en || service.short_description || '';

  // Pointer glare effect
  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlarePosition({ x, y });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={isFeatured ? 'xl-1600:col-span-2' : ''}
    >
      <Link
        to={`/services/${service.slug}`}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="group relative block h-full"
        aria-label={`${language === 'ar' ? 'عرض تفاصيل' : 'View details for'} ${title}`}
      >
        <InverseSurface
          token="glass"
          className="relative h-full p-6 rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
        >
          {/* Gradient border on hover */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), transparent 50%, rgba(100, 116, 139, 0.3))',
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
                background: `radial-gradient(600px circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(6, 182, 212, 0.08), transparent 40%)`
              }}
              aria-hidden="true"
            />
          )}

          {/* Icon in glowing glass tile */}
          <div className="relative mb-4">
            <InverseSurface
              token="glass"
              className="inline-flex items-center justify-center w-14 h-14 rounded-xl border"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl group-hover:from-cyan-500/20 transition-all duration-300" aria-hidden="true" />
              
              <IconComponent 
                className="relative z-10 w-7 h-7 text-cyan-500 dark:text-cyan-400" 
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </InverseSurface>

            {/* Featured badge */}
            {service.is_featured && (
              <div className="absolute top-0 inline-flex" style={{ [dir === 'rtl' ? 'right' : 'left']: '3.75rem' }}>
                <InverseSurface
                  token="glass"
                  className="px-2 py-0.5 rounded-md border text-xs font-medium text-cyan-600 dark:text-cyan-400"
                >
                  {language === 'ar' ? 'مميزة' : 'Featured'}
                </InverseSurface>
              </div>
            )}
          </div>

          {/* Title - clamped 2 lines, no hyphenation */}
          <h3 
            className="text-xl font-bold mb-3 line-clamp-2"
            style={{ 
              hyphens: 'none',
              wordBreak: 'normal',
              overflowWrap: 'break-word'
            }}
            dir={dir}
          >
            <InverseSurface token="text">
              {title}
            </InverseSurface>
          </h3>

          {/* Description - clamped 3 lines, no hyphenation */}
          <p 
            className="text-sm mb-6 line-clamp-3 flex-1"
            style={{ 
              hyphens: 'none',
              wordBreak: 'normal',
              overflowWrap: 'break-word'
            }}
            dir={dir}
          >
            <InverseSurface token="secondaryText">
              {shortDesc}
            </InverseSurface>
          </p>

          {/* CTA - no wrap, inline-flex to prevent stretching */}
          <div className="flex items-center gap-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 group-hover:gap-3 transition-all">
            <span className="whitespace-nowrap">
              {language === 'ar' ? 'اعرف المزيد' : 'Learn More'}
            </span>
            <ArrowRight 
              className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-1 ${dir === 'rtl' ? 'rotate-180' : ''}`}
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
        </InverseSurface>
      </Link>
    </motion.div>
  );
}

/**
 * InverseSurface wrapper component
 */
function InverseSurface({ token, className = '', children, ...props }) {
  const tokens = {
    canvas: 'bg-slate-50 dark:bg-slate-950',
    glass: 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm',
    text: 'text-slate-950 dark:text-slate-50',
    secondaryText: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-800'
  };

  const tokenClass = tokens[token] || '';
  const combinedClassName = `${tokenClass} ${className}`.trim();

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
}
