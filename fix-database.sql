-- Fix the clients table structure
-- First, let's see what columns exist and add the password column

-- Add password_hash column if it doesn't exist
ALTER TABLE clients ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Update existing records to have a default password
UPDATE clients SET password_hash = 'password123' WHERE password_hash IS NULL;

-- Make sure the password_hash column is not null
ALTER TABLE clients ALTER COLUMN password_hash SET NOT NULL;

-- Create index for faster login queries
CREATE INDEX IF NOT EXISTS idx_clients_email_password ON clients(email, password_hash);

-- Check if the table structure is correct
-- Let's also make sure all required columns exist
ALTER TABLE clients ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS postcode VARCHAR(20);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Insert a test user for testing
INSERT INTO clients (email, password_hash, first_name, last_name, phone, postcode, address, is_verified, is_active) 
VALUES 
('fizasaif0233@gmail.com', 'mehrmah098!F', 'Fiza', 'Saif', '1234567890', 'SW1A 1AA', 'Test Address, London', true, true)
ON CONFLICT (email) DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    postcode = EXCLUDED.postcode,
    address = EXCLUDED.address,
    is_verified = EXCLUDED.is_verified,
    is_active = EXCLUDED.is_active;

-- Show the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position; 