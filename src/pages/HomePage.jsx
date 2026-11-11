import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import { 
  useServices, 
  useClientLogos, 
  useTrustBadges, 
  useProcessSteps, 
  useWhyChooseUs,
  useHero,
  useTestimonials,
  useStats
} from '@/hooks/useContent';
import SectionHeader from '@/components/ui/SectionHeader';
import PremiumMarqueeBand from '@/components/home/PremiumMarqueeBand';
import PremiumHero from '@/components/home/PremiumHero';
import PremiumServices from '@/components/home/PremiumServices';
import PremiumStats from '@/components/home/PremiumStats';
import PremiumTestimonials from '@/components/home/PremiumTestimonials';
import PremiumCTA from '@/components/home/PremiumCTA';
import PageTransition from '@/components/PageTransition';
import TrustedBySection from '@/components/sections/TrustedBySection';
import OurImpactSection from '@/components/sections/OurImpactSection';
import { LoadingState, ErrorState } from '@/components/ui/EmptyState';
import * as LucideIcons from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { SEO, useSEO } from '@/components/SEO';
import '../index.css';

const HomePage = () => {
  const location = useLocation();
  const { t, language } = useTranslation();
  const { getMetadata } = useSEO();
  const seoData = getMetadata('home');

  // Fetch data from Supabase with timeout handling
  const { data: hero, isLoading: heroLoading, error: heroError } = useHero();
  const { data: services = [], isLoading: servicesLoading, error: servicesError } = useServices();
  const { data: testimonials = [], isLoading: testimonialsLoading, error: testimonialsError } = useTestimonials();
  const { data: stats = [], isLoading: statsLoading, error: statsError } = useStats();
  const { data: clientLogos = [], isLoading: logosLoading } = useClientLogos();
  const { data: trustBadges = [], isLoading: badgesLoading } = useTrustBadges();
  const { data: processSteps = [], isLoading: processLoading } = useProcessSteps();
  const { data: whyChooseUs = [], isLoading: whyLoading } = useWhyChooseUs();

  // Helper function to get icon component
  const getIcon = (iconName) => {
    const Icon = LucideIcons[iconName];
    return Icon || LucideIcons.Box;
  };

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.hash]);

  // DON'T block the whole page - render shell and let sections handle their own loading
  // Only check for critical errors that prevent any render
  const hasCriticalError = heroError && servicesError;

  if (hasCriticalError) {
    return (
      <ErrorState 
        error={heroError || servicesError} 
        message={t('common.errorLoading')}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <PageTransition>
      <SEO 
        title={seoData.title}
        description={seoData.description}
        type="website"
      />
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
      </Helmet>

      {/* Premium Hero Section */}
      <PremiumHero hero={hero} trustBadges={trustBadges} />

      {/* Client Logos Section - New Marquee Design */}
      <TrustedBySection />

      {/* Premium Services Section */}
      <PremiumServices services={services} featured={true} />

      {/* Our Impact Section - New Dark Band Design */}
      <OurImpactSection />

      {/* Premium Marquee Band #1 */}
      <PremiumMarqueeBand />

      {/* Premium Testimonials Section */}
      <PremiumTestimonials testimonials={testimonials} />

      {/* Premium Marquee Band #2 */}
      <PremiumMarqueeBand />

      {/* Premium CTA Section */}
      <PremiumCTA />
    </PageTransition>
  );
};

export default HomePage;