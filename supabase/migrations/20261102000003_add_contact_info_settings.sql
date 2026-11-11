-- Migration: Add contact information to site_settings
-- Date: 2026-11-02
-- Purpose: Populate contact details for PremiumFinalCTA and other components

-- Insert or update WhatsApp number
INSERT INTO site_settings (key, value, created_at, updated_at)
VALUES (
  'whatsapp_number',
  '+966500000000', -- PLACEHOLDER: Replace with real Saudi number
  NOW(),
  NOW()
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Insert or update primary email
INSERT INTO site_settings (key, value, created_at, updated_at)
VALUES (
  'primary_email',
  'info@sentivra.com', -- PLACEHOLDER: Replace with real email
  NOW(),
  NOW()
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Insert or update primary phone
INSERT INTO site_settings (key, value, created_at, updated_at)
VALUES (
  'primary_phone',
  '+966 50 000 0000', -- PLACEHOLDER: Replace with real formatted phone
  NOW(),
  NOW()
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Insert or update business hours (useful for contact page)
INSERT INTO site_settings (key, value, created_at, updated_at)
VALUES (
  'business_hours',
  'Sun-Thu: 9AM-6PM', -- PLACEHOLDER: Adjust for actual hours
  NOW(),
  NOW()
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Insert or update physical address (if applicable)
INSERT INTO site_settings (key, value, created_at, updated_at)
VALUES (
  'physical_address',
  'Riyadh, Saudi Arabia', -- PLACEHOLDER: Replace with real address
  NOW(),
  NOW()
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Verify the insertions
DO $$
DECLARE
  contact_settings_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO contact_settings_count
  FROM site_settings
  WHERE key IN ('whatsapp_number', 'primary_email', 'primary_phone', 'business_hours', 'physical_address');
  
  RAISE NOTICE 'Contact settings configured: %', contact_settings_count;
  
  IF contact_settings_count < 5 THEN
    RAISE WARNING 'Expected 5 contact settings, found %', contact_settings_count;
  END IF;
END $$;

-- Show current contact settings
SELECT key, value, updated_at
FROM site_settings
WHERE key IN ('whatsapp_number', 'primary_email', 'primary_phone', 'business_hours', 'physical_address')
ORDER BY key;
