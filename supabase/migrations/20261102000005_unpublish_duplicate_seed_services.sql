-- Migration: Unpublish duplicate seed services (Round 3 bug fix)
-- Date: 2026-11-02
-- Purpose: Fix duplicate services issue identified in Round 3
--
-- Issue: Seed data contains services with slugs ending in "-development":
--   - 'web-application-development' vs potential user-created 'web' or 'web-development'
--   - 'mobile-application-development' vs potential user-created 'mobile' or 'mobile-apps'
--
-- Strategy: Unpublish ONLY the seed services IF simpler user-created versions exist
-- This migration is IDEMPOTENT (safe to run multiple times)

-- Check if we have user-created simpler web services
DO $$
DECLARE
  has_user_web BOOLEAN;
  has_user_mobile BOOLEAN;
BEGIN
  -- Check for user web service (non-seed)
  SELECT EXISTS (
    SELECT 1 FROM services
    WHERE slug IN ('web', 'web-development')
      AND is_active = true
      AND slug != 'web-application-development'
  ) INTO has_user_web;
  
  -- Check for user mobile service (non-seed)
  SELECT EXISTS (
    SELECT 1 FROM services
    WHERE slug IN ('mobile', 'mobile-apps', 'mobile-applications')
      AND is_active = true
      AND slug != 'mobile-application-development'
  ) INTO has_user_mobile;
  
  -- Unpublish seed web service if user has created a simpler one
  IF has_user_web THEN
    UPDATE services
    SET 
      is_active = false,
      updated_at = NOW()
    WHERE slug = 'web-application-development'
      AND title = 'Web Application Development'; -- Extra safety: only if title matches seed
    
    RAISE NOTICE 'Unpublished seed service: web-application-development (user web service exists)';
  ELSE
    RAISE NOTICE 'Keeping seed service: web-application-development (no user alternative found)';
  END IF;
  
  -- Unpublish seed mobile service if user has created a simpler one
  IF has_user_mobile THEN
    UPDATE services
    SET 
      is_active = false,
      updated_at = NOW()
    WHERE slug = 'mobile-application-development'
      AND title = 'Mobile Application Development'; -- Extra safety: only if title matches seed
    
    RAISE NOTICE 'Unpublished seed service: mobile-application-development (user mobile service exists)';
  ELSE
    RAISE NOTICE 'Keeping seed service: mobile-application-development (no user alternative found)';
  END IF;
END $$;

-- Show final active services list for verification
SELECT 
  slug,
  title,
  is_active,
  is_featured,
  display_order,
  CASE 
    WHEN slug LIKE '%-development' AND title LIKE '%Development' THEN 'Seed (verbose)'
    ELSE 'User or short slug'
  END as service_type
FROM services
WHERE is_active = true
ORDER BY display_order, slug;

-- Summary report
DO $$
DECLARE
  active_count INTEGER;
  inactive_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO active_count FROM services WHERE is_active = true;
  SELECT COUNT(*) INTO inactive_count FROM services WHERE is_active = false;
  
  RAISE NOTICE '=== Services Summary ===';
  RAISE NOTICE 'Active services: %', active_count;
  RAISE NOTICE 'Inactive services: %', inactive_count;
  RAISE NOTICE 'Total services: %', active_count + inactive_count;
END $$;
