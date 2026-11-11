-- =============================================
-- Migration: Create page_content table for CMS-editable page sections
-- Created: 2026-11-07
-- Purpose: Store hero, section headers, CTAs for each page (EN/AR)
-- =============================================

-- Create page_content table
CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key TEXT NOT NULL, -- 'home', 'services', 'about', 'contact', 'our-work', 'mockups'
  section_key TEXT NOT NULL, -- 'hero', 'features', 'why-choose-us', 'faq', 'cta'
  
  -- Multilingual text fields
  label_en TEXT,
  label_ar TEXT,
  title_en TEXT,
  title_ar TEXT,
  title_accent_en TEXT, -- Highlighted words in title
  title_accent_ar TEXT,
  subtitle_en TEXT,
  subtitle_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  
  -- CTA buttons
  primary_button_label_en TEXT,
  primary_button_label_ar TEXT,
  primary_button_link TEXT,
  secondary_button_label_en TEXT,
  secondary_button_label_ar TEXT,
  secondary_button_link TEXT,
  
  -- Media
  background_image_url TEXT, -- Hero backgrounds, section images
  media_url TEXT, -- Additional images/videos
  
  -- Meta
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique page + section combination
  UNIQUE(page_key, section_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_page_content_page_key ON page_content(page_key);
CREATE INDEX IF NOT EXISTS idx_page_content_active ON page_content(is_active);

-- RLS Policies
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Public can read active content
CREATE POLICY "Public can read active page content"
  ON page_content FOR SELECT
  USING (is_active = TRUE);

-- Authenticated users can read all
CREATE POLICY "Authenticated can read all page content"
  ON page_content FOR SELECT
  TO authenticated
  USING (TRUE);

-- Authenticated users can insert/update/delete
CREATE POLICY "Authenticated can manage page content"
  ON page_content FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- =============================================
-- Seed initial Services page content
-- =============================================

INSERT INTO page_content (page_key, section_key, label_en, label_ar, title_en, title_ar, title_accent_en, title_accent_ar, subtitle_en, subtitle_ar, description_en, description_ar, primary_button_label_en, primary_button_label_ar, primary_button_link, secondary_button_label_en, secondary_button_label_ar, secondary_button_link, display_order, is_active)
VALUES
  -- Services Hero
  (
    'services',
    'hero',
    'Our Services',
    'خدماتنا',
    'Build Your Digital',
    'ابنِ مستقبلك',
    'Future',
    'الرقمي',
    'Comprehensive Software Solutions',
    'حلول برمجية متكاملة',
    'From web and mobile apps to enterprise systems and AI solutions, we deliver cutting-edge technology tailored to your business needs.',
    'من تطبيقات الويب والموبايل إلى أنظمة المؤسسات وحلول الذكاء الاصطناعي، نقدم تقنية متطورة مصممة خصيصاً لاحتياجات عملك.',
    'Explore Services',
    'استكشف الخدمات',
    '#services-list',
    'Get Started',
    'ابدأ الآن',
    '/contact',
    1,
    TRUE
  ),
  
  -- Services List Section Header
  (
    'services',
    'services-list',
    'What We Build',
    'ما نبنيه',
    'Comprehensive Digital Solutions',
    'حلول رقمية شاملة',
    NULL,
    NULL,
    NULL,
    NULL,
    'We specialize in crafting custom software that drives business growth and innovation.',
    'نتخصص في بناء برمجيات مخصصة تدفع نمو الأعمال والابتكار.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    2,
    TRUE
  ),
  
  -- Why Choose Us (Services page variant)
  (
    'services',
    'why-choose-us',
    'Why Choose Sentivra',
    'لماذا Sentivra',
    'Excellence in Every Project',
    'التميز في كل مشروع',
    NULL,
    NULL,
    NULL,
    NULL,
    'Our commitment to quality, innovation, and client success sets us apart in the software development industry.',
    'التزامنا بالجودة والابتكار ونجاح العملاء يميزنا في صناعة تطوير البرمجيات.',
    'Start Your Project',
    'ابدأ مشروعك',
    '/contact',
    NULL,
    NULL,
    NULL,
    3,
    TRUE
  ),
  
  -- FAQ Section
  (
    'services',
    'faq',
    'FAQ',
    'الأسئلة الشائعة',
    'Got Questions?',
    'لديك أسئلة؟',
    NULL,
    NULL,
    NULL,
    NULL,
    'Find answers to common questions about our services, process, and pricing.',
    'اعثر على إجابات للأسئلة الشائعة حول خدماتنا وعملياتنا وأسعارنا.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    4,
    TRUE
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_page_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER page_content_updated_at
  BEFORE UPDATE ON page_content
  FOR EACH ROW
  EXECUTE FUNCTION update_page_content_updated_at();

-- Grant permissions
GRANT SELECT ON page_content TO anon;
GRANT ALL ON page_content TO authenticated;
