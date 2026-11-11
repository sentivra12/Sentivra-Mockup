-- ============================================================================
-- CHECK_MOCKUPS_MIGRATIONS.sql
-- Verification script for Mockups page migrations
-- Run this after applying migrations 20261112000001 through 20261112000006
-- ============================================================================

\echo '============================================================================'
\echo 'VERIFICATION: Mockups Page Migrations'
\echo '============================================================================'
\echo ''

-- ============================================================================
-- 1. Check mockup_categories table
-- ============================================================================
\echo '1. Checking mockup_categories table...'
\echo '   Expected: 10 categories (all, business-corporate, ecommerce, etc.)'
\echo ''

SELECT 
  COUNT(*) as total_categories,
  COUNT(*) FILTER (WHERE is_active = TRUE) as active_categories,
  COUNT(*) FILTER (WHERE slug IN ('all', 'business-corporate', 'ecommerce', 'restaurant-food', 'healthcare', 'education', 'fitness-wellness', 'real-estate', 'portfolio-personal', 'other')) as expected_slugs
FROM mockup_categories;

\echo ''
\echo '   Category details:'
SELECT 
  slug,
  name_en,
  name_ar,
  icon,
  color,
  display_order,
  is_active
FROM mockup_categories
ORDER BY display_order;

\echo ''

-- ============================================================================
-- 2. Check mockups table schema upgrade
-- ============================================================================
\echo '2. Checking mockups table schema...'
\echo '   Expected: New bilingual columns and screenshot fields'
\echo ''

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'mockups'
  AND column_name IN (
    'slug', 'title_en', 'title_ar',
    'short_description_en', 'short_description_ar',
    'long_description_en', 'long_description_ar',
    'desktop_screenshot_url', 'full_page_screenshot_url',
    'tablet_screenshot_url', 'mobile_screenshot_url',
    'cover_image_url', 'demo_url', 'whats_included',
    'category_id', 'is_new', 'is_popular', 'is_featured'
  )
ORDER BY column_name;

\echo ''

-- ============================================================================
-- 3. Check foreign key relationships
-- ============================================================================
\echo '3. Checking foreign key relationships...'
\echo ''

SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (
    (tc.table_name = 'mockups' AND kcu.column_name = 'category_id')
    OR (tc.table_name = 'messages' AND kcu.column_name = 'mockup_id')
  )
ORDER BY tc.table_name, kcu.column_name;

\echo ''

-- ============================================================================
-- 4. Check page_content entries for Mockups page
-- ============================================================================
\echo '4. Checking page_content entries for Mockups page...'
\echo '   Expected: 40+ sections for complete CMS control'
\echo ''

SELECT 
  COUNT(*) as total_sections,
  COUNT(*) FILTER (WHERE section_key LIKE 'mockups-%') as mockups_sections,
  COUNT(*) FILTER (WHERE content_en IS NOT NULL AND content_en != '') as has_english,
  COUNT(*) FILTER (WHERE content_ar IS NOT NULL AND content_ar != '') as has_arabic
FROM page_content
WHERE section_key LIKE 'mockups-%';

\echo ''
\echo '   Section keys (first 20):'
SELECT 
  section_key,
  LEFT(content_en, 50) as en_preview,
  LEFT(content_ar, 50) as ar_preview,
  is_active
FROM page_content
WHERE section_key LIKE 'mockups-%'
ORDER BY section_key
LIMIT 20;

\echo ''

-- ============================================================================
-- 5. Check seed mockups status
-- ============================================================================
\echo '5. Checking seed mockups (should be unpublished)...'
\echo '   Expected: 12 mockups with is_active = FALSE'
\echo ''

SELECT 
  COUNT(*) as total_seed_mockups,
  COUNT(*) FILTER (WHERE is_active = FALSE) as unpublished,
  COUNT(*) FILTER (WHERE title_ar IS NOT NULL AND title_ar != '') as has_arabic
FROM mockups
WHERE slug IN (
  'modern-real-estate',
  'cozy-cafe',
  'fashion-store',
  'education-platform',
  'medical-center',
  'industrial-company',
  'corporate-business',
  'creative-portfolio',
  'luxury-hotel',
  'fitness-gym',
  'law-firm',
  'salon-spa'
);

\echo ''
\echo '   Seed mockup details:'
SELECT 
  slug,
  title_en,
  title_ar,
  category,
  is_active
FROM mockups
WHERE slug IN (
  'modern-real-estate',
  'cozy-cafe',
  'fashion-store',
  'education-platform',
  'medical-center',
  'industrial-company',
  'corporate-business',
  'creative-portfolio',
  'luxury-hotel',
  'fitness-gym',
  'law-firm',
  'salon-spa'
)
ORDER BY slug;

