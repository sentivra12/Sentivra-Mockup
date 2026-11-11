-- ============================================================================
-- Migration: Add Arabic translations for seed mockups
-- Description: Add Arabic titles and descriptions for the 12 seed mockups (for reference)
-- Author: Kiro AI
-- Date: 2026-11-12
-- ============================================================================

-- Update seed mockups with Arabic translations
-- Note: These mockups are unpublished. Translations provided for reference only.

UPDATE mockups SET
  title_ar = 'عقارات عصرية',
  short_description_ar = 'تصميم موقع عقاري أنيق واحترافي يعرض قوائم العقارات مع إمكانيات بحث وتصفية متقدمة.',
  long_description_ar = 'موقع ويب عقاري حديث بتصميم احترافي، يوفر تجربة سلسة للمستخدمين للبحث عن العقارات وتصفيتها حسب الموقع والسعر ونوع العقار. يتضمن معرض صور متقدم، خرائط تفاعلية، ونماذج استفسار سهلة الاستخدام.'
WHERE slug = 'modern-real-estate';

UPDATE mockups SET
  title_ar = 'مقهى دافئ',
  short_description_ar = 'موقع مقهى دافئ وجذاب يعرض القائمة ونظام الطلب عبر الإنترنت وحجز الطاولات.',
  long_description_ar = 'موقع مقهى بتصميم دافئ ومريح، يسهل على الزوار تصفح القائمة والتعرف على المشروبات والوجبات الخفيفة. يتضمن نظام طلب عبر الإنترنت وإمكانية حجز الطاولات مسبقًا، مع معرض صور للأجواء والمنتجات.'
WHERE slug = 'cozy-cafe';

UPDATE mockups SET
  title_ar = 'متجر أزياء',
  short_description_ar = 'منصة تجارة إلكترونية أنيقة لعلامات الأزياء مع معارض المنتجات وعربة التسوق وتجربة دفع سلسة.',
  long_description_ar = 'متجر إلكتروني عصري للأزياء بتصميم جذاب، يوفر تجربة تسوق ممتعة مع معارض منتجات عالية الجودة، عربة تسوق متقدمة، نظام دفع آمن وسهل، وصفحات منتجات تفصيلية مع خيارات الألوان والأحجام.'
WHERE slug = 'fashion-store';

UPDATE mockups SET
  title_ar = 'منصة تعليمية',
  short_description_ar = 'منصة تعلم شاملة عبر الإنترنت مع كتالوجات الدورات ودروس الفيديو ولوحة الطالب وتتبع التقدم.',
  long_description_ar = 'منصة تعليمية متكاملة توفر دورات تدريبية متنوعة مع دروس فيديو تفاعلية، اختبارات، متابعة التقدم الأكاديمي، ولوحة تحكم للطلاب والمدرسين. تدعم التعلم الذاتي والدورات الحية.'
WHERE slug = 'education-platform';

UPDATE mockups SET
  title_ar = 'مركز طبي',
  short_description_ar = 'موقع رعاية صحية احترافي مع ملفات الأطباء وحجز المواعيد وبوابة المرضى ونظرة عامة على الخدمات الطبية.',
  long_description_ar = 'موقع مركز طبي متطور يسهل على المرضى حجز المواعيد، الاطلاع على ملفات الأطباء والتخصصات، الوصول إلى بوابة المرضى، والتعرف على الخدمات الطبية المتاحة بشكل واضح ومنظم.'
WHERE slug = 'medical-center';

UPDATE mockups SET
  title_ar = 'شركة صناعية',
  short_description_ar = 'موقع شركات قوي للأعمال الصناعية يعرض المنتجات والقدرات والشهادات الصناعية.',
  long_description_ar = 'موقع شركة صناعية احترافي يبرز المنتجات والخدمات الصناعية، القدرات التصنيعية، الشهادات والاعتمادات، مع عرض المشاريع السابقة ومعلومات الاتصال للعملاء المحتملين.'
