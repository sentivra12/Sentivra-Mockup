-- ============================================================================
-- MOCKUPS COMPLETE REBUILD - Single idempotent migration
-- Creates everything needed for the Mockups feature from scratch
-- ============================================================================

-- ============================================================================
-- 1. HELPER FUNCTION: is_admin()
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
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

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================================================
-- 2. USER ROLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Add is_active column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE user_roles ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;
END $$;

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select_own" ON user_roles;
DROP POLICY IF EXISTS "user_roles_select_admin" ON user_roles;
DROP POLICY IF EXISTS "user_roles_write_admin" ON user_roles;

CREATE POLICY "user_roles_select_own" ON user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_roles_write_admin" ON user_roles
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- 3. MOCKUP CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS mockup_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT NOT NULL DEFAULT 'image',
  color TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE mockup_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mockup_categories_select_public" ON mockup_categories;
DROP POLICY IF EXISTS "mockup_categories_select_admin" ON mockup_categories;
DROP POLICY IF EXISTS "mockup_categories_write_admin" ON mockup_categories;

CREATE POLICY "mockup_categories_select_public" ON mockup_categories
  FOR SELECT TO anon
  USING (is_active = TRUE);

CREATE POLICY "mockup_categories_select_admin" ON mockup_categories
  FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "mockup_categories_write_admin" ON mockup_categories
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed the 8 correct categories (upsert to avoid duplicates)
INSERT INTO mockup_categories (slug, name_en, name_ar, icon, display_order, is_active) VALUES
  ('real-estate-construction', 'Real Estate & Construction', 'العقارات والإنشاءات', 'building', 1, TRUE),
  ('restaurants-cafes', 'Restaurants & Cafés', 'المطاعم والمقاهي', 'coffee', 2, TRUE),
  ('clothing-fashion', 'Clothing & Fashion', 'الملابس والأزياء', 'shirt', 3, TRUE),
  ('education', 'Education', 'التعليم', 'graduation-cap', 4, TRUE),
  ('health-medical', 'Health & Medical', 'الصحة والطب', 'heart-pulse', 5, TRUE),
  ('industrial-manufacturing', 'Industrial & Manufacturing', 'الصناعة والتصنيع', 'factory', 6, TRUE),
  ('corporate', 'Corporate', 'شركات', 'briefcase', 7, TRUE),
  ('other', 'Other', 'أخرى', 'sparkles', 8, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Unpublish all other categories (don't delete)
UPDATE mockup_categories
SET is_active = FALSE, updated_at = NOW()
WHERE slug NOT IN (
  'real-estate-construction',
  'restaurants-cafes',
  'clothing-fashion',
  'education',
  'health-medical',
  'industrial-manufacturing',
  'corporate',
  'other'
);

-- ============================================================================
-- 4. MOCKUPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS mockups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  
  -- Titles
  title_en TEXT NOT NULL,
  title_ar TEXT,
  
  -- Descriptions
  short_description_en TEXT,
  short_description_ar TEXT,
  long_description_en TEXT,
  long_description_ar TEXT,
  
  -- Category
  category_id UUID REFERENCES mockup_categories(id) ON DELETE SET NULL,
  
  -- Images
  cover_image_url TEXT,
  desktop_screenshot_url TEXT,
  tablet_screenshot_url TEXT,
  mobile_screenshot_url TEXT,
  image_alt_en TEXT,
  image_alt_ar TEXT,
  
  -- Links
  demo_url TEXT,
  
  -- Pricing & badges
  price NUMERIC(10, 2),
  badges TEXT[],
  
  -- Flags
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Ordering
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Legacy columns (keep for backward compatibility, but unused)
  title TEXT,
  description TEXT,
  title_ar_legacy TEXT,
  description_ar_legacy TEXT,
  image_url TEXT,
  thumbnail_url TEXT,
  download_url TEXT,
  category TEXT
);

-- Add columns if they don't exist (safe for existing tables)
DO $$ 
BEGIN
  -- Core columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mockups' AND column_name = 'title_en') THEN
    ALTER TABLE mockups ADD COLUMN title_en TEXT;
    UPDATE mockups SET title_en = COALESCE(title, 'Untitled') WHERE title_en IS NULL;
    ALTER TABLE mockups ALTER COLUMN title_en SET NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mockups' AND column_name = 'category_id') THEN
    ALTER TABLE mockups ADD COLUMN category_id UUID REFERENCES mockup_categories(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mockups' AND column_name = 'desktop_screenshot_url') THEN
    ALTER TABLE mockups ADD COLUMN desktop_screenshot_url TEXT;
    UPDATE mockups SET desktop_screenshot_url = image_url WHERE desktop_screenshot_url IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mockups' AND column_name = 'tablet_screenshot_url') THEN
    ALTER TABLE mockups ADD COLUMN tablet_screenshot_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mockups' AND column_name = 'mobile_screenshot_url') THEN
    ALTER TABLE mockups ADD COLUMN mobile_screenshot_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mockups' AND column_name = 'cover_image_url') THEN
    ALTER TABLE mockups ADD COLUMN cover_image_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mockups' AND column_name = 'demo_url') THEN
    ALTER TABLE mockups ADD COLUMN demo_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mockups' AND column_name = 'image_alt_en') THEN
    ALTER TABLE mockups ADD COLUMN image_alt_en TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mockups' AND column_name = 'image_alt_ar') THEN
    ALTER TABLE mockups ADD COLUMN image_alt_ar TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mockups' AND column_name = 'badges') THEN
    ALTER TABLE mockups ADD COLUMN badges TEXT[];
  END IF;
END $$;

-- Backfill category_id from legacy text category where possible
UPDATE mockups m
SET category_id = mc.id, updated_at = NOW()
FROM mockup_categories mc
WHERE m.category_id IS NULL
  AND m.category IS NOT NULL
  AND (
    LOWER(m.category) = LOWER(mc.slug) OR
    LOWER(m.category) = LOWER(mc.name_en) OR
    LOWER(REPLACE(m.category, ' ', '-')) = LOWER(mc.slug)
  );

ALTER TABLE mockups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mockups_select_public" ON mockups;
DROP POLICY IF EXISTS "mockups_select_admin" ON mockups;
DROP POLICY IF EXISTS "mockups_write_admin" ON mockups;

CREATE POLICY "mockups_select_public" ON mockups
  FOR SELECT TO anon
  USING (is_active = TRUE);

CREATE POLICY "mockups_select_admin" ON mockups
  FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "mockups_write_admin" ON mockups
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- 5. TRIGGERS FOR updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_mockup_categories_updated_at ON mockup_categories;
CREATE TRIGGER update_mockup_categories_updated_at
  BEFORE UPDATE ON mockup_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mockups_updated_at ON mockups;
CREATE TRIGGER update_mockups_updated_at
  BEFORE UPDATE ON mockups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. STORAGE BUCKET
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-media', 'site-media', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

-- Storage policies for site-media bucket
DROP POLICY IF EXISTS "site_media_public_read" ON storage.objects;
DROP POLICY IF EXISTS "site_media_admin_write" ON storage.objects;
DROP POLICY IF EXISTS "site_media_admin_delete" ON storage.objects;

CREATE POLICY "site_media_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'site-media');

CREATE POLICY "site_media_admin_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-media' AND public.is_admin());

CREATE POLICY "site_media_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'site-media' AND public.is_admin());

-- ============================================================================
-- 7. REVOKE UNNECESSARY GRANTS FROM ANON
-- ============================================================================

REVOKE INSERT, UPDATE, DELETE ON mockup_categories FROM anon;
REVOKE INSERT, UPDATE, DELETE ON mockups FROM anon;
REVOKE ALL ON user_roles FROM anon;

-- ============================================================================
-- 8. NOTIFY POSTGREST TO RELOAD SCHEMA
-- ============================================================================

NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$ 
BEGIN 
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ MOCKUPS FEATURE REBUILD COMPLETE';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📋 What was created:';
  RAISE NOTICE '   • is_admin() function (SECURITY DEFINER)';
  RAISE NOTICE '   • user_roles table with RLS';
  RAISE NOTICE '   • mockup_categories table with 8 active categories';
  RAISE NOTICE '   • mockups table with all required columns';
  RAISE NOTICE '   • RLS policies (anon: published only, admin: full access)';
  RAISE NOTICE '   • Storage bucket: site-media';
  RAISE NOTICE '   • Triggers for updated_at columns';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT - Run this query to add your admin user:';
  RAISE NOTICE '   INSERT INTO user_roles (user_id, role, is_active)';
  RAISE NOTICE '   SELECT id, ''admin'', TRUE';
  RAISE NOTICE '   FROM auth.users';
  RAISE NOTICE '   WHERE email = ''YOUR_EMAIL@example.com''';
  RAISE NOTICE '   ON CONFLICT (user_id, role) DO NOTHING;';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;
