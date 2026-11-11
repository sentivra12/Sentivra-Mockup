import { supabase, isMissingEnv } from '../lib/supabase';

// Static fallback data (used when Supabase is not configured)
export const testimonialsStatic = [
  {
    id: 1,
    text: "Working with Sentivra was an absolute pleasure. They transformed our vision into a powerful platform that exceeded our expectations. Their attention to detail and commitment to quality is unmatched.",
    clientName: "Ahmed Mostafa",
    clientRole: "CEO",
    clientCompany: "Nome Salat",
    clientPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    rating: 5
  },
  {
    id: 2,
    text: "The team's expertise in developing our ERP system was exceptional. They understood our complex requirements and delivered a solution that streamlined our entire operation.",
    clientName: "Sarah Ahmed",
    clientRole: "Operations Director",
    clientCompany: "Tech Solutions Inc",
    clientPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    rating: 5
  },
  {
    id: 3,
    text: "From concept to launch, Sentivra guided us every step of the way. Their mobile app development expertise helped us reach thousands of users within the first month.",
    clientName: "Mohamed Hassan",
    clientRole: "Founder",
    clientCompany: "Health Plus",
    clientPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    rating: 5
  }
];

// Default export for backward compatibility
export const testimonials = testimonialsStatic;

/**
 * Fetch testimonials from Supabase
 * Falls back to static data if Supabase is not configured
 * @param {Object} options - Query options
 * @param {boolean} options.featured - Filter featured testimonials
 * @param {number} options.limit - Limit number of results
 * @param {string} options.language - Language code ('en' or 'ar')
 * @returns {Promise<Array>} Testimonials array
 */
export const fetchTestimonials = async ({ featured, limit, language = 'en' } = {}) => {
  // If Supabase is not configured, return static data
  if (isMissingEnv) {
    console.warn('Using static testimonials data (Supabase not configured)');
    let filtered = testimonialsStatic;
    
    if (featured) {
      filtered = filtered.filter(t => t.rating === 5);
    }
    
    if (limit) {
      filtered = filtered.slice(0, limit);
    }
    
    return filtered;
  }

  try {
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

    if (error) {
      console.error('Error fetching testimonials:', error);
      return testimonialsStatic;
    }

    // Map bilingual fields and convert database structure to frontend format
    return data.map(testimonial => ({
      id: testimonial.id,
      text: language === 'ar' && testimonial.testimonial_text_ar 
        ? testimonial.testimonial_text_ar 
        : testimonial.testimonial_text,
      clientName: language === 'ar' && testimonial.client_name_ar 
        ? testimonial.client_name_ar 
        : testimonial.client_name,
      clientRole: language === 'ar' && testimonial.client_role_ar 
        ? testimonial.client_role_ar 
        : testimonial.client_role,
      clientCompany: language === 'ar' && testimonial.client_company_ar 
        ? testimonial.client_company_ar 
        : testimonial.client_company,
      clientPhoto: testimonial.client_photo_url,
      rating: testimonial.rating,
    }));
  } catch (err) {
    console.error('Error fetching testimonials:', err);
    return testimonialsStatic;
  }
};

