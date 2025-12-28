import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
