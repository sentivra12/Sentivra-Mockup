-- Preview Team Members stat before hiding
SELECT id, key, label, label_en, label_ar, value, is_active, display_order
FROM stats
WHERE key ILIKE '%team%' 
   OR label ILIKE '%team member%'
   OR label_en ILIKE '%team member%'
   OR label_ar ILIKE '%عضاء%'
   OR label_ar ILIKE '%فريق%';

-- Hide Team Members stat (set is_active = false)
UPDATE stats 
SET is_active = false, updated_at = NOW()
WHERE key ILIKE '%team%' 
   OR label ILIKE '%team member%'
   OR label_en ILIKE '%team member%'
   OR label_ar ILIKE '%أعضاء%'
   OR label_ar ILIKE '%فريق%';

-- Verify result
SELECT id, key, label, label_en, value, is_active
FROM stats
ORDER BY display_order;

-- Admin UI: Go to Admin > Stats > Find "Team Members" row > Toggle the "Active" switch to OFF
