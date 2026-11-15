-- OPTIONAL: Unpublish test/demo mockup rows
-- Run this manually if you want to hide the test data from the public page
-- DO NOT run automatically - user decision required

-- Unpublish the test row with gibberish text
UPDATE mockups 
SET is_active = false
WHERE title_en = 'niunhikj' OR title_ar LIKE '%ق3ب3ق%';

-- Unpublish the demo rows (E-commerce, Landing Page, Mobile App)
UPDATE mockups 
SET is_active = false
WHERE title_en IN (
  'E-commerce Dashboard',
  'Landing Page Template',
  'Mobile App UI Kit'
);

-- Verify what was updated
SELECT id, title_en, title_ar, is_active, created_at
FROM mockups
WHERE is_active = false
ORDER BY created_at DESC;
