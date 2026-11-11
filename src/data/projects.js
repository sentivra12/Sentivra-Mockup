import { supabase, isMissingEnv } from '../lib/supabase';

// Static fallback data (used when Supabase is not configured)
export const projectsStatic = [
  {
    id: 1,
    slug: 'real-estate-platform',
    title: 'Real Estate Platform',
    category: 'Web Applications',
    type: 'Real Estate Platform',
    shortDescription: 'A comprehensive real estate listing and management platform with advanced search and property management features.',
    description: 'Full-featured real estate platform enabling property listings, virtual tours, and seamless client-agent communication.',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
    featured: true
  },
  {
    id: 2,
    slug: 'inventory-management-system',
    title: 'Inventory Management System',
    category: 'ERP Systems',
    type: 'Inventory Management System',
    shortDescription: 'Advanced inventory tracking and warehouse management solution with real-time analytics and reporting.',
    description: 'Enterprise-grade inventory management system with barcode scanning, stock alerts, and automated reordering.',
    techStack: ['Laravel', 'MySQL', 'Vue.js'],
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop',
    featured: true
  },
  {
    id: 3,
    slug: 'healthcare-mobile-app',
    title: 'Healthcare Mobile App',
    category: 'Mobile Applications',
    type: 'Mobile Application',
    shortDescription: 'Patient care mobile application with appointment scheduling, telemedicine, and health records management.',
    description: 'Comprehensive healthcare app connecting patients with doctors, featuring video consultations and prescription management.',
    techStack: ['Flutter', 'Firebase', 'Node.js'],
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
    featured: true
  },
  {
    id: 4,
    slug: 'manufacturing-erp',
    title: 'Manufacturing ERP',
    category: 'ERP Systems',
    type: 'ERP System',
    shortDescription: 'Complete manufacturing resource planning system with production tracking, quality control, and supply chain management.',
    description: 'Integrated ERP solution for manufacturing companies with modules for production, inventory, HR, and finance.',
    techStack: ['React', 'Node.js', 'PostgreSQL'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    featured: true
  },
  {
    id: 5,
    slug: 'ecommerce-platform',
    title: 'E-Commerce Platform',
    category: 'Web Applications',
    type: 'E-Commerce Platform',
    shortDescription: 'Multi-vendor e-commerce marketplace with payment integration, order tracking, and seller dashboard.',
    description: 'Scalable e-commerce platform with advanced product filtering, secure payments, and comprehensive admin panel.',
    techStack: ['React', 'Node.js', 'Stripe', 'PostgreSQL'],
    image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&h=600&fit=crop',
    featured: true
  },
  {
    id: 6,
    slug: 'sales-crm-dashboard',
    title: 'Sales CRM Dashboard',
    category: 'CRM Systems',
    type: 'CRM System',
    shortDescription: 'Customer relationship management platform with lead tracking, pipeline management, and sales analytics.',
    description: 'Powerful CRM system helping sales teams manage contacts, track deals, and automate follow-ups.',
    techStack: ['Vue.js', 'Laravel', 'MySQL'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    featured: true
  },
  {
    id: 7,
    slug: 'fitness-tracking-app',
    title: 'Fitness Tracking App',
    category: 'Mobile Applications',
    type: 'Mobile Application',
    shortDescription: 'Comprehensive fitness and nutrition tracking app with workout plans, calorie counter, and progress analytics.',
    description: 'Mobile fitness companion with personalized workout routines, meal planning, and health goal tracking.',
    techStack: ['React Native', 'Firebase', 'Node.js'],
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=600&fit=crop',
    featured: false
  },
  {
    id: 8,
    slug: 'ai-chatbot-solution',
    title: 'AI Customer Support Bot',
    category: 'AI & Chatbots',
    type: 'AI Chatbot',
    shortDescription: 'Intelligent chatbot powered by AI for automated customer support with natural language processing.',
    description: 'Advanced AI chatbot providing 24/7 customer support with multi-language capabilities and sentiment analysis.',
    techStack: ['Python', 'TensorFlow', 'Node.js', 'React'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
    featured: false
  },
  {
    id: 9,
    slug: 'restaurant-management',
    title: 'Restaurant Management System',
    category: 'Other',
    type: 'Management System',
    shortDescription: 'Complete restaurant management solution with POS, inventory, reservations, and delivery integration.',
    description: 'All-in-one restaurant management platform streamlining operations from order taking to delivery.',
    techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    featured: false
  }
];

// Default export for backward compatibility
export const projects = projectsStatic;

export const projectCategories = [
  { id: 'all', name: 'All Projects' },
  { id: 'web-applications', name: 'Web Applications' },
  { id: 'mobile-applications', name: 'Mobile Applications' },
  { id: 'erp-systems', name: 'ERP Systems' },
  { id: 'crm-systems', name: 'CRM Systems' },
  { id: 'ai-chatbots', name: 'AI & Chatbots' },
  { id: 'other', name: 'Other' }
];

/**
 * Fetch projects from Supabase with optional filters
 * Falls back to static data if Supabase is not configured
 * @param {Object} options - Query options
 * @param {string} options.category - Filter by category
 * @param {boolean} options.featured - Filter featured projects
 * @param {string} options.language - Language code ('en' or 'ar')
 * @returns {Promise<Array>} Projects array
 */
export const fetchProjects = async ({ category, featured, language = 'en' } = {}) => {
  // If Supabase is not configured, return static data
  if (isMissingEnv) {
    console.warn('Using static projects data (Supabase not configured)');
    let filtered = projectsStatic;
    
    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }
    
    if (featured) {
      filtered = filtered.filter(p => p.featured);
    }
    
    return filtered;
  }

  try {
    let query = supabase
      .from('projects')
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
      console.error('Error fetching projects:', error);
      return projectsStatic;
    }

    // Map bilingual fields and convert database structure to frontend format
    return data.map(project => ({
      ...project,
      title: language === 'ar' && project.title_ar ? project.title_ar : project.title,
      shortDescription: language === 'ar' && project.short_description_ar 
        ? project.short_description_ar 
        : project.short_description,
      description: language === 'ar' && project.long_description_ar 
        ? project.long_description_ar 
        : project.long_description,
      techStack: project.technologies || [],
      image: project.image_url,
    }));
  } catch (err) {
    console.error('Error fetching projects:', err);
    return projectsStatic;
  }
};

/**
 * Fetch a single project by slug
 * @param {string} slug - Project slug
 * @param {string} language - Language code ('en' or 'ar')
 * @returns {Promise<Object|null>} Project object or null
 */
export const fetchProjectBySlug = async (slug, language = 'en') => {
  // If Supabase is not configured, return from static data
  if (isMissingEnv) {
    console.warn('Using static projects data (Supabase not configured)');
    return projectsStatic.find(p => p.slug === slug) || null;
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return projectsStatic.find(p => p.slug === slug) || null;
    }

    // Map bilingual fields
    return {
      ...data,
      title: language === 'ar' && data.title_ar ? data.title_ar : data.title,
      shortDescription: language === 'ar' && data.short_description_ar 
        ? data.short_description_ar 
        : data.short_description,
      description: language === 'ar' && data.long_description_ar 
        ? data.long_description_ar 
        : data.long_description,
      techStack: data.technologies || [],
      image: data.image_url,
    };
  } catch (err) {
    console.error('Error fetching project:', err);
    return projectsStatic.find(p => p.slug === slug) || null;
  }
};
