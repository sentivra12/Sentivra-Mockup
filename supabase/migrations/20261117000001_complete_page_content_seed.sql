-- =============================================
-- Migration: Complete page_content seed for all pages
-- Created: 2026-11-17
-- Purpose: Seed page_content with CURRENT public site texts
-- =============================================

-- This migration is IDEMPOTENT - safe to run multiple times
-- It will only insert rows that don't already exist

-- =============================================
-- HOME PAGE
-- =============================================

INSERT INTO page_content (page_key, section_key, label_en, label_ar, title_en, title_ar, title_accent_en, title_accent_ar, subtitle_en, subtitle_ar, description_en, description_ar, primary_button_label_en, primary_button_label_ar, primary_button_link, secondary_button_label_en, secondary_button_label_ar, secondary_button_link, display_order, is_active)
VALUES
  -- Home Hero
  (
    'home',
    'hero',
    'Software Company',
    'شركة برمجيات',
    'From Ideas to Real',
    'من الأفكار إلى المنتجات',
    'Digital Products',
    'الرقمية الحقيقية',
    'We transform your business ideas into powerful software solutions',
    'نحول أفكار عملك إلى حلول برمجية قوية',
    NULL,
    NULL,
    'Start Your Project',
    'ابدأ مشروعك',
    '/contact',
    'Learn More',
    'اعرف المزيد',
    '#services',
    1,
    TRUE
  ),
  
  -- Home Services Section
  (
    'home',
    'services',
    'OUR SERVICES',
    'خدماتنا',
    'Our Services',
    'خدماتنا',
    NULL,
    NULL,
    'Comprehensive digital solutions tailored to your business needs',
    'حلول رقمية شاملة مصممة خصيصاً لاحتياجات عملك',
    NULL,
    NULL,
    'View All Services',
    'عرض جميع الخدمات',
    '/services',
    NULL,
    NULL,
    NULL,
    2,
    TRUE
  ),
  
  -- Home Why Choose Us
  (
    'home',
    'why-choose-us',
    'WHY CHOOSE US',
    'لماذا نحن',
    'Innovation and Excellence',
    'الابتكار والتميز',
    NULL,
    NULL,
    'Why Choose Sentivra',
    'لماذا Sentivra',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    3,
    TRUE
  ),
  
  -- Home Stats
  (
    'home',
    'stats',
    'Our Impact',
    'تأثيرنا',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    4,
    TRUE
  ),
  
  -- Home CTA
  (
    'home',
    'cta',
    'Ready to Start?',
    'مستعد للبدء؟',
    'Let''s Turn Your Ideas Into Real Products',
    'دعنا نحول أفكارك إلى منتجات حقيقية',
    NULL,
    NULL,
    'Let''s discuss how we can help bring your vision to life',
    'دعنا نناقش كيف يمكننا المساعدة في تحقيق رؤيتك',
    'Transform your ideas into reality with our expert team. Get started today with a free consultation.',
    'حول أفكارك إلى واقع مع فريقنا المتخصص. ابدأ اليوم مع استشارة مجانية.',
    'Start a Project',
    'ابدأ مشروع',
    '/contact',
    'View Services',
    'عرض الخدمات',
    '/services',
    5,
    TRUE
  )
ON CONFLICT (page_key, section_key) DO NOTHING;

-- =============================================
-- SERVICES PAGE
-- =============================================

