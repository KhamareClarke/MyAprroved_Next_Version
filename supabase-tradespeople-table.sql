-- Create tradespeople table with all required fields and document uploads
CREATE TABLE IF NOT EXISTS tradespeople (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    postcode VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    
    -- Trade information
    trade VARCHAR(100) NOT NULL,
    years_experience INTEGER,
    hourly_rate DECIMAL(10,2),
    
    -- Required documents
    id_document_url VARCHAR(500), -- ID document upload
    insurance_document_url VARCHAR(500), -- Insurance document upload
    qualifications_document_url VARCHAR(500), -- Proof of qualifications upload
    trade_card_url VARCHAR(500), -- Trade card (required for Plumbers, Electricians, Aircon Engineers)
    
    -- Document verification status
    id_verified BOOLEAN DEFAULT false,
    insurance_verified BOOLEAN DEFAULT false,
    qualifications_verified BOOLEAN DEFAULT false,
    trade_card_verified BOOLEAN DEFAULT false,
    
    -- Account status
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_approved BOOLEAN DEFAULT false, -- Admin approval required
    
    -- Verification and security
    verification_token VARCHAR(255),
    verification_sent_at TIMESTAMP WITH TIME ZONE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    captcha_code VARCHAR(10),
    captcha_attempts INTEGER DEFAULT 0,
    captcha_locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add verification columns for email verification
ALTER TABLE tradespeople
ADD COLUMN IF NOT EXISTS verification_token varchar,
ADD COLUMN IF NOT EXISTS verification_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS email_verified_at timestamp with time zone;

-- If creating table from scratch, add these columns in the CREATE TABLE statement as well.

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tradespeople_email ON tradespeople(email);
CREATE INDEX IF NOT EXISTS idx_tradespeople_trade ON tradespeople(trade);
CREATE INDEX IF NOT EXISTS idx_tradespeople_postcode ON tradespeople(postcode);
CREATE INDEX IF NOT EXISTS idx_tradespeople_city ON tradespeople(city);
CREATE INDEX IF NOT EXISTS idx_tradespeople_is_approved ON tradespeople(is_approved);
CREATE INDEX IF NOT EXISTS idx_tradespeople_is_active ON tradespeople(is_active);

-- Enable Row Level Security
ALTER TABLE tradespeople ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Tradespeople can view their own profile
CREATE POLICY "Tradespeople can view own profile" ON tradespeople
    FOR SELECT USING (auth.uid()::text = id::text);

-- Tradespeople can update their own profile
CREATE POLICY "Tradespeople can update own profile" ON tradespeople
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Allow insert for registration
CREATE POLICY "Allow tradesperson registration" ON tradespeople
    FOR INSERT WITH CHECK (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_tradespeople_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tradespeople_updated_at 
    BEFORE UPDATE ON tradespeople 
    FOR EACH ROW 
    EXECUTE FUNCTION update_tradespeople_updated_at();

-- Insert sample tradesperson for testing
INSERT INTO tradespeople (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    phone, 
    postcode, 
    city, 
    trade, 
    years_experience, 
    hourly_rate,
    is_verified,
    is_active,
    is_approved
) VALUES (
    'tradesperson@example.com',
    'password123',
    'John',
    'Smith',
    '07700900123',
    'SW1A 1AA',
    'London',
    'Plumbing',
    5,
    45.00,
    true,
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Show the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tradespeople' 
ORDER BY ordinal_position; 