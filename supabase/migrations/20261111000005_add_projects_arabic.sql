-- =============================================
-- Migration: Add Arabic translations for seed projects
-- Created: 2026-11-11
-- Purpose: Fill Arabic columns for existing projects (only where empty)
-- =============================================

-- =============================================
-- IMPORTANT: Only fills empty Arabic columns
-- Never overwrites existing Arabic content
-- =============================================

-- Update projects with Arabic translations where Arabic columns are NULL
UPDATE projects
SET 
  title_ar = CASE slug
    WHEN 'real-estate-platform' THEN 'منصة العقارات'
    WHEN 'inventory-management-system' THEN 'نظام إدارة المخزون'
    WHEN 'healthcare-mobile-app' THEN 'تطبيق الرعاية الصحية'
    WHEN 'manufacturing-erp' THEN 'نظام ERP للتصنيع'
    WHEN 'ecommerce-platform' THEN 'منصة التجارة الإلكترونية'
    WHEN 'sales-crm-dashboard' THEN 'لوحة CRM للمبيعات'
    ELSE title_ar
  END,
  short_description_ar = CASE slug
    WHEN 'real-estate-platform' THEN 'منصة شاملة لعرض وإدارة العقارات مع ميزات بحث متقدمة وإدارة العقارات.'
    WHEN 'inventory-management-system' THEN 'حل متقدم لتتبع المخزون وإدارة المستودعات مع تحليلات وتقارير فورية.'
    WHEN 'healthcare-mobile-app' THEN 'تطبيق موبايل لرعاية المرضى مع جدولة المواعيد والاستشارات الطبية عن بُعد وإدارة السجلات الصحية.'
    WHEN 'manufacturing-erp' THEN 'نظام تخطيط موارد تصنيع متكامل مع تتبع الإنتاج ومراقبة الجودة وإدارة سلسلة التوريد.'
    WHEN 'ecommerce-platform' THEN 'سوق إلكتروني متعدد البائعين مع تكامل الدفع وتتبع الطلبات ولوحة تحكم البائع.'
    WHEN 'sales-crm-dashboard' THEN 'لوحة تحكم CRM متقدمة مع تتبع العملاء المحتملين وإدارة خط الأنابيب والتحليلات الشاملة.'
    ELSE short_description_ar
  END,
  long_description_ar = CASE slug
    WHEN 'real-estate-platform' THEN 'منصة عقارية متكاملة تربط بين المشترين والبائعين والوكلاء. تشمل الميزات: بحث متقدم بالموقع والسعر، جولات افتراضية، حاسبة الرهن العقاري، نظام إدارة العقارات للوكلاء، ومراسلة مباشرة بين الأطراف المهتمة. مبنية بأحدث التقنيات لضمان الأداء والأمان.'
    WHEN 'inventory-management-system' THEN 'حل شامل لإدارة المخزون والمستودعات يساعد الشركات على تتبع المنتجات والمخزون في الوقت الفعلي. يشمل النظام: إدارة متعددة المستودعات، تتبع الدُفعات وتواريخ الانتهاء، تنبيهات إعادة الطلب التلقائية، تقارير تحليلية مفصلة، وتكامل مع أنظمة نقاط البيع والمحاسبة.'
    WHEN 'healthcare-mobile-app' THEN 'تطبيق موبايل متطور للرعاية الصحية يسهل على المرضى جدولة المواعيد والحصول على استشارات طبية عن بُعد. الميزات تشمل: ملف طبي إلكتروني شامل، تذكيرات بالأدوية، تكامل مع الأجهزة القابلة للارتداء، مكالمات فيديو للاستشارات، وصفات طبية إلكترونية، ودفع آمن.'
    WHEN 'manufacturing-erp' THEN 'نظام ERP متكامل مصمم خصيصاً لشركات التصنيع. يغطي كامل دورة الإنتاج من التخطيط إلى التسليم. يشمل: تخطيط احتياجات المواد (MRP)، جدولة الإنتاج، مراقبة الجودة، تتبع التكاليف، إدارة سلسلة التوريد، والتقارير التحليلية في الوقت الفعلي لاتخاذ قرارات أفضل.'
    WHEN 'ecommerce-platform' THEN 'منصة تجارة إلكترونية متعددة البائعين توفر تجربة تسوق سلسة للعملاء ولوحة تحكم شاملة للبائعين. تشمل: إدارة المنتجات، سلة تسوق متقدمة، تكامل بوابات الدفع المتعددة، نظام تتبع الشحنات، تقييمات ومراجعات المنتجات، برامج ولاء العملاء، وتقارير مبيعات تفصيلية.'
    WHEN 'sales-crm-dashboard' THEN 'لوحة تحكم CRM احترافية تساعد فرق المبيعات على إدارة العملاء المحتملين وتتبع الفرص وزيادة المبيعات. الميزات تشمل: إدارة جهات الاتصال، تتبع خط أنابيب المبيعات، أتمتة سير العمل، تقارير وتحليلات متقدمة، تكامل البريد الإلكتروني، مهام وتذكيرات، ولوحات معلومات قابلة للتخصيص.'
    ELSE long_description_ar
  END,
  updated_at = NOW()
WHERE slug IN (
  'real-estate-platform',
  'inventory-management-system',
  'healthcare-mobile-app',
  'manufacturing-erp',
  'ecommerce-platform',
  'sales-crm-dashboard'
)
AND (title_ar IS NULL OR short_description_ar IS NULL OR long_description_ar IS NULL);

-- =============================================
-- Verify translation update
-- =============================================

DO $$
DECLARE
  translated_count INTEGER;
  missing_arabic INTEGER;
BEGIN
  -- Count projects with complete Arabic translations
  SELECT COUNT(*) INTO translated_count
  FROM projects
  WHERE title_ar IS NOT NULL 
    AND short_description_ar IS NOT NULL;
  
  -- Count projects still missing Arabic
  SELECT COUNT(*) INTO missing_arabic
  FROM projects
  WHERE is_active = TRUE 
    AND (title_ar IS NULL OR short_description_ar IS NULL);
  
  RAISE NOTICE '================================================';
  RAISE NOTICE 'ARABIC TRANSLATIONS: ADDED';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Projects with Arabic translations: %', translated_count;
  RAISE NOTICE 'Active projects missing Arabic: %', missing_arabic;
  RAISE NOTICE '';
  IF missing_arabic > 0 THEN
    RAISE NOTICE 'ACTION REQUIRED: % active project(s) need Arabic translation', missing_arabic;
    RAISE NOTICE 'Please add Arabic content via dashboard or update this migration.';
  ELSE
    RAISE NOTICE 'All active projects have Arabic translations!';
  END IF;
  RAISE NOTICE '================================================';
END $$;

-- =============================================
-- NOTES FOR USER:
-- =============================================
-- These are DRAFT Arabic translations for the 6 seed projects.
-- They have been written in natural Modern Standard Arabic.
--
-- Please review ARABIC_TRANSLATIONS_PROJECTS.md for:
-- - Full translation text for verification
-- - Industry-specific terminology review
-- - Tone and style appropriateness
--
-- To modify these translations:
-- 1. Edit via dashboard (recommended)
-- 2. OR update this migration and re-run (before applying to production)
--
-- For new projects you create via dashboard:
-- - Fill both English and Arabic fields directly
-- - This migration only fills empty columns for seed data
-- =============================================