INSERT INTO page_content (page_key, section_key, label_en, label_ar, title_en, title_ar, title_accent_en, title_accent_ar, subtitle_en, subtitle_ar, description_en, description_ar, primary_button_label_en, primary_button_label_ar, primary_button_link, secondary_button_label_en, secondary_button_label_ar, secondary_button_link, display_order, is_active)
VALUES
  -- Services Hero
  (
    'services',
    'hero',
    'OUR SERVICES',
    'خدماتنا',
    'Digital Solutions That',
    'حلول رقمية',
    'Drive Real Results',
    'تحقق نتائج حقيقية',
    NULL,
    NULL,
    'From custom web applications to mobile apps and enterprise systems, we deliver software that transforms your business operations and accelerates growth.',
    'من تطبيقات الويب المخصصة إلى تطبيقات الموبايل وأنظمة المؤسسات، نقدم برمجيات تحول عمليات عملك وتسرع النمو.',
    'View All Services',
    'عرض جميع الخدمات',
    '#services',
    'Get Free Consultation',
    'احصل على استشارة مجانية',
    '/contact',
    1,
    TRUE
  ),
  
  -- Services List
  (
    'services',
    'services-list',
    'What We Build',
    'ما نبنيه',
    'What We Build',
    'ما نبنيه',
    NULL,
    NULL,
    'Comprehensive software development services tailored to your business needs',
    'خدمات تطوير برمجيات شاملة مصممة خصيصاً لاحتياجات عملك',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    2,
    TRUE
  ),
  
  -- Services Why Choose
  (
    'services',
    'why-choose-us',
    'WHY CHOOSE SENTIVRA',
    'لماذا SENTIVRA',
    'Innovation and Excellence',
    'الابتكار والتميز',
    NULL,
    NULL,
    NULL,
    NULL,
    'We combine cutting-edge technology with industry best practices to deliver solutions that exceed expectations.',
    'نجمع بين التكنولوجيا المتطورة وأفضل ممارسات الصناعة لتقديم حلول تتجاوز التوقعات.',
    'Learn More About Us',
    'اعرف المزيد عنا',
    '/about',
    NULL,
    NULL,
    NULL,
    3,
    TRUE
  ),
  
  -- Services FAQ
  (
    'services',
    'faq',
    'COMMON QUESTIONS',
    'الأسئلة الشائعة',
    'Frequently Asked Questions',
    'الأسئلة المتكررة',
    NULL,
    NULL,
    'Everything you need to know about our services and process',
    'كل ما تحتاج لمعرفته عن خدماتنا وعملياتنا',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    4,
    TRUE
  )
ON CONFLICT (page_key, section_key) DO NOTHING;

-- =============================================
-- MOCKUPS PAGE
-- =============================================

INSERT INTO page_content (page_key, section_key, label_en, label_ar, title_en, title_ar, title_accent_en, title_accent_ar, subtitle_en, subtitle_ar, description_en, description_ar, primary_button_label_en, primary_button_label_ar, primary_button_link, secondary_button_label_en, secondary_button_label_ar, secondary_button_link, display_order, is_active)
VALUES
  -- Mockups Hero
  (
    'mockups',
    'hero',
    'WEBSITE MOCKUPS',
    'نماذج المواقع',
    'Ready-Made',
    'نماذج مواقع',
    'Website Mockups',
    'جاهزة',
    NULL,
    NULL,
    'Explore ready-made website designs for different industries. Choose a design you like and contact us to get it customized for your business.',
    'استكشف تصاميم مواقع جاهزة لصناعات مختلفة. اختر التصميم الذي يعجبك واتصل بنا للحصول عليه مخصصاً لعملك.',
    'Find Your Mockup',
    'ابحث عن نموذجك',
    '#mockups',
    'Contact Us',
    'اتصل بنا',
    '/contact',
    1,
    TRUE
  ),
  
  -- Mockups Section
  (
    'mockups',
    'mockups-section',
    'OUR MOCKUPS',
    'نماذجنا',
    'Explore Our Website Designs',
    'استكشف تصاميم مواقعنا',
    NULL,
    NULL,
    NULL,
    NULL,
    'Browse our collection of ready-made designs. Click on any project to view more details.',
    'تصفح مجموعتنا من التصاميم الجاهزة. انقر على أي مشروع لعرض المزيد من التفاصيل.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    2,
    TRUE
  )
ON CONFLICT (page_key, section_key) DO NOTHING;

-- =============================================
-- ABOUT PAGE
-- =============================================

