-- Check the client table structure
-- Run these commands in your Supabase SQL editor

-- 1. Show all columns in the clients table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- 2. Show the actual table structure with more details
\d clients;

-- 3. Check if there are any records in the clients table
SELECT COUNT(*) as total_clients FROM clients;

-- 4. Show a few sample records (if any exist)
SELECT * FROM clients LIMIT 5;

-- 5. Check if the id column exists and what type it is
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name = 'id';

-- 6. Check all table names in your database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name; 