-- =============================================
-- QUICK SETUP for Services Page Round 1
-- Copy and paste sections as needed
-- =============================================

-- =============================================
-- 1. ADD ARABIC TRANSLATIONS FOR 6 SERVICES
-- =============================================
-- TODO: Replace Arabic text with your actual translations

-- Service 1: Web Application Development
UPDATE services SET
  title_ar = 'تطوير تطبيقات الويب',
  short_description_ar = 'نبني تطبيقات ويب حديثة وسريعة وآمنة تناسب احتياجات عملك',
  long_description_ar = 'نطور تطبيقات ويب متطورة باستخدام أحدث التقنيات مثل React و Next.js و Node.js. تطبيقاتنا سريعة، آمنة، وقابلة للتوسع لتلبية احتياجات عملك المتنامية.'
WHERE slug = 'web-application-development';

-- Service 2: Mobile Application Development
UPDATE services SET
  title_ar = 'تطوير تطبيقات الموبايل',
  short_description_ar = 'تطبيقات iOS و Android احترافية تصل إلى ملايين المستخدمين',
  long_description_ar = 'نصمم ونطور تطبيقات موبايل native و cross-platform بأعلى معايير الجودة. تطبيقاتنا سريعة، سهلة الاستخدام، ومتوافقة مع جميع الأجهزة.'
WHERE slug = 'mobile-application-development';

-- Service 3: ERP System Development
UPDATE services SET
  title_ar = 'أنظمة تخطيط موارد المؤسسات',
  short_description_ar = 'حلول ERP مخصصة لإدارة جميع عمليات شركتك من مكان واحد',
  long_description_ar = 'نبني أنظمة ERP شاملة تدير المحاسبة، المخزون، الموارد البشرية، والمبيعات. حلولنا قابلة للتخصيص لتناسب طبيعة عملك الفريدة.'
WHERE slug = 'erp-system-development';

-- Service 4: CRM System Development
UPDATE services SET
  title_ar = 'أنظمة إدارة علاقات العملاء',
  short_description_ar = 'أنظمة CRM ذكية لتحسين علاقاتك مع عملائك وزيادة المبيعات',
  long_description_ar = 'نطور أنظمة CRM متقدمة تساعدك على إدارة عملائك، تتبع الفرص، وأتمتة عمليات المبيعات. زد إنتاجية فريقك ورضا عملائك.'
WHERE slug = 'crm-system-development';

-- Service 5: Data Analysis & Business Intelligence
UPDATE services SET
  title_ar = 'تحليل البيانات وذكاء الأعمال',
  short_description_ar = 'حول بياناتك إلى رؤى قابلة للتنفيذ مع لوحات تحكم تفاعلية',
  long_description_ar = 'نبني حلول BI متقدمة تحول بياناتك الخام إلى تقارير ولوحات تحكم بصرية تساعدك على اتخاذ قرارات ذكية مبنية على البيانات.'
WHERE slug = 'data-analysis-and-business-intelligence';

-- Service 6: AI & Chatbot Solutions
UPDATE services SET
  title_ar = 'حلول الذكاء الاصطناعي',
  short_description_ar = 'أتمتة ذكية وشات بوت يعمل بالذكاء الاصطناعي لخدمة عملائك 24/7',
  long_description_ar = 'نطور chatbots ذكية ومساعدين افتراضيين يعملون بالذكاء الاصطناعي لخدمة عملائك، الإجابة على استفساراتهم، ومساعدتهم 24/7 بدون توقف.'
WHERE slug = 'ai-and-chatbot-solutions';


-- =============================================
-- 2. ADD REAL CONTACT INFORMATION
-- =============================================
-- TODO: Replace with your actual contact details

UPDATE site_settings SET
  whatsapp_number = '+20 XXX XXX XXXX',        -- IMPORTANT: Include country code
  primary_email = 'contact@sentivra.com',      -- Your real email
  primary_phone = '+20 XXX XXX XXXX'           -- Your real phone
