-- Debug Profile Picture Upload Issues
-- Run this in your Supabase SQL Editor

-- 1. Check if any tradespeople have profile pictures
SELECT 
    id,
    first_name,
    last_name,
    email,
    profile_picture_url,
    created_at
FROM tradespeople 
WHERE profile_picture_url IS NOT NULL
ORDER BY created_at DESC;

-- 2. Check recent tradespeople registrations
SELECT 
    id,
    first_name,
    last_name,
    email,
    profile_picture_url,
    created_at
FROM tradespeople 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check documents table for profile picture entries
SELECT 
    id,
    trade_id,
    doc_type,
    file_path,
    upload_date,
    status
FROM documents 
WHERE doc_type = 'profile_picture'
ORDER BY upload_date DESC;

-- 4. Check if documents bucket exists and has files
-- (This will be visible in Storage section of Supabase dashboard)

-- 5. Count total tradespeople
SELECT COUNT(*) as total_tradespeople FROM tradespeople;

-- 6. Count tradespeople with profile pictures
SELECT COUNT(*) as tradespeople_with_profile_pictures 
FROM tradespeople 
WHERE profile_picture_url IS NOT NULL;

-- 7. Show table structure to confirm profile_picture_url column
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tradespeople' 
AND column_name = 'profile_picture_url'; 