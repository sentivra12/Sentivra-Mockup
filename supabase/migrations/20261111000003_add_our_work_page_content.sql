-- =============================================
-- Migration: Add Our Work page content to page_content table
-- Created: 2026-11-11
-- Purpose: CMS-editable content for Our Work page (EN/AR)
-- =============================================

-- Insert Our Work page content sections
INSERT INTO page_content (
  page_key, 
  section_key, 
  label_en, 
  label_ar, 
  title_en, 
  title_ar, 
  title_accent_en,
  title_accent_ar,
  subtitle_en,
  subtitle_ar,
  description_en, 
  description_ar, 
  primary_button_label_en, 
  primary_button_label_ar, 
  primary_button_link, 
  secondary_button_label_en, 
  secondary_button_label_ar, 
  secondary_button_link, 
  display_order, 
  is_active
)
VALUES
  -- =============================================
  -- Hero Section
  -- =============================================
  (
    'our-work',
    'hero',
    'Our Portfolio',
    'معرض أعمالنا',
    'Real Projects.',
    'مشاريع حقيقية.',
    'Real Impact.',
    'تأثير فعلي.',
    'Transforming Ideas into Digital Success',
    'تحويل الأفكار إلى نجاح رقمي',
    'Explore our portfolio of successful software projects delivered to satisfied clients across multiple industries. Each project represents our commitment to quality, innovation, and measurable business impact.',
    'استكشف معرض أعمالنا من المشاريع البرمجية الناجحة المُسلّمة لعملاء راضين عبر صناعات متعددة. كل مشروع يمثل التزامنا بالجودة والابتكار والتأثير القابل للقياس على الأعمال.',
    'View Projects',
    'شاهد المشاريع',
    '#projects',
    'Start Your Project',
    'ابدأ مشروعك',
    '/contact',
    1,
    TRUE
  ),
  
  -- =============================================
  -- Projects List Section Header
  -- =============================================
  (
    'our-work',
    'projects-header',
    'Featured Work',
    'أعمال مميزة',
    'Projects That Drive Results',
    'مشاريع تحقق النتائج',
    NULL,
    NULL,
    'Browse our work',
    'تصفح أعمالنا',
    'From startups to enterprises, we''ve delivered custom software solutions that solve real business challenges and drive measurable growth.',
    'من الشركات الناشئة إلى المؤسسات الكبرى، قدمنا حلول برمجية مخصصة تحل التحديات الحقيقية وتحقق نمواً ملموساً.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    2,
    TRUE
  ),
  
  -- =============================================
  -- Process Section
  -- =============================================
  (
    'our-work',
    'process',
    'Our Process',
    'عمليتنا',
    'From Ideas to Real Products',
    'من الأفكار إلى منتجات حقيقية',
    NULL,
    NULL,
    'How we work',
    'كيف نعمل',
    'We follow a proven process that ensures your project is delivered on time, within budget, and exceeds expectations at every milestone.',
    'نتبع عملية مُثبتة تضمن تسليم مشروعك في الوقت المحدد وضمن الميزانية وتفوق التوقعات في كل مرحلة.',
    'Start Your Project',
    'ابدأ مشروعك',
    '/contact',
    NULL,
    NULL,
    NULL,
    3,
    TRUE
  ),
  
  -- =============================================
  -- Impact Stats Section
  -- =============================================
  (
    'our-work',
    'impact',
    'Our Impact',
    'تأثيرنا',
    'Numbers That Matter',
    'أرقام مهمة',
    NULL,
    NULL,
    'Real results',
    'نتائج حقيقية',
    'Our track record speaks for itself. These numbers represent real projects, real clients, and real business transformation.',
    'سجلنا يتحدث عن نفسه. هذه الأرقام تمثل مشاريع حقيقية وعملاء حقيقيين وتحول فعلي في الأعمال.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    4,
    TRUE
  ),
  
  -- =============================================
  -- Testimonials Section Header
  -- =============================================
  (
    'our-work',
    'testimonials-header',
    'Client Stories',
    'قصص العملاء',
    'What Our Clients Say',
    'ماذا يقول عملاؤنا',
    NULL,
    NULL,
    'Real feedback',
    'آراء حقيقية',
    'Don''t just take our word for it. Hear directly from the clients who have trusted us with their digital transformation.',
    'لا تأخذ كلامنا فقط. استمع مباشرة من العملاء الذين وثقوا بنا في تحولهم الرقمي.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    5,
    TRUE
  ),
  
  -- =============================================
  -- FAQ Section Header
  -- =============================================
  (
    'our-work',
    'faq-header',
    'FAQ',
    'الأسئلة الشائعة',
    'Common Questions',
    'الأسئلة الشائعة',
    NULL,
    NULL,
    'Get answers',
    'احصل على إجابات',
    'Find answers to the most common questions about our projects, process, pricing, and what to expect when working with us.',
    'اعثر على إجابات للأسئلة الأكثر شيوعاً حول مشاريعنا وعمليتنا وأسعارنا وما يمكن توقعه عند العمل معنا.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    6,
    TRUE
  ),
  
  -- =============================================
  -- Final CTA
  -- =============================================
  (
    'our-work',
    'cta',
    'Ready to Start?',
    'مستعد للبدء؟',
    'Let''s Build Your Next Project',
    'لنبني مشروعك التالي',
    NULL,
    NULL,
    'Get started today',
    'ابدأ اليوم',
    'Have a project in mind? We''d love to hear about it. Get in touch and let''s discuss how we can help bring your vision to life.',
    'لديك مشروع في ذهنك؟ نود أن نسمع عنه. تواصل معنا ولنناقش كيف يمكننا مساعدتك في تحقيق رؤيتك.',
    'Get Started',
    'ابدأ الآن',
    '/contact',
    'View Services',
    'شاهد الخدمات',
    '/services',
    7,
    TRUE
  );

-- =============================================
-- Verify inserted rows
-- =============================================

-- Check that all 7 sections were inserted
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO row_count
  FROM page_content
  WHERE page_key = 'our-work';
  
  IF row_count = 7 THEN
    RAISE NOTICE 'SUCCESS: 7 Our Work page content sections inserted';
  ELSE
    RAISE WARNING 'EXPECTED 7 sections, found %', row_count;
  END IF;
END $$;

-- =============================================
-- NOTES:
-- =============================================
-- These content sections can now be edited via the dashboard
-- Page Content management screen without code changes.
--
-- Sections created:
-- 1. hero - Premium hero with featured projects visual
-- 2. projects-header - Section header above project grid
-- 3. process - Process section header and CTA
-- 4. impact - Stats/impact section header
-- 5. testimonials-header - Testimonials section intro
-- 6. faq-header - FAQ section intro
-- 7. cta - Final call-to-action band
-- =============================================
