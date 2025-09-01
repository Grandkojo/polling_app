-- Polling App Database Schema
-- This file contains all the database objects needed for the polling application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLES
-- =====================================================

-- Polls table
CREATE TABLE IF NOT EXISTS polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
  description TEXT CHECK (length(description) <= 1000),
  is_public BOOLEAN DEFAULT true,
  allow_multiple_votes BOOLEAN DEFAULT false,
  allow_anonymous_votes BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll options table
CREATE TABLE IF NOT EXISTS poll_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL CHECK (length(text) >= 1 AND length(text) <= 200),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, text)
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Prevent duplicate votes per user per option (if user is logged in)
  CONSTRAINT unique_user_vote UNIQUE(poll_id, user_id, option_id) DEFERRABLE INITIALLY DEFERRED
);

-- Poll sharing/access tracking
CREATE TABLE IF NOT EXISTS poll_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  share_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON polls(created_by);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_polls_is_public ON polls(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_polls_expires_at ON polls(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_order ON poll_options(poll_id, order_index);

CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_option_id ON votes(option_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at);
CREATE INDEX IF NOT EXISTS idx_votes_ip_address ON votes(ip_address);

CREATE INDEX IF NOT EXISTS idx_poll_shares_poll_id ON poll_shares(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_shares_share_code ON poll_shares(share_code);
CREATE INDEX IF NOT EXISTS idx_poll_shares_expires_at ON poll_shares(expires_at) WHERE expires_at IS NOT NULL;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a poll is expired
CREATE OR REPLACE FUNCTION is_poll_expired(poll_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM polls 
    WHERE id = poll_uuid 
    AND expires_at IS NOT NULL 
    AND expires_at < NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check vote rate limiting (1 vote per minute per IP)
CREATE OR REPLACE FUNCTION check_vote_rate_limit(
  poll_uuid UUID,
  user_ip INET,
  user_uuid UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- If user is logged in, check by user_id
  IF user_uuid IS NOT NULL THEN
    RETURN NOT EXISTS (
      SELECT 1 FROM votes 
      WHERE poll_id = poll_uuid 
      AND user_id = user_uuid 
      AND created_at > NOW() - INTERVAL '1 minute'
    );
  END IF;
  
  -- Otherwise check by IP address
  RETURN NOT EXISTS (
    SELECT 1 FROM votes 
    WHERE poll_id = poll_uuid 
    AND ip_address = user_ip 
    AND created_at > NOW() - INTERVAL '1 minute'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get poll results with vote counts
CREATE OR REPLACE FUNCTION get_poll_results(poll_uuid UUID)
RETURNS TABLE (
  option_id UUID,
  option_text TEXT,
  vote_count BIGINT,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    po.id as option_id,
    po.text as option_text,
    COUNT(v.id) as vote_count,
    CASE 
      WHEN total_votes.total = 0 THEN 0
      ELSE ROUND((COUNT(v.id)::NUMERIC / total_votes.total::NUMERIC) * 100, 2)
    END as percentage
  FROM poll_options po
  LEFT JOIN votes v ON po.id = v.option_id
  CROSS JOIN (
    SELECT COUNT(*) as total 
    FROM votes 
    WHERE poll_id = poll_uuid
  ) total_votes
  WHERE po.poll_id = poll_uuid
  GROUP BY po.id, po.text, total_votes.total
  ORDER BY po.order_index, po.text;
END;
$$ LANGUAGE plpgsql;

-- Function to generate a unique share code
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
  share_code TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    -- Generate a 8-character alphanumeric code
    share_code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if it's unique
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM poll_shares WHERE share_code = share_code
    );
    
    counter := counter + 1;
    -- Prevent infinite loop
    IF counter > 100 THEN
      RAISE EXCEPTION 'Unable to generate unique share code after 100 attempts';
    END IF;
  END LOOP;
  
  RETURN share_code;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to automatically update updated_at column
CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON polls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_shares ENABLE ROW LEVEL SECURITY;

-- Polls policies
CREATE POLICY "Public polls are viewable by everyone" ON polls
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own polls" ON polls
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create polls" ON polls
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own polls" ON polls
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own polls" ON polls
  FOR DELETE USING (created_by = auth.uid());

-- Poll options policies
CREATE POLICY "Poll options are viewable for public polls" ON poll_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_options.poll_id 
      AND polls.is_public = true
    )
  );

CREATE POLICY "Users can view options for their own polls" ON poll_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_options.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create options for their own polls" ON poll_options
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_options.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update options for their own polls" ON poll_options
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_options.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete options for their own polls" ON poll_options
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_options.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

-- Votes policies
CREATE POLICY "Votes are viewable for public polls" ON votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = votes.poll_id 
      AND polls.is_public = true
    )
  );

CREATE POLICY "Users can view votes for their own polls" ON votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = votes.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

CREATE POLICY "Anyone can vote on public polls" ON votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = votes.poll_id 
      AND polls.is_public = true
      AND (polls.expires_at IS NULL OR polls.expires_at > NOW())
    )
  );

-- Poll shares policies
CREATE POLICY "Share codes are viewable by everyone" ON poll_shares
  FOR SELECT USING (true);

CREATE POLICY "Users can create share codes for their own polls" ON poll_shares
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_shares.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own share codes" ON poll_shares
  FOR DELETE USING (created_by = auth.uid());

-- =====================================================
-- VIEWS
-- =====================================================

-- View for poll statistics
CREATE OR REPLACE VIEW poll_stats AS
SELECT 
  p.id as poll_id,
  p.title,
  p.description,
  p.is_public,
  p.allow_multiple_votes,
  p.allow_anonymous_votes,
  p.expires_at,
  p.created_by,
  p.created_at,
  p.updated_at,
  COUNT(DISTINCT po.id) as option_count,
  COUNT(v.id) as total_votes,
  COUNT(DISTINCT v.user_id) as unique_voters,
  CASE 
    WHEN p.expires_at IS NOT NULL AND p.expires_at < NOW() THEN true
    ELSE false
  END as is_expired
FROM polls p
LEFT JOIN poll_options po ON p.id = po.poll_id
LEFT JOIN votes v ON p.id = v.poll_id
GROUP BY p.id, p.title, p.description, p.is_public, p.allow_multiple_votes, 
         p.allow_anonymous_votes, p.expires_at, p.created_by, p.created_at, p.updated_at;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample polls (uncomment and modify as needed)
/*
INSERT INTO polls (title, description, created_by) VALUES
('What is your favorite programming language?', 'Choose the language you enjoy working with most', 'your-user-id-here'),
('Which framework do you prefer?', 'Select your go-to web development framework', 'your-user-id-here');

INSERT INTO poll_options (poll_id, text, order_index) VALUES
((SELECT id FROM polls WHERE title = 'What is your favorite programming language?'), 'JavaScript', 1),
((SELECT id FROM polls WHERE title = 'What is your favorite programming language?'), 'Python', 2),
((SELECT id FROM polls WHERE title = 'What is your favorite programming language?'), 'TypeScript', 3),
((SELECT id FROM polls WHERE title = 'What is your favorite programming language?'), 'Rust', 4),
((SELECT id FROM polls WHERE title = 'Which framework do you prefer?'), 'Next.js', 1),
((SELECT id FROM polls WHERE title = 'Which framework do you prefer?'), 'React', 2),
((SELECT id FROM polls WHERE title = 'Which framework do you prefer?'), 'Vue.js', 3),
((SELECT id FROM polls WHERE title = 'Which framework do you prefer?'), 'Angular', 4);
*/

