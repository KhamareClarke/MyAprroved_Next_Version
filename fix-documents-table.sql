-- Fix documents table to reference tradespeople instead of trades
-- First, drop the existing documents table if it exists
DROP TABLE IF EXISTS documents;

-- Create documents table with correct reference to tradespeople
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_id UUID NOT NULL REFERENCES tradespeople(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL, -- insurance, qualification
  file_path TEXT NOT NULL,
  doc_number TEXT,        -- For qualification number
  upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ, -- For insurance expiry
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Documents: allow users to read their own documents
CREATE POLICY "Users can view own documents" 
  ON documents FOR SELECT 
  USING (auth.uid()::text = trade_id::text);

-- Documents: allow users to insert their own documents
CREATE POLICY "Users can insert own documents" 
  ON documents FOR INSERT 
  WITH CHECK (auth.uid()::text = trade_id::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_trade_id ON documents(trade_id);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status); 