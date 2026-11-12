-- ============================================================================
-- Comprehensive Catch-Up Migration
-- Brings ANY database (fresh or partially migrated) to the expected schema
-- Author: Kiro AI
-- Date: 2026-11-18 12:00:00
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- HELPER FUNCTIONS FOR SECURITY
-- ============================================================================

-- Create a SECURITY DEFINER function to check admin role without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- Check if current user has admin role in user_roles table
  -- This function bypasses RLS on user_roles to prevent infinite recursion
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND is_active = TRUE
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Revoke execute from anon (only authenticated users can call this)
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================================================
-- USER ROLES TABLE (for admin permissions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
DROP POLICY IF EXISTS "user_roles_select_own" ON user_roles;
CREATE POLICY "user_roles_select_own"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- Only admins can manage roles
DROP POLICY IF EXISTS "user_roles_insert_admin" ON user_roles;
CREATE POLICY "user_roles_insert_admin"
  ON user_roles FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "user_roles_update_admin" ON user_roles;
CREATE POLICY "user_roles_update_admin"
  ON user_roles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "user_roles_delete_admin" ON user_roles;
CREATE POLICY "user_roles_delete_admin"
  ON user_roles FOR DELETE
  USING (public.is_admin());

-- ============================================================================
-- SITE SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT NOT NULL DEFAULT 'Sentivra',
  site_tagline TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_address TEXT,
  whatsapp_number TEXT,
  social_facebook TEXT,
  social_twitter TEXT,
  social_linkedin TEXT,
  social_instagram TEXT,
  social_github TEXT,
  enable_cookie_banner BOOLEAN DEFAULT FALSE,
  ga4_measurement_id TEXT,
  meta_pixel_id TEXT,
  google_ads_id TEXT,
  google_ads_conversion_label TEXT,
  tiktok_pixel_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='enable_cookie_banner') THEN
    ALTER TABLE site_settings ADD COLUMN enable_cookie_banner BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='ga4_measurement_id') THEN
    ALTER TABLE site_settings ADD COLUMN ga4_measurement_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='meta_pixel_id') THEN
    ALTER TABLE site_settings ADD COLUMN meta_pixel_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='google_ads_id') THEN
    ALTER TABLE site_settings ADD COLUMN google_ads_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='google_ads_conversion_label') THEN
    ALTER TABLE site_settings ADD COLUMN google_ads_conversion_label TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='tiktok_pixel_id') THEN
    ALTER TABLE site_settings ADD COLUMN tiktok_pixel_id TEXT;
  END IF;
END $$;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_select" ON site_settings;
CREATE POLICY "site_settings_select"
  ON site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "site_settings_insert" ON site_settings;
CREATE POLICY "site_settings_insert"
  ON site_settings FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "site_settings_update" ON site_settings;
CREATE POLICY "site_settings_update"
  ON site_settings FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "site_settings_delete" ON site_settings;
CREATE POLICY "site_settings_delete"
  ON site_settings FOR DELETE
  USING (public.is_admin());

-- ============================================================================
-- SEO SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  keywords TEXT,
  og_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seo_settings_select" ON seo_settings;
CREATE POLICY "seo_settings_select"
  ON seo_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "seo_settings_manage" ON seo_settings;
CREATE POLICY "seo_settings_manage"
  ON seo_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- SERVICES
-- ============================================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  icon TEXT,
  image_url TEXT,
  category TEXT,
  category_id UUID,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add bilingual columns if they don't exist (for existing tables)
DO $$ 
BEGIN
  -- If old single-language columns exist, rename them first
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='title' AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='title_en')) THEN
    ALTER TABLE services RENAME COLUMN title TO title_en;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='short_description' AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='short_description_en')) THEN
    ALTER TABLE services RENAME COLUMN short_description TO short_description_en;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='long_description' AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='long_description_en')) THEN
    ALTER TABLE services RENAME COLUMN long_description TO long_description_en;
  END IF;
  
  -- Add Arabic columns if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='title_ar') THEN
    ALTER TABLE services ADD COLUMN title_ar TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='short_description_ar') THEN
    ALTER TABLE services ADD COLUMN short_description_ar TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='long_description_ar') THEN
    ALTER TABLE services ADD COLUMN long_description_ar TEXT;
  END IF;
  
  -- Add category_id if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='category_id') THEN
    ALTER TABLE services ADD COLUMN category_id UUID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_select" ON services;
