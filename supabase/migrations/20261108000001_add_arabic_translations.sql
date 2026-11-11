-- =============================================
-- Arabic Translations Migration
-- Migration: 20261108000001_add_arabic_translations.sql
-- Purpose: Populate empty _ar columns with professional Arabic translations
-- Idempotent: Safe to run multiple times (uses WHERE _ar IS NULL)
-- =============================================

-- =============================================
-- 1. SITE SETTINGS
-- =============================================
UPDATE site_settings
SET
  tagline_ar = 'من الأفكار إلى المنتجات الرقمية الحقيقية',
  address_ar = 'موقعك هنا'
WHERE tagline_ar IS NULL OR address_ar IS NULL;

-- =============================================
-- 2. SEO SETTINGS
-- =============================================
UPDATE seo_settings
SET
  meta_title_ar = CASE page_key
    WHEN 'home' THEN 'سنتيفرا - شركة تطوير البرمجيات'
    WHEN 'services' THEN 'خدماتنا - سنتيفرا'
    WHEN 'our-work' THEN 'أعمالنا - معرض سنتيفرا'
    WHEN 'mockups' THEN 'نماذج التصميم - سنتيفرا'
    WHEN 'about' THEN 'من نحن - سنتيفرا'
    WHEN 'contact' THEN 'اتصل بنا - سنتيفرا'
    ELSE meta_title
  END,
  meta_description_ar = CASE page_key
    WHEN 'home' THEN 'حوّل أفكارك إلى منتجات رقمية حقيقية مع خدمات تطوير البرمجيات الاحترافية'
    WHEN 'services' THEN 'استكشف مجموعتنا الشاملة من خدمات تطوير البرمجيات'
    WHEN 'our-work' THEN 'تصفح معرض مشاريعنا البرمجية الناجحة'
    WHEN 'mockups' THEN 'نماذج وقوالب تصميم احترافية لأعمالك'
    WHEN 'about' THEN 'تعرف على رسالتنا وقيمنا ورحلتنا'
    WHEN 'contact' THEN 'تواصل معنا لمشروعك القادم'
    ELSE meta_description
  END
WHERE meta_title_ar IS NULL OR meta_description_ar IS NULL;

-- =============================================
-- 3. HERO SECTION
-- =============================================
UPDATE hero
SET
  headline_ar = 'من الأفكار إلى المنتجات الرقمية الحقيقية',
  subheadline_ar = 'نحول أفكار أعمالك إلى حلول برمجية قوية',
  cta_primary_text_ar = 'ابدأ الآن',
  cta_secondary_text_ar = 'شاهد أعمالنا'
WHERE headline_ar IS NULL OR subheadline_ar IS NULL 
   OR cta_primary_text_ar IS NULL OR cta_secondary_text_ar IS NULL;

-- =============================================
-- 4. TRUST BADGES
-- =============================================
UPDATE trust_badges
SET
  title_ar = CASE title
    WHEN 'Professional Support' THEN 'دعم احترافي'
    WHEN 'High Performance' THEN 'أداء عالي'
    WHEN 'Modern Design' THEN 'تصميم عصري'
    ELSE title
  END,
  description_ar = CASE description
    WHEN '24/7 dedicated support team' THEN 'فريق دعم متخصص على مدار الساعة'
    WHEN 'Optimized for speed and efficiency' THEN 'محسّن للسرعة والكفاءة'
    WHEN 'Beautiful, intuitive user interfaces' THEN 'واجهات مستخدم جميلة وبديهية'
    ELSE description
  END
WHERE title_ar IS NULL OR description_ar IS NULL;

