// Simple authentication utilities for the polling app
// In a real app, you'd integrate with NextAuth.js or Supabase Auth

export interface User {
  id: string;
  name: string;
  email: string;
}

// For development/testing purposes
// In production, this would come from your actual auth system
export function getCurrentUser(): User | null {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    return null;
  }

  // For now, return a mock user
  // In a real app, you'd get this from your auth context or session
  return {
    id: 'mock-user-id-123',
    name: 'Test User',
    email: 'test@example.com'
  };
}

export function getCurrentUserId(): string | null {
  const user = getCurrentUser();
  return user?.id || null;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// Mock login function for testing
export function mockLogin(email: string, password: string): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'mock-user-id-123',
        name: 'Test User',
        email: email
      });
    }, 1000);
  });
}

// Mock logout function
export function mockLogout(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
}

