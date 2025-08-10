-- Check tradespeople table structure
-- This will show all columns, their data types, and constraints

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'tradespeople' 
ORDER BY ordinal_position;

-- Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tradespeople'
) as table_exists;

-- Show table constraints
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'tradespeople';

-- Show indexes on the table
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'tradespeople';

-- Count total records in the table
SELECT COUNT(*) as total_tradespeople FROM tradespeople;

-- Show sample data (first 5 records)
SELECT 
    id,
    email,
    first_name,
    last_name,
    trade,
    city,
    postcode,
    is_verified,
    is_approved,
    created_at
FROM tradespeople 
LIMIT 5; 