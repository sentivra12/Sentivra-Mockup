import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Headphones, Zap, Palette, 
  Lightbulb, Award, Target, Users,
  Search, PenTool, Rocket
} from 'lucide-react';
import { services } from '@/data/services';
import { projects } from '@/data/projects';
import { clientLogos } from '@/data/clientLogos';
import SectionHeader from '@/components/ui/SectionHeader';
import ServiceCard from '@/components/ui/ServiceCard';
import ProjectCard from '@/components/ui/ProjectCard';
import FeatureItem from '@/components/ui/FeatureItem';
import BrandBand from '@/components/ui/BrandBand';
import '../index.css';

const HomePage = () => {
  const location = useLocation();
  const [activeFilter, setActiveFilter] = useState('All');
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef(null);

  // Handle video playback with ref to ensure muted attribute is set
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      // Explicitly set muted to ensure autoplay works
      video.muted = true;
      
      console.log('[Hero Video] Attempting to play video...');
      
      // Attempt to play the video
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('[Hero Video] Video playing successfully');
            setIsPlaying(true);
          })
          .catch((error) => {
            console.warn('[Hero Video] Autoplay failed:', error.message);
            // Show play button if autoplay fails
            setShowPlayButton(true);
            setIsPlaying(false);
          });
      }
    }
  }, []);

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.muted = true;
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((error) => console.warn('Play failed:', error));
      }
    }
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

  const filterCategories = ['All', 'Web Apps', 'Mobile', 'ERP', 'CRM', 'AI & Chatbots', 'Other'];
  
  const filteredProjects = activeFilter === 'All' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Helmet>
        <title>Sentivra - From Ideas to Real Digital Products</title>
        <meta name="description" content="Complete digital solutions for your business. We build web applications, mobile apps, ERP systems, CRM solutions, and more." />
      </Helmet>

      {/* Hero Section with Video Background */}
      <section id="home" className="relative min-h-[600px] md:min-h-[650px] flex items-center overflow-hidden">
        {/* Video Background Layer - TODO: Replace with licensed video files (remove watermark) */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/hero-poster.jpg"
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={(e) => {
            // Fallback to poster if video fails to load
            console.warn('[Hero Video] Video failed to load, showing play button');
            setShowPlayButton(true);
          }}
        >
          <source src="/videos/hero.webm" type="video/webm" />
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        {/* Primary Gradient Overlay - Left to Right (text side to video side) */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(238, 242, 244, 0.97) 0%, rgba(238, 242, 244, 0.95) 35%, rgba(238, 242, 244, 0.7) 50%, rgba(238, 242, 244, 0.3) 60%, transparent 70%)',
          }}
        />

        {/* Mobile Gradient Overlay - Top to Bottom (stronger for mobile) */}
        <div 
          className="absolute inset-0 z-10 lg:hidden pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(238, 242, 244, 0.92) 0%, rgba(238, 242, 244, 0.88) 50%, rgba(238, 242, 244, 0.7) 80%, rgba(238, 242, 244, 0.5) 100%)',
          }}
        />

        {/* Subtle Tint Overlay on Video Side - Blends dark blue video with palette */}
        <div 
          className="hidden lg:block absolute inset-0 z-10 bg-primary-deep/25 pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, transparent 55%, black 70%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 55%, black 70%, black 100%)',
          }}
        />

        {/* Bottom Fade to Next Section */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-24 z-20 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.8) 100%)',
          }}
        />

        {/* Play/Pause Button - shown when reduced motion or autoplay fails */}
        {showPlayButton && (
          <button
            onClick={toggleVideoPlayback}
            className="absolute bottom-8 right-8 z-40 bg-primary-strong hover:bg-primary-deep text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        )}

        {/* Content Layer */}
        <div className="relative z-30 w-full pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                  Software Company
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-deep leading-tight">
                  From ideas to{' '}
                  <span className="text-primary">real digital products</span>
                </h1>
                <p className="text-lg text-text-muted leading-relaxed">
                  We transform your vision into powerful digital solutions. Our expert team delivers cutting-edge technology that drives business growth and creates exceptional user experiences.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" asChild>
                    <a href="/#contact">Start Your Project</a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="/#about">Learn More</a>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-12 bg-white border-b border-frost">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-primary-deep">Professional Support</h3>
                <p className="text-sm text-text-muted">24/7 dedicated assistance</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-primary-deep">High Performance</h3>
                <p className="text-sm text-text-muted">Lightning-fast solutions</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-primary-deep">Modern Design</h3>
                <p className="text-sm text-text-muted">Beautiful & intuitive UX</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Client Logos Section */}
      <section className="py-16 bg-white border-t border-frost border-b border-frost">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {clientLogos.map((logo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-24 h-24 rounded-lg bg-white shadow-card flex items-center justify-center text-muted font-bold text-xl border border-frost"
              >
                {logo.initial}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader 
            label="OUR SERVICES"
            title="Our Services" 
            subtitle="Complete Digital Solutions for Your Business"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={service.slug}
                icon={service.icon}
                title={service.title}
                description={service.shortDescription}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Blue Brand Band #1 */}
      <BrandBand />

      {/* Process Section */}
      <section id="process" className="py-24 bg-frost-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header - Left Aligned */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-left"
          >
            <span className="inline-block text-sm font-bold text-primary uppercase tracking-wider mb-4">
              OUR PROCESS
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-primary-deep mb-4">
              Our Process
            </h2>
            <p className="text-xl text-text-muted max-w-3xl">
              A complete journey to success
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: 3 Process Steps in a Column */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white p-8 rounded-xl shadow-card border border-frost"
              >
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl font-bold text-primary">1</span>
                      <h3 className="text-xl font-bold text-primary-deep">Understand</h3>
                    </div>
                    <p className="text-text-muted">
                      We dive deep into your business needs and goals to create the perfect solution strategy.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white p-8 rounded-xl shadow-card border border-frost"
              >
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <PenTool className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl font-bold text-primary">2</span>
                      <h3 className="text-xl font-bold text-primary-deep">Design & Develop</h3>
                    </div>
                    <p className="text-text-muted">
                      Our team brings your vision to life with modern design and cutting-edge technology.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white p-8 rounded-xl shadow-card border border-frost"
              >
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl font-bold text-primary">3</span>
                      <h3 className="text-xl font-bold text-primary-deep">Launch & Support</h3>
                    </div>
                    <p className="text-text-muted">
                      We ensure a smooth launch and provide ongoing support to help you succeed.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Button size="lg" asChild>
                  <a href="/#contact">Start Your Project</a>
                </Button>
              </motion.div>
            </div>

            {/* Right: iMac Mockup Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="hidden lg:block"
            >
              {/* PLACEHOLDER: iMac mockup */}
              <div className="relative bg-frost rounded-2xl shadow-card-hover p-12 aspect-[16/10] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-8xl">🖥️</div>
                  <div className="text-primary-deep font-bold text-lg">iMac Mockup</div>
                  <div className="text-text-muted">[Placeholder - needs image]</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Blue Brand Band #2 */}
      <BrandBand />

      {/* Projects Section */}
      <section id="work" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader 
            label="OUR WORK"
            title="Our Work" 
            subtitle="Projects We're Proud Of"
          />

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {filterCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  activeFilter === category
                    ? 'bg-primary-strong text-white shadow-card-hover'
                    : 'bg-white text-text-muted hover:bg-frost-soft border border-frost'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                image={project.image}
                title={project.title}
                category={project.category}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="about" className="py-24 bg-frost-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader 
            label="WHY CHOOSE US"
            title="Innovation and Excellence" 
            subtitle="Why Choose Sentivra"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureItem
              icon={Lightbulb}
              title="Innovation"
              description="We leverage cutting-edge technologies and creative solutions to keep you ahead of the competition."
              delay={0}
            />
            <FeatureItem
              icon={Award}
              title="Quality"
              description="Our commitment to excellence ensures every project meets the highest standards of performance and design."
              delay={0.1}
            />
            <FeatureItem
              icon={Target}
              title="Focus on Success"
              description="Your success is our priority. We align our efforts with your business goals for measurable results."
              delay={0.2}
            />
            <FeatureItem
              icon={Users}
              title="Long-Term Partnership"
              description="We build lasting relationships, providing ongoing support and evolving solutions as your business grows."
              delay={0.3}
            />
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default HomePage;