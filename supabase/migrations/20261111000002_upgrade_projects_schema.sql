-- =============================================
-- Migration: Upgrade projects table schema
-- Created: 2026-11-11
-- Purpose: Add bilingual columns, case study fields, cover fit option
-- =============================================

-- =============================================
-- STEP 1: Add new columns
-- =============================================

-- Bilingual title columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS title_ar TEXT;

-- Bilingual description columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS short_description_en TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS short_description_ar TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS long_description_en TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS long_description_ar TEXT;

-- Case study fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_year INTEGER;

-- Cover image handling
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_fit TEXT DEFAULT 'cover' CHECK (cover_fit IN ('cover', 'contain'));

-- Gallery and links
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS live_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_url TEXT;

-- Category relationship (will replace old category TEXT column)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES project_categories(id);

-- =============================================
-- STEP 2: Migrate existing data to new columns
-- =============================================

-- Copy existing title to title_en (preserve existing data)
UPDATE projects 
SET title_en = title 
WHERE title_en IS NULL AND title IS NOT NULL;

-- Copy existing short_description to short_description_en
UPDATE projects 
SET short_description_en = short_description 
WHERE short_description_en IS NULL AND short_description IS NOT NULL;

-- Map old category TEXT to new category_id
-- First, create a mapping based on old category values
UPDATE projects p
SET category_id = pc.id
FROM project_categories pc
WHERE p.category_id IS NULL
  AND (
    (LOWER(p.category) LIKE '%web%' AND pc.slug = 'web-apps') OR
    (LOWER(p.category) LIKE '%mobile%' AND pc.slug = 'mobile') OR
    (LOWER(p.category) = 'erp' AND pc.slug = 'erp') OR
    (LOWER(p.category) = 'crm' AND pc.slug = 'crm') OR
    (LOWER(p.category) LIKE '%ai%' OR LOWER(p.category) LIKE '%chatbot%' AND pc.slug = 'ai-chatbots')
  );

-- Set any remaining unmapped projects to 'other' category
UPDATE projects p
SET category_id = (SELECT id FROM project_categories WHERE slug = 'other')
WHERE category_id IS NULL;

-- =============================================
-- STEP 3: Add constraints and indexes
-- =============================================

-- Make bilingual title columns required after migration
-- (Don't enforce yet - will be enforced after Arabic translations added)
-- ALTER TABLE projects ALTER COLUMN title_en SET NOT NULL;
-- ALTER TABLE projects ALTER COLUMN title_ar SET NOT NULL;

-- Make category_id required after migration
ALTER TABLE projects ALTER COLUMN category_id SET NOT NULL;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_projects_year ON projects(project_year);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_name);

-- Full-text search index on titles and descriptions (for future search feature)
CREATE INDEX IF NOT EXISTS idx_projects_search_en ON projects USING gin(
  to_tsvector('english', COALESCE(title_en, '') || ' ' || COALESCE(short_description_en, '') || ' ' || COALESCE(long_description_en, ''))
);

-- =============================================
-- STEP 4: Update RLS policies (if not already set)
-- =============================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Public can read active projects" ON projects;
DROP POLICY IF EXISTS "Authenticated can read all projects" ON projects;
DROP POLICY IF EXISTS "Authenticated can manage projects" ON projects;

-- Public can read active projects
CREATE POLICY "Public can read active projects"
  ON projects FOR SELECT
  USING (is_active = TRUE);

-- Authenticated users can read all
CREATE POLICY "Authenticated can read all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (TRUE);

-- Authenticated users can manage
CREATE POLICY "Authenticated can manage projects"
  ON projects FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- =============================================
-- STEP 5: Add helpful comments
-- =============================================

COMMENT ON COLUMN projects.title_en IS 'Project title in English (required)';
COMMENT ON COLUMN projects.title_ar IS 'Project title in Arabic (required)';
COMMENT ON COLUMN projects.cover_fit IS 'How to display cover image: "cover" (fill/crop) or "contain" (fit inside with padding)';
COMMENT ON COLUMN projects.gallery_images IS 'Array of image URLs for project gallery: ["url1", "url2", ...]';
COMMENT ON COLUMN projects.project_year IS 'Year the project was completed';
COMMENT ON COLUMN projects.category_id IS 'Foreign key to project_categories table';

-- =============================================
-- NOTES FOR MANUAL STEPS:
-- =============================================
-- After running this migration:
-- 1. Run migration 20261111000005 to add Arabic translations
-- 2. Update dashboard ProjectsPage form to include new fields
-- 3. Old 'category' and 'title' columns can be dropped in a future migration
--    after verifying all data is migrated correctly
-- =============================================
