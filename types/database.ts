// Database types for the polling app
// These types match the Supabase database schema

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      polls: {
        Row: Poll;
        Insert: PollInsert;
        Update: PollUpdate;
      };
      poll_options: {
        Row: PollOption;
        Insert: PollOptionInsert;
        Update: PollOptionUpdate;
      };
      votes: {
        Row: Vote;
        Insert: VoteInsert;
        Update: VoteUpdate;
      };
      poll_shares: {
        Row: PollShare;
        Insert: PollShareInsert;
        Update: PollShareUpdate;
      };
      comments: {
        Row: Comment;
        Insert: CommentInsert;
        Update: CommentUpdate;
      };
      comment_reactions: {
        Row: CommentReaction;
        Insert: CommentReactionInsert;
        Update: CommentReactionUpdate;
      };
      comment_reports: {
        Row: CommentReport;
        Insert: CommentReportInsert;
        Update: CommentReportUpdate;
      };
    };
    Views: {
      poll_stats: {
        Row: PollStats;
      };
    };
    Functions: {
      get_poll_results: {
        Args: { poll_uuid: string };
        Returns: PollResult[];
      };
      is_poll_expired: {
        Args: { poll_uuid: string };
        Returns: boolean;
      };
      check_vote_rate_limit: {
        Args: { 
          poll_uuid: string; 
          user_ip: string; 
          user_uuid?: string;
        };
        Returns: boolean;
      };
      generate_share_code: {
        Args: {};
        Returns: string;
      };
      get_comments_with_details: {
        Args: { 
          poll_uuid: string; 
          current_user_uuid?: string;
        };
        Returns: CommentWithDetails[];
      };
    };
  };
}

// User types
export type UserRole = 'user' | 'admin' | 'moderator';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: string;
}

export interface UserInsert {
  id?: string;
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  created_at?: string;
}

export interface UserUpdate {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  created_at?: string;
}

// Poll types
export interface Poll {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  allow_multiple_votes: boolean;
  allow_anonymous_votes: boolean;
  expires_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  comment_count: number;
}

export interface PollInsert {
  id?: string;
  title: string;
  description?: string | null;
  is_public?: boolean;
  allow_multiple_votes?: boolean;
  allow_anonymous_votes?: boolean;
  expires_at?: string | null;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface PollUpdate {
  id?: string;
  title?: string;
  description?: string | null;
  is_public?: boolean;
  allow_multiple_votes?: boolean;
  allow_anonymous_votes?: boolean;
  expires_at?: string | null;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  comment_count?: number;
}

// Comment types
export interface Comment {
  id: string;
  poll_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentInsert {
  id?: string;
  poll_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CommentUpdate {
  id?: string;
  poll_id?: string;
  user_id?: string;
  parent_id?: string | null;
  content?: string;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Extended comment with user info for display
export interface CommentWithUser extends Comment {
  user: {
    id: string;
    name: string;
    email: string;
  };
  replies?: CommentWithUser[];
}

// Poll option types
export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  order_index: number;
  created_at: string;
}

export interface PollOptionInsert {
  id?: string;
  poll_id: string;
  text: string;
  order_index?: number;
  created_at?: string;
}

export interface PollOptionUpdate {
  id?: string;
  poll_id?: string;
  text?: string;
  order_index?: number;
  created_at?: string;
}

// Vote types
export interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface VoteInsert {
  id?: string;
  poll_id: string;
  option_id: string;
  user_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: string;
}

export interface VoteUpdate {
  id?: string;
  poll_id?: string;
  option_id?: string;
  user_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: string;
}

// Poll share types
export interface PollShare {
  id: string;
  poll_id: string;
  share_code: string;
  created_by: string;
  expires_at: string | null;
  created_at: string;
}

export interface PollShareInsert {
  id?: string;
  poll_id: string;
  share_code?: string;
  created_by: string;
  expires_at?: string | null;
  created_at?: string;
}

export interface PollShareUpdate {
  id?: string;
  poll_id?: string;
  share_code?: string;
  created_by?: string;
  expires_at?: string | null;
  created_at?: string;
}

// View types
export interface PollStats {
  poll_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  allow_multiple_votes: boolean;
  allow_anonymous_votes: boolean;
  expires_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  option_count: number;
  total_votes: number;
  unique_voters: number;
  is_expired: boolean;
}

// Function return types
export interface PollResult {
  option_id: string;
  option_text: string;
  vote_count: number;
  percentage: number;
}

// Extended types for API responses
export interface PollWithOptions extends Poll {
  poll_options: PollOption[];
  _count?: {
    votes: number;
  };
}

export interface PollWithResults extends Poll {
  poll_options: (PollOption & {
    votes: Vote[];
    vote_count: number;
    percentage: number;
  })[];
  total_votes: number;
}

export interface CreatePollData {
  title: string;
  description?: string;
  is_public?: boolean;
  allow_multiple_votes?: boolean;
  allow_anonymous_votes?: boolean;
  expires_at?: string;
  options: string[];
}

export interface VoteData {
  poll_id: string;
  option_id: string;
  user_id?: string;
}

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Comment types
export interface Comment {
  id: string;
  poll_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommentInsert {
  id?: string;
  poll_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CommentUpdate {
  id?: string;
  poll_id?: string;
  user_id?: string;
  parent_id?: string | null;
  content?: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Comment reaction types
export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: 'like' | 'dislike';
  created_at: string;
}

export interface CommentReactionInsert {
  id?: string;
  comment_id: string;
  user_id: string;
  reaction_type: 'like' | 'dislike';
  created_at?: string;
}

export interface CommentReactionUpdate {
  id?: string;
  comment_id?: string;
  user_id?: string;
  reaction_type?: 'like' | 'dislike';
  created_at?: string;
}

// Comment report types
export interface CommentReport {
  id: string;
  comment_id: string;
  reporter_id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  moderator_id: string | null;
  moderator_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface CommentReportInsert {
  id?: string;
  comment_id: string;
  reporter_id: string;
  reason: string;
  status?: 'pending' | 'resolved' | 'dismissed';
  moderator_id?: string | null;
  moderator_notes?: string | null;
  created_at?: string;
  resolved_at?: string | null;
}

export interface CommentReportUpdate {
  id?: string;
  comment_id?: string;
  reporter_id?: string;
  reason?: string;
  status?: 'pending' | 'resolved' | 'dismissed';
  moderator_id?: string | null;
  moderator_notes?: string | null;
  created_at?: string;
  resolved_at?: string | null;
}

// Extended comment types with user info and reactions
export interface CommentWithDetails {
  id: string;
  poll_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  parent_id: string | null;
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  like_count: number;
  dislike_count: number;
  user_reaction: string | null;
  reply_count: number;
}

export interface CreateCommentData {
  poll_id: string;
  content: string;
  parent_id?: string | null;
}

export interface CommentReactionData {
  comment_id: string;
  reaction_type: 'like' | 'dislike';
}

export interface CommentReportData {
  comment_id: string;
  reason: string;
}

