-- Setup storage bucket for tradesperson documents
-- Run this in your Supabase SQL editor

-- Create storage bucket for tradesperson documents
-- Note: You'll need to create this bucket in the Supabase dashboard under Storage
-- This is just a reference for the bucket structure

-- Bucket name: tradesperson-documents
-- Folder structure:
-- /id-documents/
-- /insurance-documents/
-- /qualifications-documents/
-- /trade-cards/

-- Storage policies (set these in Supabase dashboard under Storage > Policies)

-- Policy 1: Allow tradespeople to upload their own documents
-- CREATE POLICY "Tradespeople can upload documents" ON storage.objects
-- FOR INSERT WITH CHECK (
--   bucket_id = 'tradesperson-documents' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Policy 2: Allow tradespeople to view their own documents
-- CREATE POLICY "Tradespeople can view own documents" ON storage.objects
-- FOR SELECT USING (
--   bucket_id = 'tradesperson-documents' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Policy 3: Allow admins to view all documents
-- CREATE POLICY "Admins can view all documents" ON storage.objects
-- FOR SELECT USING (
--   bucket_id = 'tradesperson-documents' AND
--   auth.jwt() ->> 'role' = 'admin'
-- );

-- Show current storage buckets
SELECT * FROM storage.buckets; 