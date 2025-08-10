-- Temporarily disable RLS on quote_requests to test the functionality
-- Run this in your Supabase SQL Editor

-- Disable Row Level Security on quote_requests table
ALTER TABLE quote_requests DISABLE ROW LEVEL SECURITY;

-- Test the quote functionality now, then we can re-enable RLS with proper policies
-- IMPORTANT: Remember to re-enable RLS after testing!