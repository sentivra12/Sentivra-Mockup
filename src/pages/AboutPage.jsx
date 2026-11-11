import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { 
  useCountries, 
  useTimeline, 
  useValues, 
  useStats 
} from '@/hooks/useContent';
import PageHero from '@/components/ui/PageHero';
import BrandBand from '@/components/ui/BrandBand';
import CountryCard from '@/components/ui/CountryCard';
import RegionMap from '@/components/ui/RegionMap';
import StatsStrip from '@/components/ui/StatsStrip';
import Timeline from '@/components/ui/Timeline';
import TeamBand from '@/components/ui/TeamBand';
import ValueCard from '@/components/ui/ValueCard';
import CTABand from '@/components/ui/CTABand';
import SectionHeader from '@/components/ui/SectionHeader';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import { useTranslation } from '@/i18n/useTranslation';
import { SEO, useSEO } from '@/components/SEO';

const AboutPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getMetadata } = useSEO();
  const seoData = getMetadata('about');

  // Fetch data from Supabase
  const { data: countries = [], isLoading: countriesLoading } = useCountries();
  const { data: timelineMilestones = [], isLoading: timelineLoading } = useTimeline();
  const { data: values = [], isLoading: valuesLoading } = useValues();
  const { data: stats = [], isLoading: statsLoading } = useStats();

  // Hardcoded team avatars (could be moved to database if needed)
  const teamAvatars = [
    { id: 1, name: 'Team Member 1', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Team Member 2', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Team Member 3', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: 4, name: 'Team Member 4', avatar: 'https://i.pravatar.cc/150?img=4' }
  ];

  const handleScrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Show loading state
  if (countriesLoading || timelineLoading || valuesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
    >
      <SEO 
        title={seoData.title}
        description={seoData.description}
        type="website"
      />
      <Helmet>
        <title>{seoData.title}</title>
        <meta 
          name="description" 
          content={seoData.description} 
        />
      </Helmet>

      {/* Hero Section with Floating Card */}
      <PageHero
        breadcrumbs={[
          { label: t('nav.home'), href: '/' },
          { label: t('nav.about') }
        ]}
        label={t('about.hero.label')}
        title={t('about.hero.title')}
        titleAccent={t('about.hero.titleAccent')}
        description={t('about.hero.description')}
        primaryButton={{
          label: t('about.hero.primaryButton'),
          href: '/#contact'
        }}
        secondaryButton={{
          label: t('about.hero.secondaryButton'),
          onClick: () => handleScrollToSection('our-story')
        }}
        backgroundImage="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop"
        floatingCard={{
          title: t('about.hero.floatingCardTitle')
        }}
        teamAvatars={teamAvatars}
      />

      {/* Brand Logo Strip with Arrows */}
      <BrandBand withArrows={true} />

      {/* Our Presence Section */}
      <Section spacing="xl" className="bg-frost-soft">
        <Container>
          {/* Desktop: 3-column layout | Mobile: stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column - Label, Title, Description, Button */}
            <div className="lg:col-span-3 space-y-6">
              <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider">
                OUR PRESENCE
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-primary-deep leading-tight">
                Building Solutions Across the Region
              </h2>
              <p className="text-base text-text-muted leading-relaxed">
                We proudly work with clients in Egypt, UAE, and Oman, delivering high-quality digital solutions that help businesses across different industries.
              </p>
              <a href="/our-work">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-lg group"
                >
                  Our Work
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
            </div>

            {/* Middle Column - 3 Country Cards */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {countries.map((country, index) => (
                  <CountryCard 
                    key={country.id} 
                    country={country} 
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </div>

            {/* Right Column - Regional Map */}
            <div className="lg:col-span-3 hidden lg:block">
              <RegionMap countries={countries} />
            </div>
          </div>
        </Container>
      </Section>

      {/* Stats Strip */}
      <StatsStrip stats={stats} />

      {/* Our Story Section */}
      <Section id="our-story" spacing="xl" className="bg-color-background">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left - Story Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider">
                OUR STORY
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-deep">
                From an Idea to a Growing Team
              </h2>
              <p className="text-lg text-text-muted leading-relaxed">
                Sentivra started with a simple idea: to help businesses use technology to grow. Today, we are a team of designers, developers, and strategists working with clients across Egypt, UAE, and Oman, delivering digital solutions that solve real problems.
              </p>
              <Button
                onClick={() => handleScrollToSection('our-team')}
                size="lg"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-lg group"
              >
                Our Journey
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            {/* Right - Timeline */}
            <div>
              <Timeline milestones={timelineMilestones} />
            </div>
          </div>
        </Container>
      </Section>

      {/* Our Team Band */}
      <TeamBand
        label="OUR TEAM"
        title="A Diverse Team of Talented Professionals"
        description="We are designers, developers, strategists, and problem solvers. A large team working together to build exceptional digital products."
        buttonLabel="Join Our Team"
        buttonHref="/#contact"
        teamImage="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
      />

      {/* Our Values Section */}
      <Section spacing="xl" className="bg-frost-soft">
        <Container>
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              OUR VALUES
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-deep mb-4">
              What Drives Us
            </h2>
            <p className="text-lg text-text-muted max-w-3xl mx-auto">
              These are the values that guide our work and relationships.
            </p>
          </div>

          {/* Values Cards - Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <ValueCard 
                key={value.id} 
                value={value} 
                delay={index * 0.1}
                layout="card"
              />
            ))}
          </div>

          {/* Values Cards - Mobile Compact */}
          <div className="md:hidden grid grid-cols-2 gap-8">
            {values.map((value, index) => (
              <ValueCard 
                key={value.id} 
                value={value} 
                delay={index * 0.1}
                layout="compact"
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* Final CTA Band */}
      <CTABand
        title="Let's Build Something Great Together"
        description="We're always excited to work on new ideas and partner with businesses that want to make a real impact."
        primaryButton={{
          label: 'Start Your Project',
          href: '/#contact'
        }}
        secondaryButton={{
          label: 'Contact Us',
          href: '/#contact'
        }}
      />

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </motion.div>
  );
};

export default AboutPage;
