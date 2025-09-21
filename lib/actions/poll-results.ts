'use server';

import { supabase } from '@/lib/supabase/server';
import { PollResult } from '@/types/database';

export async function getPollResults(pollId: string): Promise<{
  success: boolean;
  data?: PollResult[];
  error?: string;
}> {
  try {
    // Use the database function to get poll results
    const { data, error } = await supabase.rpc('get_poll_results', {
      poll_uuid: pollId
    });

    if (error) {
      console.error('Error fetching poll results:', error);
      return {
        success: false,
        error: 'Failed to fetch poll results'
      };
    }

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error in getPollResults:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

export async function getPollWithResults(pollId: string): Promise<{
  success: boolean;
  data?: {
    poll: any;
    results: PollResult[];
    totalVotes: number;
  };
  error?: string;
}> {
  try {
    // Get poll details
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select(`
        id,
        title,
        description,
        is_public,
        allow_multiple_votes,
        allow_anonymous_votes,
        expires_at,
        created_at,
        poll_options(id, text, order_index)
      `)
      .eq('id', pollId)
      .single();

    if (pollError) {
      console.error('Error fetching poll:', pollError);
      return {
        success: false,
        error: 'Poll not found'
      };
    }

    // Get poll results
    const resultsResponse = await getPollResults(pollId);
    if (!resultsResponse.success) {
      return {
        success: false,
        error: resultsResponse.error
      };
    }

    const results = resultsResponse.data || [];
    const totalVotes = results.reduce((sum, result) => sum + result.vote_count, 0);

    return {
      success: true,
      data: {
        poll,
        results,
        totalVotes
      }
    };
  } catch (error) {
    console.error('Error in getPollWithResults:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

