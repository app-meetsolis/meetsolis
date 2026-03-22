-- Check if user exists with this Clerk ID
SELECT id, clerk_id, email, name 
FROM users 
WHERE clerk_id = 'user_33QhgN9CtZujLdhKPP4Wl1nT9Qn';

-- Show all users to verify
SELECT id, clerk_id, email, name 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
