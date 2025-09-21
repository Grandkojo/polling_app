-- Migration: Add user roles to the polling app
-- This migration adds role management functionality

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');

-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- Add index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users to have 'user' role (this is the default, but being explicit)
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Create admin policies for role-based access
-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (id = auth.uid());

-- Admins can update user roles
CREATE POLICY "Admins can update user roles" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Users can update their own profile (except role)
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Add role-based policies for polls
-- Admins can view all polls
CREATE POLICY "Admins can view all polls" ON polls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admins can delete any poll
CREATE POLICY "Admins can delete any poll" ON polls
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Moderators can view all polls
CREATE POLICY "Moderators can view all polls" ON polls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'moderator'
    )
  );

-- Add role-based policies for votes
-- Admins can view all votes
CREATE POLICY "Admins can view all votes" ON votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Moderators can view all votes
CREATE POLICY "Moderators can view all votes" ON votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'moderator'
    )
  );

-- Add role-based policies for poll_shares
-- Admins can view all poll shares
CREATE POLICY "Admins can view all poll shares" ON poll_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Moderators can view all poll shares
CREATE POLICY "Moderators can view all poll shares" ON poll_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'moderator'
    )
  );

-- Create a function to check if user has admin role
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = user_uuid 
    AND users.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user has moderator role
CREATE OR REPLACE FUNCTION is_moderator(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = user_uuid 
    AND users.role IN ('moderator', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID DEFAULT auth.uid())
RETURNS user_role AS $$
DECLARE
  user_role_value user_role;
BEGIN
  SELECT role INTO user_role_value
  FROM users 
  WHERE users.id = user_uuid;
  
  RETURN COALESCE(user_role_value, 'user'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add sample admin user (optional - for testing)
-- Uncomment and modify as needed:
/*
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K8K8K8K', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';
*/


