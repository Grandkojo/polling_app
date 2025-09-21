'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { UserRole } from '@/types/database';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

interface UserManagementProps {
  className?: string;
}

export default function UserManagement({ className }: UserManagementProps) {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      setUpdating(userId);
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'secondary';
      case 'user':
        return 'default';
      default:
        return 'outline';
    }
  };

  if (!isAdmin) {
    return (
      <Alert>
        <AlertDescription>
          You don't have permission to access this page. Admin privileges required.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Loading users...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={`${className} shadow-lg`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900">User Management</CardTitle>
        <CardDescription className="text-sm text-gray-600">
          Manage user roles and permissions. You are currently logged in as: <span className="font-medium">{user?.name}</span> ({user?.role})
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-3 sm:space-y-4">
          {users.map((userItem) => (
            <div
              key={userItem.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex-1 mb-3 sm:mb-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3 className="font-medium text-gray-900 text-base">{userItem.name}</h3>
                  <Badge 
                    variant={getRoleBadgeVariant(userItem.role)}
                    className="text-xs px-2 py-1 w-fit"
                  >
                    {userItem.role}
                  </Badge>
                </div>
                <p 
                  className="text-sm text-gray-600 mb-1 truncate" 
                  title={userItem.email}
                >
                  {userItem.email}
                </p>
                <p className="text-xs text-gray-500">
                  Joined: {new Date(userItem.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Select
                  value={userItem.role}
                  onValueChange={(value: UserRole) => updateUserRole(userItem.id, value)}
                  disabled={updating === userItem.id || userItem.id === user?.id}
                >
                  <SelectTrigger className="w-full sm:w-32 min-h-[40px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                
                {updating === userItem.id && (
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Updating...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No users found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}


