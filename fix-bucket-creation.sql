-- Fix Documents Bucket Creation
-- Run this in your Supabase SQL Editor

-- First, let's check if the bucket exists
SELECT 'Checking if documents bucket exists...' as status;

SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'documents';

-- If bucket doesn't exist, create it
-- Delete any existing bucket first (if it exists but is broken)
DELETE FROM storage.buckets WHERE id = 'documents';

-- Create the documents bucket properly
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    true,
    10485760, -- 10MB in bytes
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif']
);

-- Verify the bucket was created
SELECT 'Verifying bucket creation...' as status;

SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id = 'documents';

-- Drop existing policies properly (if they exist)
DROP POLICY IF EXISTS "Public Access to Documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow document upload during registration" ON storage.objects;

-- Recreate the policies
CREATE POLICY "Public Access to Documents" ON storage.objects 
FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can upload documents" ON storage.objects 
FOR INSERT WITH CHECK (
    bucket_id = 'documents' 
    AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "Users can update own documents" ON storage.objects 
FOR UPDATE USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own documents" ON storage.objects 
FOR DELETE USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow document upload during registration" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'documents');

-- Final verification
SELECT 'Final verification...' as status;

SELECT 
    id,
    name,
    public,
    file_size_limit
FROM storage.buckets 
WHERE id = 'documents';

SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND (qual LIKE '%documents%' OR with_check LIKE '%documents%')
ORDER BY policyname; 