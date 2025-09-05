'use server';

import { supabaseAdmin } from '@/lib/supabase/server';

export async function createPoll(formData: FormData, userId: string) {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const isPublic = formData.get('isPublic') === 'true';
    const allowMultipleVotes = formData.get('allowMultipleVotes') === 'true';
    const allowAnonymousVotes = formData.get('allowAnonymousVotes') === 'true';
    const expiresAt = formData.get('expiresAt') as string;
    const options = formData.getAll('options') as string[];

    // Validation
    if (!title || title.trim().length === 0) {
      throw new Error('Poll title is required');
    }
    if (options.length < 2) {
      throw new Error('At least 2 options are required');
    }

    // Create poll
    const { data: poll, error: pollError } = await supabaseAdmin
      .from('polls')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        is_public: isPublic,
        allow_multiple_votes: allowMultipleVotes,
        allow_anonymous_votes: allowAnonymousVotes,
        expires_at: expiresAt || null,
        created_by: userId,
      })
      .select()
      .single();

    if (pollError) throw pollError;

    // Create poll options
    const pollOptions = options
      .filter(option => option.trim().length > 0)
      .map((text, index) => ({
        poll_id: poll.id,
        text: text.trim(),
        order_index: index,
      }));

    const { error: optionsError } = await supabaseAdmin
      .from('poll_options')
      .insert(pollOptions);

    if (optionsError) throw optionsError;

    return { success: true, pollId: poll.id };
  } catch (error) {
    console.error('Error creating poll:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create poll' 
    };
  }
}

export async function vote(formData: FormData, userId?: string) {
  try {
    const pollId = formData.get('pollId') as string;
    const optionId = formData.get('optionId') as string;
    const ipAddress = formData.get('ipAddress') as string;
    const userAgent = formData.get('userAgent') as string;

    if (!pollId || !optionId) {
      throw new Error('Poll ID and option ID are required');
    }

    // Check if poll exists and is not expired
    const { data: poll, error: pollError } = await supabaseAdmin
      .from('polls')
      .select('*')
      .eq('id', pollId)
      .single();

    if (pollError || !poll) {
      throw new Error('Poll not found');
    }

    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      throw new Error('This poll has expired');
    }

    // Check rate limiting
    const { data: rateLimitCheck, error: rateLimitError } = await supabaseAdmin
      .rpc('check_vote_rate_limit', {
        poll_uuid: pollId,
        user_ip: ipAddress || '0.0.0.0',
        user_uuid: userId,
      });

    if (rateLimitError) throw rateLimitError;
    if (!rateLimitCheck) {
      throw new Error('Rate limit exceeded. Please wait before voting again.');
    }

    // Insert vote
    const { data: vote, error: voteError } = await supabaseAdmin
      .from('votes')
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (voteError) throw voteError;

    return { success: true, voteId: vote.id };
  } catch (error) {
    console.error('Error voting:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to vote' 
    };
  }
}

export async function deletePoll(pollId: string, userId: string) {
  try {
    // Verify ownership
    const { data: poll, error: pollError } = await supabaseAdmin
      .from('polls')
      .select('created_by')
      .eq('id', pollId)
      .single();

    if (pollError || !poll) {
      throw new Error('Poll not found');
    }

    if (poll.created_by !== userId) {
      throw new Error('Unauthorized to delete this poll');
    }

    // Delete poll (cascade will handle options and votes)
    const { error: deleteError } = await supabaseAdmin
      .from('polls')
      .delete()
      .eq('id', pollId);

    if (deleteError) throw deleteError;

    return { success: true };
  } catch (error) {
    console.error('Error deleting poll:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete poll' 
    };
  }
}

export async function createShareCode(pollId: string, userId: string, expiresAt?: string) {
  try {
    // Verify ownership
    const { data: poll, error: pollError } = await supabaseAdmin
      .from('polls')
      .select('created_by')
      .eq('id', pollId)
      .single();

    if (pollError || !poll) {
      throw new Error('Poll not found');
    }

    if (poll.created_by !== userId) {
      throw new Error('Unauthorized to share this poll');
    }

    // Generate share code
    const { data: shareCode, error: shareError } = await supabaseAdmin
      .from('poll_shares')
      .insert({
        poll_id: pollId,
        share_code: await supabaseAdmin.rpc('generate_share_code'),
        created_by: userId,
        expires_at: expiresAt || null,
      })
      .select()
      .single();

    if (shareError) throw shareError;

    return { success: true, shareCode: shareCode.share_code };
  } catch (error) {
    console.error('Error creating share code:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create share code' 
    };
  }
}
