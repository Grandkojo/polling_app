import { getPollWithResults } from '@/lib/actions/poll-results';
import PollResultsChart from '@/components/PollResultsChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import ShareButton from '@/components/ShareButton';

interface PollResultsPageProps {
  params: {
    id: string;
  };
}

export default async function PollResultsPage({ params }: PollResultsPageProps) {
  const result = await getPollWithResults(params.id);

  if (!result.success || !result.data) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Poll Not Found</h1>
          <p className="text-gray-600 mb-6">The poll you're looking for doesn't exist or has been removed.</p>
          <Link href="/polls">
            <Button>Browse All Polls</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { poll, results, totalVotes } = result.data;
  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/polls/${poll.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Poll
            </Button>
          </Link>
          <Badge variant={isExpired ? 'secondary' : 'default'}>
            {isExpired ? 'Expired' : 'Active'}
          </Badge>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{poll.title}</h1>
        {poll.description && (
          <p className="text-gray-600 mb-4">{poll.description}</p>
        )}
        
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Created {new Date(poll.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
          </div>
          {poll.expires_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {isExpired ? 'Expired' : 'Expires'} {new Date(poll.expires_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="mb-8">
        <PollResultsChart
          results={results}
          pollTitle={poll.title}
          totalVotes={totalVotes}
        />
      </div>

      {/* Poll Options Details */}
      <Card>
        <CardHeader>
          <CardTitle>Poll Options</CardTitle>
          <CardDescription>
            Detailed breakdown of all poll options and their vote counts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {poll.poll_options?.map((option: any, index: number) => {
              const result = results.find(r => r.option_id === option.id);
              const voteCount = result?.vote_count || 0;
              const percentage = result?.percentage || 0;
              
              return (
                <div key={option.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium">{option.text}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{voteCount} votes</div>
                    <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Share Section */}
      <div className="mt-8 text-center">
        <Card>
          <CardContent className="py-6">
            <h3 className="text-lg font-semibold mb-2">Share These Results</h3>
            <p className="text-gray-600 mb-4">
              Share this poll with others so they can see the results and vote too!
            </p>
            <ShareButton
              pollId={poll.id}
              pollTitle={poll.title}
              userId="anonymous"
              variant="default"
              size="sm"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

