-- Fix the jobs table to work with your client table structure
-- Your clients table has 'id' as the primary key, so this should work

-- First, let's check if the jobs table exists and drop it if needed
DROP TABLE IF EXISTS jobs CASCADE;

-- Create jobs table with correct foreign key reference
CREATE TABLE jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    trade VARCHAR(100) NOT NULL,
    job_description TEXT NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    budget DECIMAL(10,2),
    budget_type VARCHAR(20) DEFAULT 'fixed', -- 'fixed', 'hourly', 'negotiable'
    images TEXT[], -- Array of image URLs
    preferred_date DATE,
    preferred_time VARCHAR(50), -- 'morning', 'afternoon', 'evening', 'any'
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'completed', 'cancelled'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_postcode ON jobs(postcode);
CREATE INDEX idx_jobs_trade ON jobs(trade);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (we'll handle authentication in the app logic)
-- Allow all operations for now (we'll secure this in the API routes)
CREATE POLICY "Allow all operations" ON jobs FOR ALL USING (true);

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

-- Insert sample jobs for testing (only if clients exist)
-- This will insert sample jobs for the first client found in the database
INSERT INTO jobs (client_id, trade, job_description, postcode, budget, budget_type, preferred_date, preferred_time, status) 
SELECT 
    c.id,
    'Plumbing',
    'Need a plumber to fix a leaking tap in the kitchen. The tap has been dripping for a week now.',
    'SW1A 1AA',
    150.00,
    'fixed',
    '2024-01-15',
    'morning',
    'open'
FROM clients c
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO jobs (client_id, trade, job_description, postcode, budget, budget_type, preferred_date, preferred_time, status) 
SELECT 
    c.id,
    'Electrical',
    'Looking for an electrician to install new LED lights in the living room. Need about 6 recessed lights.',
    'SW1A 1AA',
    300.00,
    'fixed',
    '2024-01-20',
    'afternoon',
    'open'
FROM clients c
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO jobs (client_id, trade, job_description, postcode, budget, budget_type, preferred_date, preferred_time, status) 
SELECT 
    c.id,
    'Carpentry',
    'Need a carpenter to build custom bookshelves in the study room. Looking for something modern and functional.',
    'SW1A 1AA',
    800.00,
    'fixed',
    '2024-01-25',
    'any',
    'open'
FROM clients c
LIMIT 1
ON CONFLICT DO NOTHING;

-- Show the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
ORDER BY ordinal_position; 