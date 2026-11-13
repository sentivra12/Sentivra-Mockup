/**
 * Mockups API - Clean data layer
 * All functions return data or THROW errors (never swallow)
 */

import { supabase } from '@/lib/supabase';

// ============================================================================
// CATEGORIES
// ============================================================================

export async function fetchMockupCategories() {
  const { data, error } = await supabase
    .from('mockup_categories')
    .select('*')
    .order('display_order');

  if (error) throw error;
  return data || [];
}

// ============================================================================
// MOCKUPS - PUBLIC
// ============================================================================

export async function fetchPublicMockups(categorySlug = null) {
  let query = supabase
    .from('mockups')
    .select(`
      *,
      category:mockup_categories(id, slug, name_en, name_ar, icon)
    `)
    .eq('is_active', true)
    .order('display_order');

  if (categorySlug) {
    query = query.eq('mockup_categories.slug', categorySlug);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchFeaturedMockups(limit = 6) {
  const { data, error } = await supabase
    .from('mockups')
    .select(`
      *,
      category:mockup_categories(id, slug, name_en, name_ar, icon)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('display_order')
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function fetchMockupBySlug(slug) {
  const { data, error } = await supabase
    .from('mockups')
    .select(`
      *,
      category:mockup_categories(id, slug, name_en, name_ar, icon)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// MOCKUPS - ADMIN
// ============================================================================

export async function fetchAllMockups() {
  const { data, error } = await supabase
    .from('mockups')
    .select(`
      *,
      category:mockup_categories(id, slug, name_en, name_ar, icon)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createMockup(mockup) {
  const { data, error } = await supabase
    .from('mockups')
    .insert([mockup])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMockup(id, updates) {
  const { data, error } = await supabase
    .from('mockups')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMockup(id) {
  const { error } = await supabase
    .from('mockups')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// FILE UPLOAD
// ============================================================================

export async function uploadMockupImage(file, path = null) {
  if (!file) throw new Error('No file provided');

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const extension = file.name.split('.').pop();
  const filename = path || `mockups/${timestamp}-${randomString}.${extension}`;

  const { data, error } = await supabase.storage
    .from('site-media')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('site-media')
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function deleteFile(url) {
  if (!url) return;

  // Extract path from public URL
  const urlParts = url.split('/site-media/');
  if (urlParts.length < 2) return;

  const path = urlParts[1];
  const { error } = await supabase.storage
    .from('site-media')
    .remove([path]);

  if (error) throw error;
}

// ============================================================================
// SYSTEM CHECK (for admin diagnostics)
// ============================================================================

export async function runSystemCheck() {
  const results = {
    canReadCategories: false,
    categoriesCount: 0,
    isAdmin: false,
    canInsertMockup: false,
    canDeleteMockup: false,
    canUploadFile: false,
    canDeleteFile: false,
    errors: [],
  };

  // Check 1: Read categories
  try {
    const categories = await fetchMockupCategories();
    results.canReadCategories = true;
    results.categoriesCount = categories.length;
  } catch (error) {
    results.errors.push({ check: 'Read categories', error: error.message });
  }

  // Check 2: is_admin()
  try {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) throw error;
    results.isAdmin = data === true;
  } catch (error) {
    results.errors.push({ check: 'is_admin()', error: error.message });
  }

  // Check 3: Insert test mockup
  try {
    const testMockup = {
      slug: `test-${Date.now()}`,
      title_en: 'System Check Test',
      is_active: false,
    };
    const created = await createMockup(testMockup);
    results.canInsertMockup = true;

    // Check 4: Delete test mockup
    try {
      await deleteMockup(created.id);
      results.canDeleteMockup = true;
    } catch (error) {
      results.errors.push({ check: 'Delete mockup', error: error.message });
    }
  } catch (error) {
    results.errors.push({ check: 'Insert mockup', error: error.message });
  }

  // Check 5: Upload test file
  try {
    const testBlob = new Blob(['test'], { type: 'image/png' });
    const testFile = new File([testBlob], 'test.png', { type: 'image/png' });
    const url = await uploadMockupImage(testFile, `test/system-check-${Date.now()}.png`);
    results.canUploadFile = true;

    // Check 6: Delete test file
    try {
      await deleteFile(url);
      results.canDeleteFile = true;
    } catch (error) {
      results.errors.push({ check: 'Delete file', error: error.message });
    }
  } catch (error) {
    results.errors.push({ check: 'Upload file', error: error.message });
  }

  return results;
}
