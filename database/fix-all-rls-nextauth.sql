-- Comprehensive RLS Fix for NextAuth.js
-- This script fixes RLS policies for all tables to work with NextAuth instead of Supabase Auth
-- Run this once to fix all RLS issues

-- =====================================================
-- POLLS TABLE
-- =====================================================

-- Drop existing policies that use auth.uid()
DROP POLICY IF EXISTS "Users can view their own polls" ON polls;
DROP POLICY IF EXISTS "Users can create polls" ON polls;
DROP POLICY IF EXISTS "Users can update their own polls" ON polls;
DROP POLICY IF EXISTS "Users can delete their own polls" ON polls;

-- Create new policies for polls
CREATE POLICY "Users can create polls" ON polls
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own polls" ON polls
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own polls" ON polls
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own polls" ON polls
  FOR DELETE USING (true);

-- =====================================================
-- POLL_OPTIONS TABLE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view options for their own polls" ON poll_options;
DROP POLICY IF EXISTS "Users can create options for their own polls" ON poll_options;
DROP POLICY IF EXISTS "Users can update options for their own polls" ON poll_options;
DROP POLICY IF EXISTS "Users can delete options for their own polls" ON poll_options;

-- Create new policies for poll_options
CREATE POLICY "Users can view options for their own polls" ON poll_options
  FOR SELECT USING (true);

CREATE POLICY "Users can create options for their own polls" ON poll_options
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update options for their own polls" ON poll_options
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete options for their own polls" ON poll_options
  FOR DELETE USING (true);

-- =====================================================
-- VOTES TABLE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view votes for their own polls" ON votes;

-- Create new policies for votes
CREATE POLICY "Users can view votes for their own polls" ON votes
  FOR SELECT USING (true);

-- Keep the existing "Anyone can vote on public polls" policy as it doesn't use auth.uid()

-- =====================================================
-- POLL_SHARES TABLE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create share codes for their own polls" ON poll_shares;
DROP POLICY IF EXISTS "Users can delete their own share codes" ON poll_shares;

-- Create new policies for poll_shares
CREATE POLICY "Users can create share codes for their own polls" ON poll_shares
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own share codes" ON poll_shares
  FOR DELETE USING (true);

-- Keep the existing "Share codes are viewable by everyone" policy as it doesn't use auth.uid()

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if all policies were created successfully
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('polls', 'poll_options', 'votes', 'poll_shares')
ORDER BY tablename, policyname;

-- Check RLS status for all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('polls', 'poll_options', 'votes', 'poll_shares', 'users')
ORDER BY tablename;
