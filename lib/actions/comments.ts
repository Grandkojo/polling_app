'use server';

import { supabaseAdmin } from '@/lib/supabase/server';
import type { CommentInsert, CommentUpdate, CommentWithUser } from '@/types/database';

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function logError(prefix: string, error: unknown) {
  if (process.env.NODE_ENV !== 'test') {
    console.error(prefix, error);
  }
}

/**
 * Get comments for a poll with user information
 */
export async function getPollComments(
  pollId: string
): Promise<ActionResult<CommentWithUser[]>> {
  try {
    const { data: comments, error } = await (supabaseAdmin as any)
      .from('comments')
      .select(`
        id,
        poll_id,
        user_id,
        parent_id,
        content,
        is_visible,
        report_count,
        created_at,
        updated_at,
        users:users!comments_user_id_fkey (
          id,
          name,
          email
        )
      `)
      .eq('poll_id', pollId)
      .eq('is_visible', true)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Organize comments into a tree structure
    const commentMap = new Map<string, CommentWithUser>();
    const rootComments: CommentWithUser[] = [];

    // First pass: create comment objects
    comments.forEach((comment: any) => {
      const commentWithUser: CommentWithUser = {
        id: comment.id,
        poll_id: comment.poll_id,
        user_id: comment.user_id,
        parent_id: comment.parent_id,
        content: comment.content,
        is_visible: comment.is_visible,
        report_count: comment.report_count,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        users: comment.users,
        replies: []
      };
      commentMap.set(comment.id, commentWithUser);
    });

    // Second pass: organize into tree structure
    comments.forEach((comment: any) => {
      const commentWithUser = commentMap.get(comment.id)!;
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithUser);
        }
      } else {
        rootComments.push(commentWithUser);
      }
    });

    return {
      success: true,
      data: rootComments
    };
  } catch (error) {
    logError('Error getting poll comments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get comments'
    };
  }
}

/**
 * Create a new comment
 */
export async function createComment(
  pollId: string,
  userId: string,
  content: string,
  parentId?: string
): Promise<ActionResult<CommentWithUser>> {
  try {
    // Validate content
    if (!content.trim() || content.length > 1000) {
      return {
        success: false,
        error: 'Comment must be between 1 and 1000 characters'
      };
    }

    // Verify poll exists and is accessible
    const { data: poll, error: pollError } = await (supabaseAdmin as any)
      .from('polls')
      .select('id, is_public, created_by')
      .eq('id', pollId)
      .single();

    if (pollError || !poll) {
      return {
        success: false,
        error: 'Poll not found'
      };
    }

    // Check if user can comment (poll is public or user owns it)
    if (!poll.is_public && poll.created_by !== userId) {
      return {
        success: false,
        error: 'You cannot comment on this poll'
      };
    }

    // If replying to a comment, verify parent exists
    if (parentId) {
      const { data: parentComment, error: parentError } = await (supabaseAdmin as any)
        .from('comments')
        .select('id, poll_id')
        .eq('id', parentId)
        .eq('poll_id', pollId)
        .eq('is_visible', true)
        .single();

      if (parentError || !parentComment) {
        return {
          success: false,
          error: 'Parent comment not found'
        };
      }
    }

    // Create the comment
    const { data: newComment, error: insertError } = await (supabaseAdmin as any)
      .from('comments')
      .insert([
        {
          poll_id: pollId,
          user_id: userId,
          parent_id: parentId || null,
          content: content.trim()
        }
      ])
      .select(`
        id,
        poll_id,
        user_id,
        parent_id,
        content,
        is_visible,
        report_count,
        created_at,
        updated_at,
        users:users!comments_user_id_fkey (
          id,
          name,
          email
        )
      `)
      .single();

    if (insertError) {
      throw insertError;
    }

    return {
      success: true,
      data: newComment
    };
  } catch (error) {
    logError('Error creating comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create comment'
    };
  }
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  userId: string,
  content: string
): Promise<ActionResult<CommentWithUser>> {
  try {
    // Validate content
    if (!content.trim() || content.length > 1000) {
      return {
        success: false,
        error: 'Comment must be between 1 and 1000 characters'
      };
    }

    // Verify comment exists and user owns it
    const { data: existingComment, error: fetchError } = await (supabaseAdmin as any)
      .from('comments')
      .select('id, user_id, is_visible')
      .eq('id', commentId)
      .single();

    if (fetchError || !existingComment) {
      return {
        success: false,
        error: 'Comment not found'
      };
    }

    if (existingComment.user_id !== userId) {
      return {
        success: false,
        error: 'You can only edit your own comments'
      };
    }

    if (!existingComment.is_visible) {
      return {
        success: false,
        error: 'Cannot edit hidden comment'
      };
    }

    // Update the comment
    const { data: updatedComment, error: updateError } = await (supabaseAdmin as any)
      .from('comments')
      .update({ content: content.trim() })
      .eq('id', commentId)
      .select(`
        id,
        poll_id,
        user_id,
        parent_id,
        content,
        is_visible,
        report_count,
        created_at,
        updated_at,
        users:users!comments_user_id_fkey (
          id,
          name,
          email
        )
      `)
      .single();

    if (updateError) {
      throw updateError;
    }

    return {
      success: true,
      data: updatedComment
    };
  } catch (error) {
    logError('Error updating comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update comment'
    };
  }
}

