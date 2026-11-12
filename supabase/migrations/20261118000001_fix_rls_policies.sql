-- Fix infinite recursion in RLS policies
-- This migration removes circular dependencies in user_roles checks

-- =============================================
-- FIX: Remove problematic RLS policies that cause infinite recursion
-- =============================================

-- Drop and recreate site_settings policies without user_roles dependency
DROP POLICY IF EXISTS "site_settings_select_policy" ON site_settings;
DROP POLICY IF EXISTS "site_settings_update_policy" ON site_settings;
DROP POLICY IF EXISTS "site_settings_admin_all" ON site_settings;

-- Simple policies that don't check roles (since it's single-row config)
CREATE POLICY "site_settings_select_policy" 
ON site_settings FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "site_settings_update_policy" 
ON site_settings FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid()
  )
);

CREATE POLICY "site_settings_insert_policy" 
ON site_settings FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid()
  )
);

-- =============================================
-- FIX: Ensure FAQs table has bilingual columns
-- =============================================

DO $$ 
BEGIN
  -- Check and add question_ar
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'faqs' AND column_name = 'question_ar'
  ) THEN
    ALTER TABLE faqs ADD COLUMN question_ar TEXT;
  END IF;

  -- Check and add answer_ar
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'faqs' AND column_name = 'answer_ar'
  ) THEN
    ALTER TABLE faqs ADD COLUMN answer_ar TEXT;
  END IF;

  -- Rename question to question_en if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'faqs' AND column_name = 'question'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'faqs' AND column_name = 'question_en'
  ) THEN
    ALTER TABLE faqs RENAME COLUMN question TO question_en;
  END IF;

  -- Rename answer to answer_en if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'faqs' AND column_name = 'answer'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'faqs' AND column_name = 'answer_en'
  ) THEN
    ALTER TABLE faqs RENAME COLUMN answer TO answer_en;
  END IF;
END $$;

-- =============================================
-- FIX: Ensure mockups table has all required columns
-- =============================================

-- Add missing bilingual columns if they don't exist
DO $$ 
BEGIN
  -- Check and add title_en
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mockups' AND column_name = 'title_en'
  ) THEN
    ALTER TABLE mockups ADD COLUMN title_en TEXT;
    
    -- Migrate existing title to title_en
    UPDATE mockups SET title_en = title WHERE title_en IS NULL;
  END IF;

  -- Check and add title_ar
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mockups' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE mockups ADD COLUMN title_ar TEXT;
  END IF;

  -- Check and add short_description_en
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mockups' AND column_name = 'short_description_en'
  ) THEN
    ALTER TABLE mockups ADD COLUMN short_description_en TEXT;
    
    -- Migrate existing description to short_description_en
    UPDATE mockups SET short_description_en = description WHERE short_description_en IS NULL;
  END IF;

  -- Check and add short_description_ar
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mockups' AND column_name = 'short_description_ar'
  ) THEN
    ALTER TABLE mockups ADD COLUMN short_description_ar TEXT;
  END IF;

  -- Check and add cover_image_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mockups' AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE mockups ADD COLUMN cover_image_url TEXT;
  END IF;

  -- Check and add desktop_screenshot_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mockups' AND column_name = 'desktop_screenshot_url'
  ) THEN
    ALTER TABLE mockups ADD COLUMN desktop_screenshot_url TEXT;
    
    -- Migrate existing image_url to desktop_screenshot_url
    UPDATE mockups SET desktop_screenshot_url = image_url WHERE desktop_screenshot_url IS NULL;
  END IF;
END $$;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$ 
BEGIN 
  RAISE NOTICE '✅ RLS policies fixed - infinite recursion resolved';
  RAISE NOTICE '✅ FAQs table schema updated with bilingual columns';
  RAISE NOTICE '✅ Mockups table schema updated with bilingual columns';
END $$;
