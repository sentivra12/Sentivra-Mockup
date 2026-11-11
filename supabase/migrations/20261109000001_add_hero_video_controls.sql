-- =============================================
-- Migration: Add hero video and overlay controls
-- Date: 2026-11-09
-- Description: Adds dashboard controls for hero video visibility,
--              overlay strength, badge text, and Arabic translations
-- =============================================

-- Add new columns to hero table (idempotent - only adds if not exists)
DO $$ 
BEGIN
    -- Show/hide video toggle (default true)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='hero' AND column_name='show_background_video'
    ) THEN
        ALTER TABLE hero ADD COLUMN show_background_video BOOLEAN DEFAULT TRUE;
    END IF;

    -- Overlay strength slider (0-100, default 80)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='hero' AND column_name='overlay_strength'
    ) THEN
        ALTER TABLE hero ADD COLUMN overlay_strength INTEGER DEFAULT 80 CHECK (overlay_strength >= 0 AND overlay_strength <= 100);
    END IF;

    -- Badge text field (for customizing "SOFTWARE COMPANY" pill)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='hero' AND column_name='badge_text'
    ) THEN
        ALTER TABLE hero ADD COLUMN badge_text TEXT;
    END IF;

    -- Arabic translations
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='hero' AND column_name='headline_ar'
    ) THEN
        ALTER TABLE hero ADD COLUMN headline_ar TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='hero' AND column_name='subheadline_ar'
    ) THEN
        ALTER TABLE hero ADD COLUMN subheadline_ar TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='hero' AND column_name='badge_text_ar'
    ) THEN
        ALTER TABLE hero ADD COLUMN badge_text_ar TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='hero' AND column_name='cta_primary_text_ar'
    ) THEN
        ALTER TABLE hero ADD COLUMN cta_primary_text_ar TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='hero' AND column_name='cta_secondary_text_ar'
    ) THEN
        ALTER TABLE hero ADD COLUMN cta_secondary_text_ar TEXT;
    END IF;
END $$;

-- Update existing hero row with default values (if exists)
UPDATE hero 
SET 
    show_background_video = COALESCE(show_background_video, TRUE),
    overlay_strength = COALESCE(overlay_strength, 80)
WHERE id IS NOT NULL;

-- Add helpful comment
COMMENT ON COLUMN hero.show_background_video IS 'Dashboard toggle: Show/hide background video (default true)';
COMMENT ON COLUMN hero.overlay_strength IS 'Dashboard slider: Video overlay darkness 0-100 (default 80)';
COMMENT ON COLUMN hero.badge_text IS 'Customizable eyebrow pill text (e.g., "SOFTWARE COMPANY")';
COMMENT ON COLUMN hero.headline_ar IS 'Arabic translation of headline';
COMMENT ON COLUMN hero.subheadline_ar IS 'Arabic translation of subheadline';
COMMENT ON COLUMN hero.badge_text_ar IS 'Arabic translation of badge text';
COMMENT ON COLUMN hero.cta_primary_text_ar IS 'Arabic translation of primary CTA button';
COMMENT ON COLUMN hero.cta_secondary_text_ar IS 'Arabic translation of secondary CTA button';
