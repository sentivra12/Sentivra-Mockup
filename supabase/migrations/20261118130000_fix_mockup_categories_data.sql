-- ============================================================================
-- Fix Mockup Categories Data
-- Replace incorrect seed categories with correct 8 categories
-- ============================================================================

-- Unpublish all old incorrect categories
UPDATE mockup_categories 
SET is_active = FALSE
WHERE slug IN ('all', 'business-corporate', 'ecommerce', 'restaurant-food', 
               'healthcare', 'fitness-wellness', 'portfolio-personal');

-- Note: 'education', 'real-estate', and 'other' will be updated with correct data

-- Insert/Update correct 8 categories
INSERT INTO mockup_categories (slug, name_en, name_ar, icon, color, display_order, is_active) VALUES
  ('real-estate-construction', 'Real Estate & Construction', 'العقارات والإنشاءات', 'Building', '#14b8a6', 1, TRUE),
  ('restaurants-cafes', 'Restaurants & Cafés', 'المطاعم والمقاهي', 'Coffee', '#f59e0b', 2, TRUE),
  ('clothing-fashion', 'Clothing & Fashion', 'الملابس والأزياء', 'Shirt', '#ec4899', 3, TRUE),
  ('education', 'Education', 'التعليم', 'GraduationCap', '#6366f1', 4, TRUE),
  ('health-medical', 'Health & Medical', 'الصحة والطب', 'HeartPulse', '#ef4444', 5, TRUE),
  ('industrial-manufacturing', 'Industrial & Manufacturing', 'الصناعة والتصنيع', 'Factory', '#64748b', 6, TRUE),
  ('corporate', 'Corporate', 'شركات', 'Briefcase', '#3b82f6', 7, TRUE),
  ('other', 'Other', 'أخرى', 'Sparkles', '#8b5cf6', 8, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
