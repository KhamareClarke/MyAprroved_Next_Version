-- Clear all quote requests from the database
-- Run this in your Supabase SQL Editor

-- First, let's see what we have
SELECT COUNT(*) as total_requests FROM quote_requests;

-- Delete all quote requests (this bypasses RLS)
DELETE FROM quote_requests;

-- Verify they're gone
SELECT COUNT(*) as remaining_requests FROM quote_requests;

-- Final verification
SELECT 'Quote requests cleared successfully' as status; 