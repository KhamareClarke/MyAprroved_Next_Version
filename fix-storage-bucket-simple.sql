-- Simple storage bucket creation for job images
-- This script only creates the bucket without modifying RLS policies

-- Check if the bucket exists first
SELECT 
    id, 
    name, 
    public, 
    allowed_mime_types, 
    file_size_limit
FROM storage.buckets 
WHERE id = 'job-images';

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES ('job-images', 'job-images', TRUE, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'], 5242880) -- 5MB limit
ON CONFLICT (id) DO NOTHING;

-- Verify the bucket was created
SELECT 
    id, 
    name, 
    public, 
    allowed_mime_types, 
    file_size_limit
FROM storage.buckets 
WHERE id = 'job-images'; 