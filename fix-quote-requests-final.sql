-- Fix quote_requests RLS policy - compatible with all PostgreSQL versions
-- Run this in your Supabase SQL Editor

-- First drop the policy if it exists, then create it
DROP POLICY IF EXISTS "Allow quote request creation" ON quote_requests;

-- Create the INSERT policy that allows anyone to create quote requests
CREATE POLICY "Allow quote request creation" ON quote_requests
FOR INSERT WITH CHECK (true);

-- Verify the policy was created
SELECT 
    policyname,
    cmd,
    with_check
FROM pg_policies 
WHERE tablename = 'quote_requests' AND cmd = 'INSERT';