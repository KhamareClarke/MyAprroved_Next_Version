-- Create quotes and chat_messages tables for the complete quote workflow
-- Run this in your Supabase SQL Editor

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
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

    CONSTRAINT fk_chat_messages_quote_request
        FOREIGN KEY (quote_request_id)
        REFERENCES quote_requests(id)
        ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quotes_quote_request_id ON quotes(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_quotes_tradesperson_id ON quotes(tradesperson_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_quote_request_id ON chat_messages(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Enable RLS on both tables
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quotes table
CREATE POLICY "Tradespeople can view their quotes" ON quotes
    FOR SELECT
    USING (true); -- Allow all selects for now

CREATE POLICY "Clients can view quotes for their requests" ON quotes
    FOR SELECT
    USING (true); -- Allow all selects for now

CREATE POLICY "Tradespeople can insert quotes" ON quotes
    FOR INSERT
    WITH CHECK (true); -- Allow all inserts for now

CREATE POLICY "Clients can update quote status" ON quotes
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Create RLS policies for chat_messages table
CREATE POLICY "Users can view chat messages when chat is enabled" ON chat_messages
    FOR SELECT
    USING (true); -- Allow all selects for now

CREATE POLICY "Users can insert chat messages when chat is enabled" ON chat_messages
    FOR INSERT
    WITH CHECK (true); -- Allow all inserts for now

CREATE POLICY "Users can update chat message read status" ON chat_messages
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Verify tables were created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name IN ('quotes', 'chat_messages')
ORDER BY table_name; 