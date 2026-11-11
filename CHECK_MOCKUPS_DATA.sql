-- Check mockups data
SELECT 
  COUNT(*) as total_mockups,
  COUNT(CASE WHEN published = true THEN 1 END) as published_mockups,
  COUNT(CASE WHEN preview_image_url IS NOT NULL AND preview_image_url != '' THEN 1 END) as mockups_with_preview,
  COUNT(CASE WHEN screenshot_mobile_url IS NOT NULL AND screenshot_mobile_url != '' THEN 1 END) as mockups_with_mobile
FROM mockups;

-- Check categories
SELECT DISTINCT category, category_ar 
FROM mockups 
WHERE published = true
ORDER BY category;

-- Check messages table for attribution columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
  AND column_name IN ('utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'referrer', 'landing_page', 'gclid', 'fbclid', 'ttclid')
ORDER BY column_name;

-- Check applied migrations
SELECT id, name, executed_at 
FROM supabase_migrations.schema_migrations 
WHERE name LIKE '%mockup%' OR name LIKE '%attribution%'
ORDER BY executed_at DESC;
