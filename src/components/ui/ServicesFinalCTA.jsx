import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/useLanguage';
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  ArrowRight,
  Code,
  Smartphone,
  Layers,
  Database,
  BarChart3,
  Bot,
  Mail,
  Phone,
  MessageCircle
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
 * ServicesFinalCTA
 * 
 * Final conversion section with:
 * - Eyebrow chip
 * - Compelling heading
 * - Primary button: frost/white fill, deep text, shine effect, magnetic (48px height, nowrap)
 * - Secondary glass WhatsApp button with REAL number from site_settings
 * - Email/phone text links (LTR-isolated)
 * - Compact services orbit visual (real icons, never empty)
 * - InverseSurface tokens, RTL, dark mode, a11y, reduced-motion
 */
export default function ServicesFinalCTA({ services = [], contactInfo = {} }) {
  const { t, language, dir } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  // Active services for orbit (max 6)
  const activeServices = services
    .filter(s => s.is_active)
    .slice(0, 6)
    .map(s => ({
      id: s.id,
      icon: s.icon || 'Code'
    }));

  // Extract contact info with fallback to props or empty
  const whatsappNumber = contactInfo?.whatsapp_number || '';
  const email = contactInfo?.email || '';
  const phone = contactInfo?.phone || '';

  return (
    <section className="relative overflow-hidden">
      <InverseSurface
        token="canvas"
        className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28"
      >
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {/* Subtle gradient */}
          <InverseSurface
            token="subtleFill"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 rounded-full blur-3xl opacity-20"
          />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex mb-6"
              >
                <InverseSurface
                  token="glass"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
                >
                  <span className="w-2 h-2 bg-cyan-500 rounded-full" aria-hidden="true" />
                  <InverseSurface token="secondaryText" className="text-sm font-medium">
                    {language === 'ar' ? 'ابدأ مشروعك الآن' : 'Start Your Project Now'}
                  </InverseSurface>
                </InverseSurface>
              </motion.div>

              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6"
                style={{ 
                  letterSpacing: language === 'ar' ? '0' : '-0.02em',
                  lineHeight: 1.1
                }}
                dir={dir}
              >
                <InverseSurface token="text">
                  {language === 'ar' 
                    ? 'جاهز لتحويل فكرتك إلى واقع؟'
                    : 'Ready to Transform Your Idea Into Reality?'}
                </InverseSurface>
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg mb-8"
                dir={dir}
              >
                <InverseSurface token="secondaryText">
                  {language === 'ar' 
                    ? 'تواصل معنا اليوم ودعنا نناقش كيف يمكننا مساعدتك في بناء حل برمجي مميز'
                    : 'Contact us today and let\'s discuss how we can help you build an exceptional software solution'}
                </InverseSurface>
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 mb-8"
              >
                {/* Primary button - magnetic frost/white fill */}
                <MagneticButton shouldReduceMotion={shouldReduceMotion}>
                  <Link
                    to="/contact"
                    className="relative group inline-flex items-center justify-center gap-2 px-8 h-12 rounded-xl font-semibold text-base whitespace-nowrap overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #EEF2F4 0%, #FFFFFF 100%)',
                      boxShadow: '0 4px 16px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    {/* Deep text */}
                    <span className="relative z-10 text-slate-900 font-bold">
                      {language === 'ar' ? 'ابدأ مشروعك' : 'Start Your Project'}
                    </span>
                    
                    {/* Arrow */}
                    <ArrowRight 
                      className={`relative z-10 w-5 h-5 text-slate-900 transition-transform group-hover:translate-x-1 ${dir === 'rtl' ? 'rotate-180' : ''}`}
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />

                    {/* Shine effect */}
                    {!shouldReduceMotion && (
                      <span 
                        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </MagneticButton>

                {/* WhatsApp button - glass secondary */}
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center gap-2 px-6 h-12 rounded-xl font-semibold text-base whitespace-nowrap bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 hover:shadow-lg transition-all"
                  >
                    <MessageCircle 
                      className="w-5 h-5 text-green-600 dark:text-green-500" 
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <span className="text-slate-900 dark:text-slate-50">
                      {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                    </span>
                  </a>
                )}
              </motion.div>

              {/* Contact links - LTR isolated */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center gap-4 text-sm"
              >
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                    dir="ltr"
                  >
                    <Mail className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                    <span>{email}</span>
                  </a>
                )}
                
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                    dir="ltr"
                  >
                    <Phone className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                    <span>{phone}</span>
                  </a>
                )}
              </motion.div>
            </div>

            {/* Right: Compact services orbit */}
            {activeServices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative w-full max-w-md mx-auto aspect-square"
              >
                {/* Central hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <InverseSurface
                    token="glass"
                    className="relative w-24 h-24 rounded-2xl border flex items-center justify-center shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-2xl" aria-hidden="true" />
                    <Code className="relative z-10 w-10 h-10 text-cyan-500 dark:text-cyan-400" strokeWidth={1.5} aria-hidden="true" />
                  </InverseSurface>
                </div>

                {/* Orbiting service icons */}
                <div className="absolute inset-0">
                  {activeServices.map((service, idx) => {
                    const angle = (idx / activeServices.length) * 360;
                    const radius = 42; // percentage
                    const x = 50 + radius * Math.cos((angle - 90) * (Math.PI / 180));
                    const y = 50 + radius * Math.sin((angle - 90) * (Math.PI / 180));
                    
                    const IconComponent = iconMap[service.icon] || Code;

                    return (
                      <motion.div
                        key={service.id}
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
                          opacity: { duration: 0.4, delay: 0.4 + idx * 0.08 },
                          scale: { duration: 0.4, delay: 0.4 + idx * 0.08 },
                          rotate: shouldReduceMotion 
                            ? { duration: 0 }
                            : {
                                duration: 25,
                                repeat: Infinity,
                                ease: 'linear'
                              }
                        }}
                      >
                        <InverseSurface
                          token="glass"
                          className="w-14 h-14 rounded-xl border flex items-center justify-center"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-xl" aria-hidden="true" />
                          <IconComponent 
                            className="relative z-10 w-6 h-6 text-cyan-500 dark:text-cyan-400" 
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                        </InverseSurface>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </InverseSurface>
    </section>
  );
}

/**
 * MagneticButton
 * Creates magnetic pull effect on hover (disabled for reduced-motion)
 */
function MagneticButton({ children, shouldReduceMotion }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    // Magnetic pull (max 12px)
    x.set(Math.max(-12, Math.min(12, distanceX * 0.3)));
    y.set(Math.max(-12, Math.min(12, distanceY * 0.3)));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={shouldReduceMotion ? {} : { x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}

/**
 * InverseSurface wrapper component
 */
function InverseSurface({ token, className = '', children, style, ...props }) {
  const tokens = {
    canvas: 'bg-white dark:bg-slate-950',
    glass: 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm',
    subtleFill: 'bg-cyan-500/10 dark:bg-cyan-400/10',
    text: 'text-slate-950 dark:text-slate-50',
    secondaryText: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-800'
  };

  const tokenClass = tokens[token] || '';
  const combinedClassName = `${tokenClass} ${className}`.trim();

  return (
    <div className={combinedClassName} style={style} {...props}>
      {children}
    </div>
  );
}
