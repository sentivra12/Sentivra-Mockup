-- ============================================================================
-- Migration: Add website and extended fields to mockups table
-- Description: Add live_url, client_name, industry, features, technologies, and metadata
-- Author: Round 4 Enhancement
-- Date: 2026-11-15
-- ============================================================================

-- Add live website URL field
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS live_url TEXT;

-- Add client and project metadata
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS project_year INTEGER;

-- Add structured data fields
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb; -- Array of feature strings
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS technologies JSONB DEFAULT '[]'::jsonb; -- Array of tech stack strings
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb; -- Array of tag strings
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb; -- Array of {url, alt_en, alt_ar}

-- Add behavior toggles
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS open_in_new_tab BOOLEAN DEFAULT TRUE;

-- Add validation constraint for live_url (must be https if provided)
ALTER TABLE mockups ADD CONSTRAINT check_live_url_https 
  CHECK (live_url IS NULL OR live_url ~* '^https://.*');

-- Create index for quick filtering by industry
CREATE INDEX IF NOT EXISTS idx_mockups_industry ON mockups(industry) WHERE industry IS NOT NULL;

-- Create index for project year
CREATE INDEX IF NOT EXISTS idx_mockups_project_year ON mockups(project_year) WHERE project_year IS NOT NULL;

-- Add helpful comments
COMMENT ON COLUMN mockups.live_url IS 'Live website URL (must be HTTPS). If provided, card opens this URL instead of details page';
COMMENT ON COLUMN mockups.client_name IS 'Optional client/company name for this mockup';
COMMENT ON COLUMN mockups.industry IS 'Industry/sector (e.g., Healthcare, E-commerce, Education)';
COMMENT ON COLUMN mockups.project_year IS 'Year the project was completed';
COMMENT ON COLUMN mockups.features IS 'JSON array of feature strings (e.g., ["Responsive Design", "CMS Integration"])';
COMMENT ON COLUMN mockups.technologies IS 'JSON array of technologies used (e.g., ["React", "Node.js", "PostgreSQL"])';
COMMENT ON COLUMN mockups.tags IS 'JSON array of searchable tags (e.g., ["modern", "minimal", "corporate"])';
COMMENT ON COLUMN mockups.gallery_images IS 'JSON array of gallery image objects {url, alt_en, alt_ar}';
COMMENT ON COLUMN mockups.open_in_new_tab IS 'Whether to open live_url in new tab (default: true)';

-- Update existing rows to ensure arrays are initialized
UPDATE mockups 
SET 
  features = COALESCE(features, '[]'::jsonb),
  technologies = COALESCE(technologies, '[]'::jsonb),
  tags = COALESCE(tags, '[]'::jsonb),
  gallery_images = COALESCE(gallery_images, '[]'::jsonb),
  open_in_new_tab = COALESCE(open_in_new_tab, TRUE)
WHERE features IS NULL OR technologies IS NULL OR tags IS NULL OR gallery_images IS NULL OR open_in_new_tab IS NULL;

