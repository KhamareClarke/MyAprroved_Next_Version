-- Add application and quotation support to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS assigned_tradesperson_id UUID REFERENCES tradespeople(id),
ADD COLUMN IF NOT EXISTS application_status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'completed'
ADD COLUMN IF NOT EXISTS quotation_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS quotation_notes TEXT,
ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create applications table to track multiple applications
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  tradesperson_id UUID REFERENCES tradespeople(id) ON DELETE CASCADE,
  quotation_amount DECIMAL(10,2),
  quotation_notes TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(job_id, tradesperson_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_tradesperson ON jobs(assigned_tradesperson_id);
CREATE INDEX IF NOT EXISTS idx_jobs_application_status ON jobs(application_status);
CREATE INDEX IF NOT EXISTS idx_jobs_postcode ON jobs(postcode);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_tradesperson_id ON job_applications(tradesperson_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

-- Add RLS policies for job applications
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Tradespeople can view their own applications
CREATE POLICY "Tradespeople can view own applications" ON job_applications
  FOR SELECT USING (auth.uid()::text = tradesperson_id::text);

-- Tradespeople can insert their own applications
CREATE POLICY "Tradespeople can insert own applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid()::text = tradesperson_id::text);

-- Clients can view applications for their jobs
CREATE POLICY "Clients can view job applications" ON job_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_applications.job_id 
      AND jobs.client_id::text = auth.uid()::text
    )
  );

-- Admin can view all applications
CREATE POLICY "Admin can view all applications" ON job_applications
  FOR ALL USING (true); 