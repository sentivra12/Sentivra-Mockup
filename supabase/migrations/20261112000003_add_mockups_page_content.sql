-- ============================================================================
-- Migration: Add mockups page content to CMS
-- Description: Add page_content entries for Mockups page (hero, banner, handwritten note)
-- Author: Kiro AI
-- Date: 2026-11-12
-- ============================================================================

-- Check if page_content table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'page_content') THEN
    RAISE EXCEPTION 'page_content table does not exist. Please run the page_content migration first.';
  END IF;
END $$;

-- Insert page content for Mockups page
INSERT INTO page_content (section_key, content_en, content_ar, page, is_active) VALUES

-- Hero section
('mockups-hero-eyebrow', 'WEBSITE MOCKUPS', 'تصاميم المواقع', 'mockups', TRUE),
('mockups-hero-title', 'Ready-Made Website Mockups', 'تصاميم مواقع جاهزة', 'mockups', TRUE),
('mockups-hero-description', 'Explore ready-made website designs for different industries. Choose a design you like and we''ll customize it for your business needs, complete with your branding, content, and features.', 'استكشف تصاميم المواقع الجاهزة لمختلف الصناعات. اختر التصميم الذي يعجبك وسنقوم بتخصيصه لاحتياجات عملك، مع علامتك التجارية والمحتوى والميزات الخاصة بك.', 'mockups', TRUE),
('mockups-hero-primary-button', 'Find Your Mockup', 'اعثر على تصميمك', 'mockups', TRUE),
('mockups-hero-secondary-button', 'Contact Us', 'تواصل معنا', 'mockups', TRUE),

-- Handwritten annotation
('mockups-hero-handwritten-note', 'Modern Designs For Your Business', 'تصاميم عصرية لأعمالك', 'mockups', TRUE),

-- Stats (used for real counts)
('mockups-stats-designs-label', 'Ready Designs', 'تصميم جاهز', 'mockups', TRUE),
('mockups-stats-industries-label', 'Industries', 'صناعة', 'mockups', TRUE),

-- Section header
('mockups-section-eyebrow', 'OUR MOCKUPS', 'تصاميمنا', 'mockups', TRUE),
('mockups-section-title', 'Explore Our Website Designs', 'استكشف تصاميم مواقعنا', 'mockups', TRUE),
('mockups-section-description', 'Browse our collection of ready-made designs. Each mockup is fully customizable to match your brand identity and business goals.', 'تصفح مجموعتنا من التصاميم الجاهزة. كل تصميم قابل للتخصيص بالكامل ليتناسب مع هوية علامتك التجارية وأهداف عملك.', 'mockups', TRUE),

-- Banner section
('mockups-banner-title', 'Found a Design You Like?', 'وجدت تصميمًا يعجبك؟', 'mockups', TRUE),
('mockups-banner-description', 'We can customize any of our mockups to match your brand, content, and business needs. Get a stunning website tailored specifically for you.', 'يمكننا تخصيص أي من تصاميمنا لتتناسب مع علامتك التجارية والمحتوى واحتياجات عملك. احصل على موقع ويب مذهل مصمم خصيصًا لك.', 'mockups', TRUE),
('mockups-banner-button', 'Contact Us Now', 'تواصل معنا الآن', 'mockups', TRUE),

-- FAQ section header
('mockups-faq-eyebrow', 'FAQ', 'الأسئلة الشائعة', 'mockups', TRUE),
('mockups-faq-title', 'Frequently Asked Questions', 'الأسئلة المتكررة', 'mockups', TRUE),
('mockups-faq-description', 'Find answers to common questions about our website mockups and customization process.', 'ابحث عن إجابات للأسئلة الشائعة حول تصاميم مواقعنا وعملية التخصيص.', 'mockups', TRUE),

-- Empty state
('mockups-empty-title', 'No mockups found', 'لم يتم العثور على تصاميم', 'mockups', TRUE),
('mockups-empty-description', 'We couldn''t find any mockups matching your search. Try adjusting your filters or search terms, or contact us for a custom design.', 'لم نتمكن من العثور على أي تصاميم تطابق بحثك. جرّب تعديل المرشحات أو مصطلحات البحث، أو اتصل بنا للحصول على تصميم مخصص.', 'mockups', TRUE),
('mockups-empty-reset-button', 'Reset Filters', 'إعادة تعيين المرشحات', 'mockups', TRUE),
('mockups-empty-contact-link', 'Request a custom design', 'طلب تصميم مخصص', 'mockups', TRUE),

