-- Fix Supabase Storage RLS Policies for tradesperson-documents bucket
-- Run this in your Supabase SQL Editor

-- First, let's see what policies exist
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
WHERE tablename = 'objects';

-- Drop any existing policies for the tradesperson-documents bucket (if they exist)
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read" ON storage.objects;

-- Create the correct INSERT policy (WITH CHECK, not USING)
CREATE POLICY "Allow authenticated upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tradesperson-documents');

-- Create a SELECT policy so users can read their uploaded files
CREATE POLICY "Allow authenticated read"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'tradesperson-documents');

-- Verify the policies were created
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%authenticated%';

-- Check if the bucket exists
SELECT * FROM storage.buckets WHERE id = 'tradesperson-documents';

-- If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public)
VALUES ('tradesperson-documents', 'tradesperson-documents', false)
ON CONFLICT (id) DO NOTHING; 