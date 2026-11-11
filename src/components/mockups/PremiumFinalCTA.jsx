/**
 * PremiumFinalCTA - Round 7: Premium conversion-focused final CTA
 * 
 * FIXES:
 * - Empty stage: Now uses correct field (image_url), shows skeleton while loading, CSS fallback
 * - Primary button: High contrast frost/white fill (#EEF2F4) with deep slate text (#0A1525)
 * - WhatsApp button: Visible when whatsapp_number is set in siteSettings
 * - Heading: Balanced with gradient + hand-drawn shimmer underline
 * 
 * PREMIUM DESIGN:
 * - Richer aurora blobs, perspective grid floor, light beam sweep, sparkles, shapes, grain
 * - Floating glass UI chips around device (Live, palette, component card)
 * - Balanced 5/12 text + 7/12 stage layout, 96px vertical padding desktop
 * - Trust row with count-up animation, real mockup/category counts
 * - Staged reveal: text → buttons → stage slide with overshoot
 * - Device stage: tilt/parallax on desktop, floor glow, premium bezels
 * - Email/Phone text links (LTR-isolated)
 * - Curved divider from section above, glowing hairline
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, MessageCircle, Mail, Phone, Sparkles, Palette, LayoutGrid } from 'lucide-react';
import InverseSurface from '@/components/ui/InverseSurface';
import { Button } from '@/components/ui/button';

const PremiumFinalCTA = ({
  mockups = [],
  categories = [],
  siteSettings = {},
  language = 'en',
  isDark = false
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [currentMockupIndex, setCurrentMockupIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [buttonMagnetPos, setButtonMagnetPos] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(0);
  const stageRef = useRef(null);
  const sectionRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Check for save data / low power
  const saveData = typeof navigator !== 'undefined' && 
    (navigator?.connection?.saveData || navigator?.connection?.effectiveType === 'slow-2g');
  const disableHeavyEffects = shouldReduceMotion || saveData;
  
  // Get published mockups with images - FIX: use correct field name
  const publishedMockups = mockups.filter(m => 
    (m.published || m.is_active) && m.image_url
  );
  
  const mockupCount = publishedMockups.length;
  
  // Get unique published categories - FIX: ensure categories is array
  const publishedCategories = Array.isArray(categories) ? categories.filter(c => 
    mockups.some(m => (m.published || m.is_active) && m.category_slug === c.slug)
  ) : [];
  const categoryCount = publishedCategories.length;
  
  // Cycle through mockup images
  useEffect(() => {
    if (publishedMockups.length <= 1 || !isVisible) return;
    
    const interval = setInterval(() => {
      setCurrentMockupIndex(prev => (prev + 1) % publishedMockups.length);
      setImageLoaded(false); // Reset for next image
    }, 3500); // 3.5s cycle
    
    return () => clearInterval(interval);
  }, [publishedMockups.length, isVisible]);
  
  // Count-up animation for trust row
  useEffect(() => {
    if (!isVisible || mockupCount === 0) return;
    
    let frame = 0;
    const totalFrames = 30;
    const increment = mockupCount / totalFrames;
    
    const timer = setInterval(() => {
      frame++;
      if (frame >= totalFrames) {
        setDisplayedCount(mockupCount);
        clearInterval(timer);
      } else {
        setDisplayedCount(Math.floor(increment * frame));
      }
    }, 40);
    
    return () => clearInterval(timer);
  }, [isVisible, mockupCount]);
  
  // IntersectionObserver for staged reveal
  useEffect(() => {
    if (shouldReduceMotion) {
      setIsVisible(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '-80px'
      }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, [shouldReduceMotion]);
  
  // Parallax/tilt for stage (desktop only, mouse move)
  useEffect(() => {
    if (disableHeavyEffects || typeof window === 'undefined' || 'ontouchstart' in window) return;
    
    const handleMouseMove = (e) => {
      if (stageRef.current) {
        const rect = stageRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePos({ x: x * 2, y: y * 2 }); // -2 to +2 range
      }
    };
    
    const stage = stageRef.current;
    if (stage) {
      stage.addEventListener('mousemove', handleMouseMove);
      return () => stage.removeEventListener('mousemove', handleMouseMove);
    }
  }, [disableHeavyEffects]);
  
  // Magnetic effect for primary button (desktop only)
  useEffect(() => {
    if (disableHeavyEffects || typeof window === 'undefined' || 'ontouchstart' in window) return;
    
    const handleMouseMove = (e) => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        const distance = Math.sqrt(x * x + y * y);
        
        if (distance < 120) {
          const strength = 1 - distance / 120;
          setButtonMagnetPos({ 
            x: x * strength * 0.3, 
            y: y * strength * 0.3 
          });
        } else {
          setButtonMagnetPos({ x: 0, y: 0 });
        }
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [disableHeavyEffects]);
  
  // Get contact channels from site settings - FIX: handle null/undefined
  const whatsapp = siteSettings?.whatsapp_number || null;
  const email = siteSettings?.primary_email || null;
  const phone = siteSettings?.primary_phone || null;
  
  // Create WhatsApp link with prefilled message
  const whatsappLink = whatsapp ? 
    `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
      language === 'ar' 
        ? 'مرحباً! أنا مهتم بأحد تصاميمكم الجاهزة. أود مناقشة خيارات التخصيص.'
        : 'Hello! I\'m interested in one of your ready-made designs. I\'d like to discuss customization options.'
    )}` 
    : null;
  
  const currentMockup = publishedMockups[currentMockupIndex];
  const mockupImage = currentMockup?.image_url; // FIX: use correct field

  return (
    <InverseSurface 
      ref={sectionRef}
      className="relative overflow-hidden" 
      style={{ 
        paddingTop: 'clamp(64px, 8vw, 96px)',
        paddingBottom: 'clamp(64px, 8vw, 96px)',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 5rem))'
      }}
      withTopGlow={false}
      withGrid={false}
    >
      {/* Curved Divider from Section Above */}
      <div 
        className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, transparent 100%)'
        }}
        aria-hidden="true"
      />
      
      {/* Top Glowing Hairline */}
      <div 
        className="absolute top-0 left-0 right-0 h-px opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, var(--inverse-accent) 50%, transparent 100%)'
        }}
        aria-hidden="true"
      />
      
      {/* Background Effects */}
      {!disableHeavyEffects && (
        <>
          {/* Richer Aurora Blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <motion.div
              className="absolute w-[700px] h-[700px] rounded-full blur-[120px]"
              style={{
                background: 'radial-gradient(circle, rgba(92, 126, 143, 0.25) 0%, transparent 65%)',
                top: '-15%',
                left: language === 'ar' ? 'auto' : '-8%',
                right: language === 'ar' ? '-8%' : 'auto'
              }}
              animate={isVisible ? {
                x: [0, 50, 0],
                y: [0, 70, 0],
                scale: [1, 1.12, 1]
              } : {}}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full blur-[110px]"
              style={{
                background: 'radial-gradient(circle, rgba(111, 211, 216, 0.2) 0%, transparent 65%)',
                bottom: '-10%',
                right: language === 'ar' ? 'auto' : '-5%',
                left: language === 'ar' ? '-5%' : 'auto'
              }}
              animate={isVisible ? {
                x: [0, -60, 0],
                y: [0, -65, 0],
                scale: [1, 1.18, 1]
              } : {}}
              transition={{
                duration: 24,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </div>
          
          {/* Perspective Grid Floor Under Stage */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-[400px] opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, var(--inverse-accent) 1px, transparent 1px),
                linear-gradient(to bottom, var(--inverse-accent) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
              transform: 'perspective(600px) rotateX(60deg)',
              transformOrigin: 'bottom center'
            }}
            aria-hidden="true"
          />
          
          {/* Light Beam Sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(110deg, transparent 0%, rgba(111, 211, 216, 0.08) 45%, rgba(111, 211, 216, 0.12) 50%, rgba(111, 211, 216, 0.08) 55%, transparent 100%)',
              opacity: isVisible ? 1 : 0
            }}
            animate={isVisible ? {
              x: ['-100%', '200%']
            } : {}}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 2
            }}
            aria-hidden="true"
          />
          
          {/* Subtle Sparkles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${15 + (i % 4) * 22}%`,
                  color: 'var(--inverse-accent)',
                  opacity: 0
                }}
                animate={isVisible ? {
                  opacity: [0, 0.4, 0],
                  scale: [0.8, 1.2, 0.8]
                } : {}}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.6
                }}
              >
                <Sparkles className="w-3 h-3" />
              </motion.div>
            ))}
          </div>
          
          {/* Drifting Shapes (Rounded Squares, Rings, Plus, Dots) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={`shape-${i}`}
                className="absolute opacity-[0.025]"
                style={{
                  left: `${8 + i * 10}%`,
                  top: `${18 + (i % 3) * 28}%`,
                  color: 'var(--inverse-fg)'
                }}
                animate={isVisible ? {
                  y: [0, -30, 0],
                  rotate: i % 2 === 0 ? [0, 360] : [360, 0],
                  scale: [1, 1.15, 1]
                } : {}}
                transition={{
                  duration: 14 + i * 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.4
                }}
              >
                {i % 4 === 0 && <div className="w-16 h-16 rounded-2xl border-2 border-current" />}
                {i % 4 === 1 && <div className="w-12 h-12 rounded-full border-2 border-current" />}
                {i % 4 === 2 && <div className="text-4xl font-bold">+</div>}
                {i % 4 === 3 && <div className="w-3 h-3 rounded-full bg-current" />}
              </motion.div>
            ))}
          </div>
          
          {/* Grain Texture */}
          <div 
            className="absolute inset-0 opacity-[0.018] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}
            aria-hidden="true"
          />
        </>
      )}
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center ${
          language === 'ar' ? 'lg:grid-flow-dense' : ''
        }`}>
          
          {/* Left Content: 5/12 width (Right in RTL) */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className={`lg:col-span-5 space-y-6 ${
              language === 'ar' ? 'lg:col-start-8 text-right' : 'text-left'
            }`}
          >
            {/* Eyebrow Chip with Pulsing Dot */}
            <div className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full backdrop-blur-md ${
              language === 'ar' ? 'flex-row-reverse' : ''
            }`}
            style={{
              backgroundColor: 'rgba(111, 211, 216, 0.08)',
              border: '1px solid rgba(111, 211, 216, 0.2)'
            }}>
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--inverse-accent)' }}
                animate={!shouldReduceMotion ? {
                  opacity: [0.5, 1, 0.5],
                  scale: [0.9, 1.1, 0.9]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              <span className="text-sm font-semibold" style={{ color: 'var(--inverse-accent)' }}>
                {language === 'ar' ? 'جاهز للبدء؟' : 'Ready to Start?'}
              </span>
            </div>
            
            {/* Heading with Gradient + Hand-Drawn Underline */}
            <div className="relative">
              <h2 
                className="font-extrabold leading-[1.1]"
                style={{ 
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  textWrap: 'balance',
                  maxWidth: language === 'ar' ? '100%' : '18ch',
                  color: 'var(--inverse-fg)',
                  letterSpacing: language === 'ar' ? '0' : '-0.02em',
                  fontWeight: 800
                }}
              >
                {language === 'ar' ? (
                  <>
                    وجدت تصميماً{' '}
                    <span 
                      className="relative inline-block"
                      style={{
                        background: 'linear-gradient(135deg, rgba(92, 126, 143, 1) 0%, rgba(111, 211, 216, 1) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      يعجبك؟
                      {/* Hand-drawn underline with shimmer */}
                      {!shouldReduceMotion && (
                        <motion.svg
                          className="absolute -bottom-1 left-0 w-full"
                          viewBox="0 0 120 8"
                          fill="none"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={isVisible ? { pathLength: 1, opacity: 0.6 } : {}}
                          transition={{ duration: 1.2, delay: 0.3, ease: 'easeInOut' }}
                          style={{ overflow: 'visible' }}
                        >
                          <motion.path
                            d="M 2 6 Q 30 3, 60 4 T 118 5"
                            stroke="url(#shimmer-gradient)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            animate={isVisible ? {
                              strokeDashoffset: [0, -20]
                            } : {}}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: 'linear'
                            }}
                            style={{
                              strokeDasharray: '10 10'
                            }}
                          />
                          <defs>
                            <linearGradient id="shimmer-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgba(92, 126, 143, 0.4)" />
                              <stop offset="50%" stopColor="rgba(111, 211, 216, 0.8)" />
                              <stop offset="100%" stopColor="rgba(92, 126, 143, 0.4)" />
                            </linearGradient>
                          </defs>
                        </motion.svg>
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    Found a Design{' '}
                    <span 
                      className="relative inline-block"
                      style={{
                        background: 'linear-gradient(135deg, rgba(92, 126, 143, 1) 0%, rgba(111, 211, 216, 1) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      You Like?
                      {/* Hand-drawn underline with shimmer */}
                      {!shouldReduceMotion && (
                        <motion.svg
                          className="absolute -bottom-1 left-0 w-full"
                          viewBox="0 0 120 8"
                          fill="none"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={isVisible ? { pathLength: 1, opacity: 0.6 } : {}}
                          transition={{ duration: 1.2, delay: 0.3, ease: 'easeInOut' }}
                          style={{ overflow: 'visible' }}
                        >
                          <motion.path
                            d="M 2 6 Q 30 3, 60 4 T 118 5"
                            stroke="url(#shimmer-gradient)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            animate={isVisible ? {
                              strokeDashoffset: [0, -20]
                            } : {}}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: 'linear'
                            }}
                            style={{
                              strokeDasharray: '10 10'
                            }}
                          />
                          <defs>
                            <linearGradient id="shimmer-gradient-en" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgba(92, 126, 143, 0.4)" />
                              <stop offset="50%" stopColor="rgba(111, 211, 216, 0.8)" />
                              <stop offset="100%" stopColor="rgba(92, 126, 143, 0.4)" />
                            </linearGradient>
                          </defs>
                        </motion.svg>
                      )}
                    </span>
                  </>
                )}
              </h2>
            </div>
            
            {/* Supporting Line */}
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--inverse-fg-muted)' }}>
              {language === 'ar'
                ? 'دعنا نخصصه لعلامتك التجارية ونطلقه لك. ابدأ المحادثة اليوم'
                : 'Let\'s customize it to your brand and launch it for you. Start the conversation today'}
            </p>
            
            {/* Buttons - Staged Reveal */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
              className={`flex flex-col sm:flex-row gap-4 pt-4 ${
                language === 'ar' ? 'sm:flex-row-reverse' : ''
              }`}
            >
              {/* Primary Button - HIGH CONTRAST with Magnetic + Shine */}
              <motion.div
                ref={buttonRef}
                style={!disableHeavyEffects ? {
                  transform: `translate(${buttonMagnetPos.x}px, ${buttonMagnetPos.y}px)`,
                  transition: 'transform 0.2s ease-out'
                } : {}}
              >
                <Button
                  onClick={() => {
                    // Smooth scroll to contact section
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                      window.location.href = '/#contact';
                    }
                  }}
                  size="lg"
                  className={`group relative overflow-hidden px-8 rounded-2xl font-semibold text-base shadow-lg hover:shadow-2xl transition-all duration-300 ${
                    language === 'ar' ? 'flex-row-reverse' : ''
                  }`}
                  style={{
                    height: '48px',
                    minHeight: '48px',
                    whiteSpace: 'nowrap',
                    backgroundColor: '#EEF2F4',
                    color: '#0A1525',
                    border: 'none'
                  }}
                  aria-label={language === 'ar' ? 'تواصل معنا الآن' : 'Contact Us Now'}
                >
                  {/* Shine Sweep Effect */}
                  {!shouldReduceMotion && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{
                        x: ['-100%', '200%']
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 4,
                        ease: 'easeInOut'
                      }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{language === 'ar' ? 'تواصل معنا الآن' : 'Contact Us Now'}</span>
                  <ArrowRight 
                    className={`relative z-10 w-5 h-5 transition-transform group-hover:translate-x-0.5 ${
                      language === 'ar' ? 'mr-2 rotate-180 group-hover:-translate-x-0.5' : 'ml-2'
                    }`}
                    aria-hidden="true"
                  />
                </Button>
              </motion.div>
              
              {/* Secondary Button - WhatsApp Glass (only if set) */}
              {whatsappLink && (
                <Button
                  onClick={() => window.open(whatsappLink, '_blank', 'noopener,noreferrer')}
                  variant="outline"
                  size="lg"
                  className={`px-6 rounded-2xl font-semibold text-base backdrop-blur-md hover:backdrop-blur-lg transition-all duration-300 ${
                    language === 'ar' ? 'flex-row-reverse' : ''
                  }`}
                  style={{
                    height: '48px',
                    minHeight: '48px',
                    whiteSpace: 'nowrap',
                    backgroundColor: 'rgba(111, 211, 216, 0.08)',
                    borderColor: 'rgba(111, 211, 216, 0.25)',
                    borderWidth: '1.5px',
                    color: 'var(--inverse-fg)'
                  }}
                  aria-label={language === 'ar' ? 'دردش على واتساب' : 'Chat on WhatsApp'}
                >
                  <MessageCircle className={`w-5 h-5 ${language === 'ar' ? 'mr-2.5' : 'ml-2.5'}`} aria-hidden="true" />
                  <span>{language === 'ar' ? 'دردش على واتساب' : 'Chat on WhatsApp'}</span>
                </Button>
              )}
            </motion.div>
            
            {/* Email/Phone Text Links (only if set) */}
            {(email || phone) && (
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`flex flex-wrap items-center gap-4 text-sm ${
                  language === 'ar' ? 'flex-row-reverse' : ''
                }`}
                style={{ color: 'var(--inverse-fg-muted)' }}
              >
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                  >
                    <Mail className="w-4 h-4" aria-hidden="true" />
                    <span dir="ltr">{email}</span>
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                  >
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    <span dir="ltr">{phone}</span>
                  </a>
                )}
              </motion.div>
            )}
            
            {/* Trust Row with Count-Up + Categories */}
            {(mockupCount > 0 || categoryCount > 0) && (
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
                className={`flex flex-wrap items-center gap-6 pt-2 text-sm ${
                  language === 'ar' ? 'flex-row-reverse' : ''
                }`}
                style={{ color: 'var(--inverse-fg-muted)' }}
              >
                {mockupCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ backgroundColor: 'var(--inverse-accent)' }}
                    />
                    <span>
                      <span className="font-bold tabular-nums" style={{ color: 'var(--inverse-fg)' }}>
                        {displayedCount}
                      </span>{' '}
                      {language === 'ar' ? 'تصميم جاهز' : 'ready-made designs'}
                    </span>
                  </div>
                )}
                {categoryCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ backgroundColor: 'var(--inverse-accent)' }}
                    />
                    <span>
                      <span className="font-bold" style={{ color: 'var(--inverse-fg)' }}>
                        {categoryCount}
                      </span>{' '}
                      {language === 'ar' ? 'صناعة' : 'industries'}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
          
          {/* Right: Device Stage 7/12 width (Left in RTL) - Slide In with Overshoot */}
          <motion.div
            initial={shouldReduceMotion ? {} : { 
              opacity: 0, 
              x: language === 'ar' ? -80 : 80,
              scale: 0.95 
            }}
            animate={isVisible ? { 
              opacity: 1, 
              x: 0,
              scale: 1 
            } : {}}
            transition={{ 
              duration: 0.9, 
              delay: 0.35,
              type: 'spring',
              stiffness: 80,
              damping: 15
            }}
            className={`lg:col-span-7 ${
              language === 'ar' ? 'lg:col-start-1 lg:row-start-1' : ''
            }`}
          >
            <div
              ref={stageRef}
              className="relative"
              style={!disableHeavyEffects && typeof window !== 'undefined' && !('ontouchstart' in window) ? {
                transform: `perspective(1200px) rotateX(${mousePos.y * 2.5}deg) rotateY(${mousePos.x * 2.5}deg)`,
                transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transformStyle: 'preserve-3d'
              } : {}}
            >
              {/* Floor Glow */}
              <div 
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-4/5 h-40 blur-[80px] opacity-25 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse, rgba(111, 211, 216, 0.6) 0%, transparent 70%)'
                }}
                aria-hidden="true"
              />
              
              {/* Device Frame with Mockup */}
              <div className="relative">
                {/* Reserve space to avoid CLS */}
                <div className="aspect-[16/10] relative">
                  {/* Show skeleton while image loading */}
                  {!imageLoaded && mockupImage && (
                    <div 
                      className="absolute inset-0 rounded-2xl animate-pulse"
                      style={{
                        backgroundColor: 'rgba(111, 211, 216, 0.05)',
                        border: '2px solid rgba(111, 211, 216, 0.15)'
                      }}
                      aria-label={language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    />
                  )}
                  
                  {/* Laptop Device Frame */}
                  <div 
                    className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl"
                    style={{
                      backgroundColor: 'rgba(10, 21, 37, 0.6)',
                      border: '3px solid rgba(111, 211, 216, 0.2)',
                      boxShadow: `
                        0 20px 60px rgba(0, 0, 0, 0.4),
                        0 0 0 1px rgba(111, 211, 216, 0.1) inset,
                        0 0 40px rgba(111, 211, 216, 0.15)
                      `
                    }}
                  >
                    {mockupImage ? (
                      <img
                        src={mockupImage}
                        alt={currentMockup?.title_en || currentMockup?.title || (language === 'ar' ? 'معاينة التصميم' : 'Design preview')}
                        className="w-full h-full object-cover object-top transition-opacity duration-700"
                        style={{ opacity: imageLoaded ? 1 : 0 }}
                        onLoad={() => setImageLoaded(true)}
                        loading="lazy"
                      />
                    ) : (
                      // CSS Mini Template Fallback (never empty)
                      <div className="w-full h-full p-6 flex flex-col gap-4" style={{ backgroundColor: 'rgba(15, 28, 45, 0.8)' }}>
                        <div 
                          className="h-10 rounded-lg" 
                          style={{ backgroundColor: 'rgba(111, 211, 216, 0.15)' }}
                        />
                        <div 
                          className="h-6 rounded-lg w-2/3" 
                          style={{ backgroundColor: 'rgba(111, 211, 216, 0.08)' }}
                        />
                        <div className="grid grid-cols-3 gap-3 pt-4 flex-1">
                          {[1, 2, 3].map(i => (
                            <div 
                              key={i} 
                              className="rounded-lg" 
                              style={{ backgroundColor: 'rgba(111, 211, 216, 0.12)' }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Screen Reflection */}
                    {!shouldReduceMotion && (
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, transparent 50%)',
                          opacity: 0.4
                        }}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  
                  {/* Floating Glass UI Chips around devices */}
                  {!shouldReduceMotion && publishedMockups.length > 0 && (
                    <>
                      {/* Live Chip (Top Right/Left) */}
                      <motion.div
                        className="absolute -top-4 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg"
                        style={{
                          backgroundColor: 'rgba(111, 211, 216, 0.12)',
                          border: '1px solid rgba(111, 211, 216, 0.25)',
                          [language === 'ar' ? 'left' : 'right']: '-1rem',
                          zIndex: 10
                        }}
                        animate={{
                          y: [0, -8, 0],
                          rotate: [0, 2, 0]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: '#10b981' }}
                            animate={{
                              opacity: [0.5, 1, 0.5],
                              scale: [0.9, 1.1, 0.9]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                          />
                          <span className="text-xs font-semibold" style={{ color: 'var(--inverse-fg)' }}>
                            Live
                          </span>
                        </div>
                      </motion.div>
                      
                      {/* Palette Swatch Card (Bottom Left/Right) */}
                      <motion.div
                        className="absolute -bottom-6 backdrop-blur-md rounded-xl p-2.5 shadow-lg"
                        style={{
                          backgroundColor: 'rgba(111, 211, 216, 0.1)',
                          border: '1px solid rgba(111, 211, 216, 0.2)',
                          [language === 'ar' ? 'right' : 'left']: '1rem',
                          zIndex: 10
                        }}
                        animate={{
                          y: [0, 6, 0],
                          rotate: [0, -1.5, 0]
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 0.5
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5" style={{ color: 'var(--inverse-accent)' }} />
                          <div className="flex gap-1">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#5C7E8F' }} />
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#6FD3D8' }} />
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#EEF2F4' }} />
                          </div>
                        </div>
                      </motion.div>
                      
                      {/* Component Card (Middle Right/Left) */}
                      <motion.div
                        className="absolute top-1/3 backdrop-blur-md rounded-lg p-2 shadow-lg"
                        style={{
                          backgroundColor: 'rgba(111, 211, 216, 0.08)',
                          border: '1px solid rgba(111, 211, 216, 0.2)',
                          [language === 'ar' ? 'left' : 'right']: '-2.5rem',
                          zIndex: 9
                        }}
                        animate={{
                          x: [0, language === 'ar' ? 6 : -6, 0],
                          y: [0, -5, 0]
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 1
                        }}
                      >
                        <LayoutGrid className="w-5 h-5" style={{ color: 'var(--inverse-accent)' }} />
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </InverseSurface>
  );
};

export default PremiumFinalCTA;
