-- =============================================
-- MIGRATION STATUS VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to check if migrations were applied
-- =============================================

-- =============================================
-- 1. CHECK IF page_content TABLE EXISTS
-- =============================================
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'page_content'
    ) 
    THEN '✅ page_content table EXISTS'
    ELSE '❌ page_content table MISSING - Run migration 20261107000001'
  END AS status;

-- =============================================
-- 2. CHECK IF service_categories TABLE EXISTS
-- =============================================
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'service_categories'
    ) 
    THEN '✅ service_categories table EXISTS'
    ELSE '❌ service_categories table MISSING - Run migration 20261107000002'
  END AS status;

-- =============================================
-- 3. CHECK IF services TABLE HAS NEW COLUMNS
-- =============================================
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'services' 
      AND column_name = 'title_en'
    ) 
    THEN '✅ services table UPGRADED (has title_en column)'
    ELSE '❌ services table NOT UPGRADED - Run migration 20261107000003'
  END AS status;

-- =============================================
-- 4. CHECK ACTIVE vs INACTIVE SERVICES
-- =============================================
SELECT 
  COUNT(*) FILTER (WHERE is_active = true) as active_services,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_services,
  COUNT(*) as total_services,
  CASE 
    WHEN COUNT(*) FILTER (WHERE is_active = false) >= 2 
    THEN '✅ Duplicates unpublished (2+ inactive)'
    ELSE '⚠️ Check migration 20261107000004 - Expected 2 inactive services'
  END as status
FROM services;

-- =============================================
-- 5. CHECK IF page_content HAS DATA
-- =============================================
SELECT 
  page_key,
  section_key,
  CASE 
    WHEN title_en IS NOT NULL THEN '✅ Has title_en'
    ELSE '❌ Missing title_en'
  END as title_status,
  CASE 
    WHEN title_ar IS NOT NULL THEN '✅ Has title_ar'
    ELSE '❌ Missing title_ar'
  END as arabic_status
FROM page_content
WHERE page_key = 'services'
ORDER BY display_order;

-- =============================================
-- 6. LIST ALL SERVICES WITH STATUS
-- =============================================
SELECT 
  slug,
  title_en,
  title_ar,
  is_active,
  CASE 
    WHEN is_active = false AND slug IN ('web-development', 'mobile-apps')
    THEN '✅ Correctly unpublished duplicate'
    WHEN is_active = true
    THEN '✅ Active service'
    ELSE '⚠️ Review this service'
  END as status
FROM services
ORDER BY display_order;

-- =============================================
-- 7. CHECK service_categories DATA
-- =============================================
SELECT 
  slug,
  name_en,
  name_ar,
  CASE 
    WHEN name_en IS NOT NULL AND name_ar IS NOT NULL 
    THEN '✅ Bilingual complete'
    ELSE '❌ Missing translations'
  END as status
FROM service_categories
ORDER BY display_order;

-- =============================================
-- SUMMARY: WHAT YOU SHOULD SEE IF ALL MIGRATIONS RAN
-- =============================================
-- 1. page_content table EXISTS ✅
-- 2. service_categories table EXISTS ✅
-- 3. services table has title_en column ✅
-- 4. 6 active services, 2 inactive services ✅
-- 5. Services page has 4 content rows (hero, services-list, why-choose-us, faq) ✅
-- 6. Duplicate services (web-development, mobile-apps) are inactive ✅
-- 7. 3 service categories exist (web-mobile, business-systems, ai-data) ✅
--
-- If ANY check shows ❌, you need to run the corresponding migration:
--   Migration 1: supabase/migrations/20261107000001_create_page_content.sql
--   Migration 2: supabase/migrations/20261107000002_create_service_categories.sql
--   Migration 3: supabase/migrations/20261107000003_upgrade_services_schema.sql
--   Migration 4: supabase/migrations/20261107000004_unpublish_duplicate_services.sql
--   Migration 5: supabase/migrations/20261107000005_add_arabic_translations.sql
-- =============================================
