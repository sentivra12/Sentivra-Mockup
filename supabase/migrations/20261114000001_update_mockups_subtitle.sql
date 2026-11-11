-- Migration: Update mockups hero subtitle to correct copy
-- Description: Updates subtitle ONLY if it still has the OLD seed value (never overwrites user edits)
-- Date: 2024-11-14

-- Update English subtitle (only if it matches the old seed value)
UPDATE page_content
SET subtitle = 'Explore ready-made website designs for different industries. Choose a design you like and contact us to get it customized for your business.'
WHERE page_key = 'mockups'
  AND (
    subtitle = 'Professional, ready-to-use designs for various industries'
    OR subtitle IS NULL
  );

-- Update Arabic subtitle (only if it matches the old seed value or is null)
UPDATE page_content
SET subtitle_ar = 'استكشف تصاميم مواقع جاهزة لمختلف الصناعات. اختر تصميمًا يعجبك وتواصل معنا للحصول عليه مخصصًا لعملك.'
WHERE page_key = 'mockups'
  AND (
    subtitle_ar = 'تصاميم احترافية جاهزة للاستخدام لمختلف الصناعات'
    OR subtitle_ar IS NULL
  );

-- Verify the update
-- Run this to check if the update was applied:
-- SELECT page_key, subtitle, subtitle_ar FROM page_content WHERE page_key = 'mockups';
