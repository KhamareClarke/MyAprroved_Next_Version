-- Check the current state of job_reviews table
-- This script will help diagnose why reviews and ratings aren't showing

-- 1. Check if the table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'job_reviews' 
ORDER BY ordinal_position;

-- 2. Check if there are any records in the table
SELECT COUNT(*) as total_reviews FROM job_reviews;

-- 3. Check sample data if any exists
SELECT 
    id,
    job_id,
    tradesperson_id,
    reviewer_type,
    reviewer_id,
    rating,
    review_text,
    reviewed_at
FROM job_reviews 
LIMIT 10;

-- 4. Check if there are any completed jobs
SELECT 
    id,
    trade,
    job_description,
    is_completed,
    application_status,
    completed_at,
    completed_by
FROM jobs 
WHERE is_completed = true 
LIMIT 10;

-- 5. Check if there are any jobs with reviews
SELECT 
    j.id,
    j.trade,
    j.job_description,
    j.is_completed,
    COUNT(jr.id) as review_count
FROM jobs j
LEFT JOIN job_reviews jr ON j.id = jr.job_id
WHERE j.is_completed = true
GROUP BY j.id, j.trade, j.job_description, j.is_completed
ORDER BY review_count DESC
LIMIT 10;

-- 6. Check for any constraint violations or missing foreign keys
SELECT 
    j.id as job_id,
    j.trade,
    jr.id as review_id,
    jr.tradesperson_id,
    jr.reviewer_id
FROM jobs j
LEFT JOIN job_reviews jr ON j.id = jr.job_id
WHERE j.is_completed = true 
    AND jr.id IS NOT NULL
LIMIT 10; 