"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Polls</h3>
            <p className="text-gray-600 text-sm mb-4">Manage polls you've created</p>
            <Link href="/polls" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View All →
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Poll</h3>
            <p className="text-gray-600 text-sm mb-4">Start a new poll for the community</p>
            <Link href="/polls/create" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              Create Poll →
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Activity</h3>
            <p className="text-gray-600 text-sm mb-4">Your recent poll interactions</p>
            <span className="text-gray-400 text-sm">Coming soon...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
