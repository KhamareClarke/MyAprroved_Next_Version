-- Check if documents bucket was created properly
-- Run this in your Supabase SQL Editor

-- Check if bucket exists in storage.buckets table
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at,
    updated_at
FROM storage.buckets 
WHERE id = 'documents';

-- Check all buckets
SELECT 
    id,
    name,
    public,
    file_size_limit
FROM storage.buckets 
ORDER BY name;

-- Check if there are any files in the documents bucket
SELECT 
    name,
    bucket_id,
    owner,
    created_at,
    updated_at,
    last_accessed_at,
    metadata
FROM storage.objects 
WHERE bucket_id = 'documents'
ORDER BY created_at DESC;

-- Count files in documents bucket
SELECT COUNT(*) as files_in_documents_bucket
FROM storage.objects 
WHERE bucket_id = 'documents';

-- Check storage policies for documents bucket
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