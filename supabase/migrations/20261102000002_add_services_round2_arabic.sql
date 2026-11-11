-- Migration: Add Arabic translations for 6 core services used in ServicesPageRound2
-- Date: 2026-11-02
-- Purpose: Provide bilingual support for /services page redesign

-- Update web development service
UPDATE services
SET 
  title_ar = 'تطوير المواقع الإلكترونية',
  short_description_ar = 'مواقع ويب سريعة وآمنة ومتجاوبة مصممة خصيصاً لأهداف عملك'
WHERE slug = 'web' AND is_active = true;

-- Update mobile development service
UPDATE services
SET 
  title_ar = 'تطوير تطبيقات الجوال',
  short_description_ar = 'تطبيقات جوال أصلية وعبر المنصات توفر تجارب مستخدم استثنائية'
WHERE slug = 'mobile' AND is_active = true;

-- Update ERP service
UPDATE services
SET 
  title_ar = 'أنظمة تخطيط موارد المؤسسات',
  short_description_ar = 'حلول ERP مخصصة لتبسيط عمليات عملك وزيادة الكفاءة'
WHERE slug = 'erp' AND is_active = true;

-- Update CRM service
UPDATE services
SET 
  title_ar = 'أنظمة إدارة علاقات العملاء',
  short_description_ar = 'منصات CRM قوية لإدارة العملاء وتعزيز المبيعات وبناء العلاقات'
WHERE slug = 'crm' AND is_active = true;

-- Update data analytics service
UPDATE services
SET 
  title_ar = 'تحليل البيانات والذكاء التجاري',
  short_description_ar = 'حلول تحليلات متقدمة لتحويل بياناتك إلى رؤى قابلة للتنفيذ'
WHERE slug = 'data' OR slug = 'analytics' AND is_active = true;

-- Update AI/ML service
UPDATE services
SET 
  title_ar = 'الذكاء الاصطناعي والتعلم الآلي',
  short_description_ar = 'حلول ذكاء اصطناعي متطورة لأتمتة العمليات وتحسين اتخاذ القرارات'
WHERE slug = 'ai' OR slug = 'ml' OR slug = 'chat' AND is_active = true;

-- Verify the updates
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM services
  WHERE is_active = true 
    AND title_ar IS NOT NULL 
    AND title_ar != ''
    AND short_description_ar IS NOT NULL 
    AND short_description_ar != '';
  
  RAISE NOTICE 'Services with Arabic translations: %', updated_count;
  
  IF updated_count < 6 THEN
    RAISE WARNING 'Expected at least 6 services with Arabic translations, found %', updated_count;
  END IF;
END $$;
