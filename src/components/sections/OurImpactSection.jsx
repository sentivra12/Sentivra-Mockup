import { useEffect, useState, useRef } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { supabase } from '../../lib/supabase';
import { resolveIcon } from '../../lib/iconResolver';

export default function OurImpactSection() {
  const { language } = useTranslation();
  const isRTL = language === 'ar';
  const [stats, setStats] = useState([]);
  const [sectionSettings, setSectionSettings] = useState(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch active stats for home page
        const { data: statsData, error: statsError } = await supabase
          .from('stats')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (statsData && !statsError) {
          // Filter for home page if pages column exists
          const homeStats = statsData.filter(stat => 
            !stat.pages || stat.pages.length === 0 || stat.pages.includes('home')
          );
          setStats(homeStats);
        }

        // Fetch section settings (optional - won't break if table doesn't exist)
        const { data: sectionData, error: sectionError } = await supabase
          .from('page_sections')
          .select('*')
          .eq('section_key', 'our_impact')
          .eq('page', 'home')
          .eq('enabled', true)
          .single();

        if (sectionData && !sectionError) {
          setSectionSettings(sectionData);
        }
      } catch (error) {
        console.error('Error fetching impact data:', error);
      }
    }

    fetchData();
  }, []);

  // Intersection observer for scroll-triggered animation
  useEffect(() => {
    if (!sectionRef.current || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [hasAnimated]);

  // Don't render section if no stats - AFTER all hooks
  if (stats.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-impact-start via-impact-mid to-impact-end relative overflow-hidden"
    >
      {/* Background texture */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        {sectionSettings && (
          <div className="text-center mb-16">
            {sectionSettings.eyebrow && (
              <p className="text-sm font-medium text-impact-accent mb-2 uppercase tracking-wider">
                {isRTL ? sectionSettings.eyebrow_ar || sectionSettings.eyebrow : sectionSettings.eyebrow}
              </p>
            )}
            {sectionSettings.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {isRTL ? sectionSettings.title_ar || sectionSettings.title : sectionSettings.title}
              </h2>
            )}
            {sectionSettings.subtitle && (
              <p className="text-lg text-impact-muted max-w-2xl mx-auto">
                {isRTL ? sectionSettings.subtitle_ar || sectionSettings.subtitle : sectionSettings.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0">
          {stats.map((stat, index) => {
            const IconComponent = resolveIcon(stat.icon);
            const isLastInRow = (index + 1) % 5 === 0 || index === stats.length - 1;
            
            return (
              <div
                key={stat.id}
                className={`
                  relative px-6 py-8 text-center
                  ${!isLastInRow ? 'after:absolute after:top-1/4 after:bottom-1/4 after:w-px after:bg-impact-divider' : ''}
                  ${isRTL ? 'after:left-0' : 'after:right-0'}
                `}
              >
                {/* Icon with gradient */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-impact-icon-glow blur-xl opacity-60" />
                    <IconComponent 
                      className="w-10 h-10 text-impact-accent relative z-10" 
                      strokeWidth={1.5}
                    />
                  </div>
                </div>

                {/* Animated Counter */}
                <div className="mb-2">
                  <AnimatedStat
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    shouldAnimate={hasAnimated}
                    delay={index * 100}
                  />
                </div>

                {/* Label */}
                <p className="text-sm text-impact-muted font-medium">
                  {isRTL ? stat.label_ar || stat.label : stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Animated counter component
function AnimatedStat({ value, prefix = '', suffix = '', shouldAnimate, delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!shouldAnimate) return;

    const timeout = setTimeout(() => {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      let step = 0;

      animationRef.current = setInterval(() => {
        step++;
        current += increment;
        
        if (step >= steps) {
          setDisplayValue(value);
          clearInterval(animationRef.current);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [value, shouldAnimate, delay]);

  return (
    <div className="text-4xl md:text-5xl font-bold text-white">
      {prefix}
      {displayValue}
      {suffix}
    </div>
  );
}
