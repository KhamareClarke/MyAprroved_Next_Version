-- First, create the UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: Trades (Tradesperson profiles)
CREATE TABLE trades (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  trade TEXT NOT NULL,
  company_name TEXT NOT NULL,
  postcode TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Table 2: Documents (For qualification and insurance documents)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL, -- insurance, qualification
  file_path TEXT NOT NULL,
  doc_number TEXT,        -- For qualification number
  upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ, -- For insurance expiry
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Table 3: Jobs (For job listings and leads)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  trade_type TEXT NOT NULL,
  postcode TEXT NOT NULL,
  budget DECIMAL(10, 2),
  status TEXT NOT NULL DEFAULT 'open', -- open, assigned, completed, cancelled
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Create RLS (Row Level Security) Policies
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Trade profiles: allow users to read their own profiles
CREATE POLICY "Users can view own trade profile" 
  ON trades FOR SELECT 
  USING (auth.uid() = id);

-- Admin can view all trade profiles (you'll need to set up admin role)
CREATE POLICY "Admins can view all trade profiles" 
  ON trades FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Documents: allow users to read their own documents
CREATE POLICY "Users can view own documents" 
  ON documents FOR SELECT 
  USING (auth.uid() = trade_id);

-- Jobs: allow all users to view open jobs
CREATE POLICY "Everyone can view open jobs" 
  ON jobs FOR SELECT 
  USING (status = 'open');

-- Jobs: allow users to view their own jobs
CREATE POLICY "Users can view own jobs" 
  ON jobs FOR SELECT 
  USING (auth.uid() = customer_id);

-- Storage setup instructions (to be run in separate steps)
-- 1. Create a storage bucket for documents
-- SELECT create_bucket('documents');
-- 
-- 2. Set up storage policies for the documents bucket
-- CREATE POLICY "Users can upload their own documents" 
--   ON storage.objects FOR INSERT 
--   WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
-- 
-- CREATE POLICY "Users can read their own documents" 
--   ON storage.objects FOR SELECT 
--   USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
