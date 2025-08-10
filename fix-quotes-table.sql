-- Fix quotes table structure
-- Run this in your Supabase SQL Editor

-- First, let's check what columns exist in quote_requests
SELECT 'Current quote_requests columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'quote_requests' 
ORDER BY ordinal_position;

-- Drop the quotes table if it exists with wrong structure
DROP TABLE IF EXISTS quotes CASCADE;

-- Create quotes table with correct structure
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_request_id UUID NOT NULL,
    tradesperson_id UUID NOT NULL,
    quote_amount DECIMAL(10,2) NOT NULL,
    quote_description TEXT NOT NULL,
    estimated_duration VARCHAR(100),
    terms_and_conditions TEXT,
    status VARCHAR(50) DEFAULT 'pending_client_approval',
    client_approved_at TIMESTAMP WITH TIME ZONE,
    client_rejected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Add foreign key constraints
    CONSTRAINT fk_quotes_quote_request 
        FOREIGN KEY (quote_request_id) 
        REFERENCES quote_requests(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_quotes_tradesperson 
        FOREIGN KEY (tradesperson_id) 
        REFERENCES tradespeople(id) 
        ON DELETE CASCADE
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_request_id UUID NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('client', 'tradesperson')),
    sender_id VARCHAR(255), -- client email or tradesperson id
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Add foreign key constraint
    CONSTRAINT fk_chat_messages_quote_request 
        FOREIGN KEY (quote_request_id) 
        REFERENCES quote_requests(id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotes_quote_request_id ON quotes(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_quotes_tradesperson_id ON quotes(tradesperson_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_quote_request_id ON chat_messages(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Add RLS policies for quotes table
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow tradespeople to view their own quotes" ON quotes;
DROP POLICY IF EXISTS "Allow tradespeople to insert their own quotes" ON quotes;
DROP POLICY IF EXISTS "Allow clients to view quotes for their requests" ON quotes;

-- Create new policies
CREATE POLICY "Allow tradespeople to view their own quotes" ON quotes
FOR SELECT USING (auth.uid()::text = tradesperson_id::text);

CREATE POLICY "Allow tradespeople to insert their own quotes" ON quotes
FOR INSERT WITH CHECK (auth.uid()::text = tradesperson_id::text);

CREATE POLICY "Allow clients to view quotes for their requests" ON quotes
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM quote_requests 
        WHERE quote_requests.id = quotes.quote_request_id 
        AND quote_requests.customer_email = auth.jwt() ->> 'email'
    )
);

-- Add RLS policies for chat_messages table
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow tradespeople to view chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow tradespeople to insert chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow clients to view chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow clients to insert chat messages" ON chat_messages;

-- Create new policies
CREATE POLICY "Allow tradespeople to view chat messages" ON chat_messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM quote_requests 
        WHERE quote_requests.id = chat_messages.quote_request_id 
        AND quote_requests.tradesperson_id::text = auth.uid()::text
        AND quote_requests.chat_enabled = true
    )
);

CREATE POLICY "Allow tradespeople to insert chat messages" ON chat_messages
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM quote_requests 
        WHERE quote_requests.id = chat_messages.quote_request_id 
        AND quote_requests.tradesperson_id::text = auth.uid()::text
        AND quote_requests.chat_enabled = true
        AND chat_messages.sender_type = 'tradesperson'
    )
);

CREATE POLICY "Allow clients to view chat messages" ON chat_messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM quote_requests 
        WHERE quote_requests.id = chat_messages.quote_request_id 
        AND quote_requests.customer_email = auth.jwt() ->> 'email'
        AND quote_requests.chat_enabled = true
    )
);

CREATE POLICY "Allow clients to insert chat messages" ON chat_messages
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM quote_requests 
        WHERE quote_requests.id = chat_messages.quote_request_id 
        AND quote_requests.customer_email = auth.jwt() ->> 'email'
        AND quote_requests.chat_enabled = true
        AND chat_messages.sender_type = 'client'
    )
);

-- Verify the tables were created correctly
SELECT 'quotes table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'quotes' 
ORDER BY ordinal_position;

SELECT 'chat_messages table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
ORDER BY ordinal_position; 