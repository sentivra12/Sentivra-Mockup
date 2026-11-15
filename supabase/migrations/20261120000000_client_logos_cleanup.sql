-- =============================================================================
-- MIGRATION: client_logos_cleanup
-- 1. Add missing bilingual + dark-mode-invert columns (idempotent)
-- 2. Unpublish the 6 seed/demo rows that have logo_url = NULL
--    (never deletes rows — only sets is_active = FALSE so they are hidden
--     on the public site but remain editable in Admin > Client Logos)
-- =============================================================================

BEGIN;

-- ── 1. Add columns if they don't exist ───────────────────────────────────────

ALTER TABLE client_logos ADD COLUMN IF NOT EXISTS client_name_ar  TEXT;
ALTER TABLE client_logos ADD COLUMN IF NOT EXISTS alt_text         TEXT;
ALTER TABLE client_logos ADD COLUMN IF NOT EXISTS invert_in_dark  BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN client_logos.client_name_ar  IS 'Arabic translation of client name';
COMMENT ON COLUMN client_logos.alt_text        IS 'Alt text for logo image (defaults to client_name)';
COMMENT ON COLUMN client_logos.invert_in_dark  IS 'Apply CSS invert filter in dark mode for dark logos on transparent bg';

-- ── 2. Unpublish seed demo rows (NULL or empty logo_url) ─────────────────────
-- These are the rows from 20261104000002_seed_data.sql:
--   Tech Corp, Innovate Ltd, Digital Solutions, Enterprise Co, Global Systems, Smart Apps
-- We identify them by logo_url IS NULL AND client_name IN (...) to be safe.
-- Your "bgihy" row has logo_url = '' (empty string) — also unpublished since
-- it has no image. You can re-activate any of these after adding a real logo.

UPDATE client_logos
SET    is_active = FALSE,
       updated_at = NOW()
WHERE  (logo_url IS NULL OR logo_url = '')
  AND  is_active = TRUE;

-- ── 3. Reload PostgREST ───────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';

COMMIT;

-- Verify
SELECT client_name, logo_url, is_active, display_order
FROM   client_logos
ORDER  BY display_order;