WHERE slug = 'industrial-company';

UPDATE mockups SET
  title_ar = 'أعمال شركات',
  short_description_ar = 'تصميم موقع شركات احترافي مع نظرة عامة على الشركة وملفات الفريق ودراسات الحالة وشهادات العملاء.',
  long_description_ar = 'موقع شركات متكامل بتصميم احترافي، يعرض نبذة عن الشركة، فريق العمل، الخدمات المقدمة، دراسات حالة للمشاريع الناجحة، وشهادات العملاء لبناء الثقة والمصداقية.'
WHERE slug = 'corporate-business';

UPDATE mockups SET
  title_ar = 'معرض أعمال إبداعي',
  short_description_ar = 'موقع معرض أعمال مذهل للمبدعين والوكالات يضم عرض المشاريع والرسوم المتحركة ونماذج الاتصال.',
  long_description_ar = 'معرض أعمال احترافي للمصممين والمطورين والوكالات الإبداعية، يعرض المشاريع بشكل بصري جذاب مع تأثيرات متحركة، معلومات تفصيلية لكل مشروع، ونماذج اتصال سهلة.'
WHERE slug = 'creative-portfolio';

UPDATE mockups SET
  title_ar = 'فندق فاخر',
  short_description_ar = 'موقع فندق أنيق مع معارض الغرف ونظام الحجز وعرض المرافق وجولات افتراضية.',
  long_description_ar = 'موقع فندق فاخر بتصميم راقي، يعرض الغرف والأجنحة بصور عالية الدقة، نظام حجز متكامل، معلومات عن المرافق والخدمات، وجولات افتراضية لمنح الزوار تجربة غامرة.'
WHERE slug = 'luxury-hotel';

UPDATE mockups SET
  title_ar = 'صالة رياضية',
  short_description_ar = 'موقع مركز لياقة ديناميكي يعرض جداول الحصص وملفات المدربين وخطط العضوية والتسجيل عبر الإنترنت.',
  long_description_ar = 'موقع صالة رياضية عصري يسهل على الأعضاء تصفح جداول الحصص، التعرف على المدربين، مقارنة خطط العضوية، والتسجيل عبر الإنترنت. يتضمن معرض صور للمرافق وقصص نجاح الأعضاء.'
WHERE slug = 'fitness-gym';

UPDATE mockups SET
  title_ar = 'مكتب محاماة',
  short_description_ar = 'موقع خدمات قانونية احترافي مع مجالات الممارسة وملفات المحامين ونتائج القضايا وحجز الاستشارات.',
  long_description_ar = 'موقع مكتب محاماة بتصميم احترافي يعرض مجالات الممارسة القانونية، ملفات المحامين وخبراتهم، نتائج القضايا السابقة، ونظام حجز استشارات قانونية سهل الاستخدام.'
WHERE slug = 'law-firm';

UPDATE mockups SET
  title_ar = 'صالون تجميل',
  short_description_ar = 'موقع صالون وسبا جميل مع قوائم الخدمات والأسعار ومعرض الموظفين وجدولة المواعيد عبر الإنترنت.',
  long_description_ar = 'موقع صالون تجميل أنيق يعرض الخدمات المتاحة مع الأسعار، معرض أعمال الموظفين، وإمكانية حجز المواعيد عبر الإنترنت. يتضمن صور للأعمال السابقة وعروض خاصة.'
WHERE slug = 'salon-spa';

-- Report translations added
DO $$
DECLARE
  translated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO translated_count
  FROM mockups
  WHERE slug IN (
    'modern-real-estate',
    'cozy-cafe',
    'fashion-store',
    'education-platform',
    'medical-center',
    'industrial-company',
    'corporate-business',
    'creative-portfolio',
    'luxury-hotel',
    'fitness-gym',
    'law-firm',
    'salon-spa'
  ) AND title_ar IS NOT NULL AND title_ar != '';

  RAISE NOTICE 'Successfully added Arabic translations for % seed mockups.', translated_count;
END $$;
