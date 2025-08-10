-- Add job completion, ratings, and reviews functionality
-- This script adds the necessary columns and tables for job completion workflow

-- Add completion columns to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_by VARCHAR(20), -- 'client', 'admin', 'tradesperson'
ADD COLUMN IF NOT EXISTS client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
ADD COLUMN IF NOT EXISTS client_review TEXT,
ADD COLUMN IF NOT EXISTS review_submitted_at TIMESTAMP WITH TIME ZONE;

-- Create job_reviews table for detailed reviews
CREATE TABLE IF NOT EXISTS job_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  reviewer_type VARCHAR(20) NOT NULL, -- 'client', 'tradesperson'
  reviewer_id UUID NOT NULL, -- client_id or tradesperson_id
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_is_completed ON jobs(is_completed);
CREATE INDEX IF NOT EXISTS idx_jobs_completed_at ON jobs(completed_at);
CREATE INDEX IF NOT EXISTS idx_jobs_client_rating ON jobs(client_rating);
CREATE INDEX IF NOT EXISTS idx_job_reviews_job_id ON job_reviews(job_id);
CREATE INDEX IF NOT EXISTS idx_job_reviews_reviewer_type ON job_reviews(reviewer_type);
CREATE INDEX IF NOT EXISTS idx_job_reviews_reviewer_id ON job_reviews(reviewer_id);

-- Add RLS policies for job_reviews table
ALTER TABLE job_reviews ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (we'll secure this in the API routes)
CREATE POLICY "Allow all operations" ON job_reviews FOR ALL USING (true);

-- Update existing in_progress jobs to have is_completed = false
UPDATE jobs 
SET is_completed = FALSE 
WHERE application_status = 'in_progress' 
AND is_completed IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
AND column_name IN ('is_completed', 'completed_at', 'completed_by', 'client_rating', 'client_review', 'review_submitted_at')
ORDER BY ordinal_position; 