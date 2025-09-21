import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import UserManagement from "@/components/UserManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCommentStats } from "@/lib/actions/comments";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Check if user is admin
  const { data: user, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (error || !user || user.role !== 'admin') {
    redirect("/dashboard");
  }

  // Get some basic stats
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('role');

  const { data: polls, error: pollsError } = await supabase
    .from('polls')
    .select('id, created_at');

  // Get comment statistics
  const commentStatsResult = await getCommentStats();

  const userCount = users?.length || 0;
  const adminCount = users?.filter(u => u.role === 'admin').length || 0;
  const moderatorCount = users?.filter(u => u.role === 'moderator').length || 0;
  const pollCount = polls?.length || 0;
  const commentStats = commentStatsResult.success ? commentStatsResult.data : {
    totalComments: 0,
    commentsToday: 0,
    commentsThisWeek: 0
  };

  // Debug logging
  if (usersError) {
    console.error('Error fetching users:', usersError);
  }
  if (pollsError) {
    console.error('Error fetching polls:', pollsError);
  }

  const stats = {
    userCount,
    adminCount,
    moderatorCount,
    pollCount,
    ...commentStats
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage users, polls, and system settings
            </p>
          </div>
          <Badge variant="destructive" className="text-xs sm:text-sm px-3 py-1 w-fit">
            Admin Access
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Total Users</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.userCount || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Admins</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-red-600">{stats?.adminCount || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              Admin users
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Moderators</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-orange-600">{stats?.moderatorCount || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              Moderator users
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Total Polls</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats?.pollCount || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              Created polls
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Total Comments</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats?.totalComments || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              All comments
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Comments Today</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600">{stats?.commentsToday || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              Today's activity
            </p>
          </CardContent>
        </Card>
      </div>

        {/* User Management Section */}
        <div className="mt-8">
          <UserManagement />
        </div>
      </div>
    </div>
  );
}

