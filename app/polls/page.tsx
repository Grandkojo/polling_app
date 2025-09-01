'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { Calendar, Users, Vote } from 'lucide-react';

interface Poll {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  poll_options: Array<{
    id: string;
    text: string;
  }>;
  total_votes?: number;
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPolls() {
      try {
        const { data, error } = await supabase
          .from('polls')
          .select(`
            id,
            title,
            description,
            created_at,
            poll_options(id, text)
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching polls:', error);
        } else {
          // Fetch vote counts for each poll
          const pollsWithVotes = await Promise.all(
            (data || []).map(async (poll: any) => {
              const { data: votes, error: voteError } = await supabase
                .from('votes')
                .select('id')
                .eq('poll_id', poll.id);

              if (voteError) {
                console.error('Error fetching vote counts for poll:', poll.id, voteError);
                return { ...poll, total_votes: 0 };
              }

              return { ...poll, total_votes: votes?.length || 0 };
            })
          );

          setPolls(pollsWithVotes);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPolls();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Loading polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Polls</h1>
        <p className="text-gray-600 mt-2">Browse and participate in polls created by the community</p>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Vote className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No polls yet</h3>
            <p className="text-gray-500 mb-6">Be the first to create a poll and start the conversation!</p>
            <Link href="/polls/create">
              <Button>
                Create Your First Poll
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => (
            <Card key={poll.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-2">{poll.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {poll.description || 'No description provided'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(poll.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    {poll.poll_options?.length || 0} options
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Vote className="h-4 w-4 mr-2" />
                    {poll.total_votes || 0} votes
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Link href={`/polls/${poll.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Poll
                      </Button>
                    </Link>
                    <Link href={`/polls/${poll.id}`} className="flex-1">
                      <Button className="w-full">
                        Vote Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
