-- =============================================
-- OPTIONAL: Unpublish Old Seed Countries
-- =============================================
-- This script unpublishes old demo/seed countries (US, UK)
-- that were in the old seed_data.sql but are NOT the real
-- company countries (Egypt, UAE, Oman)
--
-- RUN THIS MANUALLY ONLY IF:
-- - You see United States, United Kingdom in your About page
-- - These are not real countries where you operate
-- - You want to hide them without deleting (preserves data)
--
-- TO RUN: Execute in Supabase SQL Editor
--
-- DOES NOT DELETE ROWS - only unpublishes them

-- List current countries first (for review)
SELECT 
  id, 
  name_en, 
  code, 
  flag_emoji, 
  is_active, 
  display_order,
  created_at
FROM countries
ORDER BY display_order;

-- Unpublish old seed countries (US, UK) if they exist
UPDATE countries 
SET is_active = FALSE, updated_at = NOW()
WHERE name_en IN ('United States', 'United Kingdom')
  AND code IN ('US', 'GB', 'UK');

-- Verify changes
SELECT 
  name_en, 
  code, 
  is_active, 
  CASE 
    WHEN is_active THEN '✅ Published' 
    ELSE '❌ Unpublished' 
  END as status
FROM countries
ORDER BY display_order;

-- Note: After running this, notify PostgREST to reload schema:
-- NOTIFY pgrst, 'reload schema';
