-- Migration: Restore neutral FAQ answers for #7 and #8
-- Date: 2026-11-02
-- Purpose: Replace placeholder pricing/tech stack claims with neutral, professional answers
-- Issue: QUICK_SETUP.sql overwrites the better neutral answers from 20261102000001

-- FAQ #7: Restore neutral pricing/timeline answer (no fake numbers)
UPDATE faqs SET
  answer = 'Pricing and timeline vary based on project scope, complexity, and features. Contact us with your requirements for a detailed quote and realistic timeline tailored to your project.',
  answer_ar = 'التسعير والجدول الزمني يختلفان بناءً على نطاق المشروع وتعقيده والميزات. تواصل معنا مع متطلباتك للحصول على عرض أسعار تفصيلي وجدول زمني واقعي مخصص لمشروعك.',
  updated_at = NOW()
WHERE page_key = 'services' 
  AND display_order = 7
  AND is_active = true;

-- FAQ #8: Restore neutral tech stack/hosting answer (no fake pricing)
UPDATE faqs SET
  answer = 'We use modern, proven technologies based on your project needs. For specific tech stacks, hosting options, and ongoing maintenance packages, please contact us to discuss your requirements.',
  answer_ar = 'نستخدم تقنيات حديثة ومثبتة بناءً على احتياجات مشروعك. للحصول على تفاصيل حول التقنيات المحددة وخيارات الاستضافة وحزم الصيانة المستمرة، يرجى التواصل معنا لمناقشة متطلباتك.',
  updated_at = NOW()
WHERE page_key = 'services' 
  AND display_order = 8
  AND is_active = true;

-- Verify the updates
DO $$
DECLARE
  faq7_answer TEXT;
  faq8_answer TEXT;
BEGIN
  -- Check FAQ #7
  SELECT answer INTO faq7_answer
  FROM faqs
  WHERE page_key = 'services' AND display_order = 7;
  
  IF faq7_answer LIKE '%$%' OR faq7_answer LIKE '%5,000%' THEN
    RAISE WARNING 'FAQ #7 still contains specific pricing claims';
  ELSE
    RAISE NOTICE 'FAQ #7: Neutral answer confirmed ✓';
  END IF;
  
  -- Check FAQ #8
  SELECT answer INTO faq8_answer
  FROM faqs
  WHERE page_key = 'services' AND display_order = 8;
  
  IF faq8_answer LIKE '%$500%' OR faq8_answer LIKE '%React/Next.js%' THEN
    RAISE WARNING 'FAQ #8 still contains specific tech/pricing claims';
  ELSE
    RAISE NOTICE 'FAQ #8: Neutral answer confirmed ✓';
  END IF;
END $$;

-- Show the updated FAQs
SELECT 
  display_order,
  LEFT(question, 50) as question_preview,
  LEFT(answer, 80) as answer_preview,
  CASE 
    WHEN answer LIKE '%$%' THEN '⚠️ Contains pricing'
    WHEN answer LIKE '%React%' OR answer LIKE '%Node.js%' THEN '⚠️ Contains tech stack'
    ELSE '✅ Neutral'
  END as status
FROM faqs
WHERE page_key = 'services' AND display_order IN (7, 8)
ORDER BY display_order;
