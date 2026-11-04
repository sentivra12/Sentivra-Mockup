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

const OurWorkPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [displayCount, setDisplayCount] = useState(6);
  const location = useLocation();

  // Fetch data from Supabase
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
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

  // Filter projects by category
  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(project => project.category === activeCategory);

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
  const impactStats = stats.length > 0 ? stats.map(stat => ({
    value: stat.value,
    suffix: stat.suffix || '',
    icon: CheckCircle, // Default icon for stats
    label: stat.label
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
      <section className="py-12 bg-white border-b border-frost">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {clientLogos.map((logo, index) => (
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
                  />
                ) : (
                  <span className="text-muted font-bold text-xl">
                    {logo.client_name.charAt(0)}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section id="projects" className="py-24 bg-frost-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    key={project.id}
                    project={{
                      ...project,
                      image: project.image_url,
                      shortDescription: project.short_description,
                      type: project.category,
                      techStack: project.technologies || []
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
        </div>
      </section>

      {/* Brand Band */}
      <BrandBand />

      {/* Process Section */}
      <section id="process" className="py-24 bg-frost-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <ProcessStepsList steps={processSteps} />
        </div>
      </section>

      {/* Impact Stats Band */}
      <WhyChooseUsBand
        label="OUR IMPACT"
        title="Turning Ideas Into Successful Products"
        description="Delivering exceptional results and building long-term partnerships with businesses worldwide."
        stats={impactStats}
      />

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              CLIENT TESTIMONIAL
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-primary-deep">
              What Our Clients Say
            </h2>
          </div>

          <TestimonialSlider testimonials={testimonials} />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <FAQAccordion faqs={faqs} />
          </div>
        </div>
      </section>

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
