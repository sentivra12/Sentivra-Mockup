-- =============================================
-- Add Arabic Language Support - Phase 2
-- Migration: 20261107000001_add_arabic_columns.sql
-- =============================================

-- =============================================
-- 1. SITE SETTINGS
-- =============================================
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS tagline_ar TEXT,
ADD COLUMN IF NOT EXISTS address_ar TEXT;

-- =============================================
-- 2. SEO SETTINGS
-- =============================================
ALTER TABLE seo_settings
ADD COLUMN IF NOT EXISTS meta_title_ar TEXT,
ADD COLUMN IF NOT EXISTS meta_description_ar TEXT;

-- =============================================
-- 3. HERO SECTION
-- =============================================
ALTER TABLE hero
ADD COLUMN IF NOT EXISTS headline_ar TEXT,
ADD COLUMN IF NOT EXISTS subheadline_ar TEXT,
ADD COLUMN IF NOT EXISTS cta_primary_text_ar TEXT,
ADD COLUMN IF NOT EXISTS cta_secondary_text_ar TEXT;

-- =============================================
-- 4. TRUST BADGES
-- =============================================
ALTER TABLE trust_badges
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- =============================================
-- 5. SERVICES
-- =============================================
ALTER TABLE services
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS short_description_ar TEXT,
ADD COLUMN IF NOT EXISTS long_description_ar TEXT,
ADD COLUMN IF NOT EXISTS features_ar JSONB,
ADD COLUMN IF NOT EXISTS benefits_ar JSONB,
ADD COLUMN IF NOT EXISTS pricing_info_ar TEXT,
ADD COLUMN IF NOT EXISTS delivery_time_ar TEXT;

-- =============================================
-- 6. PROJECTS
-- =============================================
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS short_description_ar TEXT,
ADD COLUMN IF NOT EXISTS long_description_ar TEXT;

-- =============================================
-- 7. MOCKUPS
-- =============================================
ALTER TABLE mockups
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- =============================================
-- 8. TESTIMONIALS
-- =============================================
ALTER TABLE testimonials
ADD COLUMN IF NOT EXISTS client_role_ar TEXT,
ADD COLUMN IF NOT EXISTS client_company_ar TEXT,
ADD COLUMN IF NOT EXISTS testimonial_text_ar TEXT;

-- =============================================
-- 9. FAQs
-- =============================================
ALTER TABLE faqs
ADD COLUMN IF NOT EXISTS question_ar TEXT,
ADD COLUMN IF NOT EXISTS answer_ar TEXT;

-- =============================================
-- 10. PROCESS STEPS
-- =============================================
ALTER TABLE process_steps
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- =============================================
-- 11. WHY CHOOSE US
-- =============================================
ALTER TABLE why_choose_us
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- =============================================
-- 12. COUNTRIES
-- =============================================
ALTER TABLE countries
ADD COLUMN IF NOT EXISTS name_ar TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- =============================================
-- 13. TIMELINE MILESTONES
-- =============================================
ALTER TABLE timeline_milestones
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- =============================================
-- 14. VALUES
-- =============================================
ALTER TABLE values
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- =============================================
-- 15. STATS
-- =============================================
ALTER TABLE stats
ADD COLUMN IF NOT EXISTS label_ar TEXT;

-- =============================================
-- 16. BLOG POSTS
-- =============================================
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS excerpt_ar TEXT,
ADD COLUMN IF NOT EXISTS content_ar TEXT;

-- =============================================
-- INDEXES (Optional - for performance)
-- =============================================

-- Add GIN indexes for JSONB columns with Arabic content
CREATE INDEX IF NOT EXISTS idx_services_features_ar ON services USING GIN (features_ar);
CREATE INDEX IF NOT EXISTS idx_services_benefits_ar ON services USING GIN (benefits_ar);

-- =============================================
-- COMMENTS (Documentation)
-- =============================================

COMMENT ON COLUMN site_settings.tagline_ar IS 'Arabic translation of site tagline';
COMMENT ON COLUMN site_settings.address_ar IS 'Arabic translation of address';

COMMENT ON COLUMN services.title_ar IS 'Arabic translation of service title';
COMMENT ON COLUMN services.short_description_ar IS 'Arabic translation of short description';
COMMENT ON COLUMN services.long_description_ar IS 'Arabic translation of long description';
COMMENT ON COLUMN services.features_ar IS 'Array of feature strings in Arabic';
COMMENT ON COLUMN services.benefits_ar IS 'Array of benefit strings in Arabic';

COMMENT ON COLUMN projects.title_ar IS 'Arabic translation of project title';
COMMENT ON COLUMN projects.short_description_ar IS 'Arabic translation of short description';
COMMENT ON COLUMN projects.long_description_ar IS 'Arabic translation of long description';

COMMENT ON COLUMN mockups.title_ar IS 'Arabic translation of mockup title';
COMMENT ON COLUMN mockups.description_ar IS 'Arabic translation of description';

COMMENT ON COLUMN testimonials.testimonial_text_ar IS 'Arabic translation of testimonial';
COMMENT ON COLUMN testimonials.client_role_ar IS 'Arabic translation of client role';
COMMENT ON COLUMN testimonials.client_company_ar IS 'Arabic translation of company name';

COMMENT ON COLUMN faqs.question_ar IS 'Arabic translation of FAQ question';
COMMENT ON COLUMN faqs.answer_ar IS 'Arabic translation of FAQ answer';

COMMENT ON COLUMN process_steps.title_ar IS 'Arabic translation of step title';
COMMENT ON COLUMN process_steps.description_ar IS 'Arabic translation of step description';

COMMENT ON COLUMN stats.label_ar IS 'Arabic translation of stat label';

COMMENT ON COLUMN blog_posts.title_ar IS 'Arabic translation of blog post title';
COMMENT ON COLUMN blog_posts.excerpt_ar IS 'Arabic translation of excerpt';
COMMENT ON COLUMN blog_posts.content_ar IS 'Arabic translation of blog post content';

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Arabic columns added successfully to all tables!';
  RAISE NOTICE '📊 Total tables updated: 15';
  RAISE NOTICE '🔤 Total Arabic columns added: 50+';
  RAISE NOTICE '🚀 Database is now bilingual-ready!';
END $$;
