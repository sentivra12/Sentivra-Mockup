-- =============================================
-- Migration: Unpublish seed/demo projects
-- Created: 2026-11-11
-- Purpose: Hide fake demo projects in production (don't delete - preserve for reference)
-- =============================================

-- =============================================
-- Unpublish the 6 seed projects
-- =============================================

-- These projects were inserted by the seed file (20261104000002_seed_data.sql)
-- with stock Unsplash photos. They are demo/example data.
-- We unpublish (is_active = FALSE) instead of deleting to:
-- 1. Preserve them for reference
-- 2. Allow re-activation if needed
-- 3. Avoid breaking foreign key relationships

UPDATE projects
SET 
  is_active = FALSE,
  is_featured = FALSE,
  updated_at = NOW()
WHERE slug IN (
  'real-estate-platform',
  'inventory-management-system',
  'healthcare-mobile-app',
  'manufacturing-erp',
  'ecommerce-platform',
  'sales-crm-dashboard'
);

-- =============================================
-- Verify the unpublish operation
-- =============================================

DO $$
DECLARE
  unpublished_count INTEGER;
  still_active_count INTEGER;
BEGIN
  -- Count how many seed projects were unpublished
  SELECT COUNT(*) INTO unpublished_count
  FROM projects
  WHERE slug IN (
    'real-estate-platform',
    'inventory-management-system',
    'healthcare-mobile-app',
    'manufacturing-erp',
    'ecommerce-platform',
    'sales-crm-dashboard'
  ) AND is_active = FALSE;
  
  -- Count how many are still active (real user projects)
  SELECT COUNT(*) INTO still_active_count
  FROM projects
  WHERE is_active = TRUE;
  
  RAISE NOTICE '================================================';
  RAISE NOTICE 'UNPUBLISH SEED PROJECTS: COMPLETE';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Unpublished seed projects: %', unpublished_count;
  RAISE NOTICE 'Active projects remaining: %', still_active_count;
  RAISE NOTICE '';
  RAISE NOTICE 'The 6 seed projects are now hidden from public view.';
  RAISE NOTICE 'They can be re-activated or deleted later via dashboard.';
  RAISE NOTICE '================================================';
END $$;

-- =============================================
-- List of unpublished seed projects:
-- =============================================
-- 1. real-estate-platform - Demo real estate listing platform
-- 2. inventory-management-system - Demo inventory tracking system
-- 3. healthcare-mobile-app - Demo patient care mobile app
-- 4. manufacturing-erp - Demo manufacturing ERP system
-- 5. ecommerce-platform - Demo multi-vendor marketplace
-- 6. sales-crm-dashboard - Demo CRM dashboard
--
-- All used stock Unsplash photos:
-- - House keys photo
-- - Warehouse photo
-- - Doctor with patient photo
-- - Dashboard/manufacturing photo
-- - Chair/furniture photo
-- - Another dashboard photo
--
-- These are NOT real client projects.
-- =============================================

-- =============================================
-- IMPORTANT: Seed file cleanup
-- =============================================
-- To prevent these projects from being re-inserted on fresh database setups,
-- the seed file (20261104000002_seed_data.sql) should be updated to:
--
-- Option 1: Mark them as inactive in the seed itself:
--   is_active = false, is_featured = false
--
-- Option 2: Wrap the INSERT in a conditional:
--   INSERT INTO projects (...) SELECT ... WHERE NOT EXISTS (...)
--
-- Option 3: Remove the project inserts entirely from seed file
--
-- For now, this migration ensures existing databases hide them.
-- =============================================
