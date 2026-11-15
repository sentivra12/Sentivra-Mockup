-- =============================================================================
-- MIGRATION: mockups_add_missing_columns
-- Adds all columns needed by the new Admin dialog and public detail page.
-- Fully idempotent: uses ADD COLUMN IF NOT EXISTS throughout.
-- =============================================================================

BEGIN;

-- ── New URL field (website the mockup represents, validated https on client) ──
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS website_url TEXT;

-- ── Long bilingual descriptions ──
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS long_description_en TEXT;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS long_description_ar TEXT;

-- ── Taxonomy / metadata ──
-- Note: 'tags' may already exist as jsonb from an earlier migration — guard:
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS tags        TEXT[]   DEFAULT '{}';
-- If the above is a no-op because tags already exists as jsonb, the app handles both.
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS industry    TEXT;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS client_name TEXT;

-- ── Structured feature list (array of short strings) ──
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';

-- ── Gallery images (ordered array of public URLs) ──
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS gallery TEXT[] DEFAULT '{}';

-- ── Behaviour flags ──
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS open_in_new_tab    BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS allow_embed_preview BOOLEAN NOT NULL DEFAULT FALSE;

-- ── Image alt text (already added in earlier migration, guard anyway) ──
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS image_alt_en TEXT;
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS image_alt_ar TEXT;

-- ── Sort order (guard — may already exist) ──
ALTER TABLE mockups ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- ── Backfill: copy legacy demo_url → website_url where website_url is still NULL ──
UPDATE mockups
SET website_url = demo_url
WHERE website_url IS NULL
  AND demo_url IS NOT NULL
  AND demo_url LIKE 'https://%';

-- ── RLS: existing policies already cover these columns (row-level, not column-level).
--    Nothing extra needed.

-- ── Reload PostgREST schema cache ──
NOTIFY pgrst, 'reload schema';

COMMIT;

-- Verify
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'mockups'
  AND column_name IN (
    'website_url','long_description_en','long_description_ar',
    'tags','industry','client_name','features','gallery',
    'open_in_new_tab','allow_embed_preview',
    'image_alt_en','image_alt_ar','display_order'
  )
ORDER BY column_name;
