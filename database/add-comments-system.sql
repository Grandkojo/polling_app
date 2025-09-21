-- Migration: Add Comments/Discussion System
-- This migration adds a comprehensive commenting system for polls

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested replies
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 1000),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment reactions table (likes/dislikes)
CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id) -- One reaction per user per comment
);

-- Comment reports table (for moderation)
CREATE TABLE IF NOT EXISTS comment_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL CHECK (length(reason) >= 1 AND length(reason) <= 500),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  moderator_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(comment_id, reporter_id) -- One report per user per comment
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_poll_id ON comments(poll_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_is_deleted ON comments(is_deleted) WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id ON comment_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_type ON comment_reactions(reaction_type);

CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id ON comment_reports(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_reporter_id ON comment_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_status ON comment_reports(status);
CREATE INDEX IF NOT EXISTS idx_comment_reports_moderator_id ON comment_reports(moderator_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_comments_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get comment with user info and reaction counts
CREATE OR REPLACE FUNCTION get_comments_with_details(poll_uuid UUID, current_user_uuid UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  poll_id UUID,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  parent_id UUID,
  content TEXT,
  is_deleted BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  like_count BIGINT,
  dislike_count BIGINT,
  user_reaction TEXT,
  reply_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.poll_id,
    c.user_id,
    u.name as user_name,
    u.email as user_email,
    c.parent_id,
    c.content,
    c.is_deleted,
    c.created_at,
    c.updated_at,
    COALESCE(like_counts.like_count, 0) as like_count,
    COALESCE(dislike_counts.dislike_count, 0) as dislike_count,
    user_reactions.reaction_type as user_reaction,
    COALESCE(reply_counts.reply_count, 0) as reply_count
  FROM comments c
  JOIN users u ON c.user_id = u.id
  LEFT JOIN (
    SELECT comment_id, COUNT(*) as like_count
    FROM comment_reactions
    WHERE reaction_type = 'like'
    GROUP BY comment_id
  ) like_counts ON c.id = like_counts.comment_id
  LEFT JOIN (
    SELECT comment_id, COUNT(*) as dislike_count
    FROM comment_reactions
    WHERE reaction_type = 'dislike'
    GROUP BY comment_id
  ) dislike_counts ON c.id = dislike_counts.comment_id
  LEFT JOIN (
    SELECT comment_id, reaction_type
    FROM comment_reactions
    WHERE user_id = current_user_uuid
  ) user_reactions ON c.id = user_reactions.comment_id
  LEFT JOIN (
    SELECT parent_id, COUNT(*) as reply_count
    FROM comments
    WHERE parent_id IS NOT NULL AND is_deleted = false
    GROUP BY parent_id
  ) reply_counts ON c.id = reply_counts.parent_id
  WHERE c.poll_id = poll_uuid AND c.is_deleted = false
  ORDER BY c.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update updated_at column
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reports ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Anyone can view comments on public polls" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = comments.poll_id 
      AND polls.is_public = true
    )
  );

CREATE POLICY "Users can view comments on their own polls" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = comments.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can view all comments" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Moderators can view all comments" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'moderator'
    )
  );

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = comments.poll_id 
      AND polls.is_public = true
    )
  );

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admins can delete any comment" ON comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Moderators can delete any comment" ON comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'moderator'
    )
  );

-- Comment reactions policies
CREATE POLICY "Anyone can view comment reactions" ON comment_reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reactions" ON comment_reactions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id = auth.uid()
  );

CREATE POLICY "Users can update their own reactions" ON comment_reactions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reactions" ON comment_reactions
  FOR DELETE USING (user_id = auth.uid());

-- Comment reports policies
CREATE POLICY "Users can view their own reports" ON comment_reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Admins can view all reports" ON comment_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Moderators can view all reports" ON comment_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'moderator'
    )
  );

CREATE POLICY "Authenticated users can create reports" ON comment_reports
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    reporter_id = auth.uid()
  );

CREATE POLICY "Admins can update reports" ON comment_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Moderators can update reports" ON comment_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'moderator'
    )
  );

