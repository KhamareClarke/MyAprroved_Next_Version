-- Add company_name column to tradespeople table
ALTER TABLE tradespeople 
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);

-- Update existing records to use city as company_name if company_name is null
UPDATE tradespeople 
SET company_name = city 
WHERE company_name IS NULL;

-- Make company_name NOT NULL after setting default values
ALTER TABLE tradespeople 
ALTER COLUMN company_name SET NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_tradespeople_company_name ON tradespeople(company_name); 