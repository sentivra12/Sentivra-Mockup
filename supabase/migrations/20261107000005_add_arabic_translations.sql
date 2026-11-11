-- =============================================
-- Migration: Add Arabic translations for services
-- Created: 2026-11-07
-- Purpose: Fill all empty Arabic columns with Modern Standard Arabic
-- Idempotent: Only fills NULL columns, never overwrites existing content
-- =============================================

-- Update services with Arabic translations
-- Only updates where Arabic columns are NULL

UPDATE services
SET 
  title_ar = CASE slug
    WHEN 'web-application-development' THEN 'تطوير تطبيقات الويب'
    WHEN 'mobile-application-development' THEN 'تطوير تطبيقات الموبايل'
    WHEN 'erp-system-development' THEN 'تطوير أنظمة تخطيط موارد المؤسسات'
    WHEN 'crm-system-development' THEN 'تطوير أنظمة إدارة علاقات العملاء'
    WHEN 'data-analysis-and-business-intelligence' THEN 'تحليل البيانات وذكاء الأعمال'
    WHEN 'ai-and-chatbot-solutions' THEN 'حلول الذكاء الاصطناعي وروبوتات الدردشة'
    ELSE title_ar
  END,
  short_description_ar = CASE slug
    WHEN 'web-application-development' THEN 'تطبيقات ويب مخصصة مصممة خصيصاً لاحتياجات عملك ومتطلبات مجال صناعتك.'
    WHEN 'mobile-application-development' THEN 'تطبيقات iOS وAndroid بأداء استثنائي وتجربة مستخدم متميزة.'
    WHEN 'erp-system-development' THEN 'حلول ERP متكاملة لتبسيط عمليات عملك التشغيلية.'
    WHEN 'crm-system-development' THEN 'أنظمة CRM ذكية لإدارة علاقات العملاء وتعزيز المبيعات.'
    WHEN 'data-analysis-and-business-intelligence' THEN 'حوّل بياناتك الخام إلى رؤى قابلة للتنفيذ واتخذ قرارات مبنية على البيانات.'
    WHEN 'ai-and-chatbot-solutions' THEN 'أتمتة ذكية وذكاء اصطناعي تحادثي متاح على مدار الساعة لتعزيز التفاعل مع العملاء.'
    ELSE short_description_ar
  END,
  long_description_ar = CASE slug
    WHEN 'web-application-development' THEN 'نبني تطبيقات ويب قوية وقابلة للتوسع وآمنة مصممة خصيصاً لاحتياجات عملك. يستخدم فريقنا أحدث أطر العمل مثل React وVue.js، لضمان أن يكون تطبيقك سريعاً ومتجاوباً ومستعداً للمستقبل. من منصات المؤسسات الكبرى إلى تطبيقات الصفحة الواحدة الديناميكية، نقدم التميز.'
    WHEN 'mobile-application-development' THEN 'اجذب جمهورك أينما كانوا مع خدمات تطوير تطبيقات الموبايل لدينا. نبتكر تطبيقات بديهية وعالية الأداء لكل من iOS وAndroid، باستخدام التقنيات الأصلية مثل Swift وKotlin، أو أطر العمل متعددة المنصات مثل React Native لتحقيق وصول أوسع ودورات تطوير أسرع.'
    WHEN 'erp-system-development' THEN 'بسّط جميع عمليات عملك التشغيلية مع أنظمة ERP المخصصة لدينا. نصمم وننفذ حلول تخطيط موارد المؤسسات التي توحد المالية والموارد البشرية والمخزون وسلسلة التوريد وأكثر في منصة واحدة قوية. احصل على رؤية كاملة والسيطرة على عمليات عملك.'
    WHEN 'crm-system-development' THEN 'غيّر الطريقة التي تدير بها علاقات العملاء مع حلول CRM المصممة خصيصاً لك. نطور أنظمة تركز بيانات العملاء، وتؤتمت سير عمل المبيعات، وتوفر رؤى قابلة للتنفيذ لمساعدة فريقك على إتمام المزيد من الصفقات وتقديم خدمة عملاء استثنائية.'
    WHEN 'data-analysis-and-business-intelligence' THEN 'اكتشف القيمة المخفية في بياناتك. يساعدك خبراء علوم البيانات لدينا على جمع ومعالجة وتحليل البيانات للكشف عن الاتجاهات والتنبؤ بالنتائج واتخاذ قرارات عمل مستنيرة. من لوحات المعلومات المخصصة إلى النمذجة التنبؤية، نحول البيانات إلى أثمن أصولك.'
    WHEN 'ai-and-chatbot-solutions' THEN 'استفد من قوة الذكاء الاصطناعي لأتمتة العمليات وتعزيز تفاعلات المستخدمين. نطور نماذج ذكاء اصطناعي مخصصة وروبوتات دردشة ذكية توفر دعماً للعملاء على مدار الساعة طوال أيام الأسبوع، وتولد عملاء محتملين، وتقدم تجارب مستخدم مخصصة، مما يدفع الكفاءة والرضا.'
    ELSE long_description_ar
  END,
  updated_at = NOW()
WHERE slug IN (
  'web-application-development',
  'mobile-application-development', 
  'erp-system-development',
  'crm-system-development',
  'data-analysis-and-business-intelligence',
  'ai-and-chatbot-solutions'
)
AND (
  title_ar IS NULL OR
  short_description_ar IS NULL OR
  long_description_ar IS NULL
);

-- Log completion
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM services
  WHERE title_ar IS NOT NULL 
    AND short_description_ar IS NOT NULL 
    AND long_description_ar IS NOT NULL
    AND is_active = TRUE;
  
  RAISE NOTICE 'Arabic translations added. % services now have complete Arabic content', updated_count;
END $$;

COMMENT ON COLUMN services.title_ar IS 'Modern Standard Arabic title - auto-filled 2026-11-07';
COMMENT ON COLUMN services.short_description_ar IS 'Modern Standard Arabic short description - auto-filled 2026-11-07';
COMMENT ON COLUMN services.long_description_ar IS 'Modern Standard Arabic long description - auto-filled 2026-11-07';
