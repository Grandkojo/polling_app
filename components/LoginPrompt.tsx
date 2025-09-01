'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPrompt() {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Login Required</CardTitle>
          <CardDescription>
            You need to be logged in to create polls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Please sign in to your account to create polls
            </p>
            
            <div className="space-y-2">
              <Link href="/auth/login">
                <Button className="w-full">
                  Sign In
                </Button>
              </Link>
              
              <Link href="/auth/register">
                <Button variant="outline" className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