CREATE POLICY "services_select"
  ON services FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "services_manage" ON services;
CREATE POLICY "services_manage"
  ON services FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- SERVICE CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT NOT NULL DEFAULT 'Layers',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_categories_slug ON service_categories(slug);

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_categories_select" ON service_categories;
CREATE POLICY "service_categories_select"
  ON service_categories FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "service_categories_manage" ON service_categories;
CREATE POLICY "service_categories_manage"
  ON service_categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- PROJECTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  category TEXT,
  category_id UUID,
  client_name TEXT,
  industry TEXT,
  project_year INTEGER,
  image_url TEXT,
  thumbnail_url TEXT,
  gallery_images TEXT[],
  technologies JSONB,
  features JSONB,
  demo_url TEXT,
  github_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add bilingual columns
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='title' AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='title_en')) THEN
    ALTER TABLE projects RENAME COLUMN title TO title_en;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='short_description' AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='short_description_en')) THEN
    ALTER TABLE projects RENAME COLUMN short_description TO short_description_en;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='long_description' AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='long_description_en')) THEN
    ALTER TABLE projects RENAME COLUMN long_description TO long_description_en;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='title_ar') THEN
    ALTER TABLE projects ADD COLUMN title_ar TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='short_description_ar') THEN
    ALTER TABLE projects ADD COLUMN short_description_ar TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='long_description_ar') THEN
    ALTER TABLE projects ADD COLUMN long_description_ar TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='category_id') THEN
    ALTER TABLE projects ADD COLUMN category_id UUID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON projects(category_id);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_select" ON projects;
CREATE POLICY "projects_select"
  ON projects FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "projects_manage" ON projects;
CREATE POLICY "projects_manage"
  ON projects FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- PROJECT CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT NOT NULL DEFAULT 'Folder',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_categories_slug ON project_categories(slug);

ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project_categories_select" ON project_categories;
CREATE POLICY "project_categories_select"
  ON project_categories FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "project_categories_manage" ON project_categories;
CREATE POLICY "project_categories_manage"
  ON project_categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- MOCKUPS
-- ============================================================================
CREATE TABLE IF NOT EXISTS mockups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  category_id UUID,
  image_url TEXT,
  desktop_screenshot_url TEXT,
  desktop_screenshot_alt_en TEXT,
  desktop_screenshot_alt_ar TEXT,
  full_page_screenshot_url TEXT,
  tablet_screenshot_url TEXT,
  mobile_screenshot_url TEXT,
  cover_image_url TEXT,
  thumbnail_url TEXT,
  demo_url TEXT,
  download_url TEXT,
  live_url TEXT,
  client_name TEXT,
  industry TEXT,
  project_year INTEGER,
  whats_included JSONB,
  features JSONB,
  technologies JSONB,
  tags TEXT[],
  gallery_images TEXT[],
  open_in_new_tab BOOLEAN DEFAULT TRUE,
  is_new BOOLEAN DEFAULT FALSE,
  is_popular BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add bilingual columns
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mockups' AND column_name='title' AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mockups' AND column_name='title_en')) THEN
    ALTER TABLE mockups RENAME COLUMN title TO title_en;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mockups' AND column_name='description' AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mockups' AND column_name='short_description_en')) THEN
    ALTER TABLE mockups RENAME COLUMN description TO short_description_en;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mockups' AND column_name='title_ar') THEN
    ALTER TABLE mockups ADD COLUMN title_ar TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mockups' AND column_name='short_description_ar') THEN
    ALTER TABLE mockups ADD COLUMN short_description_ar TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mockups' AND column_name='long_description_en') THEN
    ALTER TABLE mockups ADD COLUMN long_description_en TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mockups' AND column_name='long_description_ar') THEN
    ALTER TABLE mockups ADD COLUMN long_description_ar TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mockups' AND column_name='category_id') THEN
    ALTER TABLE mockups ADD COLUMN category_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mockups' AND column_name='desktop_screenshot_url') THEN
    ALTER TABLE mockups ADD COLUMN desktop_screenshot_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mockups' AND column_name='live_url') THEN
    ALTER TABLE mockups ADD COLUMN live_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mockups' AND column_name='open_in_new_tab') THEN
    ALTER TABLE mockups ADD COLUMN open_in_new_tab BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_mockups_slug ON mockups(slug);
