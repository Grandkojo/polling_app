-- Share Feature Database Updates
-- This script adds necessary indexes and security policies for the share feature

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Add indexes for better performance on poll_shares table
CREATE INDEX IF NOT EXISTS idx_poll_shares_code ON poll_shares(share_code);
CREATE INDEX IF NOT EXISTS idx_poll_shares_poll_id ON poll_shares(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_shares_created_by ON poll_shares(created_by);
CREATE INDEX IF NOT EXISTS idx_poll_shares_expires_at ON poll_shares(expires_at);
CREATE INDEX IF NOT EXISTS idx_poll_shares_created_at ON poll_shares(created_at);

-- =====================================================
-- RATE LIMITING FUNCTION
-- =====================================================

-- Function to check share rate limiting
CREATE OR REPLACE FUNCTION check_share_rate_limit(
  user_uuid UUID,
  user_ip TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Allow max 10 share codes per user per hour
  RETURN NOT EXISTS (
    SELECT 1 FROM poll_shares 
    WHERE created_by = user_uuid 
    AND created_at > NOW() - INTERVAL '1 hour'
    HAVING COUNT(*) >= 10
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Share codes are viewable by everyone" ON poll_shares;
DROP POLICY IF EXISTS "Users can create share codes for their own polls" ON poll_shares;

-- Create new RLS policies for poll_shares table
CREATE POLICY "Share codes are viewable by everyone" ON poll_shares
  FOR SELECT USING (true);

CREATE POLICY "Users can create share codes for their own polls" ON poll_shares
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_shares.poll_id 
      AND polls.created_by = auth.uid()
      AND polls.is_public = true
    )
  );

CREATE POLICY "Users can view their own share codes" ON poll_shares
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own share codes" ON poll_shares
  FOR DELETE USING (created_by = auth.uid());

-- =====================================================
-- CLEANUP FUNCTION
-- =====================================================

-- Function to clean up expired share codes (can be run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_share_codes() RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM poll_shares 
  WHERE expires_at IS NOT NULL 
  AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEW FOR SHARE STATISTICS
-- =====================================================

-- Create a view for share statistics
CREATE OR REPLACE VIEW poll_share_stats AS
SELECT 
  p.id as poll_id,
  p.title,
  p.created_by,
  COUNT(ps.id) as share_count,
  MAX(ps.created_at) as last_shared,
  COUNT(CASE WHEN ps.expires_at IS NULL OR ps.expires_at > NOW() THEN 1 END) as active_shares
FROM polls p
LEFT JOIN poll_shares ps ON p.id = ps.poll_id
GROUP BY p.id, p.title, p.created_by;

-- Grant access to the view
GRANT SELECT ON poll_share_stats TO authenticated;
GRANT SELECT ON poll_share_stats TO anon;
