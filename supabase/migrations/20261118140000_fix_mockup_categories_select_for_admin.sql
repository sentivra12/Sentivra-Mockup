-- ============================================================================
-- Migration: Fix mockup_categories SELECT policy for admin users
-- Description: Allow authenticated users to read ALL categories (not just active ones)
--              so admin panel can display categories in dropdown
-- Author: Kiro AI
-- Date: 2026-11-18
-- ============================================================================

-- Drop the restrictive SELECT policy that only allows is_active = TRUE
DROP POLICY IF EXISTS "mockup_categories_select" ON mockup_categories;

-- Create a new policy that allows:
-- 1. Public (unauthenticated) users can see only active categories
-- 2. Authenticated users can see ALL categories (for admin panel)
CREATE POLICY "mockup_categories_select_public"
  ON mockup_categories
  FOR SELECT
  TO anon
  USING (is_active = TRUE);

CREATE POLICY "mockup_categories_select_authenticated"
  ON mockup_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- The manage policy remains unchanged (only admins can INSERT/UPDATE/DELETE)
-- CREATE POLICY "mockup_categories_manage"
--   ON mockup_categories FOR ALL
--   USING (public.is_admin())
--   WITH CHECK (public.is_admin());

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ mockup_categories SELECT policies fixed';
  RAISE NOTICE '   - Public users: can see active categories only';
  RAISE NOTICE '   - Authenticated users: can see ALL categories';
  RAISE NOTICE '   - Admin users: can manage categories via is_admin()';
END $$;
