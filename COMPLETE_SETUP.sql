-- =============================================
-- Sentivra CMS - Complete Setup SQL
-- =============================================
-- Run this ONE file in Supabase SQL Editor
-- It will create everything you need!
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PART 1: Create All Tables
-- =============================================

-- 1. Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT NOT NULL DEFAULT 'Sentivra',
  logo_url TEXT,
  tagline TEXT,
  primary_email TEXT DEFAULT 'sentivra.tech@gmail.com',
  primary_phone TEXT,
  whatsapp_number TEXT DEFAULT '201558952126',
  address TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  github_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID
);

-- 2. Hero Section
CREATE TABLE IF NOT EXISTS hero (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  headline TEXT NOT NULL DEFAULT 'From ideas to real digital products',
  subheadline TEXT DEFAULT 'We transform your vision into powerful digital solutions.',
  cta_primary_text TEXT DEFAULT 'Start Your Project',
  cta_primary_link TEXT DEFAULT '/#contact',
  cta_secondary_text TEXT DEFAULT 'Learn More',
  cta_secondary_link TEXT DEFAULT '/#about',
  video_url TEXT,
  video_webm_url TEXT,
  video_poster_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trust Badges
CREATE TABLE IF NOT EXISTS trust_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  icon TEXT,
  image_url TEXT,
  category TEXT NOT NULL,
  features JSONB,
  benefits JSONB,
  pricing_info TEXT,
  delivery_time TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  client_name TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  thumbnail_url TEXT,
  gallery_urls TEXT[],
  technologies JSONB,
  project_url TEXT,
  github_url TEXT,
  completion_date DATE,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Mockups
CREATE TABLE IF NOT EXISTS mockups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  preview_url TEXT,
  tags JSONB,
  is_premium BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Client Logos
CREATE TABLE IF NOT EXISTS client_logos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_role TEXT,
  client_company TEXT,
  testimonial_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  client_photo_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Process Steps
CREATE TABLE IF NOT EXISTS process_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_number INTEGER NOT NULL,
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Why Choose Us
CREATE TABLE IF NOT EXISTS why_choose_us (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Countries
CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country_code TEXT,
  flag_emoji TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Timeline Milestones
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

-- 14. Values
CREATE TABLE IF NOT EXISTS values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Stats
CREATE TABLE IF NOT EXISTS stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  value INTEGER NOT NULL,
  suffix TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Messages (Contact Form)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  country TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  source TEXT DEFAULT 'contact_form',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. User Roles
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 18. SEO Settings
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key TEXT UNIQUE NOT NULL,
  meta_title TEXT NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT[],
  og_image_url TEXT,
  canonical_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Media Library
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  bucket_name TEXT,
  alt_text TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Blog Posts (Future)
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  category TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PART 2: Enable Row Level Security (RLS)
-- =============================================

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PART 3: Create RLS Policies
-- =============================================

-- Public read access to active content
CREATE POLICY "Public can view active content" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active projects" ON projects FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active mockups" ON mockups FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active testimonials" ON testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active faqs" ON faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public can view hero" ON hero FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view trust badges" ON trust_badges FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view process steps" ON process_steps FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view why choose us" ON why_choose_us FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view client logos" ON client_logos FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view countries" ON countries FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view timeline" ON timeline_milestones FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view values" ON values FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view stats" ON stats FOR SELECT USING (is_active = true);

-- Public can submit messages
CREATE POLICY "Anyone can create messages" ON messages FOR INSERT WITH CHECK (true);

-- Admin full access
CREATE POLICY "Admin full access to services" ON services FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin full access to projects" ON projects FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin full access to mockups" ON mockups FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin full access to messages" ON messages FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can view user roles" ON user_roles FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- =============================================
-- PART 4: Insert Sample Data
-- =============================================

-- Insert Hero Section
INSERT INTO hero (headline, subheadline) VALUES 
('From ideas to real digital products', 'We transform your vision into powerful digital solutions.')
ON CONFLICT DO NOTHING;

-- Insert Trust Badges
INSERT INTO trust_badges (icon, title, description, display_order) VALUES
('Clock', '24/7 Support', 'Always here when you need us', 1),
('Shield', 'Secure & Reliable', 'Your data is safe with us', 2),
('Award', 'Quality Guaranteed', 'Excellence in every project', 3)
ON CONFLICT DO NOTHING;

-- Insert Services
INSERT INTO services (slug, title, short_description, icon, category, features, display_order, is_active) VALUES
('web-development', 'Web Development', 'Custom websites and web applications', 'Code', 'Web & Mobile', '["Responsive Design", "SEO Optimized", "Fast Performance"]'::jsonb, 1, true),
('mobile-apps', 'Mobile Applications', 'iOS and Android mobile apps', 'Smartphone', 'Web & Mobile', '["Native Performance", "Cross-platform", "Push Notifications"]'::jsonb, 2, true),
('erp-systems', 'ERP Systems', 'Enterprise resource planning solutions', 'Database', 'Business Systems', '["Inventory Management", "Financial Tracking", "Reporting"]'::jsonb, 3, true),
('crm-solutions', 'CRM Solutions', 'Customer relationship management', 'Users', 'Business Systems', '["Lead Management", "Sales Pipeline", "Analytics"]'::jsonb, 4, true),
('ai-chatbots', 'AI & Chatbots', 'Intelligent chatbot solutions', 'Bot', 'AI & Data', '["Natural Language", "24/7 Availability", "Integration"]'::jsonb, 5, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert Process Steps
INSERT INTO process_steps (step_number, icon, title, description, display_order) VALUES
(1, 'Search', 'Understand', 'We dive deep into your business needs and goals', 1),
(2, 'PenTool', 'Design & Develop', 'Creating solutions with modern technology', 2),
(3, 'Rocket', 'Launch & Support', 'Smooth deployment with ongoing support', 3)
ON CONFLICT DO NOTHING;

-- Insert Why Choose Us
INSERT INTO why_choose_us (icon, title, description, display_order) VALUES
('Zap', 'Fast Delivery', 'Quick turnaround without compromising quality', 1),
('Award', 'Quality First', 'Excellence in every project we deliver', 2),
('Headphones', '24/7 Support', 'Always available to help you succeed', 3),
('Users', 'Expert Team', 'Skilled professionals dedicated to your success', 4)
ON CONFLICT DO NOTHING;

-- Insert Countries
INSERT INTO countries (name, country_code, flag_emoji, display_order) VALUES
('Egypt', 'EG', '🇪🇬', 1),
('United Arab Emirates', 'AE', '🇦🇪', 2),
('Saudi Arabia', 'SA', '🇸🇦', 3)
ON CONFLICT DO NOTHING;

-- Insert Values
INSERT INTO values (icon, title, description, display_order) VALUES
('Target', 'Innovation', 'Pushing boundaries with creative solutions', 1),
('Users', 'Collaboration', 'Working together to achieve great results', 2),
('Award', 'Excellence', 'Commitment to the highest standards', 3),
('Heart', 'Integrity', 'Honest and transparent in everything we do', 4)
ON CONFLICT DO NOTHING;

-- Insert Stats
INSERT INTO stats (label, value, suffix, display_order) VALUES
('Projects Delivered', 50, '+', 1),
('Happy Clients', 30, '+', 2),
('Years Experience', 5, '+', 3),
('Client Satisfaction', 98, '%', 4)
ON CONFLICT DO NOTHING;

-- Insert Sample FAQs
INSERT INTO faqs (page_key, question, answer, display_order) VALUES
('services', 'How long does a project take?', 'Project timelines vary based on complexity. A simple website may take 4-6 weeks, while complex systems can take 3-6 months.', 1),
('services', 'Do you provide support after launch?', 'Yes! We offer comprehensive maintenance and support packages to ensure your solution continues to perform optimally.', 2),
('contact', 'How quickly will you respond?', 'We typically respond to all inquiries within 24 hours during business days.', 1)
ON CONFLICT DO NOTHING;

-- Insert Timeline
INSERT INTO timeline_milestones (year, title, description, display_order) VALUES
(2019, 'Company Founded', 'Started with a vision to transform digital experiences', 1),
(2021, 'Team Expansion', 'Grew to a team of 10+ talented professionals', 2),
(2023, 'Regional Growth', 'Expanded services to UAE and Saudi Arabia', 3)
ON CONFLICT DO NOTHING;

-- =============================================
-- PART 5: Create Admin User
-- =============================================

-- This will be done separately after you create the user in Supabase Auth
-- Then run this to give admin permissions:

-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'admin'
-- FROM auth.users
-- WHERE email = 'sentivra.tech@gmail.com';

-- =============================================
-- SETUP COMPLETE!
-- =============================================
-- Next steps:
-- 1. Create user in Supabase Auth with email: sentivra.tech@gmail.com
-- 2. Run the INSERT command above to make them admin
-- 3. Restart your dev server: npm run dev
-- 4. Login at: http://localhost:5174/admin
-- =============================================
