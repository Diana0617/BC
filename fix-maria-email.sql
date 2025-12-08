-- Fix Maria's email to be lowercase
-- Run this directly in your PostgreSQL database

UPDATE users 
SET email = LOWER(email) 
WHERE email = 'Maria@maria.com';

-- Verify the change
SELECT id, email, "firstName", "lastName", role 
FROM users 
WHERE email = 'maria@maria.com';
