-- Create quote_requests and messages tables
-- Run this in your Supabase SQL Editor

-- Create quote_requests table
CREATE TABLE IF NOT EXISTS quote_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tradesperson_id UUID NOT NULL REFERENCES tradespeople(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    project_type VARCHAR(100),
    project_description TEXT NOT NULL,
    location VARCHAR(500) NOT NULL,
    timeframe VARCHAR(100),
    budget_range VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'quoted', 'accepted', 'declined'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tradesperson_id UUID NOT NULL REFERENCES tradespeople(id) ON DELETE CASCADE,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    sender_phone VARCHAR(50),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    urgency VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'emergency'
    status VARCHAR(20) DEFAULT 'unread', -- 'unread', 'read', 'replied'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quote_requests_tradesperson ON quote_requests(tradesperson_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created ON quote_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_tradesperson ON messages(tradesperson_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_urgency ON messages(urgency);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quote_requests
CREATE POLICY "Anyone can create quote requests" ON quote_requests
FOR INSERT WITH CHECK (true);

CREATE POLICY "Tradespeople can view their quote requests" ON quote_requests
FOR SELECT USING (auth.uid()::text = tradesperson_id::text);

CREATE POLICY "Tradespeople can update their quote requests" ON quote_requests
FOR UPDATE USING (auth.uid()::text = tradesperson_id::text);

-- Create RLS policies for messages
CREATE POLICY "Anyone can create messages" ON messages
FOR INSERT WITH CHECK (true);

CREATE POLICY "Tradespeople can view their messages" ON messages
FOR SELECT USING (auth.uid()::text = tradesperson_id::text);

CREATE POLICY "Tradespeople can update their messages" ON messages
FOR UPDATE USING (auth.uid()::text = tradesperson_id::text);

-- Verify tables were created
SELECT 'Quote requests table:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'quote_requests' 
ORDER BY ordinal_position;

SELECT 'Messages table:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;