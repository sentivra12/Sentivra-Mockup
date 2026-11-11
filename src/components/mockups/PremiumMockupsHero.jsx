import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import MockupsHeroShowcase from './MockupsHeroShowcase';
import FloatingCategoryChip from './FloatingCategoryChip';
import HandwrittenAnnotation from './HandwrittenAnnotation';
import { useTranslation } from '@/i18n/useTranslation';
import { useAllPageContent } from '@/hooks/useContent';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';

/**
 * PremiumMockupsHero - Complete premium hero for Mockups page
 * 
 * Features:
 * - Light mode: bright airy surface with soft aurora blobs
 * - Dark mode: deep slate with glowing blobs
 * - Device showcase with auto-cycling mockups
 * - Floating category chips
 * - Handwritten annotation
 * - Real stats from database
 * - Scroll cue
 * - Full bilingual support
 */
const PremiumMockupsHero = ({ mockups = [], categories = [] }) => {
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  const { data: pageContent = [] } = useAllPageContent('mockups');

  // Helper function to get content by key
  const getContent = (key) => {
    const content = pageContent.find(c => c.content_key === key);
    return content ? (isRTL ? content.content_ar : content.content_en) : key;
  };

  // Get CMS content
  const eyebrow = getContent('mockups-hero-eyebrow');
  const title = getContent('mockups-hero-title');
  const description = getContent('mockups-hero-description');
  const primaryButtonText = getContent('mockups-hero-primary-button') || 'Find Your Mockup';
  const secondaryButtonText = getContent('mockups-hero-secondary-button') || 'Contact Us';
  const handwrittenNote = getContent('mockups-hero-handwritten-note') || 'Modern Designs\nFor Your Business';
  
  // Calculate real stats
  const publishedMockupsCount = mockups.filter(m => m.is_active).length;
  const industriesCount = categories.filter(c => 
    c.is_active && 
    c.slug !== 'all' && 
    mockups.some(m => m.is_active && m.category_id === c.id)
  ).length;

  // Get top 5 active categories for floating chips (excluding 'all')
  const floatingCategories = categories
    .filter(c => c.is_active && c.slug !== 'all')
    .slice(0, 5);

  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="relative min-h-[85vh] md:min-h-[92vh] flex items-center overflow-hidden">
      {/* Background: Light mode = bright with aurora, Dark mode = deep with glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-frost-soft to-frost dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        {/* Aurora blobs - Light mode */}
        {!prefersReducedMotion && (
          <>
            <motion.div
              className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-primary/[0.15] dark:bg-primary/[0.25] blur-[120px]"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.15, 0.2, 0.15] 
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute top-[30%] right-[10%] w-[400px] h-[400px] rounded-full bg-cyan-400/[0.12] dark:bg-cyan-400/[0.2] blur-[100px]"
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.12, 0.18, 0.12] 
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
            <motion.div
              className="absolute bottom-[20%] left-[15%] w-[350px] h-[350px] rounded-full bg-purple-400/[0.1] dark:bg-purple-400/[0.18] blur-[90px]"
              animate={{ 
                scale: [1, 1.12, 1],
                opacity: [0.1, 0.15, 0.1] 
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            />
          </>
        )}

        {/* Faint line grid with radial mask */}
        <div 
          className="absolute inset-0 opacity-[0.15] dark:opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 70%)',
          }}
        />

        {/* Subtle grain texture */}
        <div 
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025] mix-blend-overlay"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'1.5\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
          }}
        />

        {/* Drifting geometric shapes */}
        {!prefersReducedMotion && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Rounded squares */}
            <motion.div
              className="absolute top-[15%] left-[12%] w-16 h-16 rounded-xl border-2 border-primary/20 dark:border-primary/30"
              animate={{ 
                y: [0, -30, 0],
                rotate: [0, 180, 360] 
              }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute bottom-[25%] right-[18%] w-12 h-12 rounded-lg border-2 border-cyan-400/20 dark:border-cyan-400/30"
              animate={{ 
                y: [0, 40, 0],
                rotate: [360, 180, 0] 
              }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            />
            
            {/* Rings */}
            <motion.div
              className="absolute top-[45%] right-[8%] w-20 h-20 rounded-full border-2 border-purple-400/20 dark:border-purple-400/30"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2] 
              }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            />
            
            {/* Plus signs */}
            <motion.svg
              className="absolute top-[60%] left-[8%] w-8 h-8 text-primary/20 dark:text-primary/30"
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </motion.svg>
            
            {/* Dots */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary/20 dark:bg-primary/30"
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
                animate={{ 
                  y: [0, -20, 0],
                  opacity: [0.2, 0.4, 0.2] 
                }}
                transition={{ 
                  duration: 8 + i * 2, 
                  repeat: Infinity, 
                  ease: 'easeInOut',
                  delay: i * 0.5 
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={isRTL ? 'lg:order-2' : ''}
          >
            {/* Breadcrumb */}
            <nav className={`flex items-center gap-2 text-sm text-text-muted mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Link to="/" className="hover:text-primary transition-colors">
                {t('nav.home')}
              </Link>
              <span>/</span>
              <span className="text-primary-deep dark:text-white font-medium">
                {t('nav.mockups')}
              </span>
            </nav>

            {/* Eyebrow */}
            {eyebrow && (
              <motion.div
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6"
              >
                {eyebrow}
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-deep dark:text-white leading-tight mb-6"
            >
              {title || 'Ready-Made Website Mockups'}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-text-muted leading-relaxed mb-8"
            >
              {description}
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={`flex flex-col sm:flex-row gap-4 mb-8 ${isRTL ? 'sm:flex-row-reverse' : ''}`}
            >
              <a href="#mockups-filter">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                >
                  {primaryButtonText}
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </Button>
              </a>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-primary/30 text-primary-deep dark:text-white hover:bg-primary/5 px-8 py-6 rounded-lg backdrop-blur-sm w-full sm:w-auto"
                >
                  {secondaryButtonText}
                </Button>
              </Link>
            </motion.div>

            {/* Real stats */}
            {(publishedMockupsCount > 0 || industriesCount > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className={`flex items-center gap-8 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {publishedMockupsCount > 0 && (
                  <div>
                    <div className="text-3xl font-bold text-primary mb-1">
                      <bdi dir="ltr">{publishedMockupsCount}</bdi>
                    </div>
                    <div className="text-text-muted">
                      {getContent('mockups-stats-designs-label') || 'Ready Designs'}
                    </div>
                  </div>
                )}
                {industriesCount > 0 && (
                  <div>
                    <div className="text-3xl font-bold text-primary mb-1">
                      <bdi dir="ltr">{industriesCount}</bdi>
                    </div>
                    <div className="text-text-muted">
                      {getContent('mockups-stats-industries-label') || 'Industries'}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Right: Showcase with floating chips */}
          <div className={`relative ${isRTL ? 'lg:order-1' : ''}`}>
            <MockupsHeroShowcase mockups={mockups} />
            
            {/* Floating category chips around showcase (desktop only) */}
            {floatingCategories.map((category, index) => (
              <FloatingCategoryChip
                key={category.id}
                category={category}
                index={index}
                total={floatingCategories.length}
                animate={!prefersReducedMotion}
              />
            ))}

            {/* Handwritten annotation */}
            <HandwrittenAnnotation
              text={handwrittenNote}
              className={isRTL ? 'top-12 left-8' : 'top-12 right-8'}
            />
          </div>
        </div>
      </Container>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted"
      >
        <span className="text-sm font-medium">
          {isRTL ? 'مرر للأسفل' : 'Scroll to explore'}
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>

      {/* Soft gradient edge into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-color-background pointer-events-none" />
    </div>
  );
};

export default PremiumMockupsHero;
