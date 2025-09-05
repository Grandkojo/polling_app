'use server';

import { supabaseAdmin } from '@/lib/supabase/server';

// Type-safe result type
type ActionResult<T = unknown> = { success: true } & T | { success: false; error: string };

// Constants
const MAX_OPTIONS = 5;

// Helper functions
function parseBool(value: FormDataEntryValue | null): boolean {
  return value === 'true' || value === 'on' || value === '1';
}

function normalizeOptions(raw: string[]): string[] {
  return raw
    .map(o => (typeof o === 'string' ? o.trim() : ''))
    .filter(o => o.length > 0)
    .slice(0, MAX_OPTIONS);
}

function shouldLog(): boolean {
  return process.env.NODE_ENV !== 'test';
}

function logError(prefix: string, error: unknown): void {
  if (shouldLog()) console.error(prefix, error);
}

export async function createPoll(formData: FormData, userId: string): Promise<ActionResult<{ pollId: string }>> {
  try {
    // Parse and validate inputs
    const title = (formData.get('title') as string | null)?.trim() || '';
    const description = (formData.get('description') as string | null)?.trim() || null;
    const isPublic = parseBool(formData.get('isPublic'));
    const allowMultipleVotes = parseBool(formData.get('allowMultipleVotes'));
    const allowAnonymousVotes = parseBool(formData.get('allowAnonymousVotes'));
    const expiresAt = (formData.get('expiresAt') as string | null) || null;
    const options = normalizeOptions((formData.getAll('options') as string[]) ?? []);

    // Validation
    if (!title) {
      return { success: false, error: 'Poll title is required' };
    }
    if (options.length < 2) {
      return { success: false, error: 'At least 2 options are required' };
    }

    // Create poll
    const { data: poll, error: pollError } = await (supabaseAdmin as any)
      .from('polls')
      .insert({
        title,
        description,
        is_public: isPublic,
        allow_multiple_votes: allowMultipleVotes,
        allow_anonymous_votes: allowAnonymousVotes,
        expires_at: expiresAt,
        created_by: userId,
      })
      .select()
      .single();

    if (pollError) throw pollError;
    if (!poll) throw new Error('Failed to create poll');

    // Create poll options
    const pollOptions = options.map((text, index) => ({
      poll_id: (poll as any).id,
      text,
      order_index: index,
    }));

    const { error: optionsError } = await (supabaseAdmin as any)
      .from('poll_options')
      .insert(pollOptions);

    if (optionsError) throw optionsError;

    return { success: true, pollId: (poll as any).id };
  } catch (error) {
    logError('Error creating poll:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create poll' 
    };
  }
}

export async function vote(formData: FormData, userId?: string): Promise<ActionResult<{ voteId: string }>> {
  try {
    const pollId = formData.get('pollId') as string | null;
    const optionId = formData.get('optionId') as string | null;
    const ipAddress = (formData.get('ipAddress') as string | null) || '0.0.0.0';
    const userAgent = (formData.get('userAgent') as string | null) || null;

    if (!pollId || !optionId) {
      return { success: false, error: 'Poll ID and option ID are required' };
    }

    // Check if poll exists and is not expired
    const { data: poll, error: pollError } = await (supabaseAdmin as any)
      .from('polls')
      .select('*')
      .eq('id', pollId)
      .single();

    if (pollError) throw pollError;
    if (!poll) {
      return { success: false, error: 'Poll not found' };
    }

    if ((poll as any).expires_at && new Date((poll as any).expires_at) < new Date()) {
      return { success: false, error: 'This poll has expired' };
    }

    // Check rate limiting
    const { data: rateLimitCheck, error: rateLimitError } = await (supabaseAdmin as any)
      .rpc('check_vote_rate_limit', {
        poll_uuid: pollId,
        user_ip: ipAddress,
        user_uuid: userId ?? null,
      });

    if (rateLimitError) throw rateLimitError;
    if (!rateLimitCheck) {
      return { success: false, error: 'Rate limit exceeded. Please wait before voting again.' };
    }

    // Insert vote
    const { data: vote, error: voteError } = await (supabaseAdmin as any)
      .from('votes')
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: userId ?? null,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (voteError) throw voteError;
    if (!vote) throw new Error('Failed to insert vote');

    return { success: true, voteId: (vote as any).id };
  } catch (error) {
    logError('Error voting:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to vote' 
    };
  }
}

export async function deletePoll(pollId: string, userId: string): Promise<ActionResult> {
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
      return { success: false, error: 'Unauthorized to delete this poll' };
    }

    // Delete poll (cascade will handle options and votes)
    const { error: deleteError } = await (supabaseAdmin as any)
      .from('polls')
      .delete()
      .eq('id', pollId);

    if (deleteError) throw deleteError;

    return { success: true };
  } catch (error) {
    logError('Error deleting poll:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete poll' 
    };
  }
}

export async function createShareCode(pollId: string, userId: string, expiresAt?: string): Promise<ActionResult<{ shareCode: string }>> {
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
      return { success: false, error: 'Unauthorized to share this poll' };
    }

    // Generate share code first
    const { data: code, error: codeError } = await (supabaseAdmin as any).rpc('generate_share_code');
    if (codeError) throw codeError;
    if (!code) throw new Error('Failed to generate share code');

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

    return { success: true, shareCode: (shareCode as any).share_code };
  } catch (error) {
    logError('Error creating share code:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create share code' 
    };
  }
}
