-- Check for duplicate services
-- This is a READ-ONLY query to identify duplicates
-- Run this first, then decide which ones to unpublish

SELECT 
  slug,
  title_en,
  is_active,
  created_at,
  COUNT(*) as count
FROM services
WHERE is_active = true
GROUP BY slug, title_en, is_active, created_at
HAVING COUNT(*) > 1
ORDER BY slug;

-- Also check for similar titles (potential duplicates)
SELECT 
  id,
  slug,
  title_en,
  is_active,
  created_at
FROM services
WHERE is_active = true
  AND (
    -- Web Development variations
    slug IN ('web-development', 'web-application-development') OR
    title_en ILIKE '%web%development%' OR
    title_en ILIKE '%web%application%' OR
    
    -- Mobile variations  
    slug IN ('mobile-applications', 'mobile-application-development') OR
    title_en ILIKE '%mobile%application%'
  )
ORDER BY slug, created_at;

-- DECISION NEEDED:
-- If you see duplicates above, create a follow-up migration to unpublish the older/seed versions
-- Keep the user-edited ones (usually newer created_at or with more content)
