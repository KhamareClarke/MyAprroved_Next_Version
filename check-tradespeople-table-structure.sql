-- Check tradespeople table structure
-- Run this in your Supabase SQL Editor

-- Show all columns in the tradespeople table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tradespeople' 
ORDER BY ordinal_position;

-- Also show a sample of the data to see what's actually there
SELECT * FROM tradespeople LIMIT 3; 