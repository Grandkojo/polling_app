"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase/client';
import { Edit, Trash2, Eye, Calendar, Vote } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ShareButton from '@/components/ShareButton';

interface Poll {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  is_public: boolean;
  poll_options: Array<{
    id: string;
    text: string;
  }>;
  _count?: {
    votes: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserPolls();
    }
  }, [session?.user?.id]);

  const fetchUserPolls = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          id,
          title,
          description,
          created_at,
          is_public,
          poll_options(id, text)
        `)
        .eq('created_by', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching polls:', error);
        toast.error('Failed to load your polls');
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
      toast.error('Failed to load your polls');
    } finally {
      setLoading(false);
    }
  };

  const deletePoll = async (pollId: string) => {
    if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId);

      if (error) {
        console.error('Error deleting poll:', error);
        toast.error('Failed to delete poll');
      } else {
        toast.success('Poll deleted successfully');
        fetchUserPolls(); // Refresh the list
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete poll');
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {session.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">My Polls</h2>
            <Link href="/polls/create">
              <Button>
                Create New Poll
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>Loading your polls...</p>
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Vote className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No polls yet</h3>
              <p className="text-gray-500 mb-6">Create your first poll to get started!</p>
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
                <CardHeader className="pb-3">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="line-clamp-2 text-base">{poll.title}</CardTitle>
                        <CardDescription className="line-clamp-2 text-sm mt-1">
                          {poll.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Link href={`/polls/${poll.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/polls/${poll.id}`}>
                          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 h-8 px-2">
                            Vote
                          </Button>
                        </Link>
                        {poll.is_public && (
                          <ShareButton
                            pollId={poll.id}
                            pollTitle={poll.title}
                            userId={session.user?.id || ''}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                          />
                        )}
                        <Link href={`/polls/${poll.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deletePoll(poll.id)}
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(poll.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Vote className="h-4 w-4 mr-2" />
                        {poll.total_votes || 0} votes
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        poll.is_public 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {poll.is_public ? 'Public' : 'Private'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {poll.poll_options?.length || 0} options
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <div className="fixed top-4 right-4 z-50">
        {/* Toast notifications will appear here */}
      </div>
    </div>
  );
}
