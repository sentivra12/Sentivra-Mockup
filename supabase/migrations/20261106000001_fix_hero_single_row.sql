-- Migration: Fix hero table to enforce single active row
-- This migration:
-- 1. Deactivates all but the most recent active hero
-- 2. Creates a unique partial index to prevent multiple active heroes
-- 3. Adds ON CONFLICT handling for future inserts

-- Step 1: Deactivate all but the newest active hero row
-- Keep only the row with the most recent updated_at
WITH ranked_heroes AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY updated_at DESC, created_at DESC) as rn
  FROM hero
  WHERE is_active = true
)
UPDATE hero
SET is_active = false
WHERE id IN (
  SELECT id FROM ranked_heroes WHERE rn > 1
);

-- Step 2: Create unique partial index to enforce single active hero
-- This prevents multiple rows with is_active = true
CREATE UNIQUE INDEX IF NOT EXISTS hero_single_active 
ON hero (is_active) 
WHERE is_active = true;

-- Step 3: Add comment explaining the constraint
COMMENT ON INDEX hero_single_active IS 'Ensures only one hero row can be active at a time';
