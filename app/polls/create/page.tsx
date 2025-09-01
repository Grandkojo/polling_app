'use client';

import { useAuth } from "@/components/AuthProvider";
import CreatePollForm from "@/components/CreatePollForm";
import LoginPrompt from "@/components/LoginPrompt";
import { Toaster } from "react-hot-toast";

export default function CreatePollPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create New Poll</h1>
        <p className="text-gray-600 mt-2">Design and publish your own poll for the community</p>
      </div>

      {user ? (
        <CreatePollForm />
      ) : (
        <LoginPrompt />
      )}
      
      <Toaster position="top-right" />
    </div>
  );
}
