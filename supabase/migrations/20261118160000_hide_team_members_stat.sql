-- =============================================
-- Migration: Hide Team Members Stat
-- Date: 2026-11-18
-- Description: Set is_active = false for Team Members stat
-- =============================================

-- Hide Team Members stat (user requested to stop showing it)
UPDATE stats 
SET is_active = false,
    updated_at = NOW()
WHERE label ILIKE '%team member%'
   OR key = 'team';

-- Verify update
DO $$
DECLARE
  hidden_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO hidden_count
  FROM stats
  WHERE (label ILIKE '%team member%' OR key = 'team')
    AND is_active = false;
  
  IF hidden_count > 0 THEN
    RAISE NOTICE '✅ Successfully hidden % Team Members stat(s)', hidden_count;
  ELSE
    RAISE NOTICE '⚠ No Team Members stats found to hide';
  END IF;
END $$;
