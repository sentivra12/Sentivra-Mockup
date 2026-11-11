-- =============================================
-- MARQUEE BAND ITEMS
-- =============================================
-- Create table for editable marquee band content
-- Two rows: Row 1 (large display text), Row 2 (smaller with icons)

CREATE TABLE IF NOT EXISTS marquee_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  row_number INTEGER NOT NULL CHECK (row_number IN (1, 2)),
  text_en TEXT NOT NULL,
  text_ar TEXT NOT NULL,
  icon_name TEXT, -- Lucide icon name (optional, used in row 2)
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_marquee_items_row_order 
  ON marquee_items(row_number, display_order) 
  WHERE is_published = TRUE;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE marquee_items ENABLE ROW LEVEL SECURITY;

-- Public can read published items
CREATE POLICY "Public can read published marquee items"
  ON marquee_items
  FOR SELECT
  USING (is_published = TRUE);

-- Authenticated users (admins) can do everything
CREATE POLICY "Authenticated users can manage marquee items"
  ON marquee_items
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- =============================================
-- SEED DATA FROM EXISTING CONTENT
-- =============================================

-- Row 1: Large display text (brand, tagline, company description)
INSERT INTO marquee_items (row_number, text_en, text_ar, icon_name, display_order, is_published)
VALUES
  -- Brand name
  (1, 'Sentivra', 'سينتيفرا', NULL, 1, TRUE),
  
  -- Tagline (from hero)
  (1, 'From Ideas to Real Digital Products', 'من الأفكار إلى منتجات رقمية حقيقية', NULL, 2, TRUE),
  
  -- Company essence
  (1, 'Building Modern Software Solutions', 'بناء حلول برمجية حديثة', NULL, 3, TRUE),
  
  -- Value proposition
  (1, 'Your Trusted Development Partner', 'شريكك الموثوق في التطوير', NULL, 4, TRUE),
  
  -- Focus
  (1, 'Innovation • Quality • Excellence', 'الابتكار • الجودة • التميز', NULL, 5, TRUE);

-- Row 2: Services and values (smaller text with icons)
INSERT INTO marquee_items (row_number, text_en, text_ar, icon_name, display_order, is_published)
VALUES
  -- Services
  (2, 'Web Applications', 'تطبيقات الويب', 'Globe', 1, TRUE),
  (2, 'Mobile Applications', 'تطبيقات الموبايل', 'Smartphone', 2, TRUE),
  (2, 'ERP Systems', 'أنظمة ERP', 'Building2', 3, TRUE),
  (2, 'CRM Systems', 'أنظمة CRM', 'Users', 4, TRUE),
  (2, 'Data Analysis', 'تحليل البيانات', 'BarChart3', 5, TRUE),
  (2, 'AI Solutions', 'حلول الذكاء الاصطناعي', 'Sparkles', 6, TRUE),
  
  -- Values
  (2, 'Innovation', 'الابتكار', 'Lightbulb', 7, TRUE),
  (2, 'Quality', 'الجودة', 'Award', 8, TRUE),
  (2, 'Performance', 'الأداء العالي', 'Zap', 9, TRUE),
  (2, 'Modern Design', 'تصميم عصري', 'Sparkles', 10, TRUE),
  (2, '24/7 Support', 'دعم على مدار الساعة', 'Headphones', 11, TRUE),
  (2, 'Long-Term Partnership', 'شراكة طويلة الأمد', 'Handshake', 12, TRUE);

-- =============================================
-- TRIGGER FOR UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_marquee_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER marquee_items_updated_at
  BEFORE UPDATE ON marquee_items
  FOR EACH ROW
  EXECUTE FUNCTION update_marquee_items_updated_at();

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE marquee_items IS 'Editable content for the marquee brand band on the home page';
COMMENT ON COLUMN marquee_items.row_number IS 'Row 1 = large display text, Row 2 = smaller text with icons';
COMMENT ON COLUMN marquee_items.icon_name IS 'Lucide icon name (used in row 2 only)';
COMMENT ON COLUMN marquee_items.display_order IS 'Order of items within the row (lower = first)';
