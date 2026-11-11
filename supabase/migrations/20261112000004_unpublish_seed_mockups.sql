-- ============================================================================
-- Migration: Unpublish seed mockups
-- Description: Set is_active=FALSE for all 12 seed mockups (preserve data for reference)
-- Author: Kiro AI
-- Date: 2026-11-12
-- ============================================================================

-- Unpublish all seed mockups by slug (from mockups.js static data)
UPDATE mockups
SET 
  is_active = FALSE,
  updated_at = NOW()
WHERE slug IN (
  'modern-real-estate',
  'cozy-cafe',
  'fashion-store',
  'education-platform',
  'medical-center',
  'industrial-company',
  'corporate-business',
  'creative-portfolio',
  'luxury-hotel',
  'fitness-gym',
  'law-firm',
  'salon-spa'
);

-- Report how many mockups were unpublished
DO $$
DECLARE
  unpublished_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unpublished_count
  FROM mockups
  WHERE slug IN (
    'modern-real-estate',
    'cozy-cafe',
    'fashion-store',
    'education-platform',
    'medical-center',
    'industrial-company',
    'corporate-business',
    'creative-portfolio',
    'luxury-hotel',
    'fitness-gym',
    'law-firm',
    'salon-spa'
  ) AND is_active = FALSE;

  RAISE NOTICE 'Successfully unpublished % seed mockups. Data preserved for reference.', unpublished_count;
  
  IF unpublished_count = 0 THEN
    RAISE NOTICE 'No seed mockups found in database. They may have been deleted or never imported.';
  END IF;
END $$;

-- List unpublished mockups for verification
DO $$
DECLARE
  mockup_record RECORD;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'UNPUBLISHED SEED MOCKUPS:';
  RAISE NOTICE '========================================';
  
  FOR mockup_record IN
    SELECT slug, title, category
    FROM mockups
    WHERE slug IN (
      'modern-real-estate',
      'cozy-cafe',
      'fashion-store',
      'education-platform',
      'medical-center',
      'industrial-company',
      'corporate-business',
      'creative-portfolio',
      'luxury-hotel',
      'fitness-gym',
      'law-firm',
      'salon-spa'
    ) AND is_active = FALSE
    ORDER BY slug
  LOOP
    RAISE NOTICE '- % (%) - %', mockup_record.slug, mockup_record.category, mockup_record.title;
  END LOOP;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

COMMENT ON TABLE mockups IS 'Website mockups. Seed data (12 mockups with Unsplash photos) unpublished 2026-11-12. Replace with real client mockups.';
