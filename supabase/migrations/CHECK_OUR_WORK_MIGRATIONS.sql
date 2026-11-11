-- ============================================================================
-- CHECK_OUR_WORK_MIGRATIONS.sql
-- Verification script for Our Work page migrations
-- Run this after applying migrations 20261111000001 through 20261111000005
-- ============================================================================

\echo '============================================================================'
\echo 'VERIFICATION: Our Work Page Migrations'
\echo '============================================================================'
\echo ''

-- ============================================================================
-- 1. Check project_categories table
-- ============================================================================
\echo '1. Checking project_categories table...'
\echo '   Expected: 7 categories (All, Web Apps, Mobile, ERP, CRM, AI & Chatbots, Other)'
\echo ''

SELECT 
  COUNT(*) as total_categories,
  COUNT(*) FILTER (WHERE is_active = TRUE) as active_categories,
  COUNT(*) FILTER (WHERE slug IN ('all', 'web-apps', 'mobile', 'erp', 'crm', 'ai-chatbots', 'other')) as expected_slugs
FROM project_categories;

\echo ''
\echo '   Category details:'
SELECT 
  slug,
  name_en,
  name_ar,
  color,
  display_order,
  is_active
FROM project_categories
ORDER BY display_order;

\echo ''

-- ============================================================================
-- 2. Check projects table schema upgrade
-- ============================================================================
\echo '2. Checking projects table schema...'
\echo '   Expected: New bilingual columns (title_en/ar, short_description_en/ar, long_description_en/ar)'
\echo '   Expected: New case study fields (client_name, industry, project_year, cover_fit, gallery_images, live_url)'
\echo ''

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'projects'
  AND column_name IN (
    'title_en', 'title_ar',
    'short_description_en', 'short_description_ar',
    'long_description_en', 'long_description_ar',
    'category_id', 'client_name', 'industry', 'project_year',
    'cover_image_url', 'cover_fit', 'gallery_images',
    'tech_stack', 'live_url', 'github_url'
  )
ORDER BY column_name;

\echo ''

-- ============================================================================
-- 3. Check foreign key relationship
-- ============================================================================
\echo '3. Checking projects → project_categories foreign key...'
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
  AND tc.table_name = 'projects'
  AND kcu.column_name = 'category_id';

\echo ''

-- ============================================================================
-- 4. Check page_content entries for Our Work page
-- ============================================================================
\echo '4. Checking page_content entries for Our Work page...'
\echo '   Expected: 7 sections (hero, projects-header, process, impact, testimonials-header, faq-header, cta)'
\echo ''

SELECT 
  COUNT(*) as total_sections,
  COUNT(*) FILTER (WHERE section_key LIKE 'our-work-%') as our_work_sections,
  COUNT(*) FILTER (WHERE content_en IS NOT NULL AND content_en != '') as has_english,
  COUNT(*) FILTER (WHERE content_ar IS NOT NULL AND content_ar != '') as has_arabic
FROM page_content
WHERE section_key LIKE 'our-work-%';

\echo ''
\echo '   Section details:'
SELECT 
  section_key,
  LENGTH(content_en) as en_length,
  LENGTH(content_ar) as ar_length,
  is_active
FROM page_content
WHERE section_key LIKE 'our-work-%'
ORDER BY section_key;

\echo ''

-- ============================================================================
-- 5. Check seed projects status
-- ============================================================================
\echo '5. Checking seed projects (should be unpublished)...'
\echo '   Expected: 6 projects with is_active = FALSE'
\echo ''

SELECT 
  slug,
  title_en,
  title_ar,
  is_active,
  created_at
FROM projects
WHERE slug IN (
  'real-estate-platform',
  'inventory-management-system',
  'healthcare-mobile-app',
  'manufacturing-erp',
  'ecommerce-platform',
  'sales-crm-dashboard'
)
ORDER BY slug;

\echo ''

-- ============================================================================
-- 6. Check Arabic translations for seed projects
-- ============================================================================
\echo '6. Checking Arabic translations for seed projects...'
\echo ''

