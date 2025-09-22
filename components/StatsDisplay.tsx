import { supabaseAdmin } from '@/lib/supabase/server';

export default async function StatsDisplay() {
  try {
    // Fetch real statistics from database
    const [
      { count: totalPolls },
      { count: totalVotes },
      { count: totalUsers }
    ] = await Promise.all([
      supabaseAdmin.from('polls').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('votes').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true })
    ]);

    return (
      <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-indigo-600">
            {totalUsers || 0}
          </div>
          <div className="text-sm text-gray-600">Registered Users</div>
        </div>
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-purple-600">
            {totalPolls || 0}
          </div>
          <div className="text-sm text-gray-600">Polls Created</div>
        </div>
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">
            {totalVotes || 0}
          </div>
          <div className="text-sm text-gray-600">Votes Cast</div>
        </div>
      </div>
    );
  } catch (error) {
    // Fallback to generic stats if database query fails
    return (
      <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-indigo-600">Growing</div>
          <div className="text-sm text-gray-600">Community</div>
        </div>
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-purple-600">Real-time</div>
          <div className="text-sm text-gray-600">Results</div>
        </div>
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">Free</div>
          <div className="text-sm text-gray-600">Forever</div>
        </div>
      </div>
    );
  }
}
