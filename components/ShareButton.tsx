'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShareModal from './ShareModal';

interface ShareButtonProps {
  pollId: string;
  pollTitle: string;
  userId: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export default function ShareButton({ 
  pollId, 
  pollTitle, 
  userId, 
  variant = 'outline',
  size = 'default',
  className 
}: ShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShare = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        className={className}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      <ShareModal
        pollId={pollId}
        pollTitle={pollTitle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userId={userId}
      />
    </>
  );
}
