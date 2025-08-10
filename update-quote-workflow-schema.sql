-- Update quote_requests table for the complete workflow
-- Run this in your Supabase SQL Editor

-- Add new columns to quote_requests table
ALTER TABLE quote_requests 
ADD COLUMN IF NOT EXISTS admin_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_rejected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tradesperson_quoted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tradesperson_quoted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS client_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS client_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS chat_enabled BOOLEAN DEFAULT FALSE;

-- Create quotes table for tradesperson responses
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_request_id UUID REFERENCES quote_requests(id) ON DELETE CASCADE,
    tradesperson_id UUID REFERENCES tradespeople(id) ON DELETE CASCADE,
    quote_amount DECIMAL(10,2) NOT NULL,
    quote_description TEXT NOT NULL,
    estimated_duration VARCHAR(100),
    terms_and_conditions TEXT,
    status VARCHAR(50) DEFAULT 'pending_client_approval',
    client_approved_at TIMESTAMP WITH TIME ZONE,
    client_rejected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table for client-tradesperson communication
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_request_id UUID REFERENCES quote_requests(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('client', 'tradesperson')),
    sender_id UUID, -- client email or tradesperson id
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_tradesperson_id ON quote_requests(tradesperson_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_customer_email ON quote_requests(customer_email);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_request_id ON quotes(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_quotes_tradesperson_id ON quotes(tradesperson_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_quote_request_id ON chat_messages(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Add RLS policies for quotes table
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

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

-- Update existing quote_requests to have the new status
UPDATE quote_requests 
SET status = 'pending_admin_approval' 
WHERE status = 'pending';

-- Verify the changes
SELECT 'quote_requests columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'quote_requests' 
ORDER BY ordinal_position;

SELECT 'quotes table created:' as info;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'quotes'
);

SELECT 'chat_messages table created:' as info;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'chat_messages'
); 