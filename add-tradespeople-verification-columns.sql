-- Add verification columns to tradespeople table
-- Run this in your Supabase SQL Editor

-- Add verification columns if they don't exist
ALTER TABLE tradespeople 
ADD COLUMN IF NOT EXISTS verification_token varchar,
ADD COLUMN IF NOT EXISTS verification_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS email_verified_at timestamp with time zone;

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tradespeople' 
AND column_name IN ('verification_token', 'verification_sent_at', 'email_verified_at');

-- Show current table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tradespeople'
ORDER BY ordinal_position; 