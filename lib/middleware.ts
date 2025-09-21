import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@/types/database';

export interface RoleConfig {
  roles: UserRole[];
  redirectTo?: string;
}

// Define role-based access for different routes
const roleConfigs: Record<string, RoleConfig> = {
  '/admin': {
    roles: ['admin'],
    redirectTo: '/dashboard'
  },
  '/admin/users': {
    roles: ['admin'],
    redirectTo: '/dashboard'
  },
  '/moderator': {
    roles: ['admin', 'moderator'],
    redirectTo: '/dashboard'
  }
};

export async function withRoleAuth(
  request: NextRequest,
  requiredRoles: UserRole[],
  redirectTo: string = '/dashboard'
) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const userRole = token.role as UserRole;
  
  if (!requiredRoles.includes(userRole)) {
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return null; // Allow access
}

export function createRoleMiddleware() {
  return async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Check if the current path requires role-based access
    const config = Object.entries(roleConfigs).find(([path]) => 
      pathname.startsWith(path)
    );

    if (!config) {
      return NextResponse.next();
    }

    const [, roleConfig] = config;
    const result = await withRoleAuth(
      request, 
      roleConfig.roles, 
      roleConfig.redirectTo
    );

    return result || NextResponse.next();
  };
}

// Helper function to check if user has required role
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

// Helper function to check if user is admin
export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'admin';
}

// Helper function to check if user is moderator or admin
export function isModerator(userRole: UserRole): boolean {
  return userRole === 'moderator' || userRole === 'admin';
}


