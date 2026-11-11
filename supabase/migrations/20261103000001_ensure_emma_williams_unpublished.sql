-- =============================================
-- Migration: Ensure Emma Williams Testimonial is Unpublished
-- Created: 2026-11-03
-- Description: Idempotent migration to ensure Emma Williams testimonial 
--              remains unpublished. This is a safety check in case the 
--              testimonial was re-activated or re-inserted.
-- =============================================

-- Update Emma Williams testimonial to be unpublished
-- This is idempotent - runs safely multiple times
UPDATE testimonials
SET 
  is_active = FALSE,
  is_seeded = TRUE,
  updated_at = NOW()
WHERE 
  client_name = 'Emma Williams'
  AND client_company = 'Global Retail Corp.'
  AND client_role = 'Marketing Director'
  AND testimonial_text ILIKE '%increased our online sales by 300%';

-- Also catch any variations of the name/company
UPDATE testimonials
SET 
  is_active = FALSE,
  is_seeded = TRUE,
  updated_at = NOW()
WHERE 
  (client_name ILIKE '%Emma%Williams%' OR client_name ILIKE '%Williams%Emma%')
  AND client_company ILIKE '%Global%Retail%'
  AND is_seeded = TRUE;

-- Add a comment for reference
COMMENT ON COLUMN testimonials.is_seeded IS 'Flag to identify testimonials from seed data that should remain unpublished by default';

-- Verify the update (for logging purposes)
DO $$
DECLARE
  affected_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO affected_count
  FROM testimonials
  WHERE client_name = 'Emma Williams' 
    AND client_company = 'Global Retail Corp.'
    AND is_active = FALSE;
    
  RAISE NOTICE 'Emma Williams testimonial status: % record(s) set to inactive', affected_count;
  
  IF affected_count = 0 THEN
    RAISE NOTICE 'No Emma Williams testimonial found in database - already removed or never existed';
  END IF;
END $$;
