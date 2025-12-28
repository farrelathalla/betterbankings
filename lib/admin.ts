import { NextResponse } from "next/server";
import { getAuthUser } from "./auth";

// Check if the current user is an admin
export async function isAdmin(): Promise<boolean> {
  const user = await getAuthUser();
  return user?.role === "admin";
}

// Require admin role - returns error response if not admin
export async function requireAdmin(): Promise<NextResponse | null> {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  if (user.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  return null; // No error, user is admin
}

// Get current user or return unauthorized response
export async function requireAuth(): Promise<
  | {
      user: ReturnType<typeof getAuthUser> extends Promise<infer T> ? T : never;
    }
  | NextResponse
> {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  return { user };
}
