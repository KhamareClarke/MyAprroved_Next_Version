-- Complete fix for job_reviews table structure
-- This script will recreate the table with the correct columns

-- First, drop the existing table if it exists (this will delete existing data)
DROP TABLE IF EXISTS job_reviews CASCADE;

-- Create the job_reviews table with the correct structure
CREATE TABLE job_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    tradesperson_id UUID REFERENCES tradespeople(id) ON DELETE CASCADE,
    reviewer_type VARCHAR(20) NOT NULL CHECK (reviewer_type IN ('client', 'admin')),
    reviewer_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, tradesperson_id, reviewer_id)
);

-- Add indexes for better performance
CREATE INDEX idx_job_reviews_job_id ON job_reviews(job_id);
CREATE INDEX idx_job_reviews_tradesperson_id ON job_reviews(tradesperson_id);
CREATE INDEX idx_job_reviews_reviewer_id ON job_reviews(reviewer_id);

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'job_reviews' 
ORDER BY ordinal_position;

-- Show that the table is empty and ready for new data
SELECT COUNT(*) as total_reviews FROM job_reviews; 