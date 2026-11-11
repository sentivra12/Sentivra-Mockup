import { Code, Smartphone, Bot, BarChart3, Database, Layers } from 'lucide-react';
import { supabase, isMissingEnv } from '../lib/supabase';

const createSlug = (title) => title.toLowerCase().replace(/ & /g, '-and-').replace(/ /g, '-').replace(/[^\w-]+/g, '');

// Static fallback data (used when Supabase is not configured)
export const servicesStatic = [
  {
    slug: createSlug('Web Application Development'),
    icon: Code,
    title: 'Web Application Development',
    shortDescription: 'Custom web applications tailored to your specific business needs and industry requirements.',
    longDescription: 'We build robust, scalable, and secure web applications tailored to your business needs. Our team uses the latest frameworks like React, and Vue.js, ensuring your application is fast, responsive, and future-proof. From enterprise-level platforms to dynamic single-page applications, we deliver excellence.',
    features: ['Custom API Development', 'Progressive Web Apps (PWAs)', 'Cloud-based Deployment', 'Real-time Functionality'],
    category: 'Web & Mobile',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=600&fit=crop'
  },
  {
    slug: createSlug('Mobile Application Development'),
    icon: Smartphone,
    title: 'Mobile Application Development',
    shortDescription: 'iOS & Android apps with exceptional performance and user experience.',
    longDescription: 'Capture your audience on the go with our mobile application development services. We create intuitive and high-performing apps for both iOS and Android, using native technologies like Swift and Kotlin, or cross-platform frameworks like React Native for wider reach and faster development cycles.',
    features: ['iOS & Android Development', 'React Native Expertise', 'Push Notifications', 'App Store Submission'],
    category: 'Web & Mobile',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop'
  },
  {
    slug: createSlug('ERP System Development'),
    icon: Layers,
    title: 'ERP System Development',
    shortDescription: 'Integrated ERP solutions to streamline your business operations.',
    longDescription: 'Streamline your entire business operations with our custom ERP systems. We design and implement enterprise resource planning solutions that unify finance, HR, inventory, supply chain, and more into a single, powerful platform. Gain complete visibility and control over your business processes.',
    features: ['Process Automation', 'Real-time Reporting', 'Multi-module Integration', 'Scalable Architecture'],
    category: 'Business Systems',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
  },
  {
    slug: createSlug('CRM System Development'),
    icon: Database,
    title: 'CRM System Development',
    shortDescription: 'Smart CRM to manage customer relationships and boost sales.',
    longDescription: 'Transform how you manage customer relationships with our tailored CRM solutions. We develop systems that centralize customer data, automate sales workflows, and provide actionable insights to help your team close more deals and deliver exceptional customer service.',
    features: ['Contact Management', 'Sales Pipeline Tracking', 'Marketing Automation', 'Customer Analytics'],
    category: 'Business Systems',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
  },
  {
    slug: createSlug('Data Analysis & Business Intelligence'),
    icon: BarChart3,
    title: 'Data Analysis & Business Intelligence',
    shortDescription: 'Turn your raw data into actionable insights and make data-driven decisions.',
    longDescription: 'Unlock the value hidden in your data. Our data science experts help you collect, process, and analyze data to uncover trends, predict outcomes, and make informed business decisions. From custom dashboards to predictive modeling, we turn data into your most valuable asset.',
    features: ['Business Intelligence Dashboards', 'Predictive Analytics', 'Big Data Processing', 'Machine Learning Insights'],
    category: 'AI & Data',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
  },
  {
    slug: createSlug('AI and Chatbot Solutions'),
    icon: Bot,
    title: 'AI and Chatbot Solutions',
    shortDescription: 'Intelligent automation and 24/7 conversational AI for enhanced customer engagement.',
    longDescription: 'Leverage the power of Artificial Intelligence to automate processes and enhance user interactions. We develop custom AI models and intelligent chatbots that provide 24/7 customer support, generate leads, and offer personalized user experiences, driving efficiency and satisfaction.',
    features: ['Natural Language Processing (NLP)', 'Machine Learning Models', '24/7 Automated Support', 'Personalized User Journeys'],
    category: 'AI & Data',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop'
  }
];

// Default export for backward compatibility
export const services = servicesStatic;

// Service categories
export const serviceCategories = [
  { id: 'all', name: 'All Services', icon: Layers },
  { id: 'web-mobile', name: 'Web & Mobile', icon: Code },
  { id: 'business-systems', name: 'Business Systems', icon: Database },
  { id: 'ai-data', name: 'AI & Data', icon: BarChart3 }
];

/**
 * Fetch services from Supabase with optional filters
 * Falls back to static data if Supabase is not configured
 * @param {Object} options - Query options
 * @param {string} options.category - Filter by category
 * @param {boolean} options.featured - Filter featured services
 * @param {string} options.language - Language code ('en' or 'ar')
 * @returns {Promise<Array>} Services array
 */
export const fetchServices = async ({ category, featured, language = 'en' } = {}) => {
  // If Supabase is not configured, return static data
  if (isMissingEnv) {
    console.warn('Using static services data (Supabase not configured)');
    let filtered = servicesStatic;
    
    if (category && category !== 'all') {
      filtered = filtered.filter(s => s.category === category);
    }
    
    if (featured) {
      filtered = filtered.filter(s => s.featured);
    }
    
    return filtered;
  }

  try {
    let query = supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching services:', error);
      return servicesStatic;
    }

    // Map bilingual fields
    return data.map(service => ({
      ...service,
      title: language === 'ar' && service.title_ar ? service.title_ar : service.title,
      shortDescription: language === 'ar' && service.short_description_ar 
        ? service.short_description_ar 
        : service.short_description,
      longDescription: language === 'ar' && service.long_description_ar 
        ? service.long_description_ar 
        : service.long_description,
      features: language === 'ar' && service.features_ar 
        ? service.features_ar 
        : service.features,
      icon: service.icon || Code, // Default icon
    }));
  } catch (err) {
    console.error('Error fetching services:', err);
    return servicesStatic;
  }
};

/**
 * Fetch a single service by slug
 * @param {string} slug - Service slug
 * @param {string} language - Language code ('en' or 'ar')
 * @returns {Promise<Object|null>} Service object or null
 */
export const fetchServiceBySlug = async (slug, language = 'en') => {
  // If Supabase is not configured, return from static data
  if (isMissingEnv) {
    console.warn('Using static services data (Supabase not configured)');
    return servicesStatic.find(s => s.slug === slug) || null;
  }

  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching service:', error);
      return servicesStatic.find(s => s.slug === slug) || null;
    }

    // Map bilingual fields
    return {
      ...data,
      title: language === 'ar' && data.title_ar ? data.title_ar : data.title,
      shortDescription: language === 'ar' && data.short_description_ar 
        ? data.short_description_ar 
        : data.short_description,
      longDescription: language === 'ar' && data.long_description_ar 
        ? data.long_description_ar 
        : data.long_description,
      features: language === 'ar' && data.features_ar 
        ? data.features_ar 
        : data.features,
      icon: data.icon || Code,
    };
  } catch (err) {
    console.error('Error fetching service:', err);
    return servicesStatic.find(s => s.slug === slug) || null;
  }
};
