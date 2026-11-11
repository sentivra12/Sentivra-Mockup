-- =============================================
-- FIX MISSING TABLES - HomePage Errors
-- Run this in Supabase SQL Editor if tables don't exist
-- =============================================

-- Check if migrations were applied
DO $$
BEGIN
  RAISE NOTICE '🔍 Checking for missing tables...';
  
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marquee_items') THEN
    RAISE NOTICE '❌ marquee_items table is missing';
  ELSE
    RAISE NOTICE '✅ marquee_items table exists';
  END IF;
  
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'page_sections') THEN
    RAISE NOTICE '❌ page_sections table is missing';
  ELSE
    RAISE NOTICE '✅ page_sections table exists';
  END IF;
END $$;

-- =============================================
-- CREATE marquee_items TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS marquee_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  row_number INTEGER NOT NULL CHECK (row_number IN (1, 2)),
  text_en TEXT NOT NULL,
  text_ar TEXT NOT NULL,
  icon_name TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_marquee_items_row_order 
  ON marquee_items(row_number, display_order) 
  WHERE is_published = TRUE;

-- Enable RLS
ALTER TABLE marquee_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read published marquee items" ON marquee_items;
DROP POLICY IF EXISTS "Authenticated users can manage marquee items" ON marquee_items;

-- Create policies
CREATE POLICY "Public can read published marquee items"
  ON marquee_items
  FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Authenticated users can manage marquee items"
  ON marquee_items
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Seed data (only if empty)
INSERT INTO marquee_items (row_number, text_en, text_ar, icon_name, display_order, is_published)
SELECT 1, 'Sentivra', 'سينتيفرا', NULL, 1, TRUE
WHERE NOT EXISTS (SELECT 1 FROM marquee_items WHERE row_number = 1 AND display_order = 1);

INSERT INTO marquee_items (row_number, text_en, text_ar, icon_name, display_order, is_published)
SELECT 1, 'From Ideas to Real Digital Products', 'من الأفكار إلى منتجات رقمية حقيقية', NULL, 2, TRUE
WHERE NOT EXISTS (SELECT 1 FROM marquee_items WHERE row_number = 1 AND display_order = 2);

INSERT INTO marquee_items (row_number, text_en, text_ar, icon_name, display_order, is_published)
SELECT 2, 'Web Applications', 'تطبيقات الويب', 'Globe', 1, TRUE
WHERE NOT EXISTS (SELECT 1 FROM marquee_items WHERE row_number = 2 AND display_order = 1);

INSERT INTO marquee_items (row_number, text_en, text_ar, icon_name, display_order, is_published)
SELECT 2, 'Mobile Applications', 'تطبيقات الموبايل', 'Smartphone', 2, TRUE
WHERE NOT EXISTS (SELECT 1 FROM marquee_items WHERE row_number = 2 AND display_order = 2);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_marquee_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS marquee_items_updated_at ON marquee_items;
CREATE TRIGGER marquee_items_updated_at
  BEFORE UPDATE ON marquee_items
  FOR EACH ROW
  EXECUTE FUNCTION update_marquee_items_updated_at();

-- =============================================
-- CREATE page_sections TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS page_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key TEXT UNIQUE NOT NULL,
    page TEXT NOT NULL,
    eyebrow TEXT,
    title TEXT,
    subtitle TEXT,
    eyebrow_ar TEXT,
    title_ar TEXT,
    subtitle_ar TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_page_sections_key ON page_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_page_sections_page_enabled ON page_sections(page, enabled) WHERE enabled = TRUE;

-- Enable RLS
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read enabled sections" ON page_sections;
DROP POLICY IF EXISTS "Admins can manage sections" ON page_sections;

-- Create policies
CREATE POLICY "Public can read enabled sections"
  ON page_sections 
  FOR SELECT
  USING (enabled = true);

CREATE POLICY "Admins can manage sections"
  ON page_sections 
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Seed data (only if empty)
INSERT INTO page_sections (section_key, page, eyebrow, title, subtitle, eyebrow_ar, title_ar, subtitle_ar, enabled)
SELECT 'trusted_by', 'home', 'Trusted By', 'Leading Companies Trust Us', 'Join the businesses that chose Sentivra', 'يثقون بنا', 'شركات رائدة تثق بنا', 'انضم إلى الشركات التي اختارت سينتيفرا', true
WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE section_key = 'trusted_by' AND page = 'home');

INSERT INTO page_sections (section_key, page, eyebrow, title, subtitle, eyebrow_ar, title_ar, subtitle_ar, enabled)
SELECT 'our_impact', 'home', 'Our Impact', 'Results That Speak', 'Numbers that reflect our commitment', 'تأثيرنا', 'نتائج تتحدث عن نفسها', 'أرقام تعكس التزامنا', true
WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE section_key = 'our_impact' AND page = 'home');

INSERT INTO page_sections (section_key, page, eyebrow, title, subtitle, eyebrow_ar, title_ar, subtitle_ar, enabled)
SELECT 'home_services', 'home', 'Our Services', 'What We Build', 'Comprehensive software solutions', 'خدماتنا', 'ما نبنيه', 'حلول برمجية شاملة', true
WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE section_key = 'home_services' AND page = 'home');

INSERT INTO page_sections (section_key, page, eyebrow, title, subtitle, eyebrow_ar, title_ar, subtitle_ar, enabled)
SELECT 'home_projects', 'home', 'Our Work', 'Projects We''re Proud Of', 'Real results from real clients', 'أعمالنا', 'مشاريع نفخر بها', 'نتائج حقيقية من عملاء حقيقيين', true
WHERE NOT EXISTS (SELECT 1 FROM page_sections WHERE section_key = 'home_projects' AND page = 'home');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_page_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS page_sections_updated_at ON page_sections;
CREATE TRIGGER page_sections_updated_at
  BEFORE UPDATE ON page_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_page_sections_updated_at();

-- =============================================
-- VERIFICATION
-- =============================================
DO $$
DECLARE
  marquee_count INTEGER;
  sections_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO marquee_count FROM marquee_items;
  SELECT COUNT(*) INTO sections_count FROM page_sections;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE '     TABLES CREATED SUCCESSFULLY';
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ marquee_items table: % rows', marquee_count;
  RAISE NOTICE '✅ page_sections table: % rows', sections_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '⚡ Indexes created';
  RAISE NOTICE '🌱 Seed data inserted';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Refresh your application';
  RAISE NOTICE '2. HomePage errors should be gone';
  RAISE NOTICE '3. Go to Admin Dashboard to edit content';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════';
END $$;
