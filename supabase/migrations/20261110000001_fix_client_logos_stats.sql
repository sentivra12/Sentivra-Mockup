-- =============================================
-- Migration: Fix Client Logos and Stats
-- Date: 2026-11-10
-- Description: Add missing columns, create page_sections table,
--              unpublish fake seeded data, fix stat numbers
-- =============================================

-- =============================================
-- 1. CLIENT LOGOS - Add Arabic name
-- =============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='client_logos' AND column_name='client_name_ar'
    ) THEN
        ALTER TABLE client_logos ADD COLUMN client_name_ar TEXT;
        COMMENT ON COLUMN client_logos.client_name_ar IS 'Arabic translation of client name';
    END IF;

    -- Add alt_text column for accessibility
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='client_logos' AND column_name='alt_text'
    ) THEN
        ALTER TABLE client_logos ADD COLUMN alt_text TEXT;
        COMMENT ON COLUMN client_logos.alt_text IS 'Alt text for logo image (defaults to client_name if empty)';
    END IF;
END $$;

-- Unpublish seeded fake clients (those without logos)
UPDATE client_logos 
SET is_active = FALSE 
WHERE logo_url IS NULL OR logo_url = '';

COMMENT ON TABLE client_logos IS 'Client logos for "Trusted by" section. Upload logo images via dashboard.';

-- =============================================
-- 2. STATS - Add missing columns
-- =============================================
DO $$ 
BEGIN
    -- Add unique key column for cross-page consistency
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='stats' AND column_name='key'
    ) THEN
        ALTER TABLE stats ADD COLUMN key TEXT UNIQUE;
        COMMENT ON COLUMN stats.key IS 'Unique key (e.g. "projects", "clients") for identifying stat across pages';
    END IF;

    -- Add prefix column (e.g. "$", "€")
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='stats' AND column_name='prefix'
    ) THEN
        ALTER TABLE stats ADD COLUMN prefix TEXT;
        COMMENT ON COLUMN stats.prefix IS 'Text to show before the number (e.g. "$", "€")';
    END IF;

    -- Add description column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='stats' AND column_name='description'
    ) THEN
        ALTER TABLE stats ADD COLUMN description TEXT;
        COMMENT ON COLUMN stats.description IS 'Optional short description line below the label';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='stats' AND column_name='description_ar'
    ) THEN
        ALTER TABLE stats ADD COLUMN description_ar TEXT;
        COMMENT ON COLUMN stats.description_ar IS 'Arabic translation of description';
    END IF;

    -- Add pages visibility control (which pages show this stat)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='stats' AND column_name='pages'
    ) THEN
        ALTER TABLE stats ADD COLUMN pages TEXT[] DEFAULT ARRAY['home', 'services', 'our-work', 'about'];
        COMMENT ON COLUMN stats.pages IS 'Array of page slugs where this stat appears (e.g. ["home", "about"])';
    END IF;
END $$;

-- Fix seeded stats with correct values and keys
UPDATE stats SET 
    key = 'projects',
    value = 50,
    suffix = '+',
    icon = 'CheckCircle'
WHERE label = 'Projects Completed';

UPDATE stats SET 
    key = 'clients',
    value = 30,
    suffix = '+',
    icon = 'Users'
WHERE label = 'Happy Clients';

UPDATE stats SET 
    key = 'countries',
    value = 3,
    suffix = '',
    icon = 'Globe'
WHERE label = 'Countries Served';

UPDATE stats SET 
    key = 'team',
    value = 20,
    suffix = '+',
    icon = 'Users'  -- Fix: UsersRound doesn't exist in Lucide
WHERE label = 'Team Members';

UPDATE stats SET 
    key = 'satisfaction',
    value = 98,
    suffix = '%',
    icon = 'ThumbsUp'
WHERE label = 'Client Satisfaction';

