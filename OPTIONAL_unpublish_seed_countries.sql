-- =====================================================
-- OPTIONAL: Unpublish Seed Countries (US, GB, AE)
-- =====================================================
-- This SQL unpublishes the original seed countries so they don't appear on public pages.
-- Run this ONLY if you want to hide these demo entries.
-- 
-- ⚠️  WARNING: Do NOT delete these rows - they may be referenced elsewhere.
-- This only sets is_active=FALSE to hide them from public display.
--
-- To execute:
-- psql $DATABASE_URL -f OPTIONAL_unpublish_seed_countries.sql
-- =====================================================

UPDATE countries
SET is_active = FALSE, updated_at = NOW()
WHERE name IN ('United States', 'United Kingdom', 'United Arab Emirates')
  AND created_at < '2026-11-15'::timestamptz;  -- Only affect old seed data

-- Verify the change
SELECT id, name, is_active, created_at, updated_at
FROM countries
WHERE name IN ('United States', 'United Kingdom', 'United Arab Emirates')
ORDER BY created_at;

-- Result: These countries will no longer appear on the About page (is_active=FALSE filters them out)