\echo ''

-- ============================================================================
-- 6. Check messages table upgrade
-- ============================================================================
\echo '6. Checking messages table upgrade for design requests...'
\echo ''

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
  AND column_name IN ('mockup_id', 'project_details', 'source')
ORDER BY column_name;

\echo ''
\echo '   Design requests view exists:'
SELECT 
  COUNT(*) as view_exists
FROM information_schema.views
WHERE table_name = 'design_requests_with_mockup';

\echo ''

-- ============================================================================
-- 7. Summary Report
-- ============================================================================
\echo '============================================================================'
\echo 'SUMMARY REPORT'
\echo '============================================================================'
\echo ''

WITH checks AS (
  SELECT
    (SELECT COUNT(*) = 10 FROM mockup_categories) as categories_ok,
    (SELECT COUNT(*) >= 18 FROM information_schema.columns WHERE table_name = 'mockups' AND column_name IN ('slug', 'title_en', 'title_ar', 'short_description_en', 'short_description_ar', 'long_description_en', 'long_description_ar', 'desktop_screenshot_url', 'full_page_screenshot_url', 'tablet_screenshot_url', 'mobile_screenshot_url', 'cover_image_url', 'demo_url', 'whats_included', 'category_id', 'is_new', 'is_popular', 'is_featured')) as schema_ok,
    (SELECT COUNT(*) = 2 FROM information_schema.table_constraints WHERE table_name IN ('mockups', 'messages') AND constraint_type = 'FOREIGN KEY' AND constraint_name LIKE '%mockup%') as fk_ok,
    (SELECT COUNT(*) >= 40 FROM page_content WHERE section_key LIKE 'mockups-%') as content_ok,
    (SELECT COUNT(*) = 12 FROM mockups WHERE slug IN ('modern-real-estate', 'cozy-cafe', 'fashion-store', 'education-platform', 'medical-center', 'industrial-company', 'corporate-business', 'creative-portfolio', 'luxury-hotel', 'fitness-gym', 'law-firm', 'salon-spa') AND is_active = FALSE) as unpublished_ok,
    (SELECT COUNT(*) = 12 FROM mockups WHERE slug IN ('modern-real-estate', 'cozy-cafe', 'fashion-store', 'education-platform', 'medical-center', 'industrial-company', 'corporate-business', 'creative-portfolio', 'luxury-hotel', 'fitness-gym', 'law-firm', 'salon-spa') AND title_ar IS NOT NULL AND title_ar != '') as arabic_ok,
    (SELECT COUNT(*) = 2 FROM information_schema.columns WHERE table_name = 'messages' AND column_name IN ('mockup_id', 'project_details')) as messages_ok
)
SELECT
  'Mockup Categories' as check_name,
  CASE WHEN categories_ok THEN '✓ PASS' ELSE '✗ FAIL' END as status
FROM checks
UNION ALL
SELECT
  'Mockups Schema Upgrade',
  CASE WHEN schema_ok THEN '✓ PASS' ELSE '✗ FAIL' END
FROM checks
UNION ALL
SELECT
  'Foreign Key Relationships',
  CASE WHEN fk_ok THEN '✓ PASS' ELSE '✗ FAIL' END
FROM checks
UNION ALL
SELECT
  'Page Content Entries',
  CASE WHEN content_ok THEN '✓ PASS' ELSE '✗ FAIL' END
FROM checks
UNION ALL
SELECT
  'Seed Mockups Unpublished',
  CASE WHEN unpublished_ok THEN '✓ PASS' ELSE '✗ FAIL' END
FROM checks
UNION ALL
SELECT
  'Arabic Translations',
  CASE WHEN arabic_ok THEN '✓ PASS' ELSE '✗ FAIL' END
FROM checks
UNION ALL
SELECT
  'Messages Table Upgrade',
  CASE WHEN messages_ok THEN '✓ PASS' ELSE '✗ FAIL' END
FROM checks;

\echo ''
\echo '============================================================================'
\echo 'END OF VERIFICATION'
\echo '============================================================================'
\echo ''
\echo 'Next steps:'
\echo '  1. If all checks pass, migrations are correctly applied'
\echo '  2. Navigate to /admin/mockup-categories to manage categories'
\echo '  3. Navigate to /admin/mockups to add real mockups with screenshots'
\echo '  4. Upload real mockup screenshots (desktop, tablet, mobile)'
\echo '  5. Test /mockups page in browser (light/dark, EN/AR)'
\echo '  6. Test /mockups/:slug detail pages'
\echo '  7. Test design request flow (contact form integration)'
\echo '  8. Run smoke tests and Lighthouse audit'
\echo ''