SELECT 
  slug,
  CASE 
    WHEN title_ar IS NOT NULL AND title_ar != '' THEN '✓' 
    ELSE '✗' 
  END as has_title_ar,
  CASE 
    WHEN short_description_ar IS NOT NULL AND short_description_ar != '' THEN '✓' 
    ELSE '✗' 
  END as has_short_desc_ar,
  CASE 
    WHEN long_description_ar IS NOT NULL AND long_description_ar != '' THEN '✓' 
    ELSE '✗' 
  END as has_long_desc_ar
FROM projects
WHERE slug IN (
  'real-estate-platform',
  'inventory-management-system',
  'healthcare-mobile-app',
  'manufacturing-erp',
  'ecommerce-platform',
  'sales-crm-dashboard'
)
ORDER BY slug;

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
    (SELECT COUNT(*) = 7 FROM project_categories) as categories_ok,
    (SELECT COUNT(*) >= 16 FROM information_schema.columns WHERE table_name = 'projects' AND column_name IN ('title_en', 'title_ar', 'short_description_en', 'short_description_ar', 'long_description_en', 'long_description_ar', 'category_id', 'client_name', 'industry', 'project_year', 'cover_image_url', 'cover_fit', 'gallery_images', 'tech_stack', 'live_url', 'github_url')) as schema_ok,
    (SELECT COUNT(*) = 1 FROM information_schema.table_constraints WHERE table_name = 'projects' AND constraint_type = 'FOREIGN KEY') as fk_ok,
    (SELECT COUNT(*) = 7 FROM page_content WHERE section_key LIKE 'our-work-%') as content_ok,
    (SELECT COUNT(*) = 6 FROM projects WHERE slug IN ('real-estate-platform', 'inventory-management-system', 'healthcare-mobile-app', 'manufacturing-erp', 'ecommerce-platform', 'sales-crm-dashboard') AND is_active = FALSE) as unpublished_ok,
    (SELECT COUNT(*) = 6 FROM projects WHERE slug IN ('real-estate-platform', 'inventory-management-system', 'healthcare-mobile-app', 'manufacturing-erp', 'ecommerce-platform', 'sales-crm-dashboard') AND title_ar IS NOT NULL AND title_ar != '' AND short_description_ar IS NOT NULL AND short_description_ar != '') as arabic_ok
)
SELECT
  'Project Categories' as check_name,
  CASE WHEN categories_ok THEN '✓ PASS' ELSE '✗ FAIL' END as status
FROM checks
UNION ALL
SELECT
  'Projects Schema Upgrade',
  CASE WHEN schema_ok THEN '✓ PASS' ELSE '✗ FAIL' END
FROM checks
UNION ALL
SELECT
  'Foreign Key Relationship',
  CASE WHEN fk_ok THEN '✓ PASS' ELSE '✗ FAIL' END
FROM checks
UNION ALL
SELECT
  'Page Content Entries',
  CASE WHEN content_ok THEN '✓ PASS' ELSE '✗ FAIL' END
FROM checks
UNION ALL
SELECT
  'Seed Projects Unpublished',
  CASE WHEN unpublished_ok THEN '✓ PASS' ELSE '✗ FAIL' END
FROM checks
UNION ALL
SELECT
  'Arabic Translations',
  CASE WHEN arabic_ok THEN '✓ PASS' ELSE '✗ FAIL' END
FROM checks;

\echo ''
\echo '============================================================================'
\echo 'END OF VERIFICATION'
\echo '============================================================================'
\echo ''
\echo 'Next steps:'
\echo '  1. If all checks pass, migrations are correctly applied'
\echo '  2. Navigate to /admin/project-categories to manage categories'
\echo '  3. Navigate to /admin/projects to add real projects with bilingual content'
\echo '  4. Upload real project cover images to replace seed data'
\echo '  5. Test /our-work page in browser (light/dark, EN/AR)'
\echo '  6. Test /our-work/:slug detail pages with navigation'
\echo '  7. Run Lighthouse for accessibility, performance, SEO audit'
\echo ''
