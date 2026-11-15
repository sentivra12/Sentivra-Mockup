-- =============================================
-- SEED MARQUEE ITEMS (Brand Band)
-- =============================================
-- This migration seeds the marquee_items table with brand/company names
-- to show in the scrolling brand band under the hero section

-- Insert marquee items (company name in different formats)
INSERT INTO marquee_items (text_en, text_ar, row_number, is_published, display_order, created_at, updated_at)
VALUES 
  (
    'Sentivra',
    'سنتفرا',
    1,
    true,
    1,
    NOW(),
    NOW()
  ),
  (
    'Software Solutions',
    'حلول برمجية',
    1,
    true,
    2,
    NOW(),
    NOW()
  ),
  (
    'Digital Innovation',
    'الابتكار الرقمي',
    1,
    true,
    3,
    NOW(),
    NOW()
  ),
  (
    'Sentivra',
    'سنتفرا',
    1,
    true,
    4,
    NOW(),
    NOW()
  ),
  (
    'Tech Excellence',
    'التميز التقني',
    1,
    true,
    5,
    NOW(),
    NOW()
  ),
  (
    'Building the Future',
    'بناء المستقبل',
    1,
    true,
    6,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE marquee_items IS 'Scrolling brand band text items shown below hero sections';
