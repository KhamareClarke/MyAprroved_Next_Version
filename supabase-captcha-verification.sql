-- Add captcha verification fields to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS captcha_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS captcha_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS captcha_locked_until TIMESTAMP WITH TIME ZONE;

-- Create index for captcha code
CREATE INDEX IF NOT EXISTS idx_clients_captcha_code ON clients(captcha_code);

-- Create function to verify captcha code
CREATE OR REPLACE FUNCTION verify_captcha_code(client_email VARCHAR, code VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    stored_code VARCHAR(10);
    attempts INTEGER;
    locked_until TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get stored captcha data
    SELECT captcha_code, captcha_attempts, captcha_locked_until 
    INTO stored_code, attempts, locked_until
    FROM clients 
    WHERE email = client_email;
    
    -- Check if account is locked
    IF locked_until IS NOT NULL AND locked_until > NOW() THEN
        RETURN FALSE;
    END IF;
    
    -- Check if code matches
    IF stored_code = code THEN
        -- Mark as verified and clear captcha data
        UPDATE clients 
        SET 
            is_verified = TRUE,
            email_verified_at = NOW(),
            captcha_code = NULL,
            captcha_attempts = 0,
            captcha_locked_until = NULL
        WHERE email = client_email;
        
        RETURN TRUE;
    ELSE
        -- Increment attempts
        UPDATE clients 
        SET 
            captcha_attempts = attempts + 1,
            captcha_locked_until = CASE 
                WHEN attempts + 1 >= 3 THEN NOW() + INTERVAL '15 minutes'
                ELSE NULL
            END
        WHERE email = client_email;
        
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate new captcha code
CREATE OR REPLACE FUNCTION generate_new_captcha_code(client_email VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    new_code VARCHAR(10);
BEGIN
    -- Generate 3-digit code
    new_code := LPAD(FLOOR(RANDOM() * 900 + 100)::TEXT, 3, '0');
    
    -- Update client with new code
    UPDATE clients 
    SET 
        captcha_code = new_code,
        captcha_attempts = 0,
        captcha_locked_until = NULL,
        verification_sent_at = NOW()
    WHERE email = client_email;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policy for captcha verification
CREATE POLICY "Allow captcha verification" ON clients
    FOR UPDATE USING (captcha_code IS NOT NULL);

-- Create verification status view
CREATE OR REPLACE VIEW client_verification_status AS
SELECT 
    id,
    email,
    first_name,
    is_verified,
    email_verified_at,
    verification_sent_at,
    captcha_attempts,
    captcha_locked_until,
    CASE 
        WHEN is_verified THEN 'Verified'
        WHEN captcha_locked_until IS NOT NULL AND captcha_locked_until > NOW() THEN 'Locked'
        WHEN verification_sent_at IS NOT NULL THEN 'Pending Verification'
        ELSE 'Not Verified'
    END as verification_status
FROM clients; 