import { supabase } from './supabase';

// =============================================
// GENERIC CRUD OPERATIONS
// =============================================

export const fetchAll = async (table, options = {}) => {
  let query = supabase.from(table).select(options.select || '*');

  // Apply filters
  if (options.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  // Apply ordering
  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending !== false });
  } else {
    // Default ordering
    query = query.order('display_order', { ascending: true });
  }

  // Limit results
  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const fetchOne = async (table, id) => {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const fetchBySlug = async (table, slug) => {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
};

export const create = async (table, values) => {
  const { data, error } = await supabase
    .from(table)
    .insert(values)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const update = async (table, id, values) => {
  const { data, error } = await supabase
    .from(table)
    .update(values)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const remove = async (table, id) => {
  const { error } = await supabase.from(table).delete().eq('id', id);

  if (error) throw error;
  return true;
};

// =============================================
// SITE SETTINGS
// =============================================

export const fetchSiteSettings = async () => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

export const updateSiteSettings = async (values) => {
  const settings = await fetchSiteSettings();
  return update('site_settings', settings.id, values);
};

// =============================================
// SEO SETTINGS
// =============================================

export const fetchSEOSettings = async (pageKey) => {
  const { data, error } = await supabase
    .from('seo_settings')
    .select('*')
    .eq('page_key', pageKey)
    .single();

  if (error) throw error;
  return data;
};

export const updateSEOSettings = async (pageKey, values) => {
  const { data, error } = await supabase
    .from('seo_settings')
    .update(values)
    .eq('page_key', pageKey)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// =============================================
// HERO
// =============================================

export const fetchHero = async () => {
  const { data, error } = await supabase
    .from('hero')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
};

export const updateHero = async (values) => {
  const hero = await fetchHero();
  return update('hero', hero.id, values);
};

// =============================================
// SERVICES
// =============================================

export const fetchServices = async (category = null) => {
  return fetchAll('services', {
    filter: category ? { category, is_active: true } : { is_active: true },
    orderBy: 'display_order',
  });
};

export const fetchServiceBySlug = async (slug) => {
  return fetchBySlug('services', slug);
};

export const createService = async (values) => {
  return create('services', values);
};

export const updateService = async (id, values) => {
  return update('services', id, values);
};

export const deleteService = async (id) => {
  return remove('services', id);
};

// =============================================
// PROJECTS
// =============================================

export const fetchProjects = async (category = null, featured = false) => {
  const filter = { is_active: true };
  if (category) filter.category = category;
  if (featured) filter.is_featured = true;

  return fetchAll('projects', {
    filter,
    orderBy: 'display_order',
  });
};

export const fetchProjectBySlug = async (slug) => {
  return fetchBySlug('projects', slug);
};

export const createProject = async (values) => {
  return create('projects', values);
};

export const updateProject = async (id, values) => {
  return update('projects', id, values);
};

export const deleteProject = async (id) => {
  return remove('projects', id);
};

// =============================================
// MOCKUPS
// =============================================

export const fetchMockups = async (category = null) => {
  return fetchAll('mockups', {
    filter: category ? { category, is_active: true } : { is_active: true },
    orderBy: 'display_order',
  });
};

export const createMockup = async (values) => {
  return create('mockups', values);
};

export const updateMockup = async (id, values) => {
  return update('mockups', id, values);
};

export const deleteMockup = async (id) => {
  return remove('mockups', id);
};

// =============================================
// TESTIMONIALS
// =============================================

export const fetchTestimonials = async (featured = false) => {
  return fetchAll('testimonials', {
    filter: featured ? { is_featured: true, is_active: true } : { is_active: true },
    orderBy: 'display_order',
  });
};

export const createTestimonial = async (values) => {
  return create('testimonials', values);
};

export const updateTestimonial = async (id, values) => {
  return update('testimonials', id, values);
};

export const deleteTestimonial = async (id) => {
  return remove('testimonials', id);
};

// =============================================
// FAQs
// =============================================

export const fetchFAQs = async (pageKey) => {
  return fetchAll('faqs', {
    filter: { page_key: pageKey, is_active: true },
    orderBy: 'display_order',
  });
};

export const createFAQ = async (values) => {
  return create('faqs', values);
};

export const updateFAQ = async (id, values) => {
  return update('faqs', id, values);
};

export const deleteFAQ = async (id) => {
  return remove('faqs', id);
};

// =============================================
// CLIENT LOGOS
// =============================================

export const fetchClientLogos = async () => {
  return fetchAll('client_logos', {
    filter: { is_active: true },
    orderBy: 'display_order',
  });
};

export const createClientLogo = async (values) => {
  return create('client_logos', values);
};

export const updateClientLogo = async (id, values) => {
  return update('client_logos', id, values);
};

export const deleteClientLogo = async (id) => {
  return remove('client_logos', id);
};

// =============================================
// TRUST BADGES
// =============================================

export const fetchTrustBadges = async () => {
  return fetchAll('trust_badges', {
    filter: { is_active: true },
    orderBy: 'display_order',
  });
};

// =============================================
// PROCESS STEPS
// =============================================

export const fetchProcessSteps = async () => {
  return fetchAll('process_steps', {
    filter: { is_active: true },
    orderBy: 'display_order',
  });
};

// =============================================
// WHY CHOOSE US
// =============================================

export const fetchWhyChooseUs = async () => {
  return fetchAll('why_choose_us', {
    filter: { is_active: true },
    orderBy: 'display_order',
  });
};

// =============================================
// ABOUT PAGE DATA
// =============================================

export const fetchCountries = async () => {
  return fetchAll('countries', {
    filter: { is_active: true },
    orderBy: 'display_order',
  });
};

export const fetchTimeline = async () => {
  return fetchAll('timeline_milestones', {
    filter: { is_active: true },
    orderBy: 'year',
    ascending: true,
  });
};

export const fetchValues = async () => {
  return fetchAll('values', {
    filter: { is_active: true },
    orderBy: 'display_order',
  });
};

export const fetchStats = async () => {
  return fetchAll('stats', {
    filter: { is_active: true },
    orderBy: 'display_order',
  });
};

// =============================================
// BLOG POSTS
// =============================================

export const fetchBlogPosts = async (status = 'published') => {
  return fetchAll('blog_posts', {
    filter: { status },
    orderBy: 'published_at',
    ascending: false,
  });
};

export const fetchBlogPostBySlug = async (slug) => {
  return fetchBySlug('blog_posts', slug);
};

export const createBlogPost = async (values) => {
  return create('blog_posts', values);
};

export const updateBlogPost = async (id, values) => {
  return update('blog_posts', id, values);
};

export const deleteBlogPost = async (id) => {
  return remove('blog_posts', id);
};

// =============================================
// MESSAGES (Contact Form)
// =============================================

export const createMessage = async (values) => {
  return create('messages', {
    ...values,
    source: values.source || 'contact_form',
    status: 'new',
  });
};

export const fetchMessages = async (source = null, status = null) => {
  const filter = {};
  if (source) filter.source = source;
  if (status) filter.status = status;

  return fetchAll('messages', {
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    orderBy: 'created_at',
    ascending: false,
  });
};

export const updateMessageStatus = async (id, status, notes = null) => {
  const updates = { status };
  if (notes !== null) updates.notes = notes;
  return update('messages', id, updates);
};

export const deleteMessage = async (id) => {
  return remove('messages', id);
};

// =============================================
// MEDIA LIBRARY
// =============================================

export const fetchMedia = async (fileType = null) => {
  return fetchAll('media', {
    filter: fileType ? { file_type: fileType } : undefined,
    orderBy: 'created_at',
    ascending: false,
  });
};

export const createMedia = async (values) => {
  return create('media', values);
};

export const deleteMedia = async (id, filePath) => {
  // Delete from storage first
  const bucket = filePath.split('/')[0]; // Extract bucket name
  const path = filePath.substring(bucket.length + 1); // Remove bucket from path
  
  await supabase.storage.from(bucket).remove([path]);
  
  // Then delete from database
  return remove('media', id);
};