CREATE INDEX IF NOT EXISTS idx_mockups_category_id ON mockups(category_id);

ALTER TABLE mockups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mockups_select" ON mockups;
CREATE POLICY "mockups_select"
  ON mockups FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "mockups_manage" ON mockups;
CREATE POLICY "mockups_manage"
  ON mockups FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- MOCKUP CATEGORIES  
-- ============================================================================
-- Table already exists, just add missing columns and fix policies

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mockup_categories' AND column_name='color') THEN
    ALTER TABLE mockup_categories ADD COLUMN color TEXT NOT NULL DEFAULT '#3b82f6';
  END IF;
END $$;

DROP POLICY IF EXISTS "Public can view active mockup categories" ON mockup_categories;
DROP POLICY IF EXISTS "Authenticated users can manage mockup categories" ON mockup_categories;
DROP POLICY IF EXISTS "mockup_categories_select_policy" ON mockup_categories;
DROP POLICY IF EXISTS "mockup_categories_insert_policy" ON mockup_categories;
DROP POLICY IF EXISTS "mockup_categories_update_policy" ON mockup_categories;
DROP POLICY IF EXISTS "mockup_categories_delete_policy" ON mockup_categories;

CREATE POLICY "mockup_categories_select"
  ON mockup_categories FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "mockup_categories_manage"
  ON mockup_categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Unpublish the incorrect seed categories (keep only the 8 correct ones)
UPDATE mockup_categories 
SET is_active = FALSE
WHERE slug IN ('all', 'business-corporate', 'ecommerce', 'restaurant-food', 'healthcare', 'education', 'fitness-wellness', 'portfolio-personal');

-- Insert correct categories if they don't exist
INSERT INTO mockup_categories (slug, name_en, name_ar, icon, color, display_order, is_active) VALUES
  ('real-estate-construction', 'Real Estate & Construction', 'العقارات والإنشاءات', 'Building', '#14b8a6', 1, TRUE),
  ('restaurants-cafes', 'Restaurants & Cafés', 'المطاعم والمقاهي', 'Coffee', '#f59e0b', 2, TRUE),
  ('clothing-fashion', 'Clothing & Fashion', 'الملابس والأزياء', 'Shirt', '#ec4899', 3, TRUE),
  ('education', 'Education', 'التعليم', 'GraduationCap', '#6366f1', 4, TRUE),
  ('health-medical', 'Health & Medical', 'الصحة والطب', 'HeartPulse', '#ef4444', 5, TRUE),
  ('industrial-manufacturing', 'Industrial & Manufacturing', 'الصناعة والتصنيع', 'Factory', '#64748b', 6, TRUE),
  ('corporate', 'Corporate', 'شركات', 'Briefcase', '#3b82f6', 7, TRUE),
  ('other', 'Other', 'أخرى', 'Sparkles', '#8b5cf6', 8, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- ============================================================================
-- TESTIMONIALS
-- ============================================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_role TEXT,
  client_position TEXT,
  client_company TEXT,
  client_photo_url TEXT,
  client_photo TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  testimonial_text TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add bilingual columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='client_name_ar') THEN
    ALTER TABLE testimonials ADD COLUMN client_name_ar TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='client_position_ar') THEN
    ALTER TABLE testimonials ADD COLUMN client_position_ar TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='client_company_ar') THEN
    ALTER TABLE testimonials ADD COLUMN client_company_ar TEXT;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='testimonial_text' AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='testimonial_en')) THEN
    ALTER TABLE testimonials RENAME COLUMN testimonial_text TO testimonial_en;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='testimonial_ar') THEN
    ALTER TABLE testimonials ADD COLUMN testimonial_ar TEXT;
  END IF;
END $$;

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "testimonials_select" ON testimonials;
CREATE POLICY "testimonials_select"
  ON testimonials FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "testimonials_manage" ON testimonials;
CREATE POLICY "testimonials_manage"
  ON testimonials FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- FAQs (already exists, just fix columns and policies)
-- ============================================================================
DO $$ 
BEGIN
  -- Rename old columns if they exist
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='faqs' AND column_name='question' AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='faqs' AND column_name='question_en')) THEN
    ALTER TABLE faqs RENAME COLUMN question TO question_en;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='faqs' AND column_name='answer' AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='faqs' AND column_name='answer_en')) THEN
    ALTER TABLE faqs RENAME COLUMN answer TO answer_en;
  END IF;
  
  -- Add Arabic columns if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='faqs' AND column_name='question_ar') THEN
    ALTER TABLE faqs ADD COLUMN question_ar TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='faqs' AND column_name='answer_ar') THEN
    ALTER TABLE faqs ADD COLUMN answer_ar TEXT;
  END IF;
