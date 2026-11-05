-- =============================================
-- Setup Supabase Storage for Media Uploads
-- =============================================

-- Create storage bucket for site media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-media',
  'site-media',
  true,
  52428800, -- 50MB in bytes
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'application/pdf',
    'application/zip'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'application/pdf',
    'application/zip'
  ];

-- Add width and height columns to media table for images
ALTER TABLE media
ADD COLUMN IF NOT EXISTS width INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER;

-- =============================================
-- Storage RLS Policies
-- =============================================

-- Allow public to READ files (public bucket)
DROP POLICY IF EXISTS "Public can view files" ON storage.objects;
CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-media');

-- Allow authenticated users to UPLOAD files
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-media' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to UPDATE their own files
DROP POLICY IF EXISTS "Authenticated users can update files" ON storage.objects;
CREATE POLICY "Authenticated users can update files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'site-media' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to DELETE files
DROP POLICY IF EXISTS "Authenticated users can delete files" ON storage.objects;
CREATE POLICY "Authenticated users can delete files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'site-media' 
  AND auth.role() = 'authenticated'
);

-- Add index on media dimensions for faster queries
CREATE INDEX IF NOT EXISTS idx_media_dimensions ON media(width, height);