/**
 * Delete a comment (soft delete)
 */
export async function deleteComment(
  commentId: string,
  userId: string,
  isAdmin: boolean = false
): Promise<ActionResult<void>> {
  try {
    // Verify comment exists
    const { data: existingComment, error: fetchError } = await (supabaseAdmin as any)
      .from('comments')
      .select('id, user_id, is_visible')
      .eq('id', commentId)
      .single();

    if (fetchError || !existingComment) {
      return {
        success: false,
        error: 'Comment not found'
      };
    }

    // Check permissions
    if (!isAdmin && existingComment.user_id !== userId) {
      return {
        success: false,
        error: 'You can only delete your own comments'
      };
    }

    // Hard delete the comment
    const { error: deleteError } = await (supabaseAdmin as any)
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      throw deleteError;
    }

    return {
      success: true
    };
  } catch (error) {
    logError('Error deleting comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete comment'
    };
  }
}

/**
 * Get comment statistics for admin dashboard
 */
export async function getCommentStats(): Promise<ActionResult<{
  totalComments: number;
  commentsToday: number;
  commentsThisWeek: number;
}>> {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get total comments
    const { count: totalComments, error: totalError } = await (supabaseAdmin as any)
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('is_visible', true);

    if (totalError) throw totalError;

    // Get comments today
    const { count: commentsToday, error: todayError } = await (supabaseAdmin as any)
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('is_visible', true)
      .gte('created_at', today.toISOString());

    if (todayError) throw todayError;

    // Get comments this week
    const { count: commentsThisWeek, error: weekError } = await (supabaseAdmin as any)
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('is_visible', true)
      .gte('created_at', weekAgo.toISOString());

    if (weekError) throw weekError;

    return {
      success: true,
      data: {
        totalComments: totalComments || 0,
        commentsToday: commentsToday || 0,
        commentsThisWeek: commentsThisWeek || 0
      }
    };
  } catch (error) {
    logError('Error getting comment stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get comment statistics'
    };
  }
}

/**
 * Update comment visibility (for moderation)
 */
export async function updateCommentVisibility(
  commentId: string,
  isVisible: boolean
): Promise<ActionResult<void>> {
  try {
    const { error } = await (supabaseAdmin as any)
      .from('comments')
      .update({ is_visible: isVisible })
      .eq('id', commentId);

    if (error) {
      throw error;
    }

    return {
      success: true
    };
  } catch (error) {
    logError('Error updating comment visibility:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update comment visibility'
    };
  }
}

/**
 * Report a comment
 */
export async function reportComment(
  commentId: string,
  userId: string,
  reason: string
): Promise<ActionResult<void>> {
  try {
    // Check if user already reported this comment
    const { data: existingReport, error: checkError } = await (supabaseAdmin as any)
      .from('comment_reports')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw checkError;
    }

    if (existingReport) {
      return {
        success: false,
        error: 'You have already reported this comment'
      };
    }

    // Create the report
    const { error: insertError } = await (supabaseAdmin as any)
      .from('comment_reports')
      .insert([
        {
          comment_id: commentId,
          user_id: userId,
          reason: reason.trim()
        }
      ]);

    if (insertError) {
      throw insertError;
    }

    return {
      success: true
    };
  } catch (error) {
    logError('Error reporting comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to report comment'
    };
  }
}