-- =============================================
-- 5. SERVICES
-- =============================================
UPDATE services
SET
  title_ar = CASE slug
    WHEN 'web-application-development' THEN 'تطوير تطبيقات الويب'
    WHEN 'mobile-application-development' THEN 'تطوير تطبيقات الجوال'
    WHEN 'erp-system-development' THEN 'تطوير أنظمة تخطيط موارد المؤسسات'
    WHEN 'crm-system-development' THEN 'تطوير أنظمة إدارة علاقات العملاء'
    WHEN 'e-commerce-development' THEN 'تطوير المتاجر الإلكترونية'
    WHEN 'custom-software-development' THEN 'تطوير البرمجيات المخصصة'
    WHEN 'ai-chatbot-development' THEN 'تطوير روبوتات الدردشة الذكية'
    WHEN 'data-analytics' THEN 'تحليلات البيانات'
    WHEN 'cloud-solutions' THEN 'حلول السحابة'
    WHEN 'ui-ux-design' THEN 'تصميم واجهة وتجربة المستخدم'
    ELSE title
  END,
  short_description_ar = CASE slug
    WHEN 'web-application-development' THEN 'تطبيقات ويب مخصصة مصممة خصيصًا لاحتياجات عملك ومتطلبات مجالك'
    WHEN 'mobile-application-development' THEN 'تطبيقات iOS و Android بأداء استثنائي وتجربة مستخدم رائعة'
    WHEN 'erp-system-development' THEN 'حلول ERP متكاملة لتبسيط عمليات عملك'
    WHEN 'crm-system-development' THEN 'نظام CRM ذكي لإدارة علاقات العملاء وتعزيز المبيعات'
    WHEN 'e-commerce-development' THEN 'متاجر إلكترونية كاملة المزايا لتنمية أعمالك'
    WHEN 'custom-software-development' THEN 'حلول برمجية مصممة خصيصًا لتلبية احتياجاتك الفريدة'
    WHEN 'ai-chatbot-development' THEN 'روبوتات دردشة مدعومة بالذكاء الاصطناعي للتفاعل مع العملاء'
    WHEN 'data-analytics' THEN 'حوّل البيانات إلى رؤى قابلة للتنفيذ'
    WHEN 'cloud-solutions' THEN 'حلول سحابية قابلة للتوسع وآمنة'
    WHEN 'ui-ux-design' THEN 'تصاميم جميلة وسهلة الاستخدام'
    ELSE short_description
  END,
  long_description_ar = CASE slug
    WHEN 'web-application-development' THEN 'نبني تطبيقات ويب قوية وقابلة للتوسع وآمنة مصممة خصيصًا لاحتياجات عملك. يستخدم فريقنا أحدث أطر العمل مثل React و Vue.js، مما يضمن أن تطبيقك سريع ومتجاوب ومستعد للمستقبل. من منصات المؤسسات إلى تطبيقات الصفحة الواحدة الديناميكية، نقدم التميز.'
    WHEN 'mobile-application-development' THEN 'اجذب جمهورك أثناء التنقل مع خدمات تطوير تطبيقات الجوال. نصمم تطبيقات بديهية وعالية الأداء لكل من iOS و Android، باستخدام تقنيات أصلية مثل Swift و Kotlin، أو أطر عمل متعددة المنصات مثل React Native لوصول أوسع ودورات تطوير أسرع.'
    WHEN 'erp-system-development' THEN 'قم بتبسيط جميع عمليات عملك باستخدام أنظمة ERP المخصصة. نصمم وننفذ حلول تخطيط موارد المؤسسات التي توحد المالية والموارد البشرية والمخزون وسلسلة التوريد والمزيد في منصة واحدة قوية. احصل على رؤية وتحكم كامل في عمليات عملك.'
    WHEN 'crm-system-development' THEN 'حوّل طريقة إدارة علاقات العملاء باستخدام حلول CRM المخصصة. نطور أنظمة تركز على بيانات العملاء، وتؤتمت سير عمل المبيعات، وتوفر رؤى قابلة للتنفيذ لمساعدة فريقك على إتمام المزيد من الصفقات وتقديم خدمة عملاء استثنائية.'
    WHEN 'e-commerce-development' THEN 'أطلق متجرك الإلكتروني مع منصتنا الشاملة. نبني حلول تجارة إلكترونية قابلة للتوسع مع بوابات دفع آمنة، وإدارة مخزون، ونظام إدارة محتوى سهل، وتكامل شحن سلس.'
    WHEN 'custom-software-development' THEN 'عندما لا تلبي الحلول الجاهزة احتياجاتك، نبني برمجيات مخصصة من الصفر. فريقنا يحلل تحدياتك الفريدة ويطور حلولاً مخصصة تتكامل تمامًا مع سير عملك وأنظمتك الحالية.'
    WHEN 'ai-chatbot-development' THEN 'عزز مشاركة العملاء مع روبوتات الدردشة الذكية المدعومة بالذكاء الاصطناعي. نصمم وننشر روبوتات محادثة يمكنها التعامل مع الأسئلة الشائعة، ومعالجة الطلبات، وتوفير دعم شخصي على مدار الساعة.'
    WHEN 'data-analytics' THEN 'اكتشف الرؤى المخفية في بياناتك مع حلول التحليلات المتقدمة. ننشئ لوحات معلومات وأدوات تقارير تحوّل البيانات الخام إلى معلومات ذكاء أعمال قابلة للتنفيذ لدعم اتخاذ القرارات المستنيرة.'
    WHEN 'cloud-solutions' THEN 'انتقل إلى السحابة بثقة. نساعدك في ترحيل البنية التحتية الخاصة بك إلى منصات سحابية مثل AWS و Azure و Google Cloud، مما يوفر قابلية توسع وأمان وكفاءة تكلفة محسّنة.'
    WHEN 'ui-ux-design' THEN 'أنشئ تجارب رقمية تسعد المستخدمين. فريق التصميم لدينا يركز على التفاعل البديهي، والعلامة التجارية الجميلة، والإمكانية الوصول لضمان أن منتجاتك الرقمية ليست فقط جميلة ولكن أيضًا سهلة الاستخدام للجميع.'
    ELSE long_description
  END,
  features_ar = CASE slug
    WHEN 'web-application-development' THEN '["تطوير API مخصص", "تطبيقات الويب التقدمية (PWA)", "نشر قائم على السحابة", "وظائف في الوقت الفعلي"]'::jsonb
    WHEN 'mobile-application-development' THEN '["تطوير iOS و Android", "خبرة React Native", "إشعارات الدفع", "إرسال لمتجر التطبيقات"]'::jsonb
    WHEN 'erp-system-development' THEN '["أتمتة العمليات", "تقارير فورية", "تكامل متعدد الوحدات", "هندسة قابلة للتوسع"]'::jsonb
    WHEN 'crm-system-development' THEN '["أتمتة المبيعات", "تتبع العملاء المحتملين", "تكامل البريد الإلكتروني", "تطبيق جوال"]'::jsonb
    WHEN 'e-commerce-development' THEN '["بوابات دفع آمنة", "إدارة المخزون", "نظام إدارة محتوى", "تكامل الشحن"]'::jsonb
    WHEN 'custom-software-development' THEN '["تحليل المتطلبات", "تصميم مخصص", "تطوير رشيق", "صيانة مستمرة"]'::jsonb
    WHEN 'ai-chatbot-development' THEN '["معالجة اللغة الطبيعية", "تكامل متعدد المنصات", "تعلم آلي", "دعم متعدد اللغات"]'::jsonb
    WHEN 'data-analytics' THEN '["لوحات معلومات مخصصة", "تحليلات تنبؤية", "تصور البيانات", "تكامل في الوقت الفعلي"]'::jsonb
    WHEN 'cloud-solutions' THEN '["استراتيجية السحابة", "الترحيل", "التحسين", "دعم على مدار الساعة"]'::jsonb
    WHEN 'ui-ux-design' THEN '["بحث المستخدم", "إطارات سلكية ونماذج أولية", "اختبار قابلية الاستخدام", "دليل العلامة التجارية"]'::jsonb
    ELSE features
  END,
  pricing_info_ar = CASE 
    WHEN pricing_info LIKE '%Starting%' THEN 'ابتداءً من ' || SUBSTRING(pricing_info FROM '\$[0-9,]+')
    ELSE pricing_info
  END,
  delivery_time_ar = CASE delivery_time
    WHEN '2-4 weeks' THEN 'أسبوعين إلى 4 أسابيع'
    WHEN '4-8 weeks' THEN '4 إلى 8 أسابيع'
    WHEN '8-12 weeks' THEN '8 إلى 12 أسبوع'
    WHEN '12+ weeks' THEN '12 أسبوع فما فوق'
    WHEN '1-2 weeks' THEN 'أسبوع إلى أسبوعين'
    ELSE delivery_time
  END