WHERE id = 1;


-- =============================================
-- 3. COMPLETE FAQ ANSWERS (Optional - Enhance)
-- =============================================
-- FAQ #7 and #8 have basic answers. Enhance them if needed:

-- FAQ #7: Pricing & Timeline (Example - customize to your needs)
UPDATE faqs SET
  answer = 'Project costs typically range from $5,000 to $50,000+ depending on complexity, features, integrations, and timeline. A simple web app takes 4-8 weeks, while enterprise systems may take 3-6 months. Contact us with your requirements for a detailed, customized quote and realistic timeline.',
  answer_ar = 'تتراوح تكلفة المشاريع عادة من 5,000$ إلى 50,000$+ حسب التعقيد والميزات والتكاملات والجدول الزمني. تطبيق ويب بسيط يستغرق 4-8 أسابيع، بينما أنظمة المؤسسات قد تستغرق 3-6 أشهر. تواصل معنا مع متطلباتك للحصول على عرض أسعار تفصيلي مخصص وجدول زمني واقعي.'
WHERE page_key = 'services' AND display_order = 7;

-- FAQ #8: Tech Stack & Hosting (Example - customize to your stack)
UPDATE faqs SET
  answer = 'We use modern, proven technologies tailored to your project: React/Next.js for front-end, Node.js/Python for back-end, PostgreSQL/MongoDB for databases. We offer flexible hosting on AWS, Azure, Google Cloud, or your preferred provider. Maintenance packages start at $500/month and include updates, monitoring, backups, and technical support.',
  answer_ar = 'نستخدم تقنيات حديثة ومثبتة مخصصة لمشروعك: React/Next.js للواجهة الأمامية، Node.js/Python للخلفية، PostgreSQL/MongoDB لقواعد البيانات. نوفر استضافة مرنة على AWS أو Azure أو Google Cloud أو مزود الخدمة المفضل لديك. تبدأ باقات الصيانة من 500$ شهرياً وتشمل التحديثات والمراقبة والنسخ الاحتياطي والدعم التقني.'
WHERE page_key = 'services' AND display_order = 8;


-- =============================================
-- 4. VERIFY SETUP (Run this to check)
-- =============================================

-- Check if Arabic fields were added to services
SELECT 
  slug,
  title_en,
  title_ar,
  CASE WHEN title_ar IS NULL THEN '❌ Missing' ELSE '✅ Set' END as arabic_status
FROM services
WHERE is_active = true
ORDER BY display_order;

-- Check contact info
SELECT 
  whatsapp_number,
  primary_email,
  primary_phone,
  CASE 
    WHEN whatsapp_number IS NULL OR whatsapp_number = '+20 123 456 7890' THEN '❌ Update needed'
    ELSE '✅ Set'
  END as contact_status
FROM site_settings
WHERE id = 1;

-- Check FAQs
SELECT 
  display_order,
  LEFT(question, 60) as question_preview,
  is_active,
  CASE WHEN answer_ar IS NULL THEN '❌ Missing Arabic' ELSE '✅ Has Arabic' END as arabic_status
FROM faqs
WHERE page_key = 'services'
ORDER BY display_order;


-- =============================================
-- 5. ACTIVATE ALL SERVICES (if needed)
-- =============================================

-- Make sure all 6 services are active
UPDATE services SET is_active = true 
WHERE slug IN (
  'web-application-development',
  'mobile-application-development',
  'erp-system-development',
  'crm-system-development',
  'data-analysis-and-business-intelligence',
  'ai-and-chatbot-solutions'
);


-- =============================================
-- DONE! 🎉
-- =============================================
-- After running these queries:
-- 1. Refresh your browser at http://localhost:5173/services
-- 2. Test in Arabic mode: http://localhost:5173/services?lang=ar
-- 3. Check WhatsApp button appears (if you set the number)
-- 4. Test all 4 modes (light/dark × EN/AR)
