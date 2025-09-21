-- Migration: Ensure only one share code per poll
-- This migration adds a unique constraint to prevent multiple share codes for the same poll

-- Add unique constraint on poll_id in poll_shares table
-- This ensures only one share code per poll
ALTER TABLE poll_shares ADD CONSTRAINT unique_poll_share UNIQUE (poll_id);

-- Optional: Clean up existing duplicate share codes (keep the most recent one)
-- Uncomment the following if you want to clean up existing duplicates:

/*
WITH ranked_shares AS (
  SELECT 
    id,
    poll_id,
    share_code,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY poll_id ORDER BY created_at DESC) as rn
  FROM poll_shares
),
duplicates_to_delete AS (
  SELECT id 
  FROM ranked_shares 
  WHERE rn > 1
)
DELETE FROM poll_shares 
WHERE id IN (SELECT id FROM duplicates_to_delete);
*/

