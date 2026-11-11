import { supabase } from './supabase';

// =============================================
// MISSING TABLE CACHE
// =============================================
// Session-level cache for missing tables to prevent repeated 404 requests
const missingTablesCache = new Set();

/**
 * Check if a table is known to be missing in this session
 * @param {string} table - Table name
 * @returns {boolean}
 */
const isTableMissing = (table) => {
  return missingTablesCache.has(table);
};

/**
 * Mark a table as missing for this session
 * @param {string} table - Table name
 */
const markTableMissing = (table) => {
  missingTablesCache.add(table);
  if (import.meta.env.DEV) {
    console.warn(`⚠️ Table "${table}" not found in database. Feature disabled. Run migrations to enable.`);
  }
};

// =============================================
// REQUEST TIMEOUT WRAPPER
// =============================================

/**
 * Wraps a promise with a timeout to prevent hanging requests
 * @param {Promise} promise - The promise to wrap
 * @param {number} timeoutMs - Timeout in milliseconds (default: 10000)
 * @param {string} operation - Operation name for error message
 * @returns {Promise} Promise that resolves/rejects with timeout
 */
const withTimeout = (promise, timeoutMs = 10000, operation = 'Request') => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
};

/**
 * Wraps an async function with timeout and retry logic
 * @param {Function} fn - Async function to wrap
 * @param {string} operation - Operation name for logging
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Function} Wrapped function
 */
const withTimeoutAndRetry = (fn, operation, timeoutMs = 10000) => {
  return async (...args) => {
    const startTime = Date.now();
    let slowWarningTimeout;
    
    // In development, warn if request takes >5 seconds
    if (import.meta.env.DEV) {
      slowWarningTimeout = setTimeout(() => {
        const elapsed = Date.now() - startTime;
        console.warn(`⚠️ [Slow Request] ${operation} pending for ${elapsed}ms - may be stuck`, args);
      }, 5000);
    }
    
    try {
      // First attempt with timeout
      const result = await withTimeout(fn(...args), timeoutMs, operation);
      clearTimeout(slowWarningTimeout);
      return result;
    } catch (error) {
      clearTimeout(slowWarningTimeout);
      
      // Don't retry PGRST205 (table not found) - it won't succeed
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        throw error;
      }
      
      console.warn(`${operation} failed (attempt 1/2):`, error.message);
      
      // Retry once after short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        return await withTimeout(fn(...args), timeoutMs, operation);
      } catch (retryError) {
        console.error(`${operation} failed after retry:`, retryError.message);
        
        // Development: Log detailed error
        if (import.meta.env.DEV) {
          console.error('Request details:', { operation, args, error: retryError });
        }
        
        throw retryError;
      }
    }
  };
};

// =============================================
// GENERIC CRUD OPERATIONS
// =============================================

export const fetchAll = withTimeoutAndRetry(async (table, options = {}) => {
  // Check if table is known to be missing
  if (isTableMissing(table)) {
    return { data: [], error: null };
  }

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
  
  // Handle PGRST205: table not found - cache and treat as "no data"
  if (error) {
    if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
      markTableMissing(table);
      return [];
    }
    throw error;
  }
  
  return data;
}, 'fetchAll', 10000);

export const fetchOne = withTimeoutAndRetry(async (table, id) => {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}, 'fetchOne', 10000);

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

export const fetchSiteSettings = withTimeoutAndRetry(async () => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  
  // Return default settings if no data exists
  if (!data) {
    return {
      site_name: 'Sentivra',
      site_tagline: 'From Ideas to Real Digital Products',
      contact_email: 'info@sentivra.com',
      contact_phone: '',
      contact_address: '',
      social_facebook: '',
      social_twitter: '',
      social_linkedin: '',
      social_instagram: '',
      social_github: '',
    };
  }
  
  return data;
}, 'fetchSiteSettings', 10000);

