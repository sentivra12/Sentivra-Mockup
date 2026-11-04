-- =============================================
-- Sentivra CMS - Seed Data (Existing Content)
-- =============================================

-- =============================================
-- 1. SITE SETTINGS
-- =============================================
INSERT INTO site_settings (site_name, logo_url, tagline, primary_email, primary_phone, whatsapp_number, address, linkedin_url)
VALUES (
  'Sentivra',
  NULL, -- Add logo later in media
  'From Ideas to Real Digital Products',
  'info@sentivra.com',
  '+1 (555) 123-4567',
  '+1234567890',
  'Your Location Here',
  'https://www.linkedin.com/company/sentivra'
);

-- =============================================
-- 2. SEO SETTINGS
-- =============================================
INSERT INTO seo_settings (page_key, meta_title, meta_description, meta_keywords)
VALUES
  ('home', 'Sentivra - Software Development Company', 'Transform your ideas into real digital products with our expert software development services', ARRAY['software development', 'web development', 'mobile apps', 'ERP', 'CRM', 'AI solutions']),
  ('services', 'Our Services - Sentivra', 'Explore our comprehensive range of software development services', ARRAY['web development', 'mobile apps', 'ERP systems', 'CRM solutions']),
  ('our-work', 'Our Work - Sentivra Portfolio', 'Browse our portfolio of successful software projects', ARRAY['portfolio', 'projects', 'case studies']),
  ('mockups', 'Mockups & Templates - Sentivra', 'Professional mockups and design templates for your business', ARRAY['mockups', 'templates', 'designs']),
  ('about', 'About Us - Sentivra', 'Learn about our mission, values, and journey', ARRAY['about us', 'company', 'team']),
  ('contact', 'Contact Us - Sentivra', 'Get in touch with us for your next project', ARRAY['contact', 'get in touch', 'inquiries']);

-- =============================================
-- 3. HERO SECTION
-- =============================================
INSERT INTO hero (headline, subheadline, cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link, video_url, is_active)
VALUES (
  'From Ideas to Real Digital Products',
  'We transform your business ideas into powerful software solutions',
  'Get Started',
  '/contact',
  'View Our Work',
  '/our-work',
  '/videos/hero.mp4', -- Existing video path
  true
);

-- =============================================
-- 4. TRUST BADGES
-- =============================================
INSERT INTO trust_badges (icon, title, description, display_order, is_active)
VALUES
  ('Headset', 'Professional Support', '24/7 dedicated support team', 1, true),
  ('Zap', 'High Performance', 'Optimized for speed and efficiency', 2, true),
  ('Sparkles', 'Modern Design', 'Beautiful, intuitive user interfaces', 3, true);

