-- ============================================================================
-- OPTIONAL: Delete Client Logos Seed Data
-- ============================================================================
-- This script is OPTIONAL and provided for manual execution only.
-- It permanently deletes the 6 demo client logo rows inserted by the seed migration.
--
-- These rows were already unpublished by migration 20261120000000_client_logos_cleanup.sql
-- They have logo_url=NULL and client_name in:
--   Tech Corp, Innovate Ltd, Digital Solutions, Enterprise Co, Global Systems, Smart Apps
--
-- WHEN TO RUN:
--   Only if you want to permanently DELETE these rows from your database.
--   They are already inactive (is_active=FALSE) so they don't show in production.
--
-- HOW TO RUN:
--   Option 1: Run manually in Supabase SQL Editor
--   Option 2: psql -f supabase/migrations/OPTIONAL_delete_client_logos_seed_data.sql
--
-- ============================================================================

-- ── 1. CHECK which rows will be deleted ────────────────────────────────────

SELECT 
  id,
  client_name,
  logo_url,
  is_active,
  display_order,
  created_at
FROM client_logos
WHERE 
  logo_url IS NULL
  AND client_name IN (
    'Tech Corp',
    'Innovate Ltd',
    'Digital Solutions',
    'Enterprise Co',
    'Global Systems',
    'Smart Apps'
  )
ORDER BY display_order;

-- Expected: 6 rows with is_active=FALSE (unpublished by cleanup migration)

-- ── 2. OPTIONAL: Delete the seed rows ──────────────────────────────────────
-- Uncomment the DELETE statement below ONLY if you want to permanently remove these rows.
-- WARNING: This cannot be undone. Your real client logos (with logo_url NOT NULL) are safe.

/*
DELETE FROM client_logos
WHERE 
  logo_url IS NULL
  AND client_name IN (
    'Tech Corp',
    'Innovate Ltd',
    'Digital Solutions',
    'Enterprise Co',
    'Global Systems',
    'Smart Apps'
  );

-- Verify deletion
SELECT COUNT(*) as remaining_seed_rows
FROM client_logos
WHERE logo_url IS NULL AND client_name LIKE '%Corp%' OR client_name LIKE '%Ltd%';
*/

-- ============================================================================
-- NOTES:
-- - Your real client logos (with actual logo_url values) are NOT affected
-- - The "bgihy" row (if it exists) with empty logo_url='' is also NOT deleted by this script
-- - After deletion, you can always re-add real client logos via Admin > Client Logos
-- ============================================================================
