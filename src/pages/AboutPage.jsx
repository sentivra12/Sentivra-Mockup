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
  const { t, language } = useTranslation();
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

  // Build country list text from actual data
  // Filter out countries without valid names
  const validCountries = (countries ?? []).filter(c => {
    const name = language === 'ar' ? (c.name_ar || c.name) : (c.name_en || c.name);
    return name && name.trim() !== '';
  });

  const buildCountryList = () => {
    if (validCountries.length === 0) return null;
    
    const countryNames = validCountries.map(c => {
      const name = language === 'ar' ? (c.name_ar || c.name) : (c.name_en || c.name);
      return name;
    }).filter(Boolean); // Remove any undefined/null
    
    if (countryNames.length === 0) return null;
    if (countryNames.length === 1) return countryNames[0];
    if (countryNames.length === 2) {
      return language === 'ar' ? `${countryNames[0]} و ${countryNames[1]}` : `${countryNames[0]} and ${countryNames[1]}`;
    }
    
    // 3+ countries: use proper list formatting
    const formatter = new Intl.ListFormat(language === 'ar' ? 'ar' : 'en', { 
      style: 'long', 
      type: 'conjunction' 
    });
    return formatter.format(countryNames);
  };

  const countryListText = buildCountryList();

  // Dev-time guard: warn if interpolation receives undefined
  if (process.env.NODE_ENV === 'development' && countryListText === null) {
    console.warn('[AboutPage] No valid countries for interpolation - using fallback text');
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
      {validCountries.length > 0 && (
        <Section spacing="xl" className="bg-frost-soft">
          <Container>
            {/* Desktop: 3-column layout | Mobile: stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Column - Label, Title, Description, Button */}
              <div className="lg:col-span-3 space-y-6">
                <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider">
                  {t('about.presence.label') || 'OUR PRESENCE'}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-primary-deep dark:text-primary-light leading-tight">
                  {t('about.presence.title') || 'Building Solutions Across the Region'}
                </h2>
                {countryListText && (
                  <p className="text-base text-text-muted leading-relaxed" dir="auto">
                    {t('about.presence.description', { countries: countryListText })}
                  </p>
                )}
                {!countryListText && (
                  <p className="text-base text-text-muted leading-relaxed">
                    {t('about.presence.descriptionGeneric') || 'We proudly work with clients across the region, delivering high-quality digital solutions that help businesses across different industries.'}
                  </p>
                )}
                <a href="/mockups">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-2 border-primary text-primary hover:bg-primary hover:text-white dark:border-brand-accent dark:text-brand-accent dark:hover:bg-brand-accent px-6 py-3 rounded-lg group"
                  >
                    {t('about.presence.button') || 'Our Work'}
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
              </div>

              {/* Middle Column - Country Cards */}
              <div className="lg:col-span-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {validCountries.slice(0, 3).map((country, index) => (
                    <CountryCard 
                      key={country.id} 
                      country={country}
                      language={language}
                      delay={index * 0.1}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column - Regional Map - only show if we have coordinates */}
              <div className="lg:col-span-3 hidden lg:block">
                {validCountries.some(c => c.latitude && c.longitude) ? (
                  <RegionMap countries={validCountries} />
                ) : (
                  <div className="relative h-full min-h-[300px] rounded-2xl overflow-hidden bg-gradient-to-br from-brand-50 via-frost-soft to-brand-100 dark:from-brand-950 dark:via-gray-900 dark:to-brand-900 border border-frost">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="text-6xl">🌍</div>
                        <p className="text-sm font-medium text-text-muted">
                          {t('about.presence.globalReach') || 'Global Reach'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </Section>
      )}

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
                {t('about.story.label') || 'OUR STORY'}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-deep dark:text-primary-light">
                {t('about.story.title') || 'From an Idea to a Growing Team'}
              </h2>
              <p className="text-lg text-text-muted leading-relaxed" dir="auto">
                {countryListText 
                  ? t('about.story.description', { countries: countryListText })
                  : t('about.story.descriptionGeneric') || 'Sentivra started with a simple idea: to help businesses use technology to grow. Today, we are a team of designers, developers, and strategists delivering digital solutions that solve real problems.'
                }
              </p>
              <Button
                onClick={() => handleScrollToSection('our-team')}
                size="lg"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white dark:border-brand-accent dark:text-brand-accent dark:hover:bg-brand-accent px-8 py-3 rounded-lg group"
              >
                {t('about.story.button') || 'Our Journey'}
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
        inverse={false}
        label={t('about.team.label') || 'OUR TEAM'}
        title={t('about.team.title') || 'A Diverse Team of Talented Professionals'}
        description={t('about.team.description') || 'We are designers, developers, strategists, and problem solvers. A large team working together to build exceptional digital products.'}
        buttonLabel={t('about.team.button') || 'Join Our Team'}
        buttonHref="/contact"
        // No teamImage - will show brand illustration instead
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
            {(values ?? []).map((value, index) => (
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
            {(values ?? []).map((value, index) => (
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
