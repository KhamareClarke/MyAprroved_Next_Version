-- Check if job-images bucket exists
SELECT 
    id, 
    name, 
    public, 
    allowed_mime_types, 
    file_size_limit
FROM storage.buckets 
WHERE id = 'job-images';

-- If the above query returns no results, run this to create the bucket:
-- INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
-- VALUES ('job-images', 'job-images', TRUE, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'], 5242880)
-- ON CONFLICT (id) DO NOTHING;

-- After creating the bucket, you may need to set up RLS policies manually in the Supabase dashboard
-- Go to Storage > Policies and add:
-- 1. Public read access for job-images bucket
-- 2. Authenticated user upload access for job-images bucket 