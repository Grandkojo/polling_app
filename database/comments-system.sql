-- Comments System Migration
-- This migration creates the comments table and related functionality

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested replies
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 1000),
  is_visible BOOLEAN DEFAULT TRUE,
  report_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_poll_id ON comments(poll_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments

-- Users can view all visible comments on public polls
CREATE POLICY "Users can view comments on public polls" ON comments
  FOR SELECT
  USING (
    is_visible = TRUE AND
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = comments.poll_id 
      AND polls.is_public = TRUE
    )
  );

-- Users can view comments on polls they created
CREATE POLICY "Users can view comments on their own polls" ON comments
  FOR SELECT
  USING (
    is_visible = TRUE AND
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = comments.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

-- Users can create comments on public polls
CREATE POLICY "Users can create comments on public polls" ON comments
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = comments.poll_id 
      AND polls.is_public = TRUE
    )
  );

-- Users can create comments on their own polls
CREATE POLICY "Users can create comments on their own polls" ON comments
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = comments.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE
  USING (user_id = auth.uid() AND is_visible = TRUE)
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE
  USING (user_id = auth.uid());

-- Admins and moderators can view all comments (including hidden)
CREATE POLICY "Admins can view all comments" ON comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'moderator')
    )
  );

-- Admins and moderators can update any comment (hide/show)
CREATE POLICY "Admins can update any comment" ON comments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'moderator')
    )
  );

-- Admins and moderators can delete any comment
CREATE POLICY "Admins can delete any comment" ON comments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'moderator')
    )
  );

-- Add comment count to polls table (optional optimization)
ALTER TABLE polls ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Create function to update comment count
CREATE OR REPLACE FUNCTION update_poll_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE polls 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.poll_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle visibility changes
    IF OLD.is_visible = TRUE AND NEW.is_visible = FALSE THEN
      UPDATE polls 
      SET comment_count = comment_count - 1 
      WHERE id = NEW.poll_id;
    ELSIF OLD.is_visible = FALSE AND NEW.is_visible = TRUE THEN
      UPDATE polls 
      SET comment_count = comment_count + 1 
      WHERE id = NEW.poll_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE polls 
    SET comment_count = comment_count - 1 
    WHERE id = OLD.poll_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update comment count
CREATE TRIGGER update_poll_comment_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_poll_comment_count();

-- Create comment reactions table
CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Create comment reports table
CREATE TABLE IF NOT EXISTS comment_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comment_reactions
CREATE POLICY "Users can view all reactions" ON comment_reactions
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can create reactions" ON comment_reactions
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own reactions" ON comment_reactions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own reactions" ON comment_reactions
  FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for comment_reports
CREATE POLICY "Users can create reports" ON comment_reports
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can view their own reports" ON comment_reports
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all reports" ON comment_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'moderator')
    )
  );

-- Create function to update comment report count
CREATE OR REPLACE FUNCTION update_comment_report_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments 
    SET report_count = report_count + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments 
    SET report_count = report_count - 1 
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update report count
CREATE TRIGGER update_comment_report_count_trigger
  AFTER INSERT OR DELETE ON comment_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_report_count();

-- Update existing polls with current comment count
UPDATE polls 
SET comment_count = (
  SELECT COUNT(*) 
  FROM comments 
  WHERE comments.poll_id = polls.id 
  AND comments.is_visible = TRUE
);

