-- =============================================
-- CREATE MISSING TABLES (Idempotent)
-- Date: 2024-11-02
-- Tables: marquee_items, page_sections
-- =============================================

-- =============================================
-- 1. MARQUEE_ITEMS TABLE
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

-- Index
CREATE INDEX IF NOT EXISTS idx_marquee_items_row_order 
  ON marquee_items(row_number, display_order) 
  WHERE is_published = TRUE;

-- RLS
ALTER TABLE marquee_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published marquee items" ON marquee_items;
CREATE POLICY "Public can read published marquee items"
  ON marquee_items FOR SELECT USING (is_published = TRUE);

DROP POLICY IF EXISTS "Authenticated users can manage marquee items" ON marquee_items;
CREATE POLICY "Authenticated users can manage marquee items"
  ON marquee_items FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- Seed data (only if empty)
INSERT INTO marquee_items (row_number, text_en, text_ar, icon_name, display_order, is_published)
SELECT * FROM (VALUES
  (1, 'Sentivra', 'سينتيفرا', NULL, 1, TRUE),
  (1, 'From Ideas to Real Digital Products', 'من الأفكار إلى منتجات رقمية حقيقية', NULL, 2, TRUE),
  (1, 'Building Modern Software Solutions', 'بناء حلول برمجية حديثة', NULL, 3, TRUE),
  (1, 'Your Trusted Development Partner', 'شريكك الموثوق في التطوير', NULL, 4, TRUE),
  (2, 'Web Applications', 'تطبيقات الويب', 'Globe', 1, TRUE),
  (2, 'Mobile Applications', 'تطبيقات الموبايل', 'Smartphone', 2, TRUE),
  (2, 'ERP Systems', 'أنظمة ERP', 'Building2', 3, TRUE),
  (2, 'CRM Systems', 'أنظمة CRM', 'Users', 4, TRUE),
  (2, 'Data Analysis', 'تحليل البيانات', 'BarChart3', 5, TRUE),
  (2, 'AI Solutions', 'حلول الذكاء الاصطناعي', 'Sparkles', 6, TRUE)
) AS v(row_number, text_en, text_ar, icon_name, display_order, is_published)
WHERE NOT EXISTS (SELECT 1 FROM marquee_items LIMIT 1);

-- Trigger
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
-- 2. PAGE_SECTIONS TABLE
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_page_sections_key ON page_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_page_sections_page_enabled 
  ON page_sections(page, enabled) WHERE enabled = TRUE;

-- RLS
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read enabled sections" ON page_sections;
CREATE POLICY "Public can read enabled sections"
  ON page_sections FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "Authenticated users can manage sections" ON page_sections;
CREATE POLICY "Authenticated users can manage sections"
  ON page_sections FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- Seed data (only if empty)
INSERT INTO page_sections (section_key, page, eyebrow, title, subtitle, eyebrow_ar, title_ar, subtitle_ar, enabled)
SELECT * FROM (VALUES
  ('trusted_by', 'home', 'Trusted By', 'Leading Companies Trust Us', 'Join the businesses that chose Sentivra', 'يثقون بنا', 'شركات رائدة تثق بنا', 'انضم إلى الشركات التي اختارت سينتيفرا', true),
  ('our_impact', 'home', 'Our Impact', 'Results That Speak', 'Numbers that reflect our commitment', 'تأثيرنا', 'نتائج تتحدث عن نفسها', 'أرقام تعكس التزامنا', true),
  ('home_services', 'home', 'Our Services', 'What We Build', 'Comprehensive software solutions', 'خدماتنا', 'ما نبنيه', 'حلول برمجية شاملة', true),
  ('home_projects', 'home', 'Our Work', 'Projects We''re Proud Of', 'Real results from real clients', 'أعمالنا', 'مشاريع نفخر بها', 'نتائج حقيقية من عملاء حقيقيين', true)
) AS v(section_key, page, eyebrow, title, subtitle, eyebrow_ar, title_ar, subtitle_ar, enabled)
WHERE NOT EXISTS (SELECT 1 FROM page_sections LIMIT 1);

-- Trigger
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
-- RELOAD SCHEMA CACHE
-- =============================================
NOTIFY pgrst, 'reload schema';

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
  RAISE NOTICE '     MIGRATION COMPLETED SUCCESSFULLY';
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ marquee_items: % rows', marquee_count;
  RAISE NOTICE '✅ page_sections: % rows', sections_count;
  RAISE NOTICE '🔒 RLS policies: enabled';
  RAISE NOTICE '⚡ Indexes: created';
  RAISE NOTICE '🔄 Schema cache: reloaded';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Refresh your application';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════';
END $$;
