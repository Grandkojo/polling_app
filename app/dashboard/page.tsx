"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/lib/supabase/client';
import { Edit, Trash2, Eye, Calendar, Vote, Shield, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ShareButton from '@/components/ShareButton';
import { useAuth } from '@/components/AuthProvider';

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
  const { user, isAdmin, isModerator } = useAuth();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {session.user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-gray-600">Welcome back, <span className="font-medium text-gray-900">{session.user?.name}</span></span>
                  <Badge 
                    variant={user?.role === 'admin' ? 'destructive' : user?.role === 'moderator' ? 'secondary' : 'default'}
                    className="text-xs px-2 py-1"
                  >
                    {user?.role}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {(isAdmin || isModerator) && (
                <Link href="/admin">
                  <Button variant="outline" className="flex items-center gap-2 hover:bg-indigo-50 hover:border-indigo-300">
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Polls</p>
                <p className="text-2xl font-bold text-gray-900">{polls.length}</p>
              </div>
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center">
                <Vote className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {polls.reduce((sum, poll) => sum + (poll.total_votes || 0), 0)}
                </p>
              </div>
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Public Polls</p>
                <p className="text-2xl font-bold text-gray-900">
                  {polls.filter(poll => poll.is_public).length}
                </p>
              </div>
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* My Polls Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Polls</h2>
              <p className="text-gray-600 mt-1">Manage and track your polls</p>
            </div>
            <Link href="/polls/create">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                <Vote className="h-4 w-4 mr-2" />
                Create New Poll
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your polls...</p>
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Vote className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No polls yet</h3>
              <p className="text-gray-600 mb-8">Create your first poll to get started and engage with your audience!</p>
              <Link href="/polls/create">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                  <Vote className="h-4 w-4 mr-2" />
                  Create Your First Poll
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {polls.map((poll) => (
              <Card key={poll.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 rounded-xl overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="line-clamp-2 text-lg font-semibold group-hover:text-indigo-600 transition-colors">
                          {poll.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-sm mt-2 text-gray-600">
                          {poll.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Link href={`/polls/${poll.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-indigo-50 hover:text-indigo-600">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/polls/${poll.id}`}>
                          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 px-2">
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
                            className="h-8 px-2 hover:bg-blue-50 hover:text-blue-600"
                          />
                        )}
                        <Link href={`/polls/${poll.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deletePoll(poll.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
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
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        poll.is_public 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {poll.is_public ? 'Public' : 'Private'}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
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
