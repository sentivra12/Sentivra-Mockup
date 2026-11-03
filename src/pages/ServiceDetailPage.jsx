import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { services } from '@/data/services';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const service = services.find(s => s.slug === serviceId);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16">
        <h1 className="text-4xl font-bold mb-4">Service Not Found</h1>
        <p className="text-lg text-text-muted mb-8">The service you're looking for doesn't exist.</p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Helmet>
        <title>{service.title} - Sentivra Services</title>
        <meta name="description" content={service.shortDescription} />
      </Helmet>

      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-24 bg-gradient-to-br from-primary-strong to-primary-deep text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <service.icon className="h-16 w-16 mx-auto mb-6" />
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{service.title}</h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">{service.shortDescription}</p>
            </motion.div>
          </div>
        </section>

        {/* Details Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="space-y-6">
                <h2 className="text-3xl font-bold text-primary-deep">What We Offer</h2>
                <p className="text-lg text-text-muted leading-relaxed">{service.longDescription}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }} className="space-y-6">
                 <h3 className="text-2xl font-semibold text-primary-deep">Key Features</h3>
                 <ul className="space-y-4">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                      <span className="text-lg text-text-muted">{feature}</span>
                    </li>
                  ))}
                 </ul>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-frost-soft">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                    <h2 className="text-3xl md:text-4xl font-bold text-primary-deep">Ready to build with us?</h2>
                    <p className="text-xl text-text-muted mt-4 mb-8 max-w-2xl mx-auto">Let's discuss how our {service.title} expertise can help your business succeed.</p>
                    <Link to="/#contact">
                       <Button size="lg" className="bg-primary hover:bg-primary-strong text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-dropdown transition-all duration-300 transform hover:scale-105">
                        Request a Consultation
                       </Button>
                    </Link>
                </motion.div>
            </div>
        </section>

      </div>
    </motion.div>
  );
};

export default ServiceDetailPage;
