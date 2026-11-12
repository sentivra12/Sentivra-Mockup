-- =============================================
-- Migration: Add Arabic fields to services and ensure FAQs support services page
-- Date: 2026-11-02
-- Description: 
--   1. Add title_en, title_ar, short_description_en, short_description_ar, 
--      long_description_en, long_description_ar to services table
--   2. Migrate existing data to _en fields
--   3. Ensure FAQs table can handle services page (page_key support)
--   4. Add 8 new service-focused FAQs
-- =============================================

-- Add Arabic and English fields to services table
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS short_description_en TEXT,
ADD COLUMN IF NOT EXISTS short_description_ar TEXT,
ADD COLUMN IF NOT EXISTS long_description_en TEXT,
ADD COLUMN IF NOT EXISTS long_description_ar TEXT;

-- Migrate existing title -> title_en, description -> description_en
UPDATE services 
SET 
  title_en = title,
  short_description_en = short_description,
  long_description_en = long_description
WHERE title_en IS NULL;

-- Add comments
COMMENT ON COLUMN services.title_en IS 'English service title';
COMMENT ON COLUMN services.title_ar IS 'Arabic service title';
COMMENT ON COLUMN services.short_description_en IS 'English short description';
COMMENT ON COLUMN services.short_description_ar IS 'Arabic short description';
COMMENT ON COLUMN services.long_description_en IS 'English long description';
COMMENT ON COLUMN services.long_description_ar IS 'Arabic long description';

-- Insert service FAQs (only if they don't exist)
-- Check if services FAQs exist, if not, insert them
INSERT INTO faqs (page_key, question_en, question_ar, answer_en, answer_ar, display_order, is_active)
SELECT * FROM (VALUES
  (
    'services',
    'What software development services do you offer?',
    'ما هي خدمات تطوير البرمجيات التي تقدمونها؟',
    'We provide comprehensive software development services including web applications, mobile apps (iOS & Android), ERP systems, CRM solutions, AI & chatbot solutions, and data analysis & business intelligence. Each service is customized to meet your specific business needs.',
    'نقدم خدمات تطوير برمجيات شاملة تشمل تطبيقات الويب، تطبيقات الموبايل (iOS و Android)، أنظمة ERP، حلول CRM، حلول الذكاء الاصطناعي والشات بوت، وتحليل البيانات وذكاء الأعمال. كل خدمة مخصصة لتلبية احتياجات عملك الخاصة.',
    1,
    true
  ),
  (
    'services',
    'Can you build a custom solution specific to my business?',
    'هل يمكنكم بناء حل مخصص لعملي؟',
    'Absolutely. We specialize in building custom software solutions tailored to your unique business processes, industry requirements, and growth goals. We don''t believe in one-size-fits-all approaches.',
    'بالتأكيد. نحن متخصصون في بناء حلول برمجية مخصصة تناسب عمليات عملك الفريدة ومتطلبات صناعتك وأهداف نموك. لا نؤمن بالحلول الجاهزة التي تناسب الجميع.',
    2,
    true
  ),
  (
    'services',
    'Do you work with existing systems and integrate with them?',
    'هل تعملون مع الأنظمة الحالية وتتكاملون معها؟',
    'Yes, we have extensive experience integrating new solutions with existing systems, databases, and third-party services. We ensure seamless data flow and minimal disruption to your current operations.',
    'نعم، لدينا خبرة واسعة في دمج الحلول الجديدة مع الأنظمة الحالية وقواعد البيانات والخدمات الخارجية. نضمن تدفق البيانات بسلاسة وأقل تعطيل لعملياتك الحالية.',
    3,
    true
  ),
  (
    'services',
    'How do we start working together?',
    'كيف نبدأ العمل معاً؟',
    'Starting is simple: contact us via the form, email, or WhatsApp. We''ll schedule a free consultation to understand your needs, then provide a detailed proposal. Once approved, we kick off with discovery and design.',
    'البدء بسيط: تواصل معنا عبر النموذج أو البريد الإلكتروني أو واتساب. سنحدد موعداً لاستشارة مجانية لفهم احتياجاتك، ثم نقدم عرضاً تفصيلياً. بعد الموافقة، نبدأ بمرحلة الاكتشاف والتصميم.',
    4,
    true
  ),
  (
    'services',
    'What information do you need from me to start?',
    'ما المعلومات التي تحتاجونها مني للبدء؟',
    'We''ll need to understand your business goals, current challenges, target users, and any technical requirements. Don''t worry—we''ll guide you through our discovery process step by step.',
    'سنحتاج إلى فهم أهداف عملك، التحديات الحالية، المستخدمين المستهدفين، وأي متطلبات تقنية. لا تقلق—سنرشدك خلال عملية الاكتشاف خطوة بخطوة.',
    5,
    true
  ),
  (
    'services',
    'Can the solution be bilingual (Arabic and English) with light and dark themes?',
    'هل يمكن أن يكون الحل ثنائي اللغة (عربي وإنجليزي) مع الوضع الفاتح والداكن؟',
    'Yes, we build fully bilingual solutions with RTL (right-to-left) support for Arabic and LTR (left-to-right) for English, as well as light and dark theme options. This is standard in all our projects.',
    'نعم، نبني حلولاً ثنائية اللغة بالكامل مع دعم RTL (من اليمين لليسار) للعربية وLTR (من اليسار لليمين) للإنجليزية، بالإضافة إلى خيارات الوضع الفاتح والداكن. هذا معيار في جميع مشاريعنا.',
    6,
    true
  ),
  (
    'services',
    'How much does a custom software project cost and how long does it take?',
    'كم تكلفة مشروع برمجي مخصص وكم يستغرق من الوقت؟',
    'Pricing and timeline vary based on project scope, complexity, and features. Contact us with your requirements for a detailed quote and realistic timeline tailored to your project.',
    'التسعير والجدول الزمني يختلفان بناءً على نطاق المشروع وتعقيده والميزات. تواصل معنا مع متطلباتك للحصول على عرض أسعار تفصيلي وجدول زمني واقعي مخصص لمشروعك.',
    7,
    true
  ),
  (
    'services',
    'What technologies do you use and do you provide hosting and maintenance?',
    'ما التقنيات التي تستخدمونها وهل تقدمون الاستضافة والصيانة؟',
    'We use modern, proven technologies based on your project needs. For specific tech stacks, hosting options, and ongoing maintenance packages, please contact us to discuss your requirements.',
    'نستخدم تقنيات حديثة ومثبتة بناءً على احتياجات مشروعك. للحصول على تفاصيل حول التقنيات المحددة وخيارات الاستضافة وحزم الصيانة المستمرة، يرجى التواصل معنا لمناقشة متطلباتك.',
    8,
    true
  )
) AS new_faqs(page_key, question, question_ar, answer, answer_ar, display_order, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM faqs 
  WHERE page_key = 'services' 
  AND question = new_faqs.question
);

