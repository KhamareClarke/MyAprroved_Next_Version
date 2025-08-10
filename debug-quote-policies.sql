-- Debug and fix quote_requests RLS policies
-- Run this in your Supabase SQL Editor

-- First, let's see ALL current policies on quote_requests
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'quote_requests'
ORDER BY cmd, policyname;

-- Check if RLS is enabled on the table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'quote_requests';

-- Also check the table owner and current user context
SELECT current_user as current_user;
SELECT tableowner FROM pg_tables WHERE tablename = 'quote_requests';