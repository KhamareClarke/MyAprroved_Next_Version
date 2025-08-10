-- Create documents table for storing uploaded files
-- Run this in your Supabase SQL Editor

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trade_id UUID NOT NULL REFERENCES tradespeople(id) ON DELETE CASCADE,
    doc_type VARCHAR(50) NOT NULL, -- 'id', 'insurance', 'qualification', 'trade_card', 'profile_picture'
    file_path TEXT NOT NULL,
    doc_number VARCHAR(100), -- For qualification number, trade card number, etc.
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE, -- For insurance expiry
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_trade_id ON documents(trade_id);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON documents(upload_date);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Tradespeople can view their own documents
CREATE POLICY "Tradespeople can view own documents" ON documents
    FOR SELECT USING (auth.uid()::text = trade_id::text);

-- Tradespeople can insert their own documents
CREATE POLICY "Tradespeople can insert own documents" ON documents
    FOR INSERT WITH CHECK (auth.uid()::text = trade_id::text);

-- Tradespeople can update their own documents
CREATE POLICY "Tradespeople can update own documents" ON documents
    FOR UPDATE USING (auth.uid()::text = trade_id::text);

-- Allow insert for registration (when auth.uid() might not be set)
CREATE POLICY "Allow document upload during registration" ON documents
    FOR INSERT WITH CHECK (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_documents_updated_at();

-- Verify the table was created
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'documents'
ORDER BY ordinal_position;

-- Show table constraints
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'documents';

-- Count records (should be 0 initially)
SELECT COUNT(*) as total_documents FROM documents; 