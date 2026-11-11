-- =============================================
-- Migration: Upgrade services table with bilingual columns
-- Created: 2026-11-07
-- Purpose: Add _en/_ar columns, technologies, category_id FK
-- =============================================

-- Add new bilingual columns
ALTER TABLE services ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS title_ar TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS short_description_en TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS short_description_ar TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS long_description_en TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS long_description_ar TEXT;

-- Add technologies and category relationship
ALTER TABLE services ADD COLUMN IF NOT EXISTS technologies JSONB DEFAULT '[]'::jsonb;
ALTER TABLE services ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL;

-- Migrate existing data to new columns
-- Copy existing single-language content to _en columns
UPDATE services 
SET 
  title_en = title,
  short_description_en = short_description,
  long_description_en = long_description
WHERE title_en IS NULL;

-- Map old category text to new category_id
UPDATE services s
SET category_id = sc.id
FROM service_categories sc
WHERE 
  s.category_id IS NULL
  AND (
    (s.category = 'Web & Mobile' AND sc.slug = 'web-mobile') OR
    (s.category = 'Business Systems' AND sc.slug = 'business-systems') OR
    (s.category = 'AI & Data' AND sc.slug = 'ai-data')
  );

-- Create index on category_id
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);

-- Add NOT NULL constraint after data migration
-- (Commented out for safety - uncomment after verifying data)
-- ALTER TABLE services ALTER COLUMN title_en SET NOT NULL;

-- Keep old columns for backward compatibility temporarily
-- They can be dropped in a future migration after frontend update
-- ALTER TABLE services DROP COLUMN IF EXISTS title;
-- ALTER TABLE services DROP COLUMN IF EXISTS short_description;
-- ALTER TABLE services DROP COLUMN IF EXISTS long_description;
-- ALTER TABLE services DROP COLUMN IF EXISTS category;

COMMENT ON COLUMN services.title_en IS 'English service title';
COMMENT ON COLUMN services.title_ar IS 'Arabic service title';
COMMENT ON COLUMN services.short_description_en IS 'English short description (for cards)';
COMMENT ON COLUMN services.short_description_ar IS 'Arabic short description';
COMMENT ON COLUMN services.long_description_en IS 'English long description (for detail page)';
COMMENT ON COLUMN services.long_description_ar IS 'Arabic long description';
COMMENT ON COLUMN services.technologies IS 'Array of technology names used (e.g., ["React", "Node.js"])';
COMMENT ON COLUMN services.category_id IS 'Foreign key to service_categories table';
