'use client';

import { useState, useEffect } from 'react';
import { Copy, Share2, ExternalLink, QrCode, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getOrCreateShareCode } from '@/lib/actions/shares';
import { copyToClipboard } from '@/lib/utils/share';
import QRCodeGenerator from './QRCodeGenerator';
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
  const [isReusingExisting, setIsReusingExisting] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link');

  // Generate share code when modal opens
  useEffect(() => {
    if (isOpen && !shareCode) {
      generateShareCodeAndUrl();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShareCode('');
      setShareUrl('');
      setIsReusingExisting(false);
      setActiveTab('link');
    }
  }, [isOpen]);

  const generateShareCodeAndUrl = async () => {
    setIsLoading(true);
    try {
      const result = await getOrCreateShareCode(pollId, userId);
      
      if (result.success) {
        setShareCode(result.shareCode);
        setShareUrl(result.shareUrl);
        setIsReusingExisting(result.isReusingExisting || false);
        
        if (result.isReusingExisting) {
          toast.success('Using existing share link for this poll');
        }
      } else {
        toast.error(result.error || 'Failed to get share code');
        onClose();
      }
    } catch (error) {
      console.error('Error getting share code:', error);
      toast.error('Failed to get share code');
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

  const handleDownloadQR = async () => {
    if (!shareUrl) return;
    
    try {
      const QRCode = (await import('qrcode')).default;
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, shareUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff',
        },
      });
      
      const link = document.createElement('a');
      link.download = `poll-qr-${pollTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('QR code downloaded successfully!');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Poll
          </DialogTitle>
          <DialogDescription>
            Share "{pollTitle}" with others so they can vote
            {isReusingExisting && (
              <span className="block mt-1 text-xs text-green-600">
                ✓ Using existing share link for this poll
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'link'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Copy className="h-4 w-4" />
              Share Link
            </div>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'qr'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <QrCode className="h-4 w-4" />
              QR Code
            </div>
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === 'link' && (
            <>
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
            </>
          )}

          {activeTab === 'qr' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">QR Code</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code with your phone camera to open the poll
                </p>
              </div>
              
              <div className="flex justify-center">
                <QRCodeGenerator 
                  url={shareUrl} 
                  size={200}
                  className="p-4 bg-white rounded-lg border border-gray-200"
                />
              </div>
              
              <div className="flex justify-center gap-3">
                <Button
                  onClick={handleDownloadQR}
                  disabled={!shareUrl}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download QR Code
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyUrl}
                  disabled={!shareUrl}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  The QR code contains the same share link as above
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
