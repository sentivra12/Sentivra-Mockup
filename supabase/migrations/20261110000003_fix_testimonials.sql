-- =============================================
-- FIX TESTIMONIALS
-- =============================================
-- 1. Unpublish fake seeded testimonials
-- 2. Add Arabic text field
-- 3. Add company logo field
-- 4. Add is_seeded flag to prevent confusion

-- =============================================
-- ADD NEW COLUMNS
-- =============================================

-- Add Arabic testimonial text
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS testimonial_text_ar TEXT;

-- Add company logo URL
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS company_logo_url TEXT;

-- Add seeded flag to mark fake data
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS is_seeded BOOLEAN DEFAULT FALSE;

-- =============================================
-- UNPUBLISH FAKE TESTIMONIALS
-- =============================================

-- Mark the three fake seeded testimonials as unpublished and seeded
UPDATE testimonials
SET 
  is_active = FALSE,
  is_seeded = TRUE,
  updated_at = NOW()
WHERE 
  client_name IN ('Sarah Johnson', 'Michael Chen', 'Emma Williams')
  AND client_company IN ('Tech Innovations Inc.', 'Digital Solutions Ltd.', 'Global Retail Corp.');

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON COLUMN testimonials.testimonial_text_ar IS 'Arabic version of the testimonial text';
COMMENT ON COLUMN testimonials.company_logo_url IS 'URL to the client company logo (optional)';
COMMENT ON COLUMN testimonials.is_seeded IS 'Flag to identify seed/demo data (should be unpublished)';

-- =============================================
-- VERIFICATION QUERY (for manual check)
-- =============================================

-- Run this to verify fake testimonials are unpublished:
-- SELECT client_name, client_company, is_active, is_seeded 
-- FROM testimonials 
-- WHERE is_seeded = TRUE;
--
-- Expected result: 3 rows with is_active = FALSE, is_seeded = TRUE
