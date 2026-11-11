-- ============================================================================
-- Migration: Upgrade messages table for mockup design requests
-- Description: Add mockup_id and project_details columns for design request tracking
-- Author: Kiro AI
-- Date: 2026-11-12
-- ============================================================================

-- Add mockup reference column
ALTER TABLE messages ADD COLUMN IF NOT EXISTS mockup_id UUID;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS project_details TEXT;

-- Add foreign key constraint to mockups table
ALTER TABLE messages 
  ADD CONSTRAINT fk_messages_mockup 
  FOREIGN KEY (mockup_id) 
  REFERENCES mockups(id) 
  ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_messages_mockup_id ON messages(mockup_id);

-- Update existing source values if needed
UPDATE messages 
SET source = 'design_request' 
WHERE source = 'mockup_request';

-- Add helpful comments
COMMENT ON COLUMN messages.mockup_id IS 'References the mockup that was requested (NULL for general contact messages)';
COMMENT ON COLUMN messages.project_details IS 'Additional project details or customization requests from the user';
COMMENT ON COLUMN messages.source IS 'Message source: contact_form, design_request, quote_request, service_inquiry, project_inquiry';

-- Create a view for design requests with mockup details
CREATE OR REPLACE VIEW design_requests_with_mockup AS
SELECT 
  m.id,
  m.full_name,
  m.email,
  m.phone,
  m.whatsapp,
  m.country,
  m.message,
  m.project_details,
  m.status,
  m.created_at,
  m.updated_at,
  mo.id AS mockup_id,
  mo.slug AS mockup_slug,
  COALESCE(mo.title_en, mo.title) AS mockup_title,
  mo.category,
  mo.cover_image_url AS mockup_image
FROM messages m
LEFT JOIN mockups mo ON m.mockup_id = mo.id
WHERE m.source = 'design_request'
ORDER BY m.created_at DESC;

-- Grant permissions on the view
GRANT SELECT ON design_requests_with_mockup TO authenticated;

COMMENT ON VIEW design_requests_with_mockup IS 'View combining design request messages with their referenced mockup details for the admin dashboard';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Successfully upgraded messages table for mockup design requests.';
  RAISE NOTICE 'Added columns: mockup_id, project_details';
  RAISE NOTICE 'Created view: design_requests_with_mockup';
END $$;
