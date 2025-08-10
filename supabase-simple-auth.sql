-- Update clients table to use simple password authentication
-- Add password column if it doesn't exist
ALTER TABLE clients ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Update existing records to have a default password (for testing)
UPDATE clients SET password = 'password123' WHERE password IS NULL;

-- Make password required
ALTER TABLE clients ALTER COLUMN password SET NOT NULL;

-- Create index for faster login queries
CREATE INDEX IF NOT EXISTS idx_clients_email_password ON clients(email, password);

-- Sample data for testing (if no clients exist)
INSERT INTO clients (email, password, first_name, last_name, phone, postcode, address, is_verified, is_active) 
VALUES 
('test@example.com', 'password123', 'Test', 'User', '1234567890', 'SW1A 1AA', '10 Downing Street, London', true, true)
ON CONFLICT (email) DO NOTHING; 