WHERE title_ar IS NULL OR short_description_ar IS NULL 
   OR long_description_ar IS NULL OR features_ar IS NULL;

-- =============================================
-- 6. PROJECTS
-- =============================================
-- Note: Projects require manual translation as they are client-specific
-- This updates only generic fallback text
UPDATE projects
SET
  title_ar = title, -- Keep English for now, update manually later
  short_description_ar = short_description,
  long_description_ar = long_description
WHERE title_ar IS NULL AND is_active = true;

-- =============================================
-- 7. MOCKUPS
-- =============================================
-- Note: Mockups require manual translation
UPDATE mockups
SET
  title_ar = title,
  description_ar = description
WHERE title_ar IS NULL AND is_active = true;

-- =============================================
-- 8. TESTIMONIALS
-- =============================================
-- Note: Testimonials require manual translation (client quotes)
UPDATE testimonials
SET
  testimonial_text_ar = testimonial_text,
  client_role_ar = client_role,
  client_company_ar = client_company
WHERE testimonial_text_ar IS NULL AND is_active = true;

-- =============================================
-- 9. FAQs
-- =============================================
-- General FAQs translations
UPDATE faqs
SET
  question_ar = CASE question
    WHEN 'What services do you offer?' THEN 'ما هي الخدمات التي تقدمونها؟'
    WHEN 'How long does a typical project take?' THEN 'كم من الوقت يستغرق المشروع النموذجي؟'
    WHEN 'Do you provide support after launch?' THEN 'هل تقدمون الدعم بعد الإطلاق؟'
    WHEN 'What technologies do you use?' THEN 'ما هي التقنيات التي تستخدمونها؟'
    WHEN 'How do I get started?' THEN 'كيف أبدأ؟'
    WHEN 'Can you work with my existing system?' THEN 'هل يمكنكم العمل مع نظامي الحالي؟'
    ELSE question
  END,
  answer_ar = CASE question
    WHEN 'What services do you offer?' THEN 'نقدم مجموعة شاملة من خدمات تطوير البرمجيات بما في ذلك تطوير تطبيقات الويب والجوال، وأنظمة ERP و CRM، والتجارة الإلكترونية، وروبوتات الدردشة الذكية، وتحليلات البيانات، والحلول السحابية، وتصميم UI/UX.'
    WHEN 'How long does a typical project take?' THEN 'تختلف المدة الزمنية حسب تعقيد المشروع. عادةً ما تستغرق المشاريع الصغيرة 2-4 أسابيع، بينما قد تستغرق المشاريع الكبيرة 3-6 أشهر. نقدم جدولاً زمنياً مفصلاً بعد فهم متطلباتك.'
    WHEN 'Do you provide support after launch?' THEN 'نعم! نقدم دعماً شاملاً بعد الإطلاق بما في ذلك إصلاح الأخطاء والصيانة والتحديثات. نقدم أيضاً خطط صيانة طويلة الأجل لضمان بقاء برنامجك محدثاً وآمناً.'
    WHEN 'What technologies do you use?' THEN 'نستخدم أحدث التقنيات بما في ذلك React و Vue.js و Node.js لتطوير الويب، وSwift و Kotlin و React Native لتطبيقات الجوال، وAWS و Azure و Google Cloud للحلول السحابية.'
    WHEN 'How do I get started?' THEN 'ابدأ بالاتصال بنا عبر نموذج الاتصال أو الواتساب. سنحدد موعداً لاستشارة مجانية لمناقشة مشروعك وتقديم اقتراح مفصل.'
    WHEN 'Can you work with my existing system?' THEN 'بالتأكيد! نحن متخصصون في دمج الحلول الجديدة مع الأنظمة الحالية. سنقوم بتحليل بنيتك التحتية الحالية وضمان التكامل السلس.'
    ELSE answer
  END
