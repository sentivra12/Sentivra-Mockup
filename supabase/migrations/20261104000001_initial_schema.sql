-- =============================================
-- Sentivra CMS - Initial Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. SITE SETTINGS
-- =============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT NOT NULL DEFAULT 'Sentivra',
  logo_url TEXT,
  tagline TEXT,
  primary_email TEXT,
  primary_phone TEXT,
  whatsapp_number TEXT,
  address TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  github_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- =============================================
-- 2. SEO SETTINGS (per page)
-- =============================================
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key TEXT UNIQUE NOT NULL, -- 'home', 'services', 'about', etc.
  meta_title TEXT NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT[],
  og_image_url TEXT,
  canonical_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. HERO SECTION
-- =============================================
CREATE TABLE IF NOT EXISTS hero (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  headline TEXT NOT NULL,
  subheadline TEXT,
  cta_primary_text TEXT,
  cta_primary_link TEXT,
  cta_secondary_text TEXT,
  cta_secondary_link TEXT,
  video_url TEXT, -- MP4 from storage
  video_webm_url TEXT, -- WebM from storage
  video_poster_url TEXT, -- Poster image from storage
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. TRUST BADGES
-- =============================================
CREATE TABLE IF NOT EXISTS trust_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon TEXT NOT NULL, -- Lucide icon name
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. SERVICES
-- =============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  icon TEXT, -- Lucide icon name
  image_url TEXT,
  category TEXT NOT NULL, -- 'Web & Mobile', 'Business Systems', 'AI & Data'
  features JSONB, -- Array of feature strings
  benefits JSONB, -- Array of benefit strings
  pricing_info TEXT,
  delivery_time TEXT, -- e.g., "2-4 weeks"
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);

-- =============================================
-- 6. PROJECTS
-- =============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  client_name TEXT,
  category TEXT NOT NULL, -- 'Web Apps', 'Mobile', 'ERP', 'CRM', 'AI & Chatbots', 'Other'
  image_url TEXT,
  thumbnail_url TEXT,
  gallery_urls TEXT[], -- Array of image URLs
  technologies JSONB, -- Array of tech used
  project_url TEXT,
  github_url TEXT,
  completion_date DATE,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- =============================================
-- 7. MOCKUPS
-- =============================================
CREATE TABLE IF NOT EXISTS mockups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'E-commerce', 'Landing Pages', 'Dashboards', etc.
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  download_url TEXT, -- For downloadable mockup files
  tags TEXT[],
  is_premium BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2) DEFAULT 0.00,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mockups_category ON mockups(category);

-- =============================================
-- 8. CLIENT LOGOS
-- =============================================
CREATE TABLE IF NOT EXISTS client_logos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. TESTIMONIALS
-- =============================================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_role TEXT,
  client_company TEXT,
  client_photo_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  testimonial_text TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 10. FAQs
-- =============================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key TEXT NOT NULL, -- 'contact', 'mockups', 'services', 'general'
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_page_key ON faqs(page_key);

