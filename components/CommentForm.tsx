'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createComment } from '@/lib/actions/comments';
import toast from 'react-hot-toast';

interface CommentFormProps {
  pollId: string;
  userId: string;
  parentId?: string;
  onCommentAdded: () => void;
  placeholder?: string;
  className?: string;
}

export default function CommentForm({ 
  pollId, 
  userId, 
  parentId, 
  onCommentAdded,
  placeholder = "Write a comment...",
  className 
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (content.length > 1000) {
      toast.error('Comment must be 1000 characters or less');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await createComment(pollId, userId, content.trim(), parentId);
      
      if (result.success) {
        setContent('');
        toast.success(parentId ? 'Reply added!' : 'Comment added!');
        onCommentAdded();
      } else {
        toast.error(result.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className || ''}`}>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[80px] resize-none"
        maxLength={1000}
        disabled={isSubmitting}
      />
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {content.length}/1000 characters
        </span>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setContent('')}
            disabled={isSubmitting || !content.trim()}
          >
            Clear
          </Button>
          
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !content.trim()}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Posting...' : (parentId ? 'Reply' : 'Comment')}
          </Button>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to submit
      </p>
    </form>
  );
}

