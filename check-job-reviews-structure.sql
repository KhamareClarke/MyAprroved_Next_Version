-- Check job_reviews table structure
-- Run this in your Supabase SQL Editor

-- Show all columns in the job_reviews table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'job_reviews' 
ORDER BY ordinal_position;

-- Also show a sample of the data to see what's actually there
SELECT * FROM job_reviews LIMIT 5;