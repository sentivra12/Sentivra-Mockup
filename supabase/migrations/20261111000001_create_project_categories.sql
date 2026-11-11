-- =============================================
-- Migration: Create project_categories table
-- Created: 2026-11-11
-- Purpose: Database-driven project categories with bilingual support (EN/AR)
-- =============================================

-- Create project_categories table
CREATE TABLE IF NOT EXISTS project_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  
  -- Multilingual fields
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  
  -- Visual
  icon TEXT DEFAULT 'Folder', -- Lucide icon name
  color_class TEXT DEFAULT 'blue', -- Tailwind color variant
  
  -- Meta
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_categories_slug ON project_categories(slug);
CREATE INDEX IF NOT EXISTS idx_project_categories_active ON project_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_project_categories_order ON project_categories(display_order);

-- RLS Policies
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;

-- Public can read active categories
CREATE POLICY "Public can read active project categories"
  ON project_categories FOR SELECT
  USING (is_active = TRUE);

-- Authenticated users can read all
CREATE POLICY "Authenticated can read all project categories"
  ON project_categories FOR SELECT
  TO authenticated
  USING (TRUE);

-- Authenticated users can manage
CREATE POLICY "Authenticated can manage project categories"
  ON project_categories FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- =============================================
-- Seed project categories
-- =============================================

INSERT INTO project_categories (slug, name_en, name_ar, description_en, description_ar, icon, color_class, display_order)
VALUES
  (
    'all',
    'All Projects',
    'كل المشاريع',
    'View all our projects across all categories',
    'عرض جميع مشاريعنا عبر كل الفئات',
    'Layers',
    'gray',
    0
  ),
  (
    'web-apps',
    'Web Applications',
    'تطبيقات الويب',
    'Modern web applications and platforms',
    'تطبيقات ومنصات ويب حديثة',
    'Code',
    'blue',
    1
  ),
  (
    'mobile',
    'Mobile Apps',
    'تطبيقات الموبايل',
    'iOS and Android mobile applications',
    'تطبيقات الموبايل لأنظمة iOS وAndroid',
    'Smartphone',
    'purple',
    2
  ),
  (
    'erp',
    'ERP Systems',
    'أنظمة ERP',
    'Enterprise resource planning solutions',
    'حلول تخطيط موارد المؤسسات',
    'Database',
    'green',
    3
  ),
  (
    'crm',
    'CRM Systems',
    'أنظمة CRM',
    'Customer relationship management platforms',
    'منصات إدارة علاقات العملاء',
    'BarChart3',
    'orange',
    4
  ),
  (
    'ai-chatbots',
    'AI & Chatbots',
    'الذكاء الاصطناعي والروبوتات',
    'AI-powered solutions and chatbots',
    'حلول الذكاء الاصطناعي والروبوتات الذكية',
    'Bot',
    'pink',
    5
  ),
  (
    'other',
    'Other',
    'أخرى',
    'Other software solutions',
    'حلول برمجية أخرى',
    'Layers',
    'gray',
    6
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_project_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_categories_updated_at
  BEFORE UPDATE ON project_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_project_categories_updated_at();

-- Grant permissions
GRANT SELECT ON project_categories TO anon;
GRANT ALL ON project_categories TO authenticated;
