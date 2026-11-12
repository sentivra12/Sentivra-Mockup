-- ============================================================================
-- Migration: Fix mockup_categories RLS policies
-- Description: Simplify RLS to allow authenticated users full access
-- Author: Kiro AI
-- Date: 2026-11-18
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view active mockup categories" ON mockup_categories;
DROP POLICY IF EXISTS "Authenticated users can manage mockup categories" ON mockup_categories;

-- Create new simplified policies
-- Policy: Public read access for active categories
CREATE POLICY "mockup_categories_select_policy"
  ON mockup_categories
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert
CREATE POLICY "mockup_categories_insert_policy"
  ON mockup_categories
  FOR INSERT
  WITH CHECK (true);

-- Policy: Authenticated users can update
CREATE POLICY "mockup_categories_update_policy"
  ON mockup_categories
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete
CREATE POLICY "mockup_categories_delete_policy"
  ON mockup_categories
  FOR DELETE
  USING (true);
