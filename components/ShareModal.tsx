'use client';

import { useState, useEffect } from 'react';
import { Copy, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { generateShareCode } from '@/lib/actions/shares';
import { copyToClipboard } from '@/lib/utils/share';
import toast from 'react-hot-toast';

interface ShareModalProps {
  pollId: string;
  pollTitle: string;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function ShareModal({ pollId, pollTitle, isOpen, onClose, userId }: ShareModalProps) {
  const [shareCode, setShareCode] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate share code when modal opens
  useEffect(() => {
    if (isOpen && !shareCode) {
      generateShareCodeAndUrl();
    }
  }, [isOpen]);

  const generateShareCodeAndUrl = async () => {
    setIsLoading(true);
    try {
      const result = await generateShareCode(pollId, userId);
      
      if (result.success) {
        setShareCode(result.shareCode);
        setShareUrl(result.shareUrl);
      } else {
        toast.error(result.error || 'Failed to generate share code');
        onClose();
      }
    } catch (error) {
      console.error('Error generating share code:', error);
      toast.error('Failed to generate share code');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!shareUrl) return;
    
    const success = await copyToClipboard(shareUrl);
    if (success) {
      toast.success('Share link copied to clipboard!');
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleCopyCode = async () => {
    if (!shareCode) return;
    
    const success = await copyToClipboard(shareCode);
    if (success) {
      toast.success('Share code copied to clipboard!');
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(`Vote on: ${pollTitle}`);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Poll
          </DialogTitle>
          <DialogDescription>
            Share "{pollTitle}" with others so they can vote
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Share URL */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Share Link</label>
              <p className="text-xs text-muted-foreground">Copy this link to share the poll</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-muted rounded-md text-sm font-mono break-all">
                {isLoading ? 'Generating...' : shareUrl}
              </div>
              <Button
                size="sm"
                onClick={handleCopyUrl}
                disabled={isLoading || !shareUrl}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Share Code */}
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-muted rounded-md text-sm font-mono text-center">
                {isLoading ? 'Generating...' : shareCode}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyCode}
                disabled={isLoading || !shareCode}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Social Sharing */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Share on Social Media</label>
              <p className="text-xs text-muted-foreground">Share this poll on your favorite platforms</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare('twitter')}
                disabled={!shareUrl}
                className="justify-start"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare('facebook')}
                disabled={!shareUrl}
                className="justify-start"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare('linkedin')}
                disabled={!shareUrl}
                className="justify-start"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare('whatsapp')}
                disabled={!shareUrl}
                className="justify-start"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