END $$;

DROP POLICY IF EXISTS "Public can view active FAQs" ON faqs;
DROP POLICY IF EXISTS "Authenticated users have full access to faqs" ON faqs;

CREATE POLICY "faqs_select"
  ON faqs FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "faqs_manage"
  ON faqs FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- CLIENT LOGOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_logos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE client_logos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_logos_select" ON client_logos;
CREATE POLICY "client_logos_select"
  ON client_logos FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "client_logos_manage" ON client_logos;
CREATE POLICY "client_logos_manage"
  ON client_logos FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- REMAINING TABLES (trust_badges, process_steps, why_choose_us, countries, 
-- timeline_milestones, values, stats, blog_posts, messages, media, marquee_items)
-- ============================================================================

-- PROCESS STEPS
CREATE TABLE IF NOT EXISTS process_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "process_steps_select" ON process_steps FOR SELECT USING (is_active = TRUE);
CREATE POLICY "process_steps_manage" ON process_steps FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- WHY CHOOSE US
CREATE TABLE IF NOT EXISTS why_choose_us (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE why_choose_us ENABLE ROW LEVEL SECURITY;
CREATE POLICY "why_choose_us_select" ON why_choose_us FOR SELECT USING (is_active = TRUE);
CREATE POLICY "why_choose_us_manage" ON why_choose_us FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- COUNTRIES
CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  flag_emoji TEXT,
  code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "countries_select" ON countries FOR SELECT USING (is_active = TRUE);
CREATE POLICY "countries_manage" ON countries FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- TIMELINE MILESTONES
CREATE TABLE IF NOT EXISTS timeline_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year INTEGER NOT NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE timeline_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timeline_milestones_select" ON timeline_milestones FOR SELECT USING (is_active = TRUE);
CREATE POLICY "timeline_milestones_manage" ON timeline_milestones FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- VALUES
CREATE TABLE IF NOT EXISTS values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "values_select" ON values FOR SELECT USING (is_active = TRUE);
CREATE POLICY "values_manage" ON values FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- STATS
CREATE TABLE IF NOT EXISTS stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label_en TEXT NOT NULL,
  label_ar TEXT NOT NULL,
  value TEXT NOT NULL,
  suffix TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stats_select" ON stats FOR SELECT USING (is_active = TRUE);
CREATE POLICY "stats_manage" ON stats FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- BLOG POSTS
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT,
  featured_image TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_posts_select_published" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "blog_posts_manage" ON blog_posts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  message TEXT NOT NULL,
  source TEXT DEFAULT 'contact_form',
  mockup_id UUID REFERENCES mockups(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_source ON messages(source);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Public can insert messages (contact form)
CREATE POLICY "messages_insert_public"
  ON messages FOR INSERT
  WITH CHECK (
    source IN ('contact_form', 'mockup_request', 'quote_request')
    AND name IS NOT NULL
    AND message IS NOT NULL
  );

-- Only admins can read/update/delete messages
CREATE POLICY "messages_select_admin" ON messages FOR SELECT USING (public.is_admin());
CREATE POLICY "messages_update_admin" ON messages FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "messages_delete_admin" ON messages FOR DELETE USING (public.is_admin());

-- MEDIA LIBRARY
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  alt_text TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_file_type ON media(file_type);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media_select_admin" ON media FOR SELECT USING (public.is_admin());
CREATE POLICY "media_manage_admin" ON media FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- MARQUEE ITEMS
CREATE TABLE IF NOT EXISTS marquee_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text_en TEXT NOT NULL,
  text_ar TEXT NOT NULL,
  row_number INTEGER DEFAULT 1,
  is_published BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marquee_items_row_number ON marquee_items(row_number);

ALTER TABLE marquee_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "marquee_items_select" ON marquee_items FOR SELECT USING (is_published = TRUE);
CREATE POLICY "marquee_items_manage" ON marquee_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- PAGE CONTENT (already exists, ensure all columns)
-- ============================================================================
-- Just drop unsafe policies and add correct ones
DROP POLICY IF EXISTS "page_content_select_policy" ON page_content;
DROP POLICY IF EXISTS "page_content_insert_policy" ON page_content;
DROP POLICY IF EXISTS "page_content_update_policy" ON page_content;
DROP POLICY IF EXISTS "page_content_delete_policy" ON page_content;

CREATE POLICY "page_content_select"
  ON page_content FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "page_content_manage"
  ON page_content FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- HERO (already exists, fix policies)
-- ============================================================================
DROP POLICY IF EXISTS "Public can view active hero" ON hero;
DROP POLICY IF EXISTS "Authenticated users have full access to hero" ON hero;

CREATE POLICY "hero_select" ON hero FOR SELECT USING (is_active = TRUE);
CREATE POLICY "hero_manage" ON hero FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- TRUST BADGES (already exists, fix policies)
-- ============================================================================
DROP POLICY IF EXISTS "Public can view active trust badges" ON trust_badges;
DROP POLICY IF EXISTS "Authenticated users have full access to trust_badges" ON trust_badges;

CREATE POLICY "trust_badges_select" ON trust_badges FOR SELECT USING (is_active = TRUE);
CREATE POLICY "trust_badges_manage" ON trust_badges FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seo_settings_updated_at ON seo_settings;
CREATE TRIGGER update_seo_settings_updated_at BEFORE UPDATE ON seo_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_categories_updated_at ON service_categories;
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_categories_updated_at ON project_categories;
CREATE TRIGGER update_project_categories_updated_at BEFORE UPDATE ON project_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mockups_updated_at ON mockups;
CREATE TRIGGER update_mockups_updated_at BEFORE UPDATE ON mockups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mockup_categories_updated_at ON mockup_categories;
CREATE TRIGGER update_mockup_categories_updated_at BEFORE UPDATE ON mockup_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_logos_updated_at ON client_logos;
CREATE TRIGGER update_client_logos_updated_at BEFORE UPDATE ON client_logos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_process_steps_updated_at ON process_steps;
CREATE TRIGGER update_process_steps_updated_at BEFORE UPDATE ON process_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_why_choose_us_updated_at ON why_choose_us;
CREATE TRIGGER update_why_choose_us_updated_at BEFORE UPDATE ON why_choose_us FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_countries_updated_at ON countries;
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_timeline_milestones_updated_at ON timeline_milestones;
CREATE TRIGGER update_timeline_milestones_updated_at BEFORE UPDATE ON timeline_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_values_updated_at ON values;
CREATE TRIGGER update_values_updated_at BEFORE UPDATE ON values FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stats_updated_at ON stats;
CREATE TRIGGER update_stats_updated_at BEFORE UPDATE ON stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_updated_at ON media;
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marquee_items_updated_at ON marquee_items;
CREATE TRIGGER update_marquee_items_updated_at BEFORE UPDATE ON marquee_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_page_content_updated_at ON page_content;
CREATE TRIGGER update_page_content_updated_at BEFORE UPDATE ON page_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hero_updated_at ON hero;
CREATE TRIGGER update_hero_updated_at BEFORE UPDATE ON hero FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trust_badges_updated_at ON trust_badges;
CREATE TRIGGER update_trust_badges_updated_at BEFORE UPDATE ON trust_badges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STORAGE BUCKET AND POLICIES
-- ============================================================================
-- Create media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, admin write
DROP POLICY IF EXISTS "media_public_read" ON storage.objects;
CREATE POLICY "media_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "media_admin_insert" ON storage.objects;
CREATE POLICY "media_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS "media_admin_update" ON storage.objects;
CREATE POLICY "media_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'media' AND public.is_admin())
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS "media_admin_delete" ON storage.objects;
CREATE POLICY "media_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND public.is_admin());

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
-- Revoke excess privileges from anon
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;

-- Grant SELECT on public content tables to anon
GRANT SELECT ON site_settings, seo_settings, hero, page_content, services, service_categories, projects, project_categories, mockups, mockup_categories, testimonials, faqs, client_logos, trust_badges, process_steps, why_choose_us, countries, timeline_milestones, values, stats, blog_posts, marquee_items TO anon;

-- Grant INSERT on messages to anon (contact form)
GRANT INSERT ON messages TO anon;

-- Grant full access to authenticated (admins will be filtered by is_admin())
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- ============================================================================
-- NOTIFY POSTGREST TO RELOAD SCHEMA CACHE
-- ============================================================================
NOTIFY pgrst, 'reload schema';
