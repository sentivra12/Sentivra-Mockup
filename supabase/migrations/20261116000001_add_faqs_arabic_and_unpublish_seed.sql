-- =============================================
-- Migration: Add Arabic columns to FAQs and unpublish seed mockup FAQs
-- Date: 2026-11-16
-- Description: 
--   1. Add question_ar and answer_ar columns for bilingual FAQ support
--   2. Unpublish the 8 seed mockup FAQs that talk about design file purchases
--   3. These will be replaced with new FAQs about ready-made website customization service
-- =============================================

-- Add Arabic columns
ALTER TABLE faqs 
ADD COLUMN IF NOT EXISTS question_ar TEXT,
ADD COLUMN IF NOT EXISTS answer_ar TEXT;

-- Unpublish seed mockup FAQs (only if they still match original seed values)
-- This preserves any user edits while removing outdated seed content

UPDATE faqs 
SET is_active = false
WHERE page_key = 'mockups' 
  AND question = 'What formats are the mockups available in?'
  AND answer = 'Our mockups are available in industry-standard formats including Figma, Sketch, Adobe XD, and PSD. Some mockups also include HTML/CSS code for direct implementation.';

UPDATE faqs 
SET is_active = false
WHERE page_key = 'mockups' 
  AND question = 'Can I customize the mockups?'
  AND answer = 'Yes! All our mockups are fully editable and customizable. You can change colors, fonts, layouts, and content to match your brand identity.';

UPDATE faqs 
SET is_active = false
WHERE page_key = 'mockups' 
  AND question = 'Do mockups include mobile responsive designs?'
  AND answer = 'Most of our mockups include responsive versions for mobile, tablet, and desktop. Check the individual mockup description for specific details.';

UPDATE faqs 
SET is_active = false
WHERE page_key = 'mockups' 
  AND question = 'Are the mockups royalty-free?'
  AND answer = 'Once purchased, you have full commercial rights to use the mockups in your projects without attribution or additional licensing fees.';

UPDATE faqs 
SET is_active = false
WHERE page_key = 'mockups' 
  AND question = 'Can you create custom mockups for my project?'
  AND answer = 'Absolutely! If you don''t find what you''re looking for in our library, we offer custom mockup design services. Contact us to discuss your requirements.';

UPDATE faqs 
SET is_active = false
WHERE page_key = 'mockups' 
  AND question = 'What''s included with a mockup purchase?'
  AND answer = 'Each mockup includes the complete design file, all assets (icons, images, fonts), and a documentation file with instructions for customization.';

UPDATE faqs 
SET is_active = false
WHERE page_key = 'mockups' 
  AND question = 'Do you offer mockup bundles or subscriptions?'
  AND answer = 'Yes! We have bundle packages and subscription plans that give you access to our entire mockup library at a discounted rate. Check our pricing page for details.';

UPDATE faqs 
SET is_active = false
WHERE page_key = 'mockups' 
  AND question = 'Can I get a refund if I''m not satisfied?'
  AND answer = 'We offer a 30-day money-back guarantee. If you''re not satisfied with your purchase, contact us within 30 days for a full refund.';

-- Insert new FAQs matching the real business (ready-made website customization service)
-- Questions where real answers are needed are marked with neutral "contact us" responses

INSERT INTO faqs (page_key, question_en, question_ar, answer_en, answer_ar, display_order, is_active)
VALUES
  (
    'mockups',
    'What is a ready-made website design?',
    'ما هو التصميم الجاهز للموقع؟',
    'A ready-made website design is a pre-built template that we customize to match your brand, content, and business needs. You get a professional website faster than starting from scratch.',
    'التصميم الجاهز للموقع هو قالب مُصمم مسبقاً نقوم بتخصيصه ليتناسب مع علامتك التجارية ومحتواك واحتياجات عملك. تحصل على موقع احترافي أسرع من البداية من الصفر.',
    1,
    true
  ),
  (
    'mockups',
    'Can I customize it to my brand and content?',
    'هل يمكنني تخصيصه لعلامتي التجارية ومحتواي؟',
    'Yes! We customize everything - colors, fonts, images, text, and layout - to match your brand identity and showcase your specific content.',
    'نعم! نقوم بتخصيص كل شيء - الألوان، الخطوط، الصور، النصوص، والتخطيط - ليتناسب مع هوية علامتك التجارية ويعرض محتواك الخاص.',
    2,
    true
  ),
  (
    'mockups',
    'Can I change pages or add features?',
    'هل يمكنني تغيير الصفحات أو إضافة مزايا؟',
    'Absolutely. We can add, remove, or modify pages and features based on your requirements. The design is flexible to fit your needs.',
    'بالتأكيد. يمكننا إضافة أو إزالة أو تعديل الصفحات والمزايا بناءً على متطلباتك. التصميم مرن ليناسب احتياجاتك.',
    3,
    true
  ),
  (
    'mockups',
    'Do you also build and launch the website?',
    'هل تقومون أيضاً ببناء وإطلاق الموقع؟',
    'Yes, we handle the complete process: customization, development, and launch. You get a fully working website ready for your visitors.',
    'نعم، نتولى العملية الكاملة: التخصيص، التطوير، والإطلاق. تحصل على موقع يعمل بالكامل جاهز لزوارك.',
    4,
    true
  ),
  (
    'mockups',
    'Can it be bilingual (Arabic and English) with dark mode?',
    'هل يمكن أن يكون ثنائي اللغة (عربي وإنجليزي) مع الوضع الداكن؟',
    'Yes, we support bilingual websites with RTL (right-to-left) for Arabic and LTR (left-to-right) for English, as well as light and dark themes.',
    'نعم، ندعم المواقع ثنائية اللغة مع RTL (من اليمين لليسار) للعربية و LTR (من اليسار لليمين) للإنجليزية، بالإضافة إلى المظاهر الفاتحة والداكنة.',
    5,
    true
  ),
  (
    'mockups',
    'How do I request a design?',
    'كيف أطلب تصميم؟',
    'Browse our designs, then contact us via the form, WhatsApp, or email. Tell us which design you like and we''ll discuss your customization needs.',
    'تصفح تصاميمنا، ثم تواصل معنا عبر النموذج أو واتساب أو البريد الإلكتروني. أخبرنا بالتصميم الذي يعجبك وسنناقش احتياجات التخصيص الخاصة بك.',
    6,
    true
  ),
  (
    'mockups',
    'What do you need from me to start?',
    'ما الذي تحتاجونه مني للبدء؟',
    'We need your brand details (logo, colors, fonts), content (text, images), and any specific requirements. We''ll guide you through the process step by step.',
    'نحتاج تفاصيل علامتك التجارية (الشعار، الألوان، الخطوط)، المحتوى (النصوص، الصور)، وأي متطلبات محددة. سنرشدك خلال العملية خطوة بخطوة.',
    7,
    true
  ),
  (
    'mockups',
    'How much does it cost and how long does it take?',
    'كم التكلفة وكم يستغرق من الوقت؟',
    'Pricing and timeline depend on the complexity and customization level. Contact us with your chosen design for a detailed quote and schedule.',
    'التسعير والجدول الزمني يعتمدان على التعقيد ومستوى التخصيص. تواصل معنا مع التصميم الذي اخترته للحصول على عرض أسعار وجدول تفصيلي.',
    8,
    true
  );

-- Add comment for documentation
COMMENT ON COLUMN faqs.question_ar IS 'Arabic translation of the FAQ question';
COMMENT ON COLUMN faqs.answer_ar IS 'Arabic translation of the FAQ answer';