-- =============================================
-- 5. SERVICES
-- =============================================
INSERT INTO services (slug, title, short_description, long_description, icon, category, features, is_active, display_order)
VALUES
  (
    'web-application-development',
    'Web Application Development',
    'Custom web applications tailored to your specific business needs and industry requirements.',
    'We build robust, scalable, and secure web applications tailored to your business needs. Our team uses the latest frameworks like React, and Vue.js, ensuring your application is fast, responsive, and future-proof. From enterprise-level platforms to dynamic single-page applications, we deliver excellence.',
    'Code',
    'Web & Mobile',
    '["Custom API Development", "Progressive Web Apps (PWAs)", "Cloud-based Deployment", "Real-time Functionality"]'::jsonb,
    true,
    1
  ),
  (
    'mobile-application-development',
    'Mobile Application Development',
    'iOS & Android apps with exceptional performance and user experience.',
    'Capture your audience on the go with our mobile application development services. We create intuitive and high-performing apps for both iOS and Android, using native technologies like Swift and Kotlin, or cross-platform frameworks like React Native for wider reach and faster development cycles.',
    'Smartphone',
    'Web & Mobile',
    '["iOS & Android Development", "React Native Expertise", "Push Notifications", "App Store Submission"]'::jsonb,
    true,
    2
  ),
  (
    'erp-system-development',
    'ERP System Development',
    'Integrated ERP solutions to streamline your business operations.',
    'Streamline your entire business operations with our custom ERP systems. We design and implement enterprise resource planning solutions that unify finance, HR, inventory, supply chain, and more into a single, powerful platform. Gain complete visibility and control over your business processes.',
    'Layers',
    'Business Systems',
    '["Process Automation", "Real-time Reporting", "Multi-module Integration", "Scalable Architecture"]'::jsonb,
    true,
    3
  ),
  (
    'crm-system-development',
    'CRM System Development',
    'Smart CRM to manage customer relationships and boost sales.',
    'Transform how you manage customer relationships with our tailored CRM solutions. We develop systems that centralize customer data, automate sales workflows, and provide actionable insights to help your team close more deals and deliver exceptional customer service.',
    'Database',
    'Business Systems',
    '["Contact Management", "Sales Pipeline Tracking", "Marketing Automation", "Customer Analytics"]'::jsonb,
    true,
    4
  ),
  (
    'data-analysis-and-business-intelligence',
    'Data Analysis & Business Intelligence',
    'Turn your raw data into actionable insights and make data-driven decisions.',
    'Unlock the value hidden in your data. Our data science experts help you collect, process, and analyze data to uncover trends, predict outcomes, and make informed business decisions. From custom dashboards to predictive modeling, we turn data into your most valuable asset.',
    'BarChart3',
    'AI & Data',
    '["Business Intelligence Dashboards", "Predictive Analytics", "Big Data Processing", "Machine Learning Insights"]'::jsonb,
    true,
    5
  ),
  (
    'ai-and-chatbot-solutions',
    'AI and Chatbot Solutions',
    'Intelligent automation and 24/7 conversational AI for enhanced customer engagement.',
    'Leverage the power of Artificial Intelligence to automate processes and enhance user interactions. We develop custom AI models and intelligent chatbots that provide 24/7 customer support, generate leads, and offer personalized user experiences, driving efficiency and satisfaction.',
    'Bot',
    'AI & Data',
    '["Natural Language Processing (NLP)", "Machine Learning Models", "24/7 Automated Support", "Personalized User Journeys"]'::jsonb,
    true,
    6
  );

-- =============================================
-- 6. PROJECTS
-- =============================================
INSERT INTO projects (slug, title, short_description, category, technologies, image_url, is_featured, is_active, display_order)
VALUES
  (
    'real-estate-platform',
    'Real Estate Platform',
    'A comprehensive real estate listing and management platform with advanced search and property management features.',
    'Web Apps',
    '["React", "Node.js", "PostgreSQL", "Stripe"]'::jsonb,
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
    true,
    true,
    1
  ),
  (
    'inventory-management-system',
    'Inventory Management System',
    'Advanced inventory tracking and warehouse management solution with real-time analytics and reporting.',
    'ERP',
    '["Laravel", "MySQL", "Vue.js"]'::jsonb,
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop',
    true,
    true,
    2
  ),
  (
    'healthcare-mobile-app',
    'Healthcare Mobile App',
    'Patient care mobile application with appointment scheduling, telemedicine, and health records management.',
    'Mobile',
    '["Flutter", "Firebase", "Node.js"]'::jsonb,
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
    true,
    true,
    3
  ),
  (
    'manufacturing-erp',
    'Manufacturing ERP',
    'Complete manufacturing resource planning system with production tracking, quality control, and supply chain management.',
    'ERP',
    '["React", "Node.js", "PostgreSQL"]'::jsonb,
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    true,
    true,
    4
  ),
  (
    'ecommerce-platform',
    'E-Commerce Platform',
    'Multi-vendor e-commerce marketplace with payment integration, order tracking, and seller dashboard.',
    'Web Apps',
    '["React", "Node.js", "Stripe", "PostgreSQL"]'::jsonb,
    'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&h=600&fit=crop',
    true,
    true,
    5
  ),
  (
    'sales-crm-dashboard',
    'Sales CRM Dashboard',
    'Customer relationship management platform with lead tracking, pipeline management, and sales analytics.',
    'CRM',
    '["Vue.js", "Laravel", "MySQL"]'::jsonb,
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    true,
    true,
    6
  ),
  (
    'fitness-tracking-app',
    'Fitness Tracking App',
    'Comprehensive fitness and nutrition tracking app with workout plans, calorie counter, and progress analytics.',
    'Mobile',
    '["React Native", "Firebase", "Node.js"]'::jsonb,
    'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=600&fit=crop',
    false,
    true,
    7
  ),
  (
    'ai-chatbot-solution',
    'AI Customer Support Bot',
    'Intelligent chatbot powered by AI for automated customer support with natural language processing.',
    'AI & Chatbots',
    '["Python", "TensorFlow", "Node.js", "React"]'::jsonb,
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
    false,
    true,
    8
  ),
  (
    'restaurant-management',
    'Restaurant Management System',
    'Complete restaurant management solution with POS, inventory, reservations, and delivery integration.',
    'Other',
    '["React", "Node.js", "MongoDB", "Stripe"]'::jsonb,
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    false,
    true,
    9
  );

