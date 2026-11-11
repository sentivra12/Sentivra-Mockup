-- ============================================================================
-- Migration: Upgrade mockups table schema
-- Description: Add bilingual fields, screenshots, slug, demo_url, and case study fields
-- Author: Kiro AI
-- Date: 2026-11-12
-- ============================================================================

-- Add new columns for bilingual support
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS title_ar TEXT;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS short_description_en TEXT;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS short_description_ar TEXT;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS long_description_en TEXT;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS long_description_ar TEXT;

-- Rename and add image fields
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS desktop_screenshot_url TEXT;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS full_page_screenshot_url TEXT; -- Tall scrolling screenshot
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS tablet_screenshot_url TEXT;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS mobile_screenshot_url TEXT;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS cover_image_url TEXT; -- Main card cover

-- Add demo and features
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS demo_url TEXT;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS whats_included JSONB DEFAULT '[]'::jsonb; -- Array of features/pages included

-- Add category relationship
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS category_id UUID;

-- Add badges
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT FALSE;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add alt text for accessibility
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS desktop_screenshot_alt_en TEXT;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS desktop_screenshot_alt_ar TEXT;

-- Migrate existing data to new structure
UPDATE mockups 
SET 
  title_en = title,
  short_description_en = description,
  desktop_screenshot_url = image_url,
  cover_image_url = image_url,
  slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE title_en IS NULL;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_mockups_slug ON mockups(slug) WHERE slug IS NOT NULL;

-- Add foreign key constraint to category
ALTER TABLE mockups 
  ADD CONSTRAINT fk_mockups_category 
  FOREIGN KEY (category_id) 
  REFERENCES mockup_categories(id) 
  ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mockups_category_id ON mockups(category_id);
CREATE INDEX IF NOT EXISTS idx_mockups_is_featured ON mockups(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_mockups_is_new ON mockups(is_new) WHERE is_new = TRUE;
CREATE INDEX IF NOT EXISTS idx_mockups_is_popular ON mockups(is_popular) WHERE is_popular = TRUE;

-- Update RLS policies (already enabled on table)
DROP POLICY IF EXISTS "Public can view active mockups" ON mockups;
CREATE POLICY "Public can view active mockups"
  ON mockups
  FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Authenticated users can manage mockups" ON mockups;
CREATE POLICY "Authenticated users can manage mockups"
  ON mockups
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Add helpful comments
COMMENT ON COLUMN mockups.slug IS 'URL-friendly identifier for mockup detail pages';
COMMENT ON COLUMN mockups.desktop_screenshot_url IS 'Main desktop screenshot (recommended: 1440x900px)';
COMMENT ON COLUMN mockups.full_page_screenshot_url IS 'Full-page tall screenshot for scroll preview (recommended: 1440px wide)';
COMMENT ON COLUMN mockups.tablet_screenshot_url IS 'Tablet screenshot (recommended: 768x1024px)';
COMMENT ON COLUMN mockups.mobile_screenshot_url IS 'Mobile screenshot (recommended: 390x844px)';
COMMENT ON COLUMN mockups.cover_image_url IS 'Card cover image, can be same as desktop_screenshot_url';
COMMENT ON COLUMN mockups.whats_included IS 'JSON array of features/pages included in the mockup (e.g., ["Home Page", "About", "Contact Form"])';
COMMENT ON COLUMN mockups.demo_url IS 'URL to live demo of the mockup (optional)';
COMMENT ON COLUMN mockups.is_new IS 'Show "New" badge on card';
COMMENT ON COLUMN mockups.is_popular IS 'Show "Popular" badge on card';
COMMENT ON COLUMN mockups.is_featured IS 'Featured mockups can span 2 columns on wide desktop';
