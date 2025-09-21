'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Eye, EyeOff, Flag } from 'lucide-react';
import { deleteComment, updateCommentVisibility, reportComment } from '@/lib/actions/comments';
import { CommentWithUser } from '@/types/database';

interface CommentModerationProps {
  comments: CommentWithUser[];
  userRole: string;
  pollId: string;
}

export default function CommentModeration({ comments, userRole, pollId }: CommentModerationProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canModerate = userRole === 'admin' || userRole === 'moderator';

  if (!canModerate) {
    return null;
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    setLoading(commentId);
    setError(null);

    try {
      const result = await deleteComment(commentId);
      if (result.success) {
        // Refresh the page to show updated comments
        window.location.reload();
      } else {
        setError(result.error || 'Failed to delete comment');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(null);
    }
  };

  const handleToggleVisibility = async (commentId: string, isVisible: boolean) => {
    setLoading(commentId);
    setError(null);

    try {
      const result = await updateCommentVisibility(commentId, !isVisible);
      if (result.success) {
        // Refresh the page to show updated comments
        window.location.reload();
      } else {
        setError(result.error || 'Failed to update comment');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(null);
    }
  };

  const handleReportComment = async (commentId: string) => {
    setLoading(commentId);
    setError(null);

    try {
      const result = await reportComment(commentId, 'Inappropriate content');
      if (result.success) {
        alert('Comment reported successfully');
      } else {
        setError(result.error || 'Failed to report comment');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(null);
    }
  };

  const reportedComments = comments.filter(comment => comment.report_count > 0);
  const hiddenComments = comments.filter(comment => !comment.is_visible);

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Comment Moderation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{comments.length}</div>
              <div className="text-sm text-gray-600">Total Comments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{reportedComments.length}</div>
              <div className="text-sm text-gray-600">Reported</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{hiddenComments.length}</div>
              <div className="text-sm text-gray-600">Hidden</div>
            </div>
          </div>

          {reportedComments.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-red-600">Reported Comments</h4>
              <div className="space-y-2">
                {reportedComments.map((comment) => (
                  <div key={comment.id} className="border border-red-200 rounded-lg p-3 bg-red-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{comment.users?.name || 'Anonymous'}</span>
                          <Badge variant="destructive" className="text-xs">
                            {comment.report_count} report{comment.report_count > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={loading === comment.id}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleToggleVisibility(comment.id, comment.is_visible)}
                          >
                            {comment.is_visible ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Hide Comment
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Show Comment
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Comment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hiddenComments.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-orange-600">Hidden Comments</h4>
              <div className="space-y-2">
                {hiddenComments.map((comment) => (
                  <div key={comment.id} className="border border-orange-200 rounded-lg p-3 bg-orange-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{comment.users?.name || 'Anonymous'}</span>
                          <Badge variant="secondary" className="text-xs">Hidden</Badge>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={loading === comment.id}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleToggleVisibility(comment.id, comment.is_visible)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Show Comment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Comment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reportedComments.length === 0 && hiddenComments.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No comments require moderation at this time.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
