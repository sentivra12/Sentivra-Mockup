-- Migration: Add tracking pixel/analytics IDs to site_settings
-- Description: Stores optional tracking IDs for Meta Pixel, GA4, Google Ads, TikTok Pixel

DO $$ 
BEGIN
  -- Meta Pixel ID
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'meta_pixel_id') THEN
    ALTER TABLE site_settings ADD COLUMN meta_pixel_id TEXT;
  END IF;
  
  -- Google Analytics 4 Measurement ID
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'ga4_measurement_id') THEN
    ALTER TABLE site_settings ADD COLUMN ga4_measurement_id TEXT;
  END IF;
  
  -- Google Ads Conversion ID
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'google_ads_id') THEN
    ALTER TABLE site_settings ADD COLUMN google_ads_id TEXT;
  END IF;
  
  -- Google Ads Conversion Label
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'google_ads_conversion_label') THEN
    ALTER TABLE site_settings ADD COLUMN google_ads_conversion_label TEXT;
  END IF;
  
  -- TikTok Pixel ID
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'tiktok_pixel_id') THEN
    ALTER TABLE site_settings ADD COLUMN tiktok_pixel_id TEXT;
  END IF;
  
  -- Cookie consent banner toggle
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'enable_cookie_banner') THEN
    ALTER TABLE site_settings ADD COLUMN enable_cookie_banner BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN site_settings.meta_pixel_id IS 'Meta (Facebook) Pixel ID - leave empty to disable';
COMMENT ON COLUMN site_settings.ga4_measurement_id IS 'Google Analytics 4 Measurement ID (G-XXXXXXXXXX)';
COMMENT ON COLUMN site_settings.google_ads_id IS 'Google Ads Conversion ID (AW-XXXXXXXXXX)';
COMMENT ON COLUMN site_settings.google_ads_conversion_label IS 'Google Ads Conversion Label';
COMMENT ON COLUMN site_settings.tiktok_pixel_id IS 'TikTok Pixel ID - leave empty to disable';
COMMENT ON COLUMN site_settings.enable_cookie_banner IS 'Show cookie consent banner (not implemented yet)';
