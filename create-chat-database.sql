-- Create chat system database structure with message persistence
-- This will enable real-time messaging between clients and tradespeople with database storage

-- Create chat_rooms table to manage conversations
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    tradesperson_id UUID REFERENCES tradespeople(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(job_id, client_id, tradesperson_id)
);

-- Create chat_messages table to store all messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('client', 'tradesperson')),
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_job_id ON chat_rooms(job_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_client_id ON chat_rooms(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_tradesperson_id ON chat_rooms(tradesperson_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_room_id ON chat_messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to create chat room when quotation is accepted
CREATE OR REPLACE FUNCTION create_chat_room_on_quotation_accept()
RETURNS TRIGGER AS $$
BEGIN
    -- When a job application is accepted, create a chat room
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        INSERT INTO chat_rooms (job_id, client_id, tradesperson_id)
        VALUES (
            NEW.job_id,
            (SELECT client_id FROM jobs WHERE id = NEW.job_id),
            NEW.tradesperson_id
        )
        ON CONFLICT (job_id, client_id, tradesperson_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically create chat room
CREATE TRIGGER trigger_create_chat_room
    AFTER UPDATE ON job_applications
    FOR EACH ROW EXECUTE FUNCTION create_chat_room_on_quotation_accept();

-- Verify the structure
SELECT 'chat_rooms' as table_name, COUNT(*) as row_count FROM chat_rooms
UNION ALL
SELECT 'chat_messages' as table_name, COUNT(*) as row_count FROM chat_messages; 