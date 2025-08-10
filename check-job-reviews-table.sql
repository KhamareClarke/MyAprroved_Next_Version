-- Check if job_reviews table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'job_reviews'
);

-- Check the actual structure of job_reviews table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'job_reviews' 
ORDER BY ordinal_position;

-- Show sample data from job_reviews table
SELECT * FROM job_reviews LIMIT 5;

-- Create job_reviews table with correct structure if it doesn't exist
CREATE TABLE IF NOT EXISTS job_reviews (
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

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add tradesperson_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_reviews' AND column_name = 'tradesperson_id') THEN
        ALTER TABLE job_reviews ADD COLUMN tradesperson_id UUID REFERENCES tradespeople(id) ON DELETE CASCADE;
    END IF;
    
    -- Add reviewer_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_reviews' AND column_name = 'reviewer_type') THEN
        ALTER TABLE job_reviews ADD COLUMN reviewer_type VARCHAR(20) NOT NULL DEFAULT 'client' CHECK (reviewer_type IN ('client', 'admin'));
    END IF;
    
    -- Add reviewer_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_reviews' AND column_name = 'reviewer_id') THEN
        ALTER TABLE job_reviews ADD COLUMN reviewer_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
    
    -- Add reviewed_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_reviews' AND column_name = 'reviewed_at') THEN
        ALTER TABLE job_reviews ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_reviews_job_id ON job_reviews(job_id);
CREATE INDEX IF NOT EXISTS idx_job_reviews_tradesperson_id ON job_reviews(tradesperson_id);
CREATE INDEX IF NOT EXISTS idx_job_reviews_reviewer_id ON job_reviews(reviewer_id);

-- Show final table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'job_reviews' 
ORDER BY ordinal_position; 