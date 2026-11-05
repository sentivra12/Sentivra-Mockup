-- =============================================
-- Add optional fields to messages table for future features
-- This migration is IDEMPOTENT and safe to run on existing databases
-- =============================================

-- Add optional fields that the new schema expects (for mockup requests, quote forms, etc.)
-- These are nullable so existing records remain valid

ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS service_interest TEXT,
ADD COLUMN IF NOT EXISTS mockup_id UUID REFERENCES mockups(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Add optional country_code to countries table
ALTER TABLE countries
ADD COLUMN IF NOT EXISTS country_code TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add index on mockup_id for faster lookups (if column was added)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'mockup_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_messages_mockup_id ON messages(mockup_id);
  END IF;
END $$;

-- No data migration needed - all new columns are nullable
-- Existing data remains unchanged
