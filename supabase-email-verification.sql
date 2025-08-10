-- Add email verification fields to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;

-- Create index for verification token
CREATE INDEX IF NOT EXISTS idx_clients_verification_token ON clients(verification_token);

-- Create function to verify email
CREATE OR REPLACE FUNCTION verify_client_email(token VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE clients 
    SET 
        is_verified = TRUE,
        email_verified_at = NOW(),
        verification_token = NULL
    WHERE verification_token = token;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create function to resend verification email
CREATE OR REPLACE FUNCTION resend_verification_email(client_email VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    new_token VARCHAR(255);
BEGIN
    -- Generate new verification token
    new_token := encode(gen_random_bytes(32), 'hex');
    
    -- Update client with new token
    UPDATE clients 
    SET 
        verification_token = new_token,
        verification_sent_at = NOW()
    WHERE email = client_email;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policy for email verification
CREATE POLICY "Allow email verification" ON clients
    FOR UPDATE USING (verification_token IS NOT NULL);

-- Create verification status view
CREATE OR REPLACE VIEW client_verification_status AS
SELECT 
    id,
    email,
    is_verified,
    email_verified_at,
    verification_sent_at,
    CASE 
        WHEN is_verified THEN 'Verified'
        WHEN verification_sent_at IS NOT NULL THEN 'Pending Verification'
        ELSE 'Not Verified'
    END as verification_status
FROM clients; 