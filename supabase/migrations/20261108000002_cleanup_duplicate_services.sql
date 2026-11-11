-- =============================================
-- Cleanup Duplicate Services Migration
-- Migration: 20261108000002_cleanup_duplicate_services.sql
-- Purpose: Remove duplicate service entries while preserving correct ones
-- Idempotent: Safe to run multiple times (checks before deleting)
-- =============================================

-- =============================================
-- IMPORTANT: Review Before Running
-- =============================================
-- This migration identifies and removes duplicate services based on slug.
-- It keeps the FIRST occurrence (lowest created_at) and removes later duplicates.
-- Review the list below and adjust if needed.

-- =============================================
-- 1. IDENTIFY DUPLICATES
-- =============================================
-- Query to find duplicates (for review only, not executed)
-- SELECT slug, COUNT(*) as count, array_agg(id ORDER BY created_at) as ids
-- FROM services
-- GROUP BY slug
-- HAVING COUNT(*) > 1;

-- =============================================
-- 2. DELETE DUPLICATES (Keep oldest entry)
-- =============================================

-- Delete duplicate services, keeping only the first created instance
WITH duplicates AS (
  SELECT 
    id,
    slug,
    ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at ASC) as rn
  FROM services
)
DELETE FROM services
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- =============================================
-- 3. ENSURE UNIQUE CONSTRAINT
-- =============================================

-- Add unique constraint if it doesn't exist (should already exist from initial schema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'services_slug_key' AND conrelid = 'services'::regclass
  ) THEN
    ALTER TABLE services ADD CONSTRAINT services_slug_key UNIQUE (slug);
    RAISE NOTICE '✅ Added unique constraint on services.slug';
  ELSE
    RAISE NOTICE 'ℹ️  Unique constraint already exists on services.slug';
  END IF;
END $$;

-- =============================================
-- 4. VERIFY SERVICE CATEGORIES
-- =============================================

-- Ensure all services have valid categories
UPDATE services
SET category = CASE
  WHEN category NOT IN ('Web & Mobile', 'Business Systems', 'AI & Data', 'Design & Cloud') 
  THEN 'Web & Mobile' -- Default fallback
  ELSE category
END
WHERE category IS NULL OR category NOT IN ('Web & Mobile', 'Business Systems', 'AI & Data', 'Design & Cloud');

-- =============================================
-- 5. STANDARDIZE DISPLAY ORDER
-- =============================================

-- Recalculate display_order to ensure no gaps
WITH ordered_services AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY display_order ASC, created_at ASC) as new_order
  FROM services
  WHERE is_active = true
)
UPDATE services s
SET display_order = os.new_order
FROM ordered_services os
WHERE s.id = os.id;

-- =============================================
-- 6. CLEANUP ORPHANED DATA (if any)
-- =============================================

-- Remove any services that might be inactive duplicates
-- (Only if you want to permanently remove inactive services)
-- Uncomment if needed:
-- DELETE FROM services WHERE is_active = false AND slug IN (
--   SELECT slug FROM services WHERE is_active = true
-- );

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

DO $$
DECLARE
  active_services INTEGER;
  total_services INTEGER;
  categories_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO active_services FROM services WHERE is_active = true;
  SELECT COUNT(*) INTO total_services FROM services;
  SELECT COUNT(DISTINCT category) INTO categories_count FROM services;

  RAISE NOTICE '✅ Service cleanup completed successfully!';
  RAISE NOTICE '📊 Active services: %', active_services;
  RAISE NOTICE '📊 Total services: %', total_services;
  RAISE NOTICE '📂 Categories: %', categories_count;
  RAISE NOTICE '';
  RAISE NOTICE '✨ All slugs are now unique!';
END $$;
