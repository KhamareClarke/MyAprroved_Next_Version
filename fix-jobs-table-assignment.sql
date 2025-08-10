-- Add assignment tracking to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS assigned_by VARCHAR(20), -- 'client' or 'admin'
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;

-- Create index for assignment tracking
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_by ON jobs(assigned_by);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_at ON jobs(assigned_at);

-- Update existing in_progress jobs to have assigned_by if missing
UPDATE jobs 
SET assigned_by = 'admin' 
WHERE application_status = 'in_progress' 
AND assigned_by IS NULL; 