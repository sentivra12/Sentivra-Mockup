-- =============================================
-- Migration: Create service_categories table
-- Created: 2026-11-07
-- Purpose: Separate table for service categories with bilingual support
-- =============================================

-- Create service_categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT, -- Lucide icon name
  color TEXT, -- Hex color for category accent
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_categories_slug ON service_categories(slug);
CREATE INDEX IF NOT EXISTS idx_service_categories_active ON service_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_service_categories_order ON service_categories(display_order);

-- RLS Policies
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- Public can read active categories
CREATE POLICY "Public can read active service categories"
  ON service_categories FOR SELECT
  USING (is_active = TRUE);

-- Authenticated users can read all
CREATE POLICY "Authenticated can read all service categories"
  ON service_categories FOR SELECT
  TO authenticated
  USING (TRUE);

-- Authenticated users can insert/update/delete
CREATE POLICY "Authenticated can manage service categories"
  ON service_categories FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- =============================================
-- Seed service categories
-- =============================================

INSERT INTO service_categories (slug, name_en, name_ar, description_en, description_ar, icon, color, display_order, is_active)
VALUES
  (
    'web-mobile',
    'Web & Mobile',
    'الويب والموبايل',
    'Modern web applications and mobile apps for iOS and Android',
    'تطبيقات ويب حديثة وتطبيقات موبايل لنظامي iOS وAndroid',
    'Code',
    '#3b82f6',
    1,
    TRUE
  ),
  (
    'business-systems',
    'Business Systems',
    'أنظمة الأعمال',
    'Enterprise resource planning and customer relationship management systems',
    'أنظمة تخطيط موارد المؤسسات وإدارة علاقات العملاء',
    'Database',
    '#8b5cf6',
    2,
    TRUE
  ),
  (
    'ai-data',
    'AI & Data',
    'الذكاء الاصطناعي والبيانات',
    'Artificial intelligence, chatbots, and business intelligence solutions',
    'حلول الذكاء الاصطناعي وروبوتات الدردشة وذكاء الأعمال',
    'Bot',
    '#ec4899',
    3,
    TRUE
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_service_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER service_categories_updated_at
  BEFORE UPDATE ON service_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_service_categories_updated_at();

-- Grant permissions
GRANT SELECT ON service_categories TO anon;
GRANT ALL ON service_categories TO authenticated;