INSERT INTO page_content (page_key, section_key, label_en, label_ar, title_en, title_ar, title_accent_en, title_accent_ar, subtitle_en, subtitle_ar, description_en, description_ar, primary_button_label_en, primary_button_label_ar, primary_button_link, secondary_button_label_en, secondary_button_label_ar, secondary_button_link, display_order, is_active)
VALUES
  -- About Hero
  (
    'about',
    'hero',
    'ABOUT US',
    'من نحن',
    'Building Digital',
    'نبني المستقبل',
    'Future',
    'الرقمي',
    'Transforming businesses through innovative software solutions',
    'نحول الأعمال من خلال حلول برمجية مبتكرة',
    NULL,
    NULL,
    'Start Your Project',
    'ابدأ مشروعك',
    '/contact',
    'Our Services',
    'خدماتنا',
    '/services',
    1,
    TRUE
  ),
  
  -- About Our Story
  (
    'about',
    'our-story',
    'OUR STORY',
    'قصتنا',
    'Who We Are',
    'من نحن',
    NULL,
    NULL,
    NULL,
    NULL,
    'We are a team of passionate developers, designers, and strategists dedicated to creating exceptional digital experiences.',
    'نحن فريق من المطورين والمصممين والاستراتيجيين المتحمسين المكرسين لإنشاء تجارب رقمية استثنائية.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    2,
    TRUE
  ),
  
  -- About How We Work
  (
    'about',
    'how-we-work',
    'HOW WE WORK',
    'كيف نعمل',
    'Our Process',
    'عمليتنا',
    NULL,
    NULL,
    'From concept to launch, we follow a proven methodology',
    'من المفهوم إلى الإطلاق، نتبع منهجية مثبتة',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    3,
    TRUE
  ),
  
  -- About Why Choose Us
  (
    'about',
    'why-choose-us',
    'WHY CHOOSE US',
    'لماذا نحن',
    'What Sets Us Apart',
    'ما يميزنا',
    NULL,
    NULL,
    NULL,
    NULL,
    'Quality, innovation, and client success drive everything we do.',
    'الجودة والابتكار ونجاح العملاء يدفع كل ما نقوم به.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    4,
    TRUE
  ),
  
  -- About CTA
  (
    'about',
    'cta',
    'GET IN TOUCH',
    'تواصل معنا',
    'Let''s Build Something Great Together',
    'دعنا نبني شيئاً رائعاً معاً',
    NULL,
    NULL,
    NULL,
    NULL,
    'Ready to transform your business with innovative software? Contact us today.',
    'مستعد لتحويل عملك ببرمجيات مبتكرة؟ اتصل بنا اليوم.',
    'Contact Us',
    'اتصل بنا',
    '/contact',
    NULL,
    NULL,
    NULL,
    5,
    TRUE
  )
ON CONFLICT (page_key, section_key) DO NOTHING;

-- =============================================
-- CONTACT PAGE
-- =============================================

INSERT INTO page_content (page_key, section_key, label_en, label_ar, title_en, title_ar, title_accent_en, title_accent_ar, subtitle_en, subtitle_ar, description_en, description_ar, primary_button_label_en, primary_button_label_ar, primary_button_link, secondary_button_label_en, secondary_button_label_ar, secondary_button_link, display_order, is_active)
VALUES
  -- Contact Hero
  (
    'contact',
    'hero',
    'CONTACT US',
    'اتصل بنا',
    'Get in',
    'تواصل',
    'Touch',
    'معنا',
    'Have a project in mind? Let''s talk',
    'لديك مشروع في ذهنك؟ دعنا نتحدث',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    1,
    TRUE
  ),
  
  -- Contact Form Section
  (
    'contact',
    'contact-form',
    'SEND MESSAGE',
    'أرسل رسالة',
    'Start Your Project',
    'ابدأ مشروعك',
    NULL,
    NULL,
    'Fill out the form and we''ll get back to you within 24 hours',
    'املأ النموذج وسنرد عليك خلال 24 ساعة',
    NULL,
    NULL,
    'Send Message',
    'أرسل رسالة',
    NULL,
    NULL,
    NULL,
    NULL,
    2,
    TRUE
  ),
  
  -- Contact Info
  (
    'contact',
    'contact-info',
    'CONTACT INFO',
    'معلومات الاتصال',
    'Other Ways to Reach Us',
    'طرق أخرى للتواصل معنا',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    3,
    TRUE
  )
ON CONFLICT (page_key, section_key) DO NOTHING;

-- =============================================
-- RELOAD POSTGREST SCHEMA CACHE
-- =============================================
NOTIFY pgrst, 'reload schema';