WHERE question_ar IS NULL OR answer_ar IS NULL;

-- =============================================
-- 10. PROCESS STEPS
-- =============================================
UPDATE process_steps
SET
  title_ar = CASE step_number
    WHEN 1 THEN 'الاكتشاف والتخطيط'
    WHEN 2 THEN 'التصميم والنموذج الأولي'
    WHEN 3 THEN 'التطوير والبناء'
    WHEN 4 THEN 'الاختبار وضمان الجودة'
    WHEN 5 THEN 'الإطلاق والنشر'
    WHEN 6 THEN 'الدعم والصيانة'
    ELSE title
  END,
  description_ar = CASE step_number
    WHEN 1 THEN 'نبدأ بفهم أهداف عملك ومتطلباتك وجمهورك المستهدف لإنشاء أساس متين لمشروعك.'
    WHEN 2 THEN 'يقوم فريق التصميم لدينا بإنشاء إطارات سلكية ونماذج أولية قابلة للنقر لتصور الحل النهائي قبل التطوير.'
    WHEN 3 THEN 'مطورونا يحولون التصاميم إلى رمز نظيف وقابل للصيانة باستخدام أفضل الممارسات ومنهجيات التطوير الرشيقة.'
    WHEN 4 THEN 'اختبار صارم عبر الأجهزة والمتصفحات لضمان أن برنامجك يعمل بشكل لا تشوبه شائبة ويلبي جميع متطلبات الجودة.'
    WHEN 5 THEN 'نتعامل مع نشر سلس إلى بيئة الإنتاج مع وقت توقف صفري وترحيل كامل للبيانات.'
    WHEN 6 THEN 'دعم مستمر وتحديثات منتظمة وصيانة استباقية للحفاظ على تشغيل برنامجك بسلاسة.'
    ELSE description
  END