-- =============================================
-- 11. PROCESS STEPS
-- =============================================
CREATE TABLE IF NOT EXISTS process_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Lucide icon name
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 12. WHY CHOOSE US
-- =============================================
CREATE TABLE IF NOT EXISTS why_choose_us (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon TEXT NOT NULL, -- Lucide icon name
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 13. COUNTRIES (About page)
-- =============================================
CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country_code TEXT,
  flag_emoji TEXT,
  description TEXT,
  client_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 14. TIMELINE MILESTONES
-- =============================================
CREATE TABLE IF NOT EXISTS timeline_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 15. VALUES (About page)
-- =============================================
CREATE TABLE IF NOT EXISTS values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon TEXT NOT NULL, -- Lucide icon name
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 16. STATS (About page)
-- =============================================
CREATE TABLE IF NOT EXISTS stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  value INTEGER NOT NULL,
  suffix TEXT, -- '+', '%', 'K', 'M'
  icon TEXT, -- Lucide icon name
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 17. BLOG POSTS
-- =============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL, -- HTML or Markdown
  featured_image_url TEXT,
  author_name TEXT,
  category TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
  published_date DATE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_date ON blog_posts(published_date);

-- =============================================
-- 18. MESSAGES (Contact form + Mockup requests)
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  country TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- 'new', 'read', 'replied', 'archived'
  source TEXT DEFAULT 'contact_form', -- 'contact_form', 'mockup_request', 'quote_request'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_source ON messages(source);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- =============================================
-- 19. MEDIA LIBRARY
-- =============================================
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_url TEXT NOT NULL, -- Public URL
  file_type TEXT NOT NULL, -- 'image', 'video', 'document'
  mime_type TEXT,
  file_size INTEGER, -- In bytes
  alt_text TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_file_type ON media(file_type);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE mockups ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE why_choose_us ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE values ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Public READ access for active/published content
DROP POLICY IF EXISTS "Public can view active content" ON site_settings;
CREATE POLICY "Public can view active content" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view SEO" ON seo_settings;
CREATE POLICY "Public can view SEO" ON seo_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view active hero" ON hero;
CREATE POLICY "Public can view active hero" ON hero FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active trust badges" ON trust_badges;
CREATE POLICY "Public can view active trust badges" ON trust_badges FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active services" ON services;
CREATE POLICY "Public can view active services" ON services FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active projects" ON projects;
CREATE POLICY "Public can view active projects" ON projects FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active mockups" ON mockups;
CREATE POLICY "Public can view active mockups" ON mockups FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active client logos" ON client_logos;
CREATE POLICY "Public can view active client logos" ON client_logos FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active testimonials" ON testimonials;
CREATE POLICY "Public can view active testimonials" ON testimonials FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active FAQs" ON faqs;
CREATE POLICY "Public can view active FAQs" ON faqs FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active process steps" ON process_steps;
CREATE POLICY "Public can view active process steps" ON process_steps FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active why choose us" ON why_choose_us;
CREATE POLICY "Public can view active why choose us" ON why_choose_us FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active countries" ON countries;
CREATE POLICY "Public can view active countries" ON countries FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active timeline" ON timeline_milestones;
CREATE POLICY "Public can view active timeline" ON timeline_milestones FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active values" ON values;
CREATE POLICY "Public can view active values" ON values FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active stats" ON stats;
CREATE POLICY "Public can view active stats" ON stats FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view published blog posts" ON blog_posts;
CREATE POLICY "Public can view published blog posts" ON blog_posts FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Public can view media" ON media;
CREATE POLICY "Public can view media" ON media FOR SELECT USING (true);

-- Public can INSERT messages (contact form)
DROP POLICY IF EXISTS "Public can create messages" ON messages;
CREATE POLICY "Public can create messages" ON messages FOR INSERT WITH CHECK (true);

-- Admin FULL access (authenticated users)
DROP POLICY IF EXISTS "Authenticated users have full access to site_settings" ON site_settings;
CREATE POLICY "Authenticated users have full access to site_settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to seo_settings" ON seo_settings;
CREATE POLICY "Authenticated users have full access to seo_settings" ON seo_settings FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to hero" ON hero;
CREATE POLICY "Authenticated users have full access to hero" ON hero FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to trust_badges" ON trust_badges;
CREATE POLICY "Authenticated users have full access to trust_badges" ON trust_badges FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to services" ON services;
CREATE POLICY "Authenticated users have full access to services" ON services FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to projects" ON projects;
CREATE POLICY "Authenticated users have full access to projects" ON projects FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to mockups" ON mockups;
CREATE POLICY "Authenticated users have full access to mockups" ON mockups FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to client_logos" ON client_logos;
CREATE POLICY "Authenticated users have full access to client_logos" ON client_logos FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to testimonials" ON testimonials;
CREATE POLICY "Authenticated users have full access to testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to faqs" ON faqs;
CREATE POLICY "Authenticated users have full access to faqs" ON faqs FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to process_steps" ON process_steps;
CREATE POLICY "Authenticated users have full access to process_steps" ON process_steps FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to why_choose_us" ON why_choose_us;
CREATE POLICY "Authenticated users have full access to why_choose_us" ON why_choose_us FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to countries" ON countries;
CREATE POLICY "Authenticated users have full access to countries" ON countries FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to timeline_milestones" ON timeline_milestones;
CREATE POLICY "Authenticated users have full access to timeline_milestones" ON timeline_milestones FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to values" ON values;
CREATE POLICY "Authenticated users have full access to values" ON values FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to stats" ON stats;
CREATE POLICY "Authenticated users have full access to stats" ON stats FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to blog_posts" ON blog_posts;
CREATE POLICY "Authenticated users have full access to blog_posts" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to messages" ON messages;
CREATE POLICY "Authenticated users have full access to messages" ON messages FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users have full access to media" ON media;
CREATE POLICY "Authenticated users have full access to media" ON media FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seo_settings_updated_at ON seo_settings;
CREATE TRIGGER update_seo_settings_updated_at BEFORE UPDATE ON seo_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hero_updated_at ON hero;
CREATE TRIGGER update_hero_updated_at BEFORE UPDATE ON hero FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trust_badges_updated_at ON trust_badges;
CREATE TRIGGER update_trust_badges_updated_at BEFORE UPDATE ON trust_badges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mockups_updated_at ON mockups;
CREATE TRIGGER update_mockups_updated_at BEFORE UPDATE ON mockups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_logos_updated_at ON client_logos;
CREATE TRIGGER update_client_logos_updated_at BEFORE UPDATE ON client_logos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_process_steps_updated_at ON process_steps;
CREATE TRIGGER update_process_steps_updated_at BEFORE UPDATE ON process_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_why_choose_us_updated_at ON why_choose_us;
CREATE TRIGGER update_why_choose_us_updated_at BEFORE UPDATE ON why_choose_us FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_countries_updated_at ON countries;
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_timeline_milestones_updated_at ON timeline_milestones;
CREATE TRIGGER update_timeline_milestones_updated_at BEFORE UPDATE ON timeline_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_values_updated_at ON values;
CREATE TRIGGER update_values_updated_at BEFORE UPDATE ON values FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stats_updated_at ON stats;
CREATE TRIGGER update_stats_updated_at BEFORE UPDATE ON stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
