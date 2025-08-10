-- Simple fix for quote_requests RLS - just add the missing INSERT policy
-- Run this in your Supabase SQL Editor

-- Add the INSERT policy that allows anyone to create quote requests
-- This is what's missing and causing the RLS violation
CREATE POLICY IF NOT EXISTS "Allow quote request creation" ON quote_requests
FOR INSERT WITH CHECK (true);

-- Check all current policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'quote_requests'
ORDER BY cmd, policyname;