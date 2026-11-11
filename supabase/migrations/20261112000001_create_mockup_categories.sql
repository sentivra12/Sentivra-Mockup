-- ============================================================================
-- Migration: Create mockup_categories table
-- Description: Create dedicated table for mockup categories with bilingual support
-- Author: Kiro AI
-- Date: 2026-11-12
-- ============================================================================

-- Create mockup_categories table
CREATE TABLE IF NOT EXISTS mockup_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT NOT NULL DEFAULT 'LayoutGrid', -- Lucide icon name
  color TEXT NOT NULL DEFAULT '#3b82f6', -- Hex color for gradients and visual differentiation
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_mockup_categories_slug ON mockup_categories(slug);
CREATE INDEX IF NOT EXISTS idx_mockup_categories_display_order ON mockup_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_mockup_categories_is_active ON mockup_categories(is_active);

-- Enable Row Level Security
ALTER TABLE mockup_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access for active categories
CREATE POLICY "Public can view active mockup categories"
  ON mockup_categories
  FOR SELECT
  USING (is_active = TRUE);

-- Policy: Authenticated users can manage all categories (for admin dashboard)
CREATE POLICY "Authenticated users can manage mockup categories"
  ON mockup_categories
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_mockup_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mockup_categories_updated_at
  BEFORE UPDATE ON mockup_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_mockup_categories_updated_at();

-- Seed initial categories (based on current hardcoded ones + industry standards)
INSERT INTO mockup_categories (slug, name_en, name_ar, icon, color, display_order, is_active) VALUES
  ('all', 'All Mockups', 'جميع التصاميم', 'LayoutGrid', '#8b5cf6', 0, TRUE),
  ('business-corporate', 'Business & Corporate', 'الأعمال والشركات', 'Briefcase', '#3b82f6', 1, TRUE),
  ('ecommerce', 'E-Commerce', 'التجارة الإلكترونية', 'ShoppingCart', '#10b981', 2, TRUE),
  ('restaurant-food', 'Restaurant & Food', 'المطاعم والأغذية', 'UtensilsCrossed', '#f59e0b', 3, TRUE),
  ('healthcare', 'Healthcare', 'الرعاية الصحية', 'Heart', '#ef4444', 4, TRUE),
  ('education', 'Education', 'التعليم', 'GraduationCap', '#6366f1', 5, TRUE),
  ('fitness-wellness', 'Fitness & Wellness', 'اللياقة والعافية', 'Dumbbell', '#ec4899', 6, TRUE),
  ('real-estate', 'Real Estate', 'العقارات', 'Home', '#14b8a6', 7, TRUE),
  ('portfolio-personal', 'Portfolio & Personal', 'الأعمال الشخصية', 'User', '#8b5cf6', 8, TRUE),
  ('other', 'Other', 'أخرى', 'Sparkles', '#64748b', 9, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Grant permissions
GRANT SELECT ON mockup_categories TO anon, authenticated;
GRANT ALL ON mockup_categories TO authenticated;

COMMENT ON TABLE mockup_categories IS 'Categories for website mockups with bilingual support';
COMMENT ON COLUMN mockup_categories.icon IS 'Lucide icon component name (e.g., ShoppingCart, Briefcase)';
COMMENT ON COLUMN mockup_categories.color IS 'Hex color code for category visual theming';
