-- Create documents storage bucket for tradesperson document uploads
-- This script will create the bucket and set up proper access policies

-- 1. Create the documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false, -- Private bucket for security
  10485760, -- 10MB file size limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 2. Enable Row Level Security on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for the documents bucket

-- Policy: Allow tradespeople to upload their own documents
CREATE POLICY "Tradespeople can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow tradespeople to view their own documents
CREATE POLICY "Tradespeople can view own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow tradespeople to update their own documents
CREATE POLICY "Tradespeople can update own documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow tradespeople to delete their own documents
CREATE POLICY "Tradespeople can delete own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Create a policy for admin access (optional)
-- Uncomment if you want admins to access all documents
-- CREATE POLICY "Admins can access all documents" ON storage.objects
-- FOR ALL USING (
--   bucket_id = 'documents' 
--   AND auth.jwt() ->> 'role' = 'admin'
-- );

-- 5. Verify the bucket was created
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'documents';

-- 6. Show all storage buckets (for verification)
SELECT 
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets; 