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
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, polls, and system settings
          </p>
        </div>
        <Badge variant="destructive" className="text-sm">
          Admin Access
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.userCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.adminCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Admin users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moderators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.moderatorCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Moderator users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pollCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Created polls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalComments || 0}</div>
            <p className="text-xs text-muted-foreground">
              All comments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.commentsToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              Today's activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <UserManagement />
    </div>
  );
}