-- =============================================
-- 7. MOCKUPS (Placeholder - categories only)
-- =============================================
INSERT INTO mockups (title, description, category, image_url, is_active, display_order)
VALUES
  ('E-commerce Dashboard', 'Modern e-commerce admin dashboard mockup', 'E-commerce', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop', true, 1),
  ('Landing Page Template', 'Professional landing page for SaaS products', 'Landing Pages', 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=600&fit=crop', true, 2),
  ('Mobile App UI Kit', 'Comprehensive mobile app UI design kit', 'Mobile Apps', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop', true, 3);

-- =============================================
-- 8. CLIENT LOGOS (Placeholder)
-- =============================================
INSERT INTO client_logos (client_name, logo_url, display_order, is_active)
VALUES
  ('Tech Corp', NULL, 1, true),
  ('Innovate Ltd', NULL, 2, true),
  ('Digital Solutions', NULL, 3, true),
  ('Enterprise Co', NULL, 4, true),
  ('Global Systems', NULL, 5, true),
  ('Smart Apps', NULL, 6, true);

-- =============================================
-- 9. TESTIMONIALS
-- =============================================
INSERT INTO testimonials (client_name, client_title, company_name, testimonial_text, rating, display_order, is_featured, is_active)
VALUES
  (
    'Sarah Johnson',
    'CEO',
    'Tech Innovations Inc.',
    'Working with Sentivra was a game-changer for our business. They delivered our ERP system ahead of schedule and exceeded all our expectations. Their team is professional, responsive, and truly understands business needs.',
    5,
    1,
    true,
    true
  ),
  (
    'Michael Chen',
    'CTO',
    'Digital Solutions Ltd.',
    'The mobile app they developed for us has received outstanding feedback from our users. The attention to detail and performance optimization is impressive. Highly recommend Sentivra for any serious development project.',
    5,
    2,
    true,
    true
  ),
  (
    'Emma Williams',
    'Marketing Director',
    'Global Retail Corp.',
    'Our new e-commerce platform built by Sentivra has increased our online sales by 300%. The team was collaborative, patient with our requests, and delivered a beautiful, functional solution.',
    5,
    3,
    true,
    true
  );

-- =============================================
-- 10. FAQs - CONTACT PAGE
-- =============================================
INSERT INTO faqs (page_key, question, answer, display_order, is_active)
VALUES
  ('contact', 'What services do you offer?', 'We specialize in custom web and mobile application development, ERP and CRM systems, AI solutions, data analytics, and business intelligence. Our team can handle projects of any size and complexity.', 1, true),
  ('contact', 'How long does a typical project take?', 'Project timelines vary based on complexity and requirements. A simple mobile app might take 2-3 months, while a comprehensive ERP system could take 6-12 months. We provide detailed timelines during the consultation phase.', 2, true),
  ('contact', 'What is your development process?', 'We follow an agile methodology with regular sprints and client feedback loops. Our process includes: Discovery → Design → Development → Testing → Deployment → Support. You''ll be involved at every stage.', 3, true),
  ('contact', 'Do you provide ongoing support after launch?', 'Yes! We offer comprehensive post-launch support and maintenance packages. This includes bug fixes, updates, security patches, and feature enhancements as your business grows.', 4, true),
  ('contact', 'What technologies do you work with?', 'We use modern, proven technologies including React, Vue.js, Node.js, Python, Flutter, React Native, PostgreSQL, MongoDB, and cloud platforms like AWS and Azure. We choose the best stack for your specific needs.', 5, true),
  ('contact', 'How much does a project cost?', 'Project costs vary based on scope, features, and complexity. We provide detailed quotes after understanding your requirements. Contact us for a free consultation and estimate.', 6, true),
  ('contact', 'Can you work with our existing systems?', 'Absolutely! We have extensive experience integrating with legacy systems, third-party APIs, and existing infrastructure. We ensure seamless data migration and system compatibility.', 7, true),
  ('contact', 'Where are you located?', 'While we have a central office, our team works remotely across multiple time zones. This allows us to provide excellent service and maintain communication with clients worldwide.', 8, true);

-- =============================================
-- 11. FAQs - MOCKUPS PAGE
-- =============================================
INSERT INTO faqs (page_key, question, answer, display_order, is_active)
VALUES
  ('mockups', 'What formats are the mockups available in?', 'Our mockups are available in industry-standard formats including Figma, Sketch, Adobe XD, and PSD. Some mockups also include HTML/CSS code for direct implementation.', 1, true),
  ('mockups', 'Can I customize the mockups?', 'Yes! All our mockups are fully editable and customizable. You can change colors, fonts, layouts, and content to match your brand identity.', 2, true),
  ('mockups', 'Do mockups include mobile responsive designs?', 'Most of our mockups include responsive versions for mobile, tablet, and desktop. Check the individual mockup description for specific details.', 3, true),
  ('mockups', 'Are the mockups royalty-free?', 'Once purchased, you have full commercial rights to use the mockups in your projects without attribution or additional licensing fees.', 4, true),
  ('mockups', 'Can you create custom mockups for my project?', 'Absolutely! If you don''t find what you''re looking for in our library, we offer custom mockup design services. Contact us to discuss your requirements.', 5, true),
  ('mockups', 'What''s included with a mockup purchase?', 'Each mockup includes the complete design file, all assets (icons, images, fonts), and a documentation file with instructions for customization.', 6, true),
  ('mockups', 'Do you offer mockup bundles or subscriptions?', 'Yes! We have bundle packages and subscription plans that give you access to our entire mockup library at a discounted rate. Check our pricing page for details.', 7, true),
  ('mockups', 'Can I get a refund if I''m not satisfied?', 'We offer a 30-day money-back guarantee. If you''re not satisfied with your purchase, contact us within 30 days for a full refund.', 8, true);

-- =============================================
-- 12. FAQs - SERVICES PAGE
-- =============================================
INSERT INTO faqs (page_key, question, answer, display_order, is_active)
VALUES
  ('services', 'Do you offer fixed-price or hourly billing?', 'We offer both models. Fixed-price works well for clearly defined projects, while hourly/retainer arrangements suit ongoing development or projects with evolving requirements.', 1, true),
  ('services', 'What industries do you serve?', 'We work across multiple industries including healthcare, finance, e-commerce, manufacturing, education, real estate, and more. Our adaptable approach ensures success in any sector.', 2, true),
  ('services', 'Do you sign NDAs?', 'Yes, we respect your confidentiality and are happy to sign Non-Disclosure Agreements before discussing your project details.', 3, true),
  ('services', 'How do you ensure quality?', 'We follow rigorous quality assurance processes including code reviews, automated testing, manual testing, security audits, and performance optimization before any release.', 4, true),
  ('services', 'Can you scale our application as we grow?', 'Absolutely! We build with scalability in mind from day one, using cloud infrastructure and modern architectures that can handle growth from hundreds to millions of users.', 5, true),
  ('services', 'Do you provide training for our team?', 'Yes, we offer comprehensive training and documentation for your team to ensure smooth adoption and effective use of the systems we build.', 6, true);

-- =============================================
-- 13. PROCESS STEPS (Home page)
-- =============================================
INSERT INTO process_steps (step_number, title, description, icon, display_order, is_active)
VALUES
  (1, 'Discovery & Planning', 'We analyze your requirements, define project scope, and create a detailed roadmap for success.', 'Search', 1, true),
  (2, 'Design & Development', 'Our team brings your vision to life with beautiful designs and robust, scalable code.', 'Code', 2, true),
  (3, 'Launch & Support', 'We deploy your solution and provide ongoing support to ensure continued success.', 'Rocket', 3, true);

-- =============================================
-- 14. WHY CHOOSE US (Home page)
-- =============================================
INSERT INTO why_choose_us (icon, title, description, display_order, is_active)
VALUES
  ('Award', 'Proven Expertise', 'Years of experience delivering successful projects across diverse industries', 1, true),
  ('Users', 'Client-Focused Approach', 'We prioritize your goals and maintain transparent communication throughout the project', 2, true),
  ('Zap', 'Cutting-Edge Technology', 'We use the latest tools and frameworks to ensure your solution is future-proof', 3, true),
  ('Shield', 'Quality Assurance', 'Rigorous testing and quality control processes ensure reliable, bug-free solutions', 4, true);

-- =============================================
-- 15. COUNTRIES (About page)
-- =============================================
INSERT INTO countries (country_name, flag_emoji, client_count, display_order, is_active)
VALUES
  ('United States', '🇺🇸', 45, 1, true),
  ('United Kingdom', '🇬🇧', 32, 2, true),
  ('United Arab Emirates', '🇦🇪', 28, 3, true);

-- =============================================
-- 16. TIMELINE MILESTONES (About page)
-- =============================================
INSERT INTO timeline_milestones (year, title, description, display_order, is_active)
VALUES
  (2018, 'Company Founded', 'Started with a vision to transform businesses through technology', 1, true),
  (2019, 'First Major Client', 'Delivered our first enterprise ERP system', 2, true),
  (2020, 'Team Expansion', 'Grew to 20+ talented developers and designers', 3, true),
  (2022, 'Global Reach', 'Expanded services to clients in 15+ countries', 4, true),
  (2024, 'Innovation Leader', '100+ successful projects and recognized industry expertise', 5, true);

-- =============================================
-- 17. VALUES (About page)
-- =============================================
INSERT INTO values (icon, title, description, display_order, is_active)
VALUES
  ('Target', 'Excellence', 'We strive for excellence in every line of code and every client interaction', 1, true),
  ('Heart', 'Integrity', 'We build trust through honest communication and ethical practices', 2, true),
  ('Lightbulb', 'Innovation', 'We embrace new technologies and creative solutions to solve complex problems', 3, true),
  ('Users', 'Collaboration', 'We believe in the power of teamwork and partnership with our clients', 4, true);

-- =============================================
-- 18. STATS (About page)
-- =============================================
INSERT INTO stats (label, value, suffix, icon, display_order, is_active)
VALUES
  ('Projects Completed', 100, '+', 'CheckCircle', 1, true),
  ('Happy Clients', 75, '+', 'Users', 2, true),
  ('Countries Served', 15, '+', 'Globe', 3, true),
  ('Team Members', 25, '+', 'UsersRound', 4, true),
  ('Client Satisfaction', 98, '%', 'ThumbsUp', 5, true);