-- Search and filter
('mockups-search-placeholder', 'Search for a mockup...', 'البحث عن تصميم...', 'mockups', TRUE),
('mockups-results-found', 'Found', 'تم العثور على', 'mockups', TRUE),
('mockups-results-mockups-singular', 'mockup', 'تصميم', 'mockups', TRUE),
('mockups-results-mockups-plural', 'mockups', 'تصميم', 'mockups', TRUE),
('mockups-results-matching', 'matching', 'يطابق', 'mockups', TRUE),

-- Sort options
('mockups-sort-featured', 'Featured First', 'المميز أولاً', 'mockups', TRUE),
('mockups-sort-newest', 'Newest First', 'الأحدث أولاً', 'mockups', TRUE),
('mockups-sort-az', 'A to Z', 'أ إلى ي', 'mockups', TRUE),

-- Card actions
('mockups-card-view', 'View Mockup', 'عرض التصميم', 'mockups', TRUE),
('mockups-card-request', 'Request This Design', 'طلب هذا التصميم', 'mockups', TRUE),
('mockups-card-starting-from', 'Starting from', 'يبدأ من', 'mockups', TRUE),

-- Badges
('mockups-badge-new', 'New', 'جديد', 'mockups', TRUE),
('mockups-badge-popular', 'Popular', 'شائع', 'mockups', TRUE),
('mockups-badge-featured', 'Featured', 'مميز', 'mockups', TRUE),

-- Modal/Detail page
('mockups-modal-whats-included', 'What''s Included', 'ما يتضمنه', 'mockups', TRUE),
('mockups-modal-view-demo', 'View Live Demo', 'عرض النسخة التجريبية', 'mockups', TRUE),
('mockups-modal-request-design', 'Request This Design', 'طلب هذا التصميم', 'mockups', TRUE),
('mockups-modal-order-whatsapp', 'Order via WhatsApp', 'اطلب عبر واتساب', 'mockups', TRUE),
('mockups-modal-share', 'Share', 'مشاركة', 'mockups', TRUE),
('mockups-modal-device-desktop', 'Desktop', 'سطح المكتب', 'mockups', TRUE),
('mockups-modal-device-tablet', 'Tablet', 'جهاز لوحي', 'mockups', TRUE),
('mockups-modal-device-mobile', 'Mobile', 'جوال', 'mockups', TRUE),
('mockups-modal-previous', 'Previous', 'السابق', 'mockups', TRUE),
('mockups-modal-next', 'Next', 'التالي', 'mockups', TRUE),

-- Sticky mobile CTA
('mockups-sticky-cta-text', 'Can''t find your design?', 'لا تجد تصميمك؟', 'mockups', TRUE),
('mockups-sticky-cta-button', 'Request a custom one', 'اطلب تصميمًا مخصصًا', 'mockups', TRUE),

-- Load more
('mockups-load-more', 'View More Mockups', 'عرض المزيد من التصاميم', 'mockups', TRUE),
('mockups-showing-count', 'Showing {current} of {total}', 'عرض {current} من {total}', 'mockups', TRUE),

-- Final CTA
('mockups-cta-title', 'Ready to Start Your Project?', 'جاهز لبدء مشروعك؟', 'mockups', TRUE),
('mockups-cta-description', 'Let''s turn your vision into reality. Contact us today to discuss your website design and get a custom quote.', 'دعنا نحول رؤيتك إلى حقيقة. اتصل بنا اليوم لمناقشة تصميم موقعك والحصول على عرض أسعار مخصص.', 'mockups', TRUE),
('mockups-cta-button', 'Contact Us', 'تواصل معنا', 'mockups', TRUE)

ON CONFLICT (section_key) DO UPDATE SET
  content_en = EXCLUDED.content_en,
  content_ar = EXCLUDED.content_ar,
  page = EXCLUDED.page,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Grant permissions
GRANT SELECT ON page_content TO anon, authenticated;
GRANT ALL ON page_content TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Successfully added % page_content entries for Mockups page', (
    SELECT COUNT(*) FROM page_content WHERE section_key LIKE 'mockups-%'
  );
END $$;
