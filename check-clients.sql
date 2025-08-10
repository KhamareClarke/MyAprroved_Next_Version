-- Check if there are any clients in the table
-- Run this first to see what clients exist

-- Count total clients
SELECT COUNT(*) as total_clients FROM clients;

-- Show all clients
SELECT 
    id,
    email,
    first_name,
    last_name,
    is_verified,
    is_active,
    created_at
FROM clients
ORDER BY created_at DESC;

-- Check if the test user exists
SELECT 
    id,
    email,
    first_name,
    last_name,
    is_verified
FROM clients 
WHERE email = 'fizasaif0233@gmail.com'; 