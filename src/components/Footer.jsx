import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Linkedin, Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { services } from '@/data/services';

const Footer = () => {
  const navigate = useNavigate();

  const handleNavClick = (e, path) => {
    e.preventDefault();
    navigate(path);
    if (path.includes('#')) {
      const id = path.split('#')[1];
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    }
  };

  return (
    <footer className="bg-primary-deep text-white">
      {/* Large CTA Section */}
      <div className="border-b border-frost/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
            Let's Turn Your Ideas Into Real Products
          </h2>
          <p className="text-lg text-frost mb-8 max-w-2xl mx-auto">
            Ready to bring your vision to life? Get in touch with us today and let's build something amazing together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="light" asChild>
              <a href="/#contact">Start Your Project</a>
            </Button>
            <Button size="lg" variant="outline-white" asChild>
              <a href="/#services">Our Services</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Content - 4 Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Logo + Description + Social */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <img 
                src="/sentivra-logo.jpg" 
                alt="Sentivra Logo" 
                className="h-10 w-10 rounded-full"
                width="40"
                height="40"
              />
              <span className="s-logo text-2xl font-bold">
                <span className="text-primary">S</span>entivra
              </span>
            </div>
            <p className="text-frost leading-relaxed">
              Transforming ideas into digital excellence through innovative technology solutions.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/sentivra12" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/in/ٍٍsentivra" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://www.facebook.com/share/16vwkvzbwi/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/sentivra" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <div className="space-y-3">
              <a href="/#home" onClick={(e) => handleNavClick(e, '/#home')} className="block text-frost hover:text-primary transition-colors">
                Home
              </a>
              <a href="/#about" onClick={(e) => handleNavClick(e, '/#about')} className="block text-frost hover:text-primary transition-colors">
                About Us
              </a>
              <a href="/#services" onClick={(e) => handleNavClick(e, '/#services')} className="block text-frost hover:text-primary transition-colors">
                Services
              </a>
              <a href="/#work" onClick={(e) => handleNavClick(e, '/#work')} className="block text-frost hover:text-primary transition-colors">
                Our Work
              </a>
              <a href="/mockups" onClick={(e) => handleNavClick(e, '/mockups')} className="block text-frost hover:text-primary transition-colors">
                Mockups
              </a>
              <a href="/#process" onClick={(e) => handleNavClick(e, '/#process')} className="block text-frost hover:text-primary transition-colors">
                Our Process
              </a>
            </div>
          </div>

          {/* Column 3: Our Services */}
          <div>
            <h3 className="text-lg font-bold mb-6">Our Services</h3>
            <div className="space-y-3">
              {services.slice(0, 6).map((service) => (
                <a 
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="block text-frost hover:text-primary transition-colors text-sm"
                >
                  {service.title}
                </a>
              ))}
            </div>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <a href="mailto:sentivra.tech@gmail.com" className="text-frost hover:text-primary transition-colors text-sm">
                  sentivra.tech@gmail.com
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <a href="tel:+201558952126" className="text-frost hover:text-primary transition-colors text-sm">
                  +201558952126
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-frost text-sm">
                  Sadat City, Egypt
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-frost/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted text-sm">
              © 2025 Sentivra. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-muted hover:text-primary transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-muted hover:text-primary transition-colors text-sm">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


