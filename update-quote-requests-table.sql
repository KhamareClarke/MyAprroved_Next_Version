-- Update quote_requests table to include new columns for admin approval workflow
-- Run this in your Supabase SQL Editor

-- First, let's see the current structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'quote_requests'
ORDER BY ordinal_position;

-- Add the new columns needed for the admin approval workflow
ALTER TABLE quote_requests 
ADD COLUMN IF NOT EXISTS admin_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tradesperson_quoted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS client_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS chat_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to have the new columns
UPDATE quote_requests 
SET 
    admin_approved = CASE 
        WHEN status = 'approved' THEN TRUE 
        ELSE FALSE 
    END,
    tradesperson_quoted = FALSE,
    client_approved = FALSE,
    chat_enabled = FALSE,
    created_at = COALESCE(created_at, NOW())
WHERE admin_approved IS NULL;

-- Verify the updated structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'quote_requests'
ORDER BY ordinal_position; 