import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Code, Smartphone, Database, Layers, BarChart3, Bot,
  Search, PenTool, Rocket, CheckCircle, Users, Award, TrendingUp
} from 'lucide-react';
import { projects, projectCategories } from '@/data/projects';
import { testimonials } from '@/data/testimonials';
import { clientLogos } from '@/data/clientLogos';
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

  // Filter projects by category
  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(project => {
        const categoryMap = {
          'web-applications': 'Web Applications',
          'mobile-applications': 'Mobile Applications',
          'erp-systems': 'ERP Systems',
          'crm-systems': 'CRM Systems',
          'ai-chatbots': 'AI & Chatbots',
          'other': 'Other'
        };
        return project.category === categoryMap[activeCategory];
      });

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

  // Process steps
  const processSteps = [
    {
      icon: Search,
      title: 'Understand',
      description: 'We dive deep into your business needs and project requirements.'
    },
    {
      icon: PenTool,
      title: 'Plan & Design',
      description: 'Creating detailed roadmaps and user-centric designs.'
    },
    {
      icon: Rocket,
      title: 'Develop',
      description: 'Building robust solutions with cutting-edge technologies.'
    },
    {
      icon: CheckCircle,
      title: 'Launch & Support',
      description: 'Smooth deployment with ongoing maintenance and support.'
    }
  ];

  // Impact stats
  const impactStats = [
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

  // FAQ data
  const faqs = [
    {
      question: 'How long does it take to complete a project?',
      answer: 'Project timelines vary based on complexity and scope. A simple website may take 4-6 weeks, while a complex web application or ERP system can take 3-6 months or more. We provide a detailed timeline during the planning phase and keep you updated throughout the development process.'
    },
    {
      question: 'Do you provide ongoing support?',
      answer: 'Yes! We offer comprehensive maintenance and support packages to ensure your solution continues to perform optimally. Our support includes bug fixes, security updates, performance monitoring, and technical assistance whenever you need it.'
    },
    {
      question: 'Can you work with our existing systems?',
      answer: 'Absolutely. We specialize in integrating new solutions with existing systems and databases. Our team has experience with various platforms and technologies, ensuring seamless integration and data migration when needed.'
    },
    {
      question: 'What technologies do you use?',
      answer: 'We use modern, proven technologies including React, Vue.js, Node.js, Python, Laravel, React Native, Flutter, and more. We select the best technology stack based on your specific project requirements, scalability needs, and long-term goals.'
    },
    {
      question: 'What industries do you work with?',
      answer: 'We work with clients across diverse industries including healthcare, finance, e-commerce, manufacturing, education, real estate, and more. Our adaptable approach allows us to understand and meet the unique needs of any industry.'
    },
    {
      question: 'How much does a project cost?',
      answer: 'Project costs vary significantly based on complexity, features, and timeline. We offer flexible pricing models including fixed-price and time-and-materials. Contact us for a free consultation and detailed quote tailored to your specific needs.'
    },
    {
      question: 'Can we request custom features?',
      answer: 'Absolutely! We specialize in building custom solutions tailored to your unique requirements. We work closely with you to understand your needs and develop features that give you a competitive advantage.'
    },
    {
      question: 'Do you offer UI/UX design only?',
      answer: 'Yes, we offer standalone UI/UX design services. Our design team can create beautiful, user-centric interfaces whether you need design only or full development services.'
    },
    {
      question: 'Will we own the source code?',
      answer: 'Yes, upon project completion and full payment, you own all source code, designs, and intellectual property. We provide complete documentation and transfer all rights to you.'
    }
  ];

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
                className="w-24 h-24 rounded-lg bg-frost-soft shadow-card flex items-center justify-center text-muted font-bold text-lg border border-frost hover:border-primary hover:text-primary transition-all"
              >
                {logo.initial}
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
                    project={project}
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
