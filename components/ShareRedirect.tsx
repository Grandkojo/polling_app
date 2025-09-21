'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

interface ShareRedirectProps {
  shareCode: string;
}

export default function ShareRedirect({ shareCode }: ShareRedirectProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const lookupShareCode = async () => {
      try {
        setIsLoading(true);
        
        // Direct lookup using the client
        const { data: shareData, error: shareError } = await supabase
          .from('poll_shares')
          .select(`
            share_code,
            expires_at,
            created_at,
            polls (
              id,
              title,
              description,
              is_public,
              allow_multiple_votes,
              allow_anonymous_votes,
              expires_at,
              created_by,
              created_at,
              updated_at,
              poll_options (
                id,
                text,
                order_index
              )
            )
          `)
          .eq('share_code', shareCode.toUpperCase())
          .single();

        if (shareError) {
          console.error('Share lookup error:', shareError);
          router.push('/polls?error=Invalid%20share%20link');
          return;
        }

        if (!shareData) {
          router.push('/polls?error=Share%20code%20not%20found');
          return;
        }

        // Check if share code is expired
        if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
          router.push('/polls?error=Share%20code%20has%20expired');
          return;
        }

        // Check if poll is expired
        const poll = shareData.polls;
        if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
          router.push('/polls?error=This%20poll%20has%20expired');
          return;
        }

        if (!poll.is_public) {
          router.push('/polls?error=This%20poll%20is%20no%20longer%20public');
          return;
        }

        // Redirect to the poll page
        router.push(`/polls/${poll.id}`);
      } catch (error) {
        console.error('Share redirect error:', error);
        router.push('/polls?error=Invalid%20share%20link');
      } finally {
        setIsLoading(false);
      }
    };

    lookupShareCode();
  }, [shareCode, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to poll...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => router.push('/polls')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Polls
          </button>
        </div>
      </div>
    );
  }

  return null;
}

