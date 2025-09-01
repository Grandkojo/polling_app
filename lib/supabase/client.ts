import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Type-safe database operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Convenience types
export type Poll = Tables<'polls'>;
export type PollOption = Tables<'poll_options'>;
export type Vote = Tables<'votes'>;
export type User = Tables<'users'>;
export type PollShare = Tables<'poll_shares'>;
export type PollStats = Database['public']['Views']['poll_stats']['Row'];

// Helper functions for common operations
export const pollsApi = {
  // Get all public polls with pagination
  async getPublicPolls(page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options(*),
        _count: votes(count)
      `, { count: 'exact' })
      .eq('is_public', true)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  },

  // Get a single poll with options and results
  async getPoll(id: string) {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options(
          *,
          votes(count)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get poll results using the database function
  async getPollResults(pollId: string) {
    const { data, error } = await supabase
      .rpc('get_poll_results', { poll_uuid: pollId });

    if (error) throw error;
    return data;
  },

  // Create a new poll with options
  async createPoll(pollData: {
    title: string;
    description?: string;
    is_public?: boolean;
    allow_multiple_votes?: boolean;
    allow_anonymous_votes?: boolean;
    expires_at?: string;
    options: string[];
  }, userId: string) {
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title: pollData.title,
        description: pollData.description,
        is_public: pollData.is_public ?? true,
        allow_multiple_votes: pollData.allow_multiple_votes ?? false,
        allow_anonymous_votes: pollData.allow_anonymous_votes ?? true,
        expires_at: pollData.expires_at,
        created_by: userId,
      })
      .select()
      .single();

    if (pollError) throw pollError;

    // Insert poll options
    const options = pollData.options.map((text, index) => ({
      poll_id: poll.id,
      text,
      order_index: index,
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(options);

    if (optionsError) throw optionsError;

    return poll;
  },

  // Vote on a poll
  async vote(pollId: string, optionId: string, userId?: string, ipAddress?: string, userAgent?: string) {
    // Check rate limiting
    const { data: rateLimitCheck, error: rateLimitError } = await supabase
      .rpc('check_vote_rate_limit', {
        poll_uuid: pollId,
        user_ip: ipAddress || '0.0.0.0',
        user_uuid: userId,
      });

    if (rateLimitError) throw rateLimitError;
    if (!rateLimitCheck) {
      throw new Error('Rate limit exceeded. Please wait before voting again.');
    }

    const { data, error } = await supabase
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

    if (error) throw error;
    return data;
  },

  // Get user's polls
  async getUserPolls(userId: string) {
    const { data, error } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options(*),
        _count: votes(count)
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create a share code for a poll
  async createShareCode(pollId: string, userId: string, expiresAt?: string) {
    const { data, error } = await supabase
      .from('poll_shares')
      .insert({
        poll_id: pollId,
        share_code: await supabase.rpc('generate_share_code'),
        created_by: userId,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get poll by share code
  async getPollByShareCode(shareCode: string) {
    const { data, error } = await supabase
      .from('poll_shares')
      .select(`
        *,
        polls(
          *,
          poll_options(*)
        )
      `)
      .eq('share_code', shareCode)
      .single();

    if (error) throw error;
    return data;
  },
};

// Real-time subscriptions
export const realtimeApi = {
  // Subscribe to poll updates
  subscribeToPoll(pollId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`poll-${pollId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `poll_id=eq.${pollId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to user's polls
  subscribeToUserPolls(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user-polls-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'polls',
          filter: `created_by=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },
};

// Error handling utility
export class SupabaseError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: string
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// Utility function to handle Supabase errors
export function handleSupabaseError(error: any): never {
  if (error?.code === 'PGRST116') {
    throw new SupabaseError('Rate limit exceeded', 429);
  }
  if (error?.code === '23505') {
    throw new SupabaseError('Duplicate entry', 409);
  }
  if (error?.code === '23503') {
    throw new SupabaseError('Referenced record not found', 404);
  }
  
  throw new SupabaseError(
    error?.message || 'An unexpected error occurred',
    error?.status || 500,
    error?.details
  );
}

