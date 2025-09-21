'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import ShareButton from '@/components/ShareButton';
import PollResultsChart, { PollResult } from '@/components/PollResultsChart';
import CommentList from '@/components/CommentList';
import CommentModeration from '@/components/CommentModeration';

export default function PollPage() {
  const params = useParams();
  const { user, isAdmin, isModerator } = useAuth();
  const router = useRouter();
  const [poll, setPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [chartResults, setChartResults] = useState<PollResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [comments, setComments] = useState<any[]>([]);

  const fetchPoll = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          poll_options(*)
        `)
        .eq('id', params.id)
        .single();

      if (error) {
        setError('Poll not found');
        return;
      }

      // Fetch all votes for this poll
      const { data: allVotes, error: voteError } = await supabase
        .from('votes')
        .select('option_id')
        .eq('poll_id', params.id);

      if (voteError) {
        console.error('Error fetching votes:', voteError);
      }

      // Count votes per option
      const voteCounts: { [key: string]: number } = {};
      allVotes?.forEach((vote: any) => {
        voteCounts[vote.option_id] = (voteCounts[vote.option_id] || 0) + 1;
      });

      // Add vote counts to poll options
      const optionsWithVotes = data.poll_options.map((option: any) => ({
        ...option,
        votes_count: voteCounts[option.id] || 0
      }));

      // Calculate total votes
      const totalVotes = allVotes?.length || 0;

      // Prepare chart results data
      const chartData: PollResult[] = optionsWithVotes.map((option: any) => ({
        option_id: option.id,
        option_text: option.text,
        vote_count: option.votes_count || 0,
        percentage: totalVotes > 0 ? ((option.votes_count || 0) / totalVotes * 100) : 0
      }));

      setPoll({
        ...data,
        poll_options: optionsWithVotes,
        total_votes: totalVotes
      });

      setChartResults(chartData);

      // Check if user has already voted
      if (user?.id) {
        const { data: userVote, error: userVoteError } = await supabase
          .from('votes')
          .select('id')
          .eq('poll_id', params.id)
          .eq('user_id', user.id)
          .limit(1);

        if (!userVoteError && userVote && userVote.length > 0) {
          setHasVoted(true);
        }
      }
    } catch (err) {
      setError('Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!isAdmin && !isModerator) return;
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users(name)
        `)
        .eq('poll_id', params.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
      } else {
        setComments(data || []);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  useEffect(() => {
    fetchPoll();
    fetchComments();
  }, [params.id, isAdmin, isModerator]);

  const deletePoll = async (pollId: string) => {
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
        router.push('/polls');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete poll');
    }
  };

  const handleOptionSelect = (optionId: string) => {
    if (poll.allow_multiple_votes) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0) {
      toast.error('Please select at least one option');
      return;
    }

    if (!poll.allow_multiple_votes && selectedOptions.length > 1) {
      toast.error('This poll only allows single votes');
      return;
    }

    setVoting(true);

    try {
      const votes = selectedOptions.map(optionId => ({
        poll_id: poll.id,
        option_id: optionId,
        user_id: user?.id || null // Use user_id instead of voter_id, null for anonymous
      }));

      const { error } = await supabase
        .from('votes')
        .insert(votes);

      if (error) {
        console.error('Error submitting vote:', error);
        if (error.code === '23505') {
          // Duplicate vote - user has already voted
          toast.error('You have already voted on this poll!');
          setHasVoted(true);
          // Still refresh to show current results
          fetchPoll();
        } else {
          toast.error(`Failed to submit vote: ${error.message}`);
        }
      } else {
        toast.success('Vote submitted successfully!');
        setHasVoted(true);
        setSelectedOptions([]);
        // Refresh poll data to show updated results
        fetchPoll();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to submit vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-red-600">Poll not found</p>
        </div>
      </div>
    );
  }

      return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">{poll.title}</h1>
        {poll.description && (
          <p className="text-gray-600 mt-2">{poll.description}</p>
        )}
        {poll.is_public && (
          <div className="mt-4">
            <ShareButton
              pollId={poll.id}
              pollTitle={poll.title}
              userId={user?.id || 'anonymous'}
              variant="default"
              size="sm"
            />
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Poll Options</CardTitle>
                <CardDescription>
                  {poll.poll_options?.length || 0} options available
                </CardDescription>
              </div>
              {user && poll.created_by === user.id && (
                <div className="flex items-center space-x-2">
                  <ShareButton
                    pollId={poll.id}
                    pollTitle={poll.title}
                    userId={user.id}
                    variant="outline"
                    size="sm"
                  />
                  <Link href={`/polls/${poll.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
                        deletePoll(poll.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasVoted ? (
              <div className="text-center py-8">
                <div className="text-green-600 text-2xl mb-2">✅</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank you for voting!</h3>
                <p className="text-gray-600 mb-4">Your vote has been recorded successfully.</p>
                
                {/* Show current results with chart */}
                <div className="mt-6">
                  <PollResultsChart
                    results={chartResults}
                    pollTitle={poll.title}
                    totalVotes={poll.total_votes || 0}
                    className="mb-6"
                  />
                </div>
                
                <div className="mt-6 flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setHasVoted(false)}
                    className="flex-1"
                  >
                    Vote Again
                  </Button>
                  <Link href={`/polls/${poll.id}/results`}>
                    <Button variant="outline" className="flex-1">
                      View Detailed Results
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {poll.poll_options?.map((option: any) => (
                  <div 
                    key={option.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedOptions.includes(option.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleOptionSelect(option.id)}
                  >
                    <div className="flex items-center space-x-3">
                      {poll.allow_multiple_votes ? (
                        <div className={`w-4 h-4 border-2 rounded ${
                          selectedOptions.includes(option.id) 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {selectedOptions.includes(option.id) && (
                            <div className="w-2 h-2 bg-white rounded-sm m-0.5"></div>
                          )}
                        </div>
                      ) : (
                        <div className={`w-4 h-4 border-2 rounded-full ${
                          selectedOptions.includes(option.id) 
                            ? 'border-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {selectedOptions.includes(option.id) && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full m-0.5"></div>
                          )}
                        </div>
                      )}
                      <p className="font-medium">{option.text}</p>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={handleVote}
                    disabled={voting || selectedOptions.length === 0}
                  >
                    {voting ? 'Submitting Vote...' : 'Submit Vote'}
                  </Button>
                  
                  {poll.total_votes > 0 && (
                    <Button 
                      variant="outline"
                      className="w-full" 
                      onClick={() => setShowResults(true)}
                    >
                      View Current Results ({poll.total_votes} votes)
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results Modal/Section */}
      {showResults && !hasVoted && (
        <div className="mt-8">
          <PollResultsChart
            results={chartResults}
            pollTitle={poll.title}
            totalVotes={poll.total_votes || 0}
          />
          <div className="text-center mt-4">
            <Button 
              variant="outline"
              onClick={() => setShowResults(false)}
            >
              Back to Voting
            </Button>
          </div>
        </div>
      )}

      {/* Comment Moderation Section (Admin/Moderator only) */}
      {(isAdmin || isModerator) && (
        <div className="mt-8">
          <CommentModeration 
            comments={comments} 
            userRole={isAdmin ? 'admin' : 'moderator'}
            pollId={poll.id}
          />
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-8">
        <CommentList pollId={poll.id} />
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Poll created on {new Date(poll.created_at).toLocaleDateString()}
        </p>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
