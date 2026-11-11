-- Migration: Add attribution tracking columns to messages table
-- Description: Captures first-touch attribution data from ad campaigns (UTM params, click IDs, referrer)
-- Safe to run multiple times (idempotent)

-- Add attribution columns to messages table
DO $$ 
BEGIN
  -- UTM parameters (Google Analytics standard)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'utm_source') THEN
    ALTER TABLE messages ADD COLUMN utm_source TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'utm_medium') THEN
    ALTER TABLE messages ADD COLUMN utm_medium TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'utm_campaign') THEN
    ALTER TABLE messages ADD COLUMN utm_campaign TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'utm_content') THEN
    ALTER TABLE messages ADD COLUMN utm_content TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'utm_term') THEN
    ALTER TABLE messages ADD COLUMN utm_term TEXT;
  END IF;
  
  -- Click IDs from ad platforms
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'gclid') THEN
    ALTER TABLE messages ADD COLUMN gclid TEXT; -- Google Ads Click ID
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'fbclid') THEN
    ALTER TABLE messages ADD COLUMN fbclid TEXT; -- Facebook Click ID
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'ttclid') THEN
    ALTER TABLE messages ADD COLUMN ttclid TEXT; -- TikTok Click ID
  END IF;
  
  -- Session tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'referrer') THEN
    ALTER TABLE messages ADD COLUMN referrer TEXT; -- HTTP Referer header
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'landing_page') THEN
    ALTER TABLE messages ADD COLUMN landing_page TEXT; -- First page visited
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'attribution_timestamp') THEN
    ALTER TABLE messages ADD COLUMN attribution_timestamp TIMESTAMPTZ; -- When attribution was captured
  END IF;
END $$;

-- Add index for filtering by source in dashboard
CREATE INDEX IF NOT EXISTS idx_messages_utm_source ON messages(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_utm_campaign ON messages(utm_campaign) WHERE utm_campaign IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN messages.utm_source IS 'Traffic source (e.g., google, facebook, newsletter)';
COMMENT ON COLUMN messages.utm_medium IS 'Marketing medium (e.g., cpc, email, social)';
COMMENT ON COLUMN messages.utm_campaign IS 'Campaign name (e.g., spring_sale_2024)';
COMMENT ON COLUMN messages.utm_content IS 'Ad content variant (e.g., headline_a, image_b)';
COMMENT ON COLUMN messages.utm_term IS 'Paid search keywords';
COMMENT ON COLUMN messages.gclid IS 'Google Ads click identifier';
COMMENT ON COLUMN messages.fbclid IS 'Facebook Ads click identifier';
COMMENT ON COLUMN messages.ttclid IS 'TikTok Ads click identifier';
COMMENT ON COLUMN messages.referrer IS 'HTTP referrer URL';
COMMENT ON COLUMN messages.landing_page IS 'First page URL visited in session';
COMMENT ON COLUMN messages.attribution_timestamp IS 'When attribution data was first captured';
