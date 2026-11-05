-- =============================================
-- Add dashboard fields to messages table
-- This migration is IDEMPOTENT and safe for production
-- =============================================

-- Add optional fields for advanced message handling
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS service_interest TEXT,
ADD COLUMN IF NOT EXISTS mockup_id UUID REFERENCES mockups(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Add index on mockup_id for faster dashboard queries
CREATE INDEX IF NOT EXISTS idx_messages_mockup_id ON messages(mockup_id);

-- Add optional fields to countries (already exist in production, but safe to re-run)
ALTER TABLE countries
ADD COLUMN IF NOT EXISTS country_code TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add optional project reference to testimonials (for linking testimonials to specific projects)
ALTER TABLE testimonials
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_testimonials_project_id ON testimonials(project_id);

-- Add optional author_id to blog_posts (for future user-based authorship)
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);

-- No data migration needed - all new columns are nullable
