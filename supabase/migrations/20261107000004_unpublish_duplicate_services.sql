-- =============================================
-- Migration: Unpublish duplicate service entries
-- Created: 2026-11-07
-- Purpose: Set is_active=FALSE for old duplicate services from COMPLETE_SETUP.sql
-- Idempotent: Safe to run multiple times
-- =============================================

-- Unpublish the two duplicate services
-- These are from COMPLETE_SETUP.sql and conflict with the proper ones in seed_data.sql
UPDATE services
SET 
  is_active = FALSE,
  updated_at = NOW()
WHERE slug IN ('web-development', 'mobile-apps')
  AND is_active = TRUE; -- Only update if currently active

-- Log what was unpublished (for verification)
DO $$
DECLARE
  unpublished_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unpublished_count
  FROM services
  WHERE slug IN ('web-development', 'mobile-apps') AND is_active = FALSE;
  
  RAISE NOTICE 'Unpublished % duplicate service(s): web-development, mobile-apps', unpublished_count;
END $$;

-- The correct services to keep active are:
-- - 'web-application-development' (not 'web-development')
-- - 'mobile-application-development' (not 'mobile-apps')

COMMENT ON TABLE services IS 'Services table - duplicates from COMPLETE_SETUP.sql unpublished on 2026-11-07';