WHERE title_ar IS NULL OR description_ar IS NULL;

-- =============================================
-- 11. WHY CHOOSE US
-- =============================================
UPDATE why_choose_us
SET
  title_ar = CASE title
    WHEN 'Expert Team' THEN 'فريق خبراء'
    WHEN 'Proven Track Record' THEN 'سجل حافل مثبت'
    WHEN 'Client-Focused Approach' THEN 'نهج يركز على العميل'
    WHEN 'Cutting-Edge Technology' THEN 'تكنولوجيا متطورة'
    WHEN 'Transparent Communication' THEN 'تواصل شفاف'
    WHEN 'Competitive Pricing' THEN 'أسعار تنافسية'
    WHEN 'Quality Assurance' THEN 'ضمان الجودة'
    WHEN 'On-Time Delivery' THEN 'تسليم في الوقت المحدد'
    ELSE title
  END,
  description_ar = CASE title
    WHEN 'Expert Team' THEN 'فريقنا من المطورين والمصممين ومديري المشاريع ذوي الخبرة يجلب سنوات من الخبرة الصناعية إلى كل مشروع.'
    WHEN 'Proven Track Record' THEN 'أكملنا بنجاح أكثر من 200 مشروع لعملاء في جميع أنحاء العالم، مع معدل رضا 98%.'
    WHEN 'Client-Focused Approach' THEN 'نجاحك هو نجاحنا. نأخذ الوقت الكافي لفهم عملك ونقدم حلولاً تحقق نتائج حقيقية.'
    WHEN 'Cutting-Edge Technology' THEN 'نبقى في طليعة التطورات التكنولوجية لضمان أن حلولك مبنية بأحدث وأفضل الأدوات.'
    WHEN 'Transparent Communication' THEN 'تحديثات منتظمة، وتتبع واضح للتقدم، واستجابة سريعة للأسئلة تبقيك على اطلاع طوال المشروع.'
    WHEN 'Competitive Pricing' THEN 'جودة من الدرجة الأولى بأسعار عادلة وشفافة. لا توجد تكاليف خفية، فقط قيمة واضحة.'
    WHEN 'Quality Assurance' THEN 'عملية اختبار صارمة وممارسات ضمان الجودة تضمن أن كل سطر من التعليمات البرمجية يلبي أعلى المعايير.'
    WHEN 'On-Time Delivery' THEN 'نحترم وقتك والمواعيد النهائية. فريقنا ملتزم بتسليم مشاريع عالية الجودة في الوقت المحدد، في كل مرة.'
    ELSE description
  END
WHERE title_ar IS NULL OR description_ar IS NULL;

-- =============================================
-- 12. COUNTRIES (About page)
-- =============================================
UPDATE countries
SET
  name_ar = CASE name
    WHEN 'Saudi Arabia' THEN 'المملكة العربية السعودية'
    WHEN 'United Arab Emirates' THEN 'الإمارات العربية المتحدة'
    WHEN 'Egypt' THEN 'مصر'
    WHEN 'Jordan' THEN 'الأردن'
    WHEN 'Kuwait' THEN 'الكويت'
    WHEN 'Qatar' THEN 'قطر'
    WHEN 'Bahrain' THEN 'البحرين'
    WHEN 'Oman' THEN 'عُمان'
    WHEN 'Lebanon' THEN 'لبنان'
    WHEN 'Morocco' THEN 'المغرب'
    WHEN 'Tunisia' THEN 'تونس'
    WHEN 'Algeria' THEN 'الجزائر'
    WHEN 'Iraq' THEN 'العراق'
    WHEN 'Palestine' THEN 'فلسطين'
    WHEN 'Syria' THEN 'سوريا'
    WHEN 'Yemen' THEN 'اليمن'
    WHEN 'Libya' THEN 'ليبيا'
    WHEN 'Sudan' THEN 'السودان'
    ELSE name
  END,
  description_ar = 'عملاء راضون في ' || 
    CASE name
      WHEN 'Saudi Arabia' THEN 'المملكة العربية السعودية'
      WHEN 'United Arab Emirates' THEN 'الإمارات'
      WHEN 'Egypt' THEN 'مصر'
      ELSE name
    END
