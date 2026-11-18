-- Quick script to hide Team Members stat
UPDATE stats 
SET is_active = false
WHERE label ILIKE '%team member%' OR key = 'team';

-- Show current active stats
SELECT id, label, key, value, suffix, is_active 
FROM stats 
ORDER BY display_order;
