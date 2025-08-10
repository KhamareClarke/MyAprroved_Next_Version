-- Check if job-images bucket exists in the correct project (jismdkfjkngwbpddhomx)
SELECT 
    id, 
    name, 
    public, 
    allowed_mime_types, 
    file_size_limit
FROM storage.buckets 
WHERE id = 'job-images';

-- If no results, create the bucket:
-- INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
-- VALUES ('job-images', 'job-images', TRUE, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'], 5242880)
-- ON CONFLICT (id) DO NOTHING;

-- Check RLS policies for storage.objects
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'; 