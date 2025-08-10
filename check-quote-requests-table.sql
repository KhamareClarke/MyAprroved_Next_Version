-- Check if quote_requests table exists
-- Run this in your Supabase SQL Editor

-- Check if the table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'quote_requests'
) as table_exists;

-- If it exists, show the structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'quote_requests' 
ORDER BY ordinal_position;