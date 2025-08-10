-- Create Documents Storage Bucket and Policies
-- Run this in your Supabase SQL Editor

-- Create the documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    true,
    10485760, -- 10MB in bytes
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the documents bucket

-- Allow public access to read documents
CREATE POLICY "Public Access to Documents" ON storage.objects 
FOR SELECT USING (bucket_id = 'documents');

-- Allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents" ON storage.objects 
FOR INSERT WITH CHECK (
    bucket_id = 'documents' 
    AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

-- Allow users to update their own documents
CREATE POLICY "Users can update own documents" ON storage.objects 
FOR UPDATE USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete own documents" ON storage.objects 
FOR DELETE USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow insert during registration (when user might not be authenticated yet)
CREATE POLICY "Allow document upload during registration" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'documents');

-- Verify the bucket was created
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'documents';

-- Show all storage policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname; 