WHERE name_ar IS NULL;

-- =============================================
-- 13. TIMELINE MILESTONES
-- =============================================
UPDATE timeline_milestones
SET
  title_ar = title, -- Keep as is, update manually
  description_ar = description
WHERE title_ar IS NULL AND is_active = true;

-- =============================================
-- 14. VALUES
-- =============================================
UPDATE values
SET
  title_ar = CASE title
    WHEN 'Innovation' THEN 'الابتكار'
    WHEN 'Excellence' THEN 'التميز'
    WHEN 'Integrity' THEN 'النزاهة'
    WHEN 'Collaboration' THEN 'التعاون'
    WHEN 'Customer Success' THEN 'نجاح العميل'
    WHEN 'Continuous Improvement' THEN 'التحسين المستمر'
    ELSE title
  END,
  description_ar = CASE title
    WHEN 'Innovation' THEN 'نحن نتبنى أحدث التقنيات ونفكر بشكل إبداعي لحل التحديات المعقدة.'
    WHEN 'Excellence' THEN 'نسعى للتميز في كل ما نقوم به، من التعليمات البرمجية التي نكتبها إلى الخدمة التي نقدمها.'
    WHEN 'Integrity' THEN 'نعمل بأمانة وشفافية، ونبني الثقة من خلال التواصل الصادق والسلوك الأخلاقي.'
    WHEN 'Collaboration' THEN 'ننجح معاً. نعمل بشكل وثيق مع عملائنا وفريقنا لتحقيق أهداف مشتركة.'
    WHEN 'Customer Success' THEN 'نجاح عملائنا هو أولويتنا القصوى. نذهب إلى أبعد الحدود لضمان رضاهم.'
    WHEN 'Continuous Improvement' THEN 'نتعلم باستمرار ونتطور ونحسن مهاراتنا وعملياتنا وحلولنا.'
    ELSE description
  END
WHERE title_ar IS NULL OR description_ar IS NULL;

-- =============================================
-- 15. STATS
-- =============================================
UPDATE stats
SET
  label_ar = CASE label
    WHEN 'Projects Completed' THEN 'مشروع منجز'
    WHEN 'Happy Clients' THEN 'عميل راضٍ'
    WHEN 'Years Experience' THEN 'سنة خبرة'
    WHEN 'Team Members' THEN 'عضو فريق'
    WHEN 'Countries Served' THEN 'دولة خدمناها'
    WHEN 'Code Commits' THEN 'التزام برمجي'
    WHEN 'Customer Satisfaction' THEN 'رضا العملاء'
    WHEN 'Support Response Time' THEN 'وقت الاستجابة'
    ELSE label
  END
WHERE label_ar IS NULL;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Count total rows updated
  SELECT 
    (SELECT COUNT(*) FROM site_settings WHERE tagline_ar IS NOT NULL) +
    (SELECT COUNT(*) FROM seo_settings WHERE meta_title_ar IS NOT NULL) +
    (SELECT COUNT(*) FROM hero WHERE headline_ar IS NOT NULL) +
    (SELECT COUNT(*) FROM trust_badges WHERE title_ar IS NOT NULL) +
    (SELECT COUNT(*) FROM services WHERE title_ar IS NOT NULL) +
    (SELECT COUNT(*) FROM faqs WHERE question_ar IS NOT NULL) +
    (SELECT COUNT(*) FROM process_steps WHERE title_ar IS NOT NULL) +
    (SELECT COUNT(*) FROM why_choose_us WHERE title_ar IS NOT NULL) +
    (SELECT COUNT(*) FROM values WHERE title_ar IS NOT NULL) +
    (SELECT COUNT(*) FROM stats WHERE label_ar IS NOT NULL)
  INTO updated_count;

  RAISE NOTICE '✅ Arabic translations added successfully!';
  RAISE NOTICE '📊 Total records updated: %', updated_count;
  RAISE NOTICE '🌍 Bilingual content is now live!';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Manual translation required for:';
  RAISE NOTICE '   - Projects (client-specific content)';
  RAISE NOTICE '   - Mockups (design titles)';
  RAISE NOTICE '   - Testimonials (client quotes)';
  RAISE NOTICE '   - Timeline milestones (company history)';
END $$;
