'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { getPollComments } from '@/lib/actions/comments';
import { useAuth } from '@/components/AuthProvider';
import type { CommentWithUser } from '@/types/database';

interface CommentListProps {
  pollId: string;
  className?: string;
}

export default function CommentList({ pollId, className }: CommentListProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await getPollComments(pollId);
      
      if (result.success && result.data) {
        setComments(result.data);
      } else {
        setError(result.error || 'Failed to load comments');
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setError('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [pollId]);

  const handleCommentAdded = () => {
    loadComments();
  };

  const handleCommentUpdated = () => {
    loadComments();
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className || ''}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading comments...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className || ''}`}>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadComments} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className || ''}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <h3 className="text-lg font-semibold">
              Comments ({comments.length})
            </h3>
          </div>
        </div>

        {/* Comment Form */}
        {user ? (
          <CommentForm
            pollId={pollId}
            userId={user.id}
            onCommentAdded={handleCommentAdded}
          />
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>Please log in to comment on this poll.</p>
          </div>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onCommentUpdated={handleCommentUpdated}
                onReplyAdded={handleCommentAdded}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