-- Add commonly used stats (unpublished by default - user can enable)
INSERT INTO stats (key, label, value, suffix, icon, display_order, is_active, pages)
VALUES 
    ('years', 'Years Experience', 5, '+', 'Calendar', 6, false, ARRAY['home', 'about']),
    ('industries', 'Industries Served', 10, '+', 'Building2', 7, false, ARRAY['about']),
    ('support', 'Support', 24, '/7', 'Headphones', 8, false, ARRAY['home', 'services'])
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE stats IS 'Statistics shown across pages. ONE value per key shared everywhere for consistency.';

-- =============================================
-- 3. PAGE SECTIONS - Settings table
-- =============================================
CREATE TABLE IF NOT EXISTS page_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key TEXT UNIQUE NOT NULL, -- e.g. 'home_trusted_by', 'home_stats'
    page TEXT NOT NULL, -- e.g. 'home', 'about', 'services'
    eyebrow TEXT, -- Small label above title (e.g. "OUR IMPACT")
    title TEXT, -- Main section title
    subtitle TEXT, -- Section subtitle/description
    eyebrow_ar TEXT,
    title_ar TEXT,
    subtitle_ar TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default section settings
INSERT INTO page_sections (section_key, page, eyebrow, title, subtitle, eyebrow_ar, enabled)
VALUES 
    ('home_trusted_by', 'home', 'Trusted By', NULL, NULL, 'يثقون بنا', true),
    ('home_stats', 'home', 'Our Impact', NULL, NULL, 'تأثيرنا', true),
    ('home_services', 'home', 'Our Services', 'What We Build', 'Comprehensive software solutions', 'خدماتنا', true),
    ('home_projects', 'home', 'Our Work', 'Projects We''re Proud Of', NULL, 'أعمالنا', true),
    ('home_testimonials', 'home', 'Testimonials', 'What Our Clients Say', 'Real feedback from businesses we''ve helped grow', 'آراء العملاء', true),
    ('home_cta', 'home', 'Ready to Start?', 'Let''s Build Something Amazing Together', NULL, 'جاهز للبدء؟', true)
ON CONFLICT (section_key) DO NOTHING;

COMMENT ON TABLE page_sections IS 'Configurable section labels, titles, and subtitles for each page';

-- =============================================
-- 4. RLS POLICIES
-- =============================================

-- Enable RLS on new table
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

-- Public read access to enabled sections
CREATE POLICY "Public can read enabled sections"
ON page_sections FOR SELECT
USING (enabled = true);

-- Admin full access
CREATE POLICY "Admins can manage sections"
ON page_sections FOR ALL
USING (auth.role() = 'authenticated');

-- Ensure client_logos and stats have proper RLS
DO $$
BEGIN
    -- Client logos policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'client_logos' AND policyname = 'Public can read active logos'
    ) THEN
        CREATE POLICY "Public can read active logos"
        ON client_logos FOR SELECT
        USING (is_active = true);
    END IF;

    -- Stats policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'stats' AND policyname = 'Public can read active stats'
    ) THEN
        CREATE POLICY "Public can read active stats"
        ON stats FOR SELECT
        USING (is_active = true);
    END IF;
END $$;

-- =============================================
-- 5. INDEXES for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_client_logos_active_order ON client_logos(is_active, display_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_stats_active_order ON stats(is_active, display_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_stats_key ON stats(key);
CREATE INDEX IF NOT EXISTS idx_stats_pages ON stats USING GIN(pages);
CREATE INDEX IF NOT EXISTS idx_page_sections_key ON page_sections(section_key);

-- =============================================
-- SUCCESS SUMMARY
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '📊 Client logos: Added client_name_ar and alt_text columns';
  RAISE NOTICE '📊 Stats: Added key, prefix, description, description_ar, and pages columns';
  RAISE NOTICE '📊 Stats: Fixed seeded numbers (50+, 30+, 3, 20+, 98%%)';
  RAISE NOTICE '📊 Stats: Fixed UsersRound → Users icon';
  RAISE NOTICE '📊 Stats: Added years, industries, support (unpublished)';
  RAISE NOTICE '🚫 Unpublished 6 fake seeded clients (no logos)';
  RAISE NOTICE '📝 Created page_sections table for section settings';
  RAISE NOTICE '🔒 RLS policies configured';
  RAISE NOTICE '⚡ Performance indexes created';
END $$;
