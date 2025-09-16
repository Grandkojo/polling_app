'use server';

import { supabaseAdmin } from '@/lib/supabase/server';
import { generateShareUrl } from '@/lib/utils/share';

// Type-safe result type
type ActionResult<T = unknown> = { success: true } & T | { success: false; error: string };

// Helper function for logging errors
function logError(prefix: string, error: unknown): void {
  if (process.env.NODE_ENV !== 'test') {
    console.error(prefix, error);
  }
}

/**
 * Generate a share code for a poll
 */
export async function generateShareCode(
  pollId: string,
  userId: string,
  expiresAt?: string
): Promise<ActionResult<{ shareCode: string; shareUrl: string }>> {
  try {
    // Verify ownership
    const { data: poll, error: pollError } = await (supabaseAdmin as any)
      .from('polls')
      .select('created_by, is_public')
      .eq('id', pollId)
      .single();

    if (pollError) throw pollError;
    if (!poll) {
      return { success: false, error: 'Poll not found' };
    }

    if ((poll as any).created_by !== userId) {
      return { success: false, error: 'Unauthorized to share this poll' };
    }

    if (!(poll as any).is_public) {
      return { success: false, error: 'Only public polls can be shared' };
    }

    // Check rate limiting (max 10 share codes per user per hour)
    const { data: recentShares, error: rateLimitError } = await (supabaseAdmin as any)
      .from('poll_shares')
      .select('id')
      .eq('created_by', userId)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (rateLimitError) throw rateLimitError;
    if (recentShares && recentShares.length >= 10) {
      return { success: false, error: 'Rate limit exceeded. Please wait before creating more share codes.' };
    }

    // Generate share code (8-character alphanumeric)
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    // Generate unique share code
    let code = generateCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      // Check if code already exists
      const { data: existingShare, error: checkError } = await (supabaseAdmin as any)
        .from('poll_shares')
        .select('id')
        .eq('share_code', code)
        .limit(1);

      if (checkError) throw checkError;
      
      if (!existingShare || existingShare.length === 0) {
        break; // Code is unique
      }
      
      code = generateCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate unique share code after multiple attempts');
    }

    // Create share record
    const { data: shareCode, error: shareError } = await (supabaseAdmin as any)
      .from('poll_shares')
      .insert({
        poll_id: pollId,
        share_code: code,
        created_by: userId,
        expires_at: expiresAt || null,
      })
      .select()
      .single();

    if (shareError) throw shareError;
    if (!shareCode) throw new Error('Failed to create share code');

    const shareUrl = generateShareUrl((shareCode as any).share_code);

    return { 
      success: true, 
      shareCode: (shareCode as any).share_code,
      shareUrl 
    };
  } catch (error) {
    logError('Error generating share code:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate share code' 
    };
  }
}

/**
 * Get poll by share code
 */
export async function getPollByShareCode(
  shareCode: string
): Promise<ActionResult<{ poll: any; shareCode: string }>> {
  try {
    // Get share record with poll data
    const { data: shareData, error: shareError } = await (supabaseAdmin as any)
      .from('poll_shares')
      .select(`
        share_code,
        expires_at,
        created_at,
        polls (
          id,
          title,
          description,
          is_public,
          allow_multiple_votes,
          allow_anonymous_votes,
          expires_at,
          created_by,
          created_at,
          updated_at,
          poll_options (
            id,
            text,
            order_index
          )
        )
      `)
      .eq('share_code', shareCode.toUpperCase())
      .single();

    if (shareError) throw shareError;
    if (!shareData) {
      return { success: false, error: 'Share code not found' };
    }

    // Check if share code is expired
    if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
      return { success: false, error: 'Share code has expired' };
    }

    // Check if poll is expired
    const poll = shareData.polls;
    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      return { success: false, error: 'This poll has expired' };
    }

    if (!poll.is_public) {
      return { success: false, error: 'This poll is no longer public' };
    }

    return { 
      success: true, 
      poll: {
        ...poll,
        poll_options: poll.poll_options.sort((a: any, b: any) => a.order_index - b.order_index)
      },
      shareCode: shareData.share_code 
    };
  } catch (error) {
    logError('Error getting poll by share code:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get poll' 
    };
  }
}

/**
 * Validate share code
 */
export async function validateShareCode(
  shareCode: string
): Promise<ActionResult<{ isValid: boolean; pollId?: string }>> {
  try {
    const { data: shareData, error: shareError } = await (supabaseAdmin as any)
      .from('poll_shares')
      .select('poll_id, expires_at, polls(id, is_public, expires_at)')
      .eq('share_code', shareCode.toUpperCase())
      .single();

    if (shareError || !shareData) {
      return { success: true, isValid: false };
    }

    // Check if share code is expired
    if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
      return { success: true, isValid: false };
    }

    // Check if poll is expired or not public
    const poll = shareData.polls;
    if (!poll || !poll.is_public || (poll.expires_at && new Date(poll.expires_at) < new Date())) {
      return { success: true, isValid: false };
    }

    return { 
      success: true, 
      isValid: true, 
      pollId: shareData.poll_id 
    };
  } catch (error) {
    logError('Error validating share code:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to validate share code' 
    };
  }
}

/**
 * Get share statistics for a poll
 */
export async function getShareStats(
  pollId: string,
  userId: string
): Promise<ActionResult<{ shareCount: number; lastShared: string | null }>> {
  try {
    // Verify ownership
    const { data: poll, error: pollError } = await (supabaseAdmin as any)
      .from('polls')
      .select('created_by')
      .eq('id', pollId)
      .single();

    if (pollError) throw pollError;
    if (!poll) {
      return { success: false, error: 'Poll not found' };
    }

    if ((poll as any).created_by !== userId) {
      return { success: false, error: 'Unauthorized to view share stats' };
    }

    // Get share statistics
    const { data: shareStats, error: statsError } = await (supabaseAdmin as any)
      .from('poll_shares')
      .select('created_at')
      .eq('poll_id', pollId)
      .order('created_at', { ascending: false });

    if (statsError) throw statsError;

    const shareCount = shareStats?.length || 0;
    const lastShared = shareStats?.[0]?.created_at || null;

    return { 
      success: true, 
      shareCount,
      lastShared 
    };
  } catch (error) {
    logError('Error getting share stats:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get share stats' 
    };
  }
}

/**
 * Delete a share code
 */
export async function deleteShareCode(
  shareCode: string,
  userId: string
): Promise<ActionResult> {
  try {
    // Verify ownership
    const { data: shareData, error: shareError } = await (supabaseAdmin as any)
      .from('poll_shares')
      .select('created_by')
      .eq('share_code', shareCode.toUpperCase())
      .single();

    if (shareError) throw shareError;
    if (!shareData) {
      return { success: false, error: 'Share code not found' };
    }

    if ((shareData as any).created_by !== userId) {
      return { success: false, error: 'Unauthorized to delete this share code' };
    }

    // Delete share code
    const { error: deleteError } = await (supabaseAdmin as any)
      .from('poll_shares')
      .delete()
      .eq('share_code', shareCode.toUpperCase());

    if (deleteError) throw deleteError;

    return { success: true };
  } catch (error) {
    logError('Error deleting share code:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete share code' 
    };
  }
}
