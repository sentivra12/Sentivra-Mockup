/**
 * Custom React hooks for fetching data from Supabase
 * Provides loading states, error handling, and bilingual support
 */

import { useState, useEffect } from 'react';
import { supabase, isMissingEnv } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Base hook for fetching data with loading and error states
 * @param {Function} fetchFunction - Async function that fetches data
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {Object} { data, loading, error, refetch }
 */
const useQuery = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      console.error('Query error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook to fetch all services
 * Supports bilingual data (English/Arabic)
 * @param {Object} options - Query options
 * @param {string} options.category - Filter by category
 * @param {boolean} options.featured - Filter featured services
 * @returns {Object} { services, loading, error, refetch }
 */
export const useServices = ({ category, featured } = {}) => {
  const { language } = useLanguage();
  
  const fetchServices = async () => {
    if (isMissingEnv) {
      throw new Error('Supabase environment variables are not configured');
    }

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

    if (error) throw error;

    // Map bilingual fields based on current language
    return data.map(service => ({
      ...service,
      title: language === 'ar' && service.title_ar ? service.title_ar : service.title,
      short_description: language === 'ar' && service.short_description_ar 
        ? service.short_description_ar 
        : service.short_description,
      long_description: language === 'ar' && service.long_description_ar 
        ? service.long_description_ar 
        : service.long_description,
      features: language === 'ar' && service.features_ar 
        ? service.features_ar 
        : service.features,
      benefits: language === 'ar' && service.benefits_ar 
        ? service.benefits_ar 
        : service.benefits,
    }));
  };

  return useQuery(fetchServices, [category, featured, language]);
};

/**
 * Hook to fetch a single service by slug
 * @param {string} slug - Service slug
 * @returns {Object} { service, loading, error, refetch }
 */
export const useService = (slug) => {
  const { language } = useLanguage();
  
  const fetchService = async () => {
    if (isMissingEnv) {
      throw new Error('Supabase environment variables are not configured');
    }

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    // Map bilingual fields
    return {
      ...data,
      title: language === 'ar' && data.title_ar ? data.title_ar : data.title,
      short_description: language === 'ar' && data.short_description_ar 
        ? data.short_description_ar 
        : data.short_description,
      long_description: language === 'ar' && data.long_description_ar 
        ? data.long_description_ar 
        : data.long_description,
      features: language === 'ar' && data.features_ar 
        ? data.features_ar 
        : data.features,
      benefits: language === 'ar' && data.benefits_ar 
        ? data.benefits_ar 
        : data.benefits,
    };
  };

  return useQuery(fetchService, [slug, language]);
};

/**
 * Hook to fetch all projects
 * @param {Object} options - Query options
 * @param {string} options.category - Filter by category
 * @param {boolean} options.featured - Filter featured projects
 * @returns {Object} { projects, loading, error, refetch }
 */
export const useProjects = ({ category, featured } = {}) => {
  const { language } = useLanguage();
  
  const fetchProjects = async () => {
    if (isMissingEnv) {
      throw new Error('Supabase environment variables are not configured');
    }

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

    if (error) throw error;

    // Map bilingual fields
    return data.map(project => ({
      ...project,
      title: language === 'ar' && project.title_ar ? project.title_ar : project.title,
      short_description: language === 'ar' && project.short_description_ar 
        ? project.short_description_ar 
        : project.short_description,
      long_description: language === 'ar' && project.long_description_ar 
        ? project.long_description_ar 
        : project.long_description,
    }));
  };

  return useQuery(fetchProjects, [category, featured, language]);
};

/**
 * Hook to fetch a single project by slug
 * @param {string} slug - Project slug
 * @returns {Object} { project, loading, error, refetch }
 */
export const useProject = (slug) => {
  const { language } = useLanguage();
  
  const fetchProject = async () => {
    if (isMissingEnv) {
      throw new Error('Supabase environment variables are not configured');
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    // Map bilingual fields
    return {
      ...data,
      title: language === 'ar' && data.title_ar ? data.title_ar : data.title,
      short_description: language === 'ar' && data.short_description_ar 
        ? data.short_description_ar 
        : data.short_description,
      long_description: language === 'ar' && data.long_description_ar 
        ? data.long_description_ar 
        : data.long_description,
    };
  };

  return useQuery(fetchProject, [slug, language]);
};

/**
 * Hook to fetch testimonials
 * @param {Object} options - Query options
 * @param {boolean} options.featured - Filter featured testimonials
 * @param {number} options.limit - Limit number of results
 * @returns {Object} { testimonials, loading, error, refetch }
 */
export const useTestimonials = ({ featured, limit } = {}) => {
  const { language } = useLanguage();
  
  const fetchTestimonials = async () => {
    if (isMissingEnv) {
      throw new Error('Supabase environment variables are not configured');
    }

    let query = supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (featured) {
      query = query.eq('is_featured', true);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Map bilingual fields
    return data.map(testimonial => ({
      ...testimonial,
      testimonial_text: language === 'ar' && testimonial.testimonial_text_ar 
        ? testimonial.testimonial_text_ar 
        : testimonial.testimonial_text,
      client_name: language === 'ar' && testimonial.client_name_ar 
        ? testimonial.client_name_ar 
        : testimonial.client_name,
      client_role: language === 'ar' && testimonial.client_role_ar 
        ? testimonial.client_role_ar 
        : testimonial.client_role,
      client_company: language === 'ar' && testimonial.client_company_ar 
        ? testimonial.client_company_ar 
        : testimonial.client_company,
    }));
  };

  return useQuery(fetchTestimonials, [featured, limit, language]);
};

/**
 * Hook to fetch mockups
 * @param {Object} options - Query options
 * @param {string} options.category - Filter by category
 * @returns {Object} { mockups, loading, error, refetch }
 */
export const useMockups = ({ category } = {}) => {
  const { language } = useLanguage();
  
  const fetchMockups = async () => {
    if (isMissingEnv) {
      throw new Error('Supabase environment variables are not configured');
    }

    let query = supabase
      .from('mockups')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Map bilingual fields
    return data.map(mockup => ({
      ...mockup,
      title: language === 'ar' && mockup.title_ar ? mockup.title_ar : mockup.title,
      description: language === 'ar' && mockup.description_ar 
        ? mockup.description_ar 
        : mockup.description,
      category: language === 'ar' && mockup.category_ar 
        ? mockup.category_ar 
        : mockup.category,
    }));
  };

  return useQuery(fetchMockups, [category, language]);
};

/**
 * Hook to fetch hero section data
 * @returns {Object} { hero, loading, error, refetch }
 */
export const useHero = () => {
  const { language } = useLanguage();
  
  const fetchHero = async () => {
    if (isMissingEnv) {
      throw new Error('Supabase environment variables are not configured');
    }

    const { data, error } = await supabase
      .from('hero')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) throw error;

    // Map bilingual fields
    return {
      ...data,
      headline: language === 'ar' && data.headline_ar ? data.headline_ar : data.headline,
      subheadline: language === 'ar' && data.subheadline_ar 
        ? data.subheadline_ar 
        : data.subheadline,
      cta_primary_text: language === 'ar' && data.cta_primary_text_ar 
        ? data.cta_primary_text_ar 
        : data.cta_primary_text,
      cta_secondary_text: language === 'ar' && data.cta_secondary_text_ar 
        ? data.cta_secondary_text_ar 
        : data.cta_secondary_text,
    };
  };

  return useQuery(fetchHero, [language]);
};

/**
 * Hook to fetch stats data
 * @returns {Object} { stats, loading, error, refetch }
 */
export const useStats = () => {
  const { language } = useLanguage();
  
  const fetchStats = async () => {
    if (isMissingEnv) {
      throw new Error('Supabase environment variables are not configured');
    }

    const { data, error } = await supabase
      .from('stats')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Map bilingual fields
    return data.map(stat => ({
      ...stat,
      label: language === 'ar' && stat.label_ar ? stat.label_ar : stat.label,
    }));
  };

  return useQuery(fetchStats, [language]);
};

/**
 * Hook to fetch client logos
 * @returns {Object} { logos, loading, error, refetch }
 */
export const useClientLogos = () => {
  const fetchLogos = async () => {
    if (isMissingEnv) {
      throw new Error('Supabase environment variables are not configured');
    }

    const { data, error } = await supabase
      .from('client_logos')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  };

  return useQuery(fetchLogos, []);
};

/**
 * Hook to fetch FAQs by page
 * @param {string} pageKey - Page identifier ('contact', 'mockups', 'general', etc.)
 * @returns {Object} { faqs, loading, error, refetch }
 */
export const useFAQs = (pageKey = 'general') => {
  const { language } = useLanguage();
  
  const fetchFAQs = async () => {
    if (isMissingEnv) {
      throw new Error('Supabase environment variables are not configured');
    }

    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('page_key', pageKey)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Map bilingual fields
    return data.map(faq => ({
      ...faq,
      question: language === 'ar' && faq.question_ar ? faq.question_ar : faq.question,
      answer: language === 'ar' && faq.answer_ar ? faq.answer_ar : faq.answer,
    }));
  };

  return useQuery(fetchFAQs, [pageKey, language]);
};