export const updateSiteSettings = async (values) => {
  const settings = await fetchSiteSettings();
  
  // If settings has an ID, update it; otherwise insert new one
  if (settings && settings.id) {
    return update('site_settings', settings.id, values);
  } else {
    return create('site_settings', values);
  }
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

export const fetchHero = withTimeoutAndRetry(async () => {
  const { data, error } = await supabase
    .from('hero')
    .select('*')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  
  // Return default hero if no data exists
  if (!data) {
    return {
      headline: 'From Ideas to Real Digital Products',
      subheadline: 'We transform your business ideas into powerful software solutions',
      cta_primary_text: 'Get Started',
      cta_primary_link: '/contact',
      cta_secondary_text: 'View Our Work',
      cta_secondary_link: '/our-work',
      video_url: '',
      video_webm_url: '',
      video_poster_url: '',
      is_active: true,
    };
  }
  
  return data;
}, 'fetchHero', 10000);

export const updateHero = async (values) => {
  const hero = await fetchHero();
  
  // If hero has an ID, update it; otherwise insert new one
  if (hero && hero.id) {
    return update('hero', hero.id, values);
  } else {
    // Create new hero (this should be rare, only if database is empty)
    return create('hero', { ...values, is_active: true });
  }
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

export const createCountry = async (values) => {
  return create('countries', values);
};

export const updateCountry = async (id, values) => {
  return update('countries', id, values);
};

export const deleteCountry = async (id) => {
  return remove('countries', id);
};

export const fetchTimeline = async () => {
  return fetchAll('timeline_milestones', {
    filter: { is_active: true },
    orderBy: 'year',
    ascending: true,
  });
};

export const createTimelineMilestone = async (values) => {
  return create('timeline_milestones', values);
};

export const updateTimelineMilestone = async (id, values) => {
  return update('timeline_milestones', id, values);
};

export const deleteTimelineMilestone = async (id) => {
  return remove('timeline_milestones', id);
};

export const fetchValues = async () => {
  return fetchAll('values', {
    filter: { is_active: true },
    orderBy: 'display_order',
  });
};

export const createValue = async (values) => {
  return create('values', values);
};

export const updateValue = async (id, values) => {
  return update('values', id, values);
};

export const deleteValue = async (id) => {
  return remove('values', id);
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
  let query = supabase
    .from('messages')
    .select(`
      *,
      mockups:mockup_id (
        id,
        slug,
        title_en,
        title_ar,
        cover_image_url,
        desktop_screenshot_url
      )
    `)
    .order('created_at', { ascending: false });

  if (source) query = query.eq('source', source);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
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


// =============================================
// MARQUEE ITEMS
// =============================================

export const fetchMarqueeItems = async (rowNumber = null) => {
  return fetchAll('marquee_items', {
    filter: rowNumber ? { row_number: rowNumber, is_published: true } : { is_published: true },
    orderBy: 'display_order',
  });
};

export const fetchAllMarqueeItems = async () => {
  return fetchAll('marquee_items', {
    orderBy: 'display_order',
  });
};

export const createMarqueeItem = async (values) => {
  return create('marquee_items', values);
};

export const updateMarqueeItem = async (id, values) => {
  return update('marquee_items', id, values);
};

export const deleteMarqueeItem = async (id) => {
  return remove('marquee_items', id);
};


// =============================================
// PAGE CONTENT (New)
// =============================================

export const fetchPageContent = async (pageKey, sectionKey) => {
  const { data, error } = await supabase
    .from('page_content')
    .select('*')
    .eq('page_key', pageKey)
    .eq('section_key', sectionKey)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
};

export const fetchAllPageContent = async (pageKey) => {
  const { data, error } = await supabase
    .from('page_content')
    .select('*')
    .eq('page_key', pageKey)
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data;
};

export const updatePageContent = async ({ id, ...updates }) => {
  const { data, error } = await supabase
    .from('page_content')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// =============================================
// SERVICE CATEGORIES (New)
// =============================================

export const fetchServiceCategories = async () => {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data;
};

export const fetchServiceCategory = async (slug) => {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
};

export const createServiceCategory = async (categoryData) => {
  const { data, error } = await supabase
    .from('service_categories')
    .insert([categoryData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateServiceCategory = async (id, updates) => {
  const { data, error } = await supabase
    .from('service_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteServiceCategory = async (id) => {
  const { error } = await supabase
    .from('service_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};


// =============================================
// PROJECT CATEGORIES
// =============================================

export const fetchProjectCategories = async () => {
  const { data, error } = await supabase
    .from('project_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data;
};

export const fetchProjectCategory = async (slug) => {
  const { data, error } = await supabase
    .from('project_categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
};

export const createProjectCategory = async (categoryData) => {
  const { data, error } = await supabase
    .from('project_categories')
    .insert([categoryData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProjectCategory = async (id, updates) => {
  const { data, error } = await supabase
    .from('project_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProjectCategory = async (id) => {
  const { error } = await supabase
    .from('project_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// =============================================
// MOCKUP CATEGORIES
// =============================================

export const fetchMockupCategories = async () => {
  const { data, error } = await supabase
    .from('mockup_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data;
};

export const getMockupCategories = async () => {
  return await withTimeoutAndRetry(
    () => fetchMockupCategories(),
    'Fetch mockup categories'
  );
};

export const fetchMockupCategoryBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('mockup_categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
};

export const getMockupCategoryBySlug = async (slug) => {
  return await withTimeoutAndRetry(
    () => fetchMockupCategoryBySlug(slug),
    `Fetch mockup category ${slug}`
  );
};

export const createMockupCategory = async (categoryData) => {
  const { data, error } = await supabase
    .from('mockup_categories')
    .insert([categoryData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateMockupCategory = async (id, updates) => {
  const { data, error } = await supabase
    .from('mockup_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteMockupCategory = async (id) => {
  const { error } = await supabase
    .from('mockup_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};
