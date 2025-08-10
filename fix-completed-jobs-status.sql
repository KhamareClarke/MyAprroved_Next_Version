-- Fix completed jobs status: Set application_status to 'closed' for all completed jobs
-- This ensures completed jobs don't appear as available to any tradesperson

-- First, let's see what jobs are completed but not marked as closed
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
  AND application_status != 'closed';

-- Update all completed jobs to have application_status = 'closed'
UPDATE jobs 
SET application_status = 'closed'
WHERE is_completed = true 
  AND application_status != 'closed';

-- Verify the fix
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

-- Check that no completed jobs are showing as available
SELECT 
  id,
  trade,
  job_description,
  is_completed,
  application_status
FROM jobs 
WHERE is_completed = true 
  AND application_status = 'open';

-- This should return 0 rows if the fix worked correctly 