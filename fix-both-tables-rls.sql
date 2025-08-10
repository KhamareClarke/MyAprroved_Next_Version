-- Fix RLS policies for both quote_requests and messages tables
-- Run this in your Supabase SQL Editor

-- ==== FIX QUOTE_REQUESTS TABLE ====

-- Temporarily disable RLS to clear any conflicts
ALTER TABLE quote_requests DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can create quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Allow quote request creation" ON quote_requests;
DROP POLICY IF EXISTS "Tradespeople can view their quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Tradespeople can update their quote requests" ON quote_requests;

-- Re-enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Create clean, simple policies
CREATE POLICY "allow_insert_quote_requests" ON quote_requests
FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_select_quote_requests" ON quote_requests
FOR SELECT USING (true);

CREATE POLICY "allow_update_quote_requests" ON quote_requests
FOR UPDATE USING (true);

-- ==== FIX MESSAGES TABLE ====

-- Temporarily disable RLS to clear any conflicts
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON messages;
DROP POLICY IF EXISTS "Enable insert for users" ON messages;

-- Re-enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for messages
CREATE POLICY "allow_insert_messages" ON messages
FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_select_messages" ON messages
FOR SELECT USING (true);

CREATE POLICY "allow_update_messages" ON messages
FOR UPDATE USING (true);

-- ==== VERIFY POLICIES ====
SELECT 'quote_requests policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'quote_requests' ORDER BY cmd;

SELECT 'messages policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'messages' ORDER BY cmd;