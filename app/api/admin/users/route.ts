import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/types/database";
import { z } from "zod";

// GET /api/admin/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || !user || user.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/admin/users - Update user role (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || !user || user.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input
    const updateSchema = z.object({
      userId: z.string().uuid(),
      role: z.enum(['user', 'moderator', 'admin']),
    });

    const validationResult = updateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { userId, role } = validationResult.data;

    // Prevent admin from changing their own role
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    // Update user role
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select('id, name, email, role, created_at')
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "User role updated successfully",
      user: updatedUser 
    });
  } catch (error) {
    console.error("Admin users PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


