-- Migration: Add mockups hero editable content fields
-- Description: Adds hero-specific texts to page_content for mockups page

-- Add hero fields to page_content table
DO $$ 
BEGIN
  -- Hero eyebrow text
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_content' AND column_name = 'hero_eyebrow') THEN
    ALTER TABLE page_content ADD COLUMN hero_eyebrow TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_content' AND column_name = 'hero_eyebrow_ar') THEN
    ALTER TABLE page_content ADD COLUMN hero_eyebrow_ar TEXT;
  END IF;
  
  -- Handwritten note text
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_content' AND column_name = 'hero_handwritten_note') THEN
    ALTER TABLE page_content ADD COLUMN hero_handwritten_note TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_content' AND column_name = 'hero_handwritten_note_ar') THEN
    ALTER TABLE page_content ADD COLUMN hero_handwritten_note_ar TEXT;
  END IF;
  
  -- Industry line lead-in text
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_content' AND column_name = 'hero_industry_lead') THEN
    ALTER TABLE page_content ADD COLUMN hero_industry_lead TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_content' AND column_name = 'hero_industry_lead_ar') THEN
    ALTER TABLE page_content ADD COLUMN hero_industry_lead_ar TEXT;
  END IF;
  
  -- Primary CTA
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_content' AND column_name = 'hero_primary_cta') THEN
    ALTER TABLE page_content ADD COLUMN hero_primary_cta TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_content' AND column_name = 'hero_primary_cta_ar') THEN
    ALTER TABLE page_content ADD COLUMN hero_primary_cta_ar TEXT;
  END IF;
  
  -- Secondary CTA
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_content' AND column_name = 'hero_secondary_cta') THEN
    ALTER TABLE page_content ADD COLUMN hero_secondary_cta TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_content' AND column_name = 'hero_secondary_cta_ar') THEN
    ALTER TABLE page_content ADD COLUMN hero_secondary_cta_ar TEXT;
  END IF;
  
  -- Sticky mobile bar texts
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_content' AND column_name = 'sticky_bar_text') THEN
    ALTER TABLE page_content ADD COLUMN sticky_bar_text TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_content' AND column_name = 'sticky_bar_text_ar') THEN
    ALTER TABLE page_content ADD COLUMN sticky_bar_text_ar TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_content' AND column_name = 'sticky_bar_cta') THEN
    ALTER TABLE page_content ADD COLUMN sticky_bar_cta TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_content' AND column_name = 'sticky_bar_cta_ar') THEN
    ALTER TABLE page_content ADD COLUMN sticky_bar_cta_ar TEXT;
  END IF;
  
  -- Toggles
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_content' AND column_name = 'show_hero_stats') THEN
    ALTER TABLE page_content ADD COLUMN show_hero_stats BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_content' AND column_name = 'show_industry_line') THEN
    ALTER TABLE page_content ADD COLUMN show_industry_line BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Insert default mockups hero content if not exists
INSERT INTO page_content (
  page_key,
  hero_eyebrow, hero_eyebrow_ar,
  hero_handwritten_note, hero_handwritten_note_ar,
  hero_industry_lead, hero_industry_lead_ar,
  hero_primary_cta, hero_primary_cta_ar,
  hero_secondary_cta, hero_secondary_cta_ar,
  sticky_bar_text, sticky_bar_text_ar,
  sticky_bar_cta, sticky_bar_cta_ar,
  show_hero_stats, show_industry_line
)
VALUES (
  'mockups',
  'WEBSITE MOCKUPS', 'نماذج المواقع',
  'Modern Designs For Your Business', 'تصاميم عصرية لعملك',
  'Perfect for', 'مثالي لـ',
  'Find Your Mockup', 'اختر تصميمك',
  'Contact Us', 'تواصل معنا',
  'Request a custom design', 'اطلب تصميم مخصص',
  'Get Started', 'ابدأ الآن',
  true, true
)
ON CONFLICT (page_key) 
DO UPDATE SET
  hero_eyebrow = COALESCE(page_content.hero_eyebrow, EXCLUDED.hero_eyebrow),
  hero_eyebrow_ar = COALESCE(page_content.hero_eyebrow_ar, EXCLUDED.hero_eyebrow_ar),
  hero_handwritten_note = COALESCE(page_content.hero_handwritten_note, EXCLUDED.hero_handwritten_note),
  hero_handwritten_note_ar = COALESCE(page_content.hero_handwritten_note_ar, EXCLUDED.hero_handwritten_note_ar),
  hero_industry_lead = COALESCE(page_content.hero_industry_lead, EXCLUDED.hero_industry_lead),
  hero_industry_lead_ar = COALESCE(page_content.hero_industry_lead_ar, EXCLUDED.hero_industry_lead_ar),
  hero_primary_cta = COALESCE(page_content.hero_primary_cta, EXCLUDED.hero_primary_cta),
  hero_primary_cta_ar = COALESCE(page_content.hero_primary_cta_ar, EXCLUDED.hero_primary_cta_ar),
  hero_secondary_cta = COALESCE(page_content.hero_secondary_cta, EXCLUDED.hero_secondary_cta),
  hero_secondary_cta_ar = COALESCE(page_content.hero_secondary_cta_ar, EXCLUDED.hero_secondary_cta_ar),
  sticky_bar_text = COALESCE(page_content.sticky_bar_text, EXCLUDED.sticky_bar_text),
  sticky_bar_text_ar = COALESCE(page_content.sticky_bar_text_ar, EXCLUDED.sticky_bar_text_ar),
  sticky_bar_cta = COALESCE(page_content.sticky_bar_cta, EXCLUDED.sticky_bar_cta),
  sticky_bar_cta_ar = COALESCE(page_content.sticky_bar_cta_ar, EXCLUDED.sticky_bar_cta_ar);
