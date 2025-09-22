'use client';

import { useState, useEffect } from 'react';
import { Copy, Share2, ExternalLink, QrCode, Download, Eye } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'preview'>('link');

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
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'preview'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
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

          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Social Media Preview</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This is how your poll will appear when shared on social media
                </p>
              </div>
              
              {/* Preview Card */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-600 relative">
                  <img 
                    src={`/api/og/poll/${pollId}`}
                    alt={`Preview for ${pollTitle}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-2xl mb-2">📊</div>
                      <div className="text-lg font-semibold">Loading Preview...</div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{pollTitle}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Vote on this poll - Multiple options available
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>polling-app.vercel.app</span>
                    <span>•</span>
                    <span>Polling App</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Supported Platforms</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Facebook</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Twitter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>LinkedIn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Discord</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Slack</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Telegram</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
                  <strong>Tip:</strong> When you share the link, platforms will automatically fetch this preview image and display it with your poll title and description.
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
