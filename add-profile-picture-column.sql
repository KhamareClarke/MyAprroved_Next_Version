-- Add profile_picture_url column to tradespeople table
-- Run this in your Supabase SQL Editor

-- Add profile_picture_url column if it doesn't exist
ALTER TABLE tradespeople 
ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(500);

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tradespeople' 
AND column_name = 'profile_picture_url';

-- Show current table structure to confirm
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tradespeople'
ORDER BY ordinal_position;

-- Add index for better performance when querying by profile picture
CREATE INDEX IF NOT EXISTS idx_tradespeople_profile_picture ON tradespeople(profile_picture_url) WHERE profile_picture_url IS NOT NULL; 