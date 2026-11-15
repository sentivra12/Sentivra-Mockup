-- =============================================
-- FIX COUNTRIES TABLE FOR BILINGUAL SUPPORT
-- =============================================
-- This migration ensures countries table matches the bilingual schema
-- and provides proper seed data for Egypt, UAE, Oman

-- Drop old columns if they exist from previous migrations
ALTER TABLE IF EXISTS countries 
  DROP COLUMN IF EXISTS name CASCADE,
  DROP COLUMN IF EXISTS country_code CASCADE,
  DROP COLUMN IF EXISTS client_count CASCADE,
  DROP COLUMN IF EXISTS description CASCADE;

-- Ensure bilingual columns exist
DO $$ 
BEGIN
  -- Add name_en if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'countries' AND column_name = 'name_en'
  ) THEN
    ALTER TABLE countries ADD COLUMN name_en TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add name_ar if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'countries' AND column_name = 'name_ar'
  ) THEN
    ALTER TABLE countries ADD COLUMN name_ar TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add description_en if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'countries' AND column_name = 'description_en'
  ) THEN
    ALTER TABLE countries ADD COLUMN description_en TEXT;
  END IF;

  -- Add description_ar if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'countries' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE countries ADD COLUMN description_ar TEXT;
  END IF;

  -- Add image_url if missing (optional, for future use)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'countries' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE countries ADD COLUMN image_url TEXT;
  END IF;

  -- Ensure code column exists (renamed from country_code)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'countries' AND column_name = 'code'
  ) THEN
    ALTER TABLE countries ADD COLUMN code TEXT;
  END IF;

  -- Ensure flag_emoji exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'countries' AND column_name = 'flag_emoji'
  ) THEN
    ALTER TABLE countries ADD COLUMN flag_emoji TEXT;
  END IF;

  -- Ensure is_active exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'countries' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE countries ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;

  -- Ensure display_order exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'countries' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE countries ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;

  -- Ensure timestamps exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'countries' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE countries ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'countries' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE countries ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Remove default from name_en and name_ar after ensuring they exist
ALTER TABLE countries ALTER COLUMN name_en DROP DEFAULT;
ALTER TABLE countries ALTER COLUMN name_ar DROP DEFAULT;

-- Clear any existing demo/seed data (US, UK from old seeds)
-- We'll keep rows user has added, only unpublish seed data
-- UPDATE: Actually, let's just clear and reseed properly
DELETE FROM countries 
WHERE name_en IN ('United States', 'United Kingdom') 
  OR code IN ('US', 'GB', 'UK');

-- Insert real company countries (Egypt, UAE, Oman)
INSERT INTO countries (name_en, name_ar, code, flag_emoji, description_en, description_ar, display_order, is_active, created_at, updated_at)
VALUES 
  (
    'Egypt',
    'مصر',
    'EG',
    '🇪🇬',
    'Delivering innovative digital solutions to businesses across Egypt',
    'تقديم حلول رقمية مبتكرة للشركات في جميع أنحاء مصر',
    1,
    true,
    NOW(),
    NOW()
  ),
  (
    'United Arab Emirates',
    'الإمارات العربية المتحدة',
    'AE',
    '🇦🇪',
    'Partnering with forward-thinking companies in the UAE',
    'الشراكة مع الشركات ذات التفكير المستقبلي في الإمارات',
    2,
    true,
    NOW(),
    NOW()
  ),
  (
    'Oman',
    'عمان',
    'OM',
    '🇴🇲',
    'Supporting Oman's digital transformation journey',
    'دعم رحلة التحول الرقمي في عمان',
    3,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Ensure RLS policies exist
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "countries_select" ON countries;
CREATE POLICY "countries_select" ON countries 
  FOR SELECT 
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "countries_manage" ON countries;
CREATE POLICY "countries_manage" ON countries 
  FOR ALL 
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_countries_active ON countries(is_active, display_order);

COMMENT ON TABLE countries IS 'Countries where the company operates (shown on About page)';
COMMENT ON COLUMN countries.name_en IS 'Country name in English';
COMMENT ON COLUMN countries.name_ar IS 'Country name in Arabic';
COMMENT ON COLUMN countries.code IS 'ISO country code (e.g., EG, AE, OM)';
COMMENT ON COLUMN countries.flag_emoji IS 'Country flag emoji for visual display';
COMMENT ON COLUMN countries.description_en IS 'Short description in English (optional)';
COMMENT ON COLUMN countries.description_ar IS 'Short description in Arabic (optional)';
COMMENT ON COLUMN countries.image_url IS 'Optional image URL (if null, use flag emoji)';
COMMENT ON COLUMN countries.is_active IS 'Whether country is published on About page';
COMMENT ON COLUMN countries.display_order IS 'Display order on About page';
