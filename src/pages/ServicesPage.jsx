import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Code, Smartphone, Database, Layers, BarChart3, Bot,
  Headphones, Zap, Palette, Cloud,
  CheckCircle, Users, Clock, Award
} from 'lucide-react';
import { services, serviceCategories } from '@/data/services';
import PageHero from '@/components/ui/PageHero';
import FeatureStrip from '@/components/ui/FeatureStrip';
import CategorySidebar from '@/components/ui/CategorySidebar';
import ServiceCardWithImage from '@/components/ui/ServiceCardWithImage';
import WhyChooseUsBand from '@/components/ui/WhyChooseUsBand';
import FAQAccordion from '@/components/ui/FAQAccordion';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import SectionHeader from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const ServicesPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Filter services by category
  const filteredServices = activeCategory === 'all'
    ? services
    : services.filter(service => {
        const categoryMap = {
          'web-mobile': 'Web & Mobile',
          'business-systems': 'Business Systems',
          'ai-data': 'AI & Data'
        };
        return service.category === categoryMap[activeCategory];
      });

  // Features for FeatureStrip
  const features = [
    {
      icon: Headphones,
      title: 'Continuous Support',
      description: '24/7 dedicated support'
    },
    {
      icon: Zap,
      title: 'High Performance',
      description: 'Lightning-fast solutions'
    },
    {
      icon: Palette,
      title: 'Modern Design',
      description: 'Beautiful & intuitive UX'
    },
    {
      icon: Cloud,
      title: 'Scalable Solutions',
      description: 'Grow with your business'
    }
  ];

  // Floating icons for hero
  const floatingIcons = [
    { icon: Code, label: 'Web Development', top: 20, left: 60 },
    { icon: Smartphone, label: 'Mobile Apps', top: 40, left: 80 },
    { icon: Layers, label: 'ERP Systems', top: 65, left: 70 },
    { icon: BarChart3, label: 'Data Analysis', top: 30, left: 40 },
    { icon: Bot, label: 'AI Solutions', top: 75, left: 50 },
    { icon: Database, label: 'CRM Systems', top: 55, left: 85 }
  ];

  // Stats for Why Choose Us
  const stats = [
    {
      value: 50,
      suffix: '+',
      icon: CheckCircle,
      label: 'Successful Projects'
    },
    {
      value: 98,
      suffix: '%',
      icon: Users,
      label: 'Client Satisfaction'
    },
    {
      value: 5,
      suffix: '+',
      icon: Award,
      label: 'Years of Experience'
    },
    {
      value: 24,
      suffix: '/7',
      icon: Clock,
      label: 'Ongoing Support'
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
      question: 'What industries do you work with?',
      answer: 'We work with clients across diverse industries including healthcare, finance, e-commerce, manufacturing, education, real estate, and more. Our adaptable approach allows us to understand and meet the unique needs of any industry.'
    },
    {
      question: 'What technologies do you use?',
      answer: 'We use modern, proven technologies including React, Vue.js, Node.js, Python, .NET, React Native, Flutter, and more. We select the best technology stack based on your specific project requirements, scalability needs, and long-term goals.'
    },
    {
      question: 'How much does a project cost?',
      answer: 'Project costs vary significantly based on complexity, features, and timeline. We offer flexible pricing models including fixed-price and time-and-materials. Contact us for a free consultation and detailed quote tailored to your specific needs.'
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Helmet>
        <title>Our Services - Digital Solutions That Drive Results | Sentivra</title>
        <meta 
          name="description" 
          content="Comprehensive digital solutions including web applications, mobile apps, ERP systems, CRM solutions, data analysis, and AI chatbots. Transform your business with Sentivra." 
        />
      </Helmet>

      {/* Page Hero */}
      <PageHero
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Services' }
        ]}
        label="OUR SERVICES"
        title="Digital Solutions"
        titleAccent="That Drive Real Results"
        description="We craft robust digital solutions designed to help your business grow, automate, and stay ahead in the digital world."
        primaryButton={{
          label: 'Start Your Project',
          href: '/#contact'
        }}
        secondaryButton={{
          label: 'Get a Free Consultation',
          href: '/#contact'
        }}
        backgroundImage="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop"
        floatingIcons={floatingIcons}
      />

      {/* Feature Strip */}
      <FeatureStrip features={features} />

      {/* What We Do Section */}
      <section id="services-list" className="py-24 bg-frost-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="What We Do"
            subtitle="Comprehensive digital solutions tailored to your business needs"
          />

          <div className="flex gap-8">
            {/* Category Sidebar - Desktop Only */}
            <CategorySidebar
              categories={serviceCategories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />

            {/* Services Grid */}
            <div className="flex-1">
              {/* Desktop: 3-column grid */}
              <div className="hidden lg:grid grid-cols-3 gap-8">
                {filteredServices.map((service, index) => (
                  <ServiceCardWithImage
                    key={service.slug}
                    service={service}
                    delay={index * 0.1}
                    variant="desktop"
                  />
                ))}
              </div>

              {/* Mobile: Vertical list */}
              <div className="lg:hidden space-y-4">
                {filteredServices.map((service, index) => (
                  <ServiceCardWithImage
                    key={service.slug}
                    service={service}
                    delay={index * 0.05}
                    variant="mobile"
                  />
                ))}
                
                {/* View All Services Button - Mobile Only */}
                <div className="pt-4 text-center">
                  <Button
                    variant="outline"
                    className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-lg group"
                  >
                    View All Services
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Band */}
      <WhyChooseUsBand
        label="WHY CHOOSE US"
        title="More Than a Development Partner"
        description="A trusted partner dedicated to delivering value and driving your business forward with cutting-edge technology."
        stats={stats}
        ctaButton={{
          label: 'Start Your Project',
          href: '/#contact'
        }}
      />

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
              Find answers to common questions about our services
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="hidden lg:flex items-center justify-center"
            >
              <div className="relative w-full max-w-md">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=600&fit=crop"
                  alt="FAQ Illustration"
                  className="w-full h-auto rounded-2xl shadow-card-hover"
                />
                <div className="absolute inset-0 bg-primary/10 rounded-2xl"></div>
              </div>
            </motion.div>

            {/* Right: Accordion */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <FAQAccordion faqs={faqs} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </motion.div>
  );
};

export default ServicesPage;
