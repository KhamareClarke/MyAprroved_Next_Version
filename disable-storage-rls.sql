-- Disable RLS for tradesperson-documents bucket
-- This is the simplest solution for registration uploads
-- Run this in your Supabase SQL Editor

-- First, check if the bucket exists
SELECT * FROM storage.buckets WHERE id = 'tradesperson-documents';

-- If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public)
VALUES ('tradesperson-documents', 'tradesperson-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Disable RLS for the bucket
UPDATE storage.buckets 
SET public = true 
WHERE id = 'tradesperson-documents';

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;

-- Create public policies (no authentication required)
CREATE POLICY "Allow public upload"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'tradesperson-documents');

CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'tradesperson-documents');

-- Verify the bucket settings
SELECT id, name, public FROM storage.buckets WHERE id = 'tradesperson-documents';

-- Verify the policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%public%'; 