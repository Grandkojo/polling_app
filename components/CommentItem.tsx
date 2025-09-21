'use client';

import { useState } from 'react';
import { MessageCircle, Edit2, Trash2, MoreHorizontal, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { updateComment, deleteComment, reportComment } from '@/lib/actions/comments';
import { useAuth } from '@/components/AuthProvider';
import CommentForm from './CommentForm';
import toast from 'react-hot-toast';
import type { CommentWithUser } from '@/types/database';

interface CommentItemProps {
  comment: CommentWithUser;
  onCommentUpdated: () => void;
  onReplyAdded: () => void;
}

export default function CommentItem({ 
  comment, 
  onCommentUpdated, 
  onReplyAdded 
}: CommentItemProps) {
  const { user, isAdmin, isModerator } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = user?.id === comment.user_id;
  const canModerate = isOwner || isAdmin || isModerator;

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    if (editContent.length > 1000) {
      toast.error('Comment must be 1000 characters or less');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await updateComment(comment.id, user!.id, editContent.trim());
      
      if (result.success) {
        setIsEditing(false);
        toast.success('Comment updated!');
        onCommentUpdated();
      } else {
        toast.error(result.error || 'Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await deleteComment(comment.id, user!.id, isAdmin);
      
      if (result.success) {
        toast.success('Comment deleted!');
        onCommentUpdated();
      } else {
        toast.error(result.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!confirm('Are you sure you want to report this comment?')) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await reportComment(comment.id, user!.id, 'Inappropriate content');
      
      if (result.success) {
        toast.success('Comment reported!');
        onCommentUpdated();
      } else {
        toast.error(result.error || 'Failed to report comment');
      }
    } catch (error) {
      console.error('Error reporting comment:', error);
      toast.error('Failed to report comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className="p-4 space-y-3">
      {/* Comment Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {comment.users?.name?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">{comment.users?.name || 'Anonymous'}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
              {comment.updated_at !== comment.created_at && (
                <span className="ml-1">(edited)</span>
              )}
              {comment.report_count > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {comment.report_count} report{comment.report_count > 1 ? 's' : ''}
                </Badge>
              )}
            </p>
          </div>
        </div>
        
        {canModerate && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isSubmitting}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && (
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {!isOwner && (
                <DropdownMenuItem onClick={handleReport}>
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Comment Content */}
      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[80px] resize-none"
            maxLength={1000}
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {editContent.length}/1000 characters
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={isSubmitting || !editContent.trim()}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap">{comment.content}</p>
        </div>
      )}

      {/* Comment Actions */}
      {!isEditing && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Reply
          </Button>
        </div>
      )}

      {/* Reply Form */}
      {isReplying && user && (
        <div className="ml-4 border-l-2 border-muted pl-4">
          <CommentForm
            pollId={comment.poll_id}
            userId={user.id}
            parentId={comment.id}
            onCommentAdded={() => {
              setIsReplying(false);
              onReplyAdded();
            }}
            placeholder={`Reply to ${comment.users?.name || 'Anonymous'}...`}
          />
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onCommentUpdated={onCommentUpdated}
              onReplyAdded={onReplyAdded}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

