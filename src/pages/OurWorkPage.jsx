import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Code, Smartphone, Database, Layers, BarChart3, Bot,
  Search, PenTool, Rocket, CheckCircle, Users, Award, TrendingUp
} from 'lucide-react';
import { 
  useProjects, 
  useTestimonials, 
  useClientLogos, 
  useProcessSteps,
  useFAQs,
  useStats
} from '@/hooks/useContent';
import PageHero from '@/components/ui/PageHero';
import FilterTabs from '@/components/ui/FilterTabs';
import EnhancedProjectCard from '@/components/ui/EnhancedProjectCard';
import BrandBand from '@/components/ui/BrandBand';
import ProcessStepsList from '@/components/ui/ProcessStepsList';
import WhyChooseUsBand from '@/components/ui/WhyChooseUsBand';
import TestimonialSlider from '@/components/ui/TestimonialSlider';
import FAQAccordion from '@/components/ui/FAQAccordion';
import CTABand from '@/components/ui/CTABand';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import SectionHeader from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';

const OurWorkPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [displayCount, setDisplayCount] = useState(6);
  const location = useLocation();

  // Fetch data from Supabase with proper defaults
  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useProjects();
  const { data: testimonials = [], isLoading: testimonialsLoading } = useTestimonials();
  const { data: clientLogos = [], isLoading: logosLoading } = useClientLogos();
  const { data: processSteps = [], isLoading: processLoading } = useProcessSteps();
  const { data: faqs = [], isLoading: faqsLoading } = useFAQs('work');
  const { data: stats = [], isLoading: statsLoading } = useStats();

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

  // Build project categories from projects data
  const projectCategories = [
    { id: 'all', label: 'All Projects', icon: Layers },
    { id: 'Web Apps', label: 'Web Apps', icon: Code },
    { id: 'Mobile', label: 'Mobile', icon: Smartphone },
    { id: 'ERP', label: 'ERP', icon: Database },
    { id: 'CRM', label: 'CRM', icon: BarChart3 },
    { id: 'AI & Chatbots', label: 'AI & Chatbots', icon: Bot },
    { id: 'Other', label: 'Other', icon: Layers }
  ];

  // Filter projects by category (with safety check)
  const filteredProjects = activeCategory === 'all'
    ? (projects || [])
    : (projects || []).filter(project => project?.category === activeCategory);

  const displayedProjects = filteredProjects.slice(0, displayCount);
  const hasMore = displayCount < filteredProjects.length;

  const loadMore = () => {
    setDisplayCount(prev => prev + 6);
  };

  // Floating icons for hero
  const floatingIcons = [
    { icon: Code, label: 'Web Applications', top: 25, left: 65 },
    { icon: Layers, label: 'ERP Systems', top: 55, left: 75 },
    { icon: Smartphone, label: 'Mobile Apps', top: 70, left: 55 }
  ];

  // Impact stats - use from database if available, fallback to defaults
  const impactStats = (stats && stats.length > 0) ? stats.map(stat => ({
    value: stat?.value || 0,
    suffix: stat?.suffix || '',
    icon: CheckCircle, // Default icon for stats
    label: stat?.label || ''
  })) : [
    {
      value: 50,
      suffix: '+',
      icon: CheckCircle,
      label: 'Projects Delivered'
    },
    {
      value: 30,
      suffix: '+',
      icon: Users,
      label: 'Happy Clients'
    },
    {
      value: 10,
      suffix: '+',
      icon: TrendingUp,
      label: 'Industries Served'
    },
    {
      value: 98,
      suffix: '%',
      icon: Award,
      label: 'Client Satisfaction'
    }
  ];

  // Show loading state
  if (projectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  // Show error state with retry
  if (projectsError) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary-deep mb-2">Failed to Load Projects</h2>
          <p className="text-text-muted mb-6">We couldn't load the projects. Please try again.</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Helmet>
        <title>Our Work - Real Projects, Real Impact | Sentivra</title>
        <meta 
          name="description" 
          content="Explore our portfolio of successful projects. From web applications to mobile apps, ERP systems, and AI solutions. See how we transform ideas into digital reality." 
        />
      </Helmet>

      {/* Page Hero */}
      <PageHero
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Our Work' }
        ]}
        label="OUR WORK"
        title="Real Projects."
        titleAccent="Real Impact."
        description="A showcase of our recent projects that showcase our expertise and commitment to delivering exceptional digital solutions."
        primaryButton={{
          label: 'Start Your Project',
          href: '/#contact'
        }}
        secondaryButton={{
          label: 'See Our Process',
          href: '#process'
        }}
        backgroundImage="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop"
        floatingIcons={floatingIcons}
      />

      {/* Client Logos Strip */}
      <Section spacing="md" className="bg-white border-b border-frost">
        <Container>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {(clientLogos || []).map((logo, index) => (
              <motion.div
                key={logo.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-24 h-24 rounded-lg bg-white shadow-card flex items-center justify-center border border-frost overflow-hidden"
              >
                {logo.logo_url ? (
                  <img 
                    src={logo.logo_url} 
                    alt={logo.client_name}
                    className="w-full h-full object-contain p-2"
                    width="96"
                    height="96"
                  />
                ) : (
                  <span className="text-muted font-bold text-xl">
                    {logo?.client_name?.charAt(0) || '?'}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Featured Projects Section */}
      <Section id="projects" spacing="xl" className="bg-frost-soft">
        <Container>
          <SectionHeader
            title="Featured Projects"
            subtitle="Explore our portfolio of successful projects across various industries and technologies"
          />

          {/* Filter Tabs */}
          <FilterTabs
            categories={projectCategories}
            activeCategory={activeCategory}
            onCategoryChange={(cat) => {
              setActiveCategory(cat);
              setDisplayCount(6); // Reset display count on filter change
            }}
            className="mb-12"
          />

          {/* Projects Grid */}
          <AnimatePresence mode="wait">
            {filteredProjects.length > 0 ? (
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {displayedProjects.map((project, index) => (
                  <EnhancedProjectCard
                    key={project?.id || index}
                    project={{
                      ...project,
                      image: project?.image_url || '',
                      shortDescription: project?.short_description || '',
                      type: project?.category || '',
                      techStack: Array.isArray(project?.technologies) ? project.technologies : []
                    }}
                    delay={index * 0.1}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <p className="text-xl text-text-muted">No projects found in this category.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* View More Button */}
          {hasMore && (
            <div className="text-center mt-12">
              <Button
                onClick={loadMore}
                size="lg"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-lg group"
              >
                View More Projects
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
        </Container>
      </Section>

      {/* Brand Band */}
      <BrandBand />

      {/* Process Section */}
      <Section id="process" spacing="xl" className="bg-frost-soft">
        <Container>
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              OUR PROCESS
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-primary-deep mb-6">
              From Ideas to Real Products
            </h2>
            <p className="text-xl text-text-muted max-w-3xl mx-auto mb-8">
              We follow a proven methodology to ensure your project's success from conception to launch and beyond.
            </p>
            <a href="/#contact">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-dark text-white px-8 py-4 text-lg rounded-lg group"
              >
                Start Your Project
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </div>

          <ProcessStepsList steps={processSteps || []} />
        </Container>
      </Section>

      {/* Impact Stats Band */}
      <WhyChooseUsBand
        label="OUR IMPACT"
        title="Turning Ideas Into Successful Products"
        description="Delivering exceptional results and building long-term partnerships with businesses worldwide."
        stats={impactStats}
      />

      {/* Testimonials Section */}
      <Section id="testimonials" spacing="xl" className="bg-white">
        <Container>
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              CLIENT TESTIMONIAL
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-primary-deep">
              What Our Clients Say
            </h2>
          </div>

          <TestimonialSlider testimonials={testimonials || []} />
        </Container>
      </Section>

      {/* FAQ Section */}
      <Section id="faq" spacing="xl" className="bg-white">
        <Container>
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              FAQ
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-primary-deep mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-text-muted max-w-3xl mx-auto">
              Find answers to common questions about our work and processes
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <FAQAccordion faqs={faqs || []} />
          </div>
        </Container>
      </Section>

      {/* Final CTA Band */}
      <CTABand
        title="Let's Build Your Next Success Story"
        description="Ready to transform your ideas into reality? Let's start your project today."
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

export default OurWorkPage;
