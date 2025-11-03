-- Create Admin User
-- Password: admin123

-- First, check if user exists
DO $$
DECLARE
  admin_user_id UUID;
  admin_role_id UUID;
BEGIN
  -- Get admin role ID
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';

  -- Create user if not exists
  INSERT INTO users (email, name, password_hash, email_verified)
  VALUES (
    'admin@medical.com',
    'Admin User',
    '$2a$10$YourHashedPasswordHere', -- You'll need to hash 'admin123'
    true
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO admin_user_id;

  -- If user was just created, assign admin role
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin_user_id, admin_role_id)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Admin user created: %', admin_user_id;
  ELSE
    -- Get existing user ID
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@medical.com';

    -- Make sure they have admin role
    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin_user_id, admin_role_id)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Admin user already exists: %', admin_user_id;
  END IF;
END $$;

-- Verify
SELECT u.id, u.email, u.name, r.name as role
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'admin@medical.com';
