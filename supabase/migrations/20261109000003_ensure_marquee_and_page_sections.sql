-- =============================================
-- Migration: Ensure marquee_items and page_sections tables exist
-- Date: 2024-11-09
-- Description: Idempotent creation of missing tables with proper RLS
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. MARQUEE_ITEMS TABLE
-- =============================================
-- Two-row marquee band with animated text items
CREATE TABLE IF NOT EXISTS marquee_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  row_number INTEGER NOT NULL CHECK (row_number IN (1, 2)),
  item_text TEXT NOT NULL,
  item_text_ar TEXT,
  icon_name TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_marquee_items_row_published 
  ON marquee_items(row_number, is_published, display_order);

-- RLS Policies for marquee_items
ALTER TABLE marquee_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to published marquee items" ON marquee_items;
DROP POLICY IF EXISTS "Allow authenticated users to manage marquee items" ON marquee_items;

-- Public read of published items
CREATE POLICY "Allow public read access to published marquee items"
  ON marquee_items
  FOR SELECT
  USING (is_published = true);

-- Authenticated write access
CREATE POLICY "Allow authenticated users to manage marquee items"
  ON marquee_items
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- 2. PAGE_SECTIONS TABLE
-- =============================================
-- Settings table for enabling/disabling page sections
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key TEXT UNIQUE NOT NULL,
  page TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_page_sections_page_key 
  ON page_sections(page, section_key);

-- RLS Policies for page_sections
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to enabled page sections" ON page_sections;
DROP POLICY IF EXISTS "Allow authenticated users to manage page sections" ON page_sections;

-- Public read of enabled sections
CREATE POLICY "Allow public read access to enabled page sections"
  ON page_sections
  FOR SELECT
  USING (enabled = true);

-- Authenticated write access
CREATE POLICY "Allow authenticated users to manage page sections"
  ON page_sections
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- 3. INSERT DEFAULT DATA (idempotent)
-- =============================================

-- Default page sections (only if not exists)
INSERT INTO page_sections (section_key, page, enabled, settings)
VALUES 
  ('trusted_by', 'home', true, '{"title": "Trusted By", "subtitle": "Companies that trust us"}'::jsonb),
  ('our_impact', 'home', true, '{"title": "Our Impact", "metrics_enabled": true}'::jsonb)
ON CONFLICT (section_key) DO NOTHING;

-- Default marquee items for row 1 (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM marquee_items WHERE row_number = 1) THEN
    INSERT INTO marquee_items (row_number, item_text, item_text_ar, icon_name, display_order, is_published)
    VALUES
      (1, 'Enterprise Solutions', 'حلول المؤسسات', 'Building', 1, true),
      (1, 'Cloud Architecture', 'البنية السحابية', 'Cloud', 2, true),
      (1, 'Mobile Development', 'تطوير الموبايل', 'Smartphone', 3, true),
      (1, 'AI & Machine Learning', 'الذكاء الاصطناعي', 'Brain', 4, true),
      (1, 'UI/UX Design', 'تصميم واجهة المستخدم', 'Palette', 5, true);
  END IF;
END $$;

-- Default marquee items for row 2 (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM marquee_items WHERE row_number = 2) THEN
    INSERT INTO marquee_items (row_number, item_text, item_text_ar, icon_name, display_order, is_published)
    VALUES
      (2, 'Scalable & Secure', 'قابل للتوسع وآمن', 'Shield', 1, true),
      (2, 'Modern Tech Stack', 'تقنيات حديثة', 'Code', 2, true),
      (2, 'Agile Methodology', 'منهجية سريعة', 'Zap', 3, true),
      (2, '24/7 Support', 'دعم على مدار الساعة', 'HeadphonesIcon', 4, true),
      (2, 'Global Reach', 'انتشار عالمي', 'Globe', 5, true);
  END IF;
END $$;

-- =============================================
-- 4. UPDATE TIMESTAMPS TRIGGER
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for marquee_items
DROP TRIGGER IF EXISTS update_marquee_items_updated_at ON marquee_items;
CREATE TRIGGER update_marquee_items_updated_at
  BEFORE UPDATE ON marquee_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers for page_sections
DROP TRIGGER IF EXISTS update_page_sections_updated_at ON page_sections;
CREATE TRIGGER update_page_sections_updated_at
  BEFORE UPDATE ON page_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. RELOAD POSTGREST SCHEMA CACHE
-- =============================================
NOTIFY pgrst, 'reload schema';
