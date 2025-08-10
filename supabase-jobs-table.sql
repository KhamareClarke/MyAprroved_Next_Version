-- Create jobs table with admin approval system
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  trade VARCHAR(100) NOT NULL,
  job_description TEXT NOT NULL,
  postcode VARCHAR(20) NOT NULL,
  budget DECIMAL(10,2),
  budget_type VARCHAR(20) DEFAULT 'fixed', -- 'fixed' or 'hourly'
  images TEXT[], -- Array of image URLs
  preferred_date DATE,
  preferred_time VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed'
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID, -- Admin who approved the job
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_postcode ON jobs(postcode);
CREATE INDEX IF NOT EXISTS idx_jobs_trade ON jobs(trade);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

-- Add RLS policies
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Clients can view their own jobs
CREATE POLICY "Clients can view own jobs" ON jobs
  FOR SELECT USING (auth.uid()::text = client_id::text);

-- Clients can insert their own jobs
CREATE POLICY "Clients can insert own jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid()::text = client_id::text);

-- Clients can update their own jobs (but not approval status)
CREATE POLICY "Clients can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid()::text = client_id::text);

-- Admin can view all jobs
CREATE POLICY "Admin can view all jobs" ON jobs
  FOR ALL USING (true);

-- Insert sample data
INSERT INTO jobs (client_id, trade, job_description, postcode, budget, budget_type, preferred_date, status, is_approved)
SELECT 
  c.id,
  'Plumbing',
  'Need a plumber to fix a leaking tap in the kitchen',
  'SW1A 1AA',
  150.00,
  'fixed',
  CURRENT_DATE + INTERVAL '7 days',
  'pending',
  FALSE
FROM clients c 
LIMIT 1;

INSERT INTO jobs (client_id, trade, job_description, postcode, budget, budget_type, preferred_date, status, is_approved)
SELECT 
  c.id,
  'Electrical',
  'Install new light fixtures in living room',
  'W1A 1AA',
  200.00,
  'fixed',
  CURRENT_DATE + INTERVAL '5 days',
  'pending',
  FALSE
FROM clients c 
LIMIT 1;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 