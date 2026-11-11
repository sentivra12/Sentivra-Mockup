import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, MessageCircle, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import InverseSurface from './InverseSurface';
import { useSiteSettings, useMockups } from '@/hooks/useContent';
import { useTranslation } from '@/i18n/useTranslation';

/**
 * PremiumCTA - Final call-to-action section with device stage
 * 
 * Features:
 * - Premium device mockup stage (laptop + phone) with real screenshots cycling
 * - Magnetic frost button with shine sweep
 * - Glass WhatsApp button (only if number set)
 * - Trust row from real data
 * - Atmospheric effects (aurora, grid, light beam, grain)
 * - Full inverse surface (dark in both themes)
 * - RTL support, reduced-motion, a11y
 */
const PremiumCTA = ({ className = '' }) => {
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const { data: siteSettings } = useSiteSettings();
  const { data: mockups = [] } = useMockups();
  
  const [currentMockupIndex, setCurrentMockupIndex] = useState(0);
  const containerRef = useRef(null);
  
  // Magnetic button effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 300 };
  const buttonX = useSpring(useTransform(mouseX, [-100, 100], [-8, 8]), springConfig);
  const buttonY = useSpring(useTransform(mouseY, [-100, 100], [-8, 8]), springConfig);

  // Get published mockups
  const publishedMockups = mockups.filter(m => m.is_published && m.thumbnail_url);
  
  // Cycle through mockups
  useEffect(() => {
    if (publishedMockups.length === 0 || prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      setCurrentMockupIndex((prev) => (prev + 1) % publishedMockups.length);
    }, 3500);
    
    return () => clearInterval(interval);
  }, [publishedMockups.length, prefersReducedMotion]);

  // Contact details
  const whatsappNumber = siteSettings?.whatsapp_number;
  const email = siteSettings?.primary_email;
  const phone = siteSettings?.primary_phone;
  
  // WhatsApp link with prefilled message
  const whatsappLink = whatsappNumber 
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
        language === 'ar' 
          ? 'مرحباً، أود الاستفسار عن خدماتكم'
          : 'Hello, I would like to inquire about your services'
      )}`
    : null;

  // Trust stats (from real data)
  const trustStats = [
    { 
      value: mockups.filter(m => m.is_published).length, 
      label: language === 'ar' ? 'تصميم جاهز' : 'Ready-Made Designs',
      show: mockups.filter(m => m.is_published).length > 0
    },
    { 
      value: siteSettings?.total_services || 8, 
      label: language === 'ar' ? 'خدمة متخصصة' : 'Specialized Services',
      show: true
    },
  ].filter(stat => stat.show);

  const handleMouseMove = (e) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <InverseSurface 
      as="section" 
      withTopGlow 
      withGrid 
      withAurora 
      className={`relative py-20 lg:py-28 ${className}`}
    >
      {/* Grain texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px'
        }} />
      </div>

      {/* Light beam sweep */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.1) 50%, transparent 100%)'
          }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${isRTL ? 'lg:grid-flow-dense' : ''}`}>
          
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={isRTL ? 'lg:col-start-2' : ''}
          >
            <h2 
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-inverse-fg mb-6"
              style={{ 
                textWrap: 'balance',
                letterSpacing: isRTL ? '0' : '-0.02em'
              }}
            >
              {language === 'ar' ? (
                <>
                  هل أعجبك ما <span className="text-transparent bg-clip-text bg-gradient-to-r from-inverse-accent via-cyan-300 to-inverse-accent">رأيت</span>؟
                </>
              ) : (
                <>
                  Like What <span className="text-transparent bg-clip-text bg-gradient-to-r from-inverse-accent via-cyan-300 to-inverse-accent">You See</span>?
                </>
              )}
            </h2>

            <p 
              className="text-lg md:text-xl text-inverse-fg-muted mb-8 max-w-xl"
              style={{ lineHeight: isRTL ? '2' : '1.7' }}
            >
              {language === 'ar' 
                ? 'دعنا نحول رؤيتك إلى واقع رقمي مميز. فريقنا جاهز لمساعدتك في بناء حلول مبتكرة تناسب احتياجاتك.'
                : 'Let\'s transform your vision into a distinctive digital reality. Our team is ready to help you build innovative solutions tailored to your needs.'}
            </p>

            {/* Trust Row */}
            {trustStats.length > 0 && (
              <div className={`flex flex-wrap gap-6 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {trustStats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-inverse-accent">{stat.value}</span>
                    <span className="text-sm text-inverse-fg-muted">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              {/* Primary: Contact Us Now */}
              <motion.div
                style={!prefersReducedMotion ? { x: buttonX, y: buttonY } : {}}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to="/contact"
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold text-base overflow-hidden transition-all hover:shadow-lg hover:shadow-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--inverse-bg)] whitespace-nowrap w-full sm:w-auto"
                >
                  {/* Shine sweep */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  
                  <span className="relative z-10">
                    {language === 'ar' ? 'تواصل معنا الآن' : 'Contact Us Now'}
                  </span>
                  <ArrowRight 
                    className={`relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} 
                  />
                </Link>
              </motion.div>

              {/* Secondary: WhatsApp (only if number set) */}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-inverse-glass-bg border border-inverse-glass-border rounded-xl font-semibold text-base text-inverse-fg hover:bg-inverse-glass-hover hover:border-inverse-accent transition-all focus:outline-none focus:ring-2 focus:ring-inverse-accent whitespace-nowrap w-full sm:w-auto"
                >
                  <MessageCircle className="w-5 h-5 text-inverse-accent" />
                  {language === 'ar' ? 'دردش على واتساب' : 'Chat on WhatsApp'}
                </a>
              )}
            </div>

            {/* Contact Links (only if set) */}
            {(email || phone) && (
              <div className={`flex flex-wrap gap-6 mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-2 text-sm text-inverse-fg-muted hover:text-inverse-accent transition-colors focus:outline-none focus:ring-2 focus:ring-inverse-accent rounded"
                  >
                    <Mail className="w-4 h-4" />
                    <span dir="ltr">{email}</span>
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-2 text-sm text-inverse-fg-muted hover:text-inverse-accent transition-colors focus:outline-none focus:ring-2 focus:ring-inverse-accent rounded"
                  >
                    <Phone className="w-4 h-4" />
                    <span dir="ltr">{phone}</span>
                  </a>
                )}
              </div>
            )}
          </motion.div>

          {/* Right: Device Stage */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`relative ${isRTL ? 'lg:col-start-1 lg:row-start-1' : ''}`}
          >
            <DeviceStage 
              mockups={publishedMockups}
              currentIndex={currentMockupIndex}
              prefersReducedMotion={prefersReducedMotion}
            />
          </motion.div>

        </div>
      </div>
    </InverseSurface>
  );
};

/**
 * DeviceStage - Laptop + Phone mockup with cycling screenshots
 */
const DeviceStage = ({ mockups, currentIndex, prefersReducedMotion }) => {
  const currentMockup = mockups[currentIndex];
  const hasImage = currentMockup?.thumbnail_url;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Reserve space to prevent CLS */}
      <div className="aspect-[4/3] relative">
        
        {/* Laptop */}
        <motion.div
          className="absolute top-0 left-0 right-0 w-full"
          style={!prefersReducedMotion ? {
            transformStyle: 'preserve-3d',
          } : {}}
          whileHover={!prefersReducedMotion ? {
            rotateY: -3,
            rotateX: 2,
            scale: 1.02,
          } : {}}
          transition={{ duration: 0.3 }}
        >
          {/* Laptop frame */}
          <div className="relative mx-auto w-[85%] rounded-t-xl overflow-hidden bg-slate-800 shadow-2xl border-4 border-slate-700">
            {/* Screen bezel */}
            <div className="aspect-video bg-slate-900 p-2">
              {/* Screen content */}
              <div className="w-full h-full rounded-sm overflow-hidden bg-white relative">
                {hasImage ? (
                  <motion.img
                    key={currentMockup.id}
                    src={currentMockup.thumbnail_url}
                    alt={currentMockup.title_en || 'Mockup preview'}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                ) : (
                  <CSSMiniScreen type="browser" />
                )}
                
                {/* Glass reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Camera notch */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-950/50" />
          </div>

          {/* Laptop base */}
          <div className="w-full h-2 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-lg shadow-lg" />

          {/* Floor glow */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-inverse-accent/20 blur-xl rounded-full" />
        </motion.div>

        {/* Phone */}
        <motion.div
          className="absolute bottom-0 right-0 w-[30%]"
          style={!prefersReducedMotion ? {
            transformStyle: 'preserve-3d',
          } : {}}
          whileHover={!prefersReducedMotion ? {
            rotateY: 5,
            rotateX: -2,
            scale: 1.05,
          } : {}}
          transition={{ duration: 0.3 }}
        >
          {/* Phone frame */}
          <div className="relative rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl border-4 border-slate-800">
            {/* Screen */}
            <div className="aspect-[9/19.5] bg-white relative">
              {hasImage ? (
                <motion.img
                  key={currentMockup.id}
                  src={currentMockup.thumbnail_url}
                  alt={currentMockup.title_en || 'Mobile mockup'}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              ) : (
                <CSSMiniScreen type="mobile" />
              )}
              
              {/* Glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1/3 h-4 bg-slate-900 rounded-b-2xl" />
          </div>
        </motion.div>

      </div>
    </div>
  );
};

/**
 * CSSMiniScreen - Fallback CSS-only screens when no mockup images
 */
const CSSMiniScreen = ({ type }) => {
  if (type === 'browser') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
        {/* Browser chrome */}
        <div className="flex items-center gap-1 px-2 py-1.5 bg-slate-200 border-b border-slate-300">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
        </div>
        {/* Content placeholder */}
        <div className="flex-1 p-2 space-y-1">
          <div className="h-1.5 bg-slate-300 rounded w-3/4" />
          <div className="h-1.5 bg-slate-300 rounded w-1/2" />
          <div className="h-8 bg-slate-200 rounded mt-2" />
        </div>
      </div>
    );
  }

  // Mobile
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col p-2">
      <div className="h-2 bg-slate-300 rounded w-2/3 mb-2" />
      <div className="flex-1 bg-slate-200 rounded" />
      <div className="flex gap-1 mt-2">
        <div className="flex-1 h-2 bg-slate-300 rounded" />
        <div className="flex-1 h-2 bg-slate-300 rounded" />
        <div className="flex-1 h-2 bg-slate-300 rounded" />
      </div>
    </div>
  );
};

export default PremiumCTA;