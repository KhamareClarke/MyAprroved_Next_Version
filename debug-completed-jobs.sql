-- Debug and fix completed jobs issue
-- This script will help identify why completed jobs are still showing as available

-- 1. Check all jobs and their current status
SELECT 
  id,
  trade,
  job_description,
  is_completed,
  application_status,
  status,
  is_approved,
  assigned_tradesperson_id,
  completed_at,
  completed_by,
  created_at
FROM jobs 
ORDER BY created_at DESC;

-- 2. Check specifically for completed jobs that might still be showing as available
SELECT 
  id,
  trade,
  job_description,
  is_completed,
  application_status,
  status,
  is_approved
FROM jobs 
WHERE is_completed = true 
  AND (application_status = 'open' OR application_status = 'in_progress');

-- 3. Check for jobs that should be completed but aren't marked as such
SELECT 
  id,
  trade,
  job_description,
  is_completed,
  application_status,
  status,
  completed_at,
  completed_by
FROM jobs 
WHERE completed_at IS NOT NULL 
  AND is_completed = false;

-- 4. Fix any completed jobs that don't have the correct status
UPDATE jobs 
SET 
  is_completed = true,
  application_status = 'closed'
WHERE completed_at IS NOT NULL 
  AND is_completed = false;

-- 5. Fix any jobs marked as completed but with wrong application_status
UPDATE jobs 
SET application_status = 'closed'
WHERE is_completed = true 
  AND application_status != 'closed';

-- 6. Verify the fix - check all completed jobs
SELECT 
  id,
  trade,
  job_description,
  is_completed,
  application_status,
  completed_at,
  completed_by
FROM jobs 
WHERE is_completed = true;

-- 7. Check that no completed jobs are showing as available
SELECT 
  id,
  trade,
  job_description,
  is_completed,
  application_status
FROM jobs 
WHERE is_completed = true 
  AND application_status = 'open';

-- This should return 0 rows if everything is fixed correctly 