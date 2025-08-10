-- Fix job status issue: Jobs should not be in_progress unless admin approved quotation
-- This script fixes any jobs that were incorrectly set to in_progress when tradesperson applied

-- First, let's see what jobs are incorrectly marked as in_progress
SELECT 
  j.id,
  j.trade,
  j.job_description,
  j.application_status,
  j.assigned_tradesperson_id,
  j.assigned_by,
  ja.status as application_status_in_table
FROM jobs j
LEFT JOIN job_applications ja ON j.id = ja.job_id AND j.assigned_tradesperson_id = ja.tradesperson_id
WHERE j.application_status = 'in_progress' 
  AND j.assigned_tradesperson_id IS NOT NULL
  AND (ja.status = 'pending' OR ja.status IS NULL);

-- Fix jobs that have pending applications but are marked as in_progress
UPDATE jobs 
SET 
  application_status = 'open',
  assigned_tradesperson_id = NULL,
  quotation_amount = NULL,
  quotation_notes = NULL,
  applied_at = NULL,
  assigned_by = NULL
WHERE id IN (
  SELECT j.id
  FROM jobs j
  LEFT JOIN job_applications ja ON j.id = ja.job_id AND j.assigned_tradesperson_id = ja.tradesperson_id
  WHERE j.application_status = 'in_progress' 
    AND j.assigned_tradesperson_id IS NOT NULL
    AND (ja.status = 'pending' OR ja.status IS NULL)
);

-- Verify the fix
SELECT 
  j.id,
  j.trade,
  j.job_description,
  j.application_status,
  j.assigned_tradesperson_id,
  j.assigned_by
FROM jobs j
WHERE j.application_status = 'in_progress'; 