import { NextResponse } from "next/server";

// Placeholder data for development
const mockPolls = [
  {
    id: "1",
    title: "What's your favorite programming language?",
    description: "Choose the programming language you enjoy working with the most",
    options: ["JavaScript", "Python", "TypeScript", "Rust", "Go"],
    votes: [15, 12, 8, 5, 3],
    createdBy: "user@example.com",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Which framework do you prefer for web development?",
    description: "Select your go-to web framework",
    options: ["Next.js", "React", "Vue.js", "Angular", "Svelte"],
    votes: [20, 18, 10, 7, 4],
    createdBy: "user@example.com",
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  // TODO: Implement actual database query
  return NextResponse.json({ polls: mockPolls });
}

export async function POST() {
  // TODO: Implement poll creation
  return NextResponse.json(
    { message: "Poll creation will be implemented in the next phase" },
    { status: 501 }
  );
}
