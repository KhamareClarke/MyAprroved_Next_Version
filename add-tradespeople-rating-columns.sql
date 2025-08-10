-- Add rating and review columns to tradespeople table
-- Run this in your Supabase SQL Editor

-- Add rating column (average rating from reviews)
ALTER TABLE tradespeople 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0;

-- Add reviews count column
ALTER TABLE tradespeople 
ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;

-- Add hourly rate column
ALTER TABLE tradespeople 
ADD COLUMN IF NOT EXISTS hourly_rate_min DECIMAL(8,2);
ALTER TABLE tradespeople 
ADD COLUMN IF NOT EXISTS hourly_rate_max DECIMAL(8,2);

-- Add status column for active/inactive tradespeople
ALTER TABLE tradespeople 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tradespeople_verified_status ON tradespeople(verified, status);
CREATE INDEX IF NOT EXISTS idx_tradespeople_rating ON tradespeople(rating DESC);
CREATE INDEX IF NOT EXISTS idx_tradespeople_reviews_count ON tradespeople(reviews_count DESC);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'tradespeople' 
AND column_name IN ('rating', 'reviews_count', 'hourly_rate_min', 'hourly_rate_max', 'status')
ORDER BY column_name; 