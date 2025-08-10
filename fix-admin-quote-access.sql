-- Fix RLS policies for admin to access quote requests and tradespeople
-- Run this in your Supabase SQL Editor

-- First, let's see the current policies for quote_requests
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'quote_requests';

-- Drop existing policies that might be blocking admin access
DROP POLICY IF EXISTS "Allow authenticated users to insert quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Tradespeople can view their quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Clients can view their quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admin can view all quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Allow updates for admin approval" ON quote_requests;

-- Create new policies that allow proper access for quote_requests
-- Allow any user (including anonymous) to insert quote requests
CREATE POLICY "Allow all users to insert quote requests" ON quote_requests
    FOR INSERT
    WITH CHECK (true);

-- Allow any user (including anonymous) to view quote requests
CREATE POLICY "Allow all users to view quote requests" ON quote_requests
    FOR SELECT
    USING (true);

-- Allow any user (including anonymous) to update quote requests
CREATE POLICY "Allow all users to update quote requests" ON quote_requests
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Now let's check and fix tradespeople table policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'tradespeople';

-- Drop existing policies that might be blocking admin access to tradespeople
DROP POLICY IF EXISTS "Tradespeople can view their own data" ON tradespeople;
DROP POLICY IF EXISTS "Clients can view tradespeople" ON tradespeople;
DROP POLICY IF EXISTS "Admin can view all tradespeople" ON tradespeople;

-- Create new policies for tradespeople that allow admin access
-- Allow any user (including anonymous) to view tradespeople data
CREATE POLICY "Allow all users to view tradespeople" ON tradespeople
    FOR SELECT
    USING (true);

-- Allow authenticated tradespeople to update their own data
CREATE POLICY "Tradespeople can update their own data" ON tradespeople
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('quote_requests', 'tradespeople')
ORDER BY tablename, policyname;

-- Test queries to make sure everything works
SELECT COUNT(*) as total_requests FROM quote_requests;
SELECT COUNT(*) as pending_requests FROM quote_requests WHERE status = 'pending_admin_approval';
SELECT COUNT(*) as total_tradespeople FROM tradespeople; 