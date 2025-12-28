import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, getClientIP } from "@/lib/auth";
import { headers } from "next/headers";
const MAX_DAILY_CLICKS = 3;
export async function GET() {
  try {
    // Check if user is authenticated
    const user = await getAuthUser();
    if (user) {
      return NextResponse.json({
        unlimited: true,
        remainingClicks: null,
        isAuthenticated: true,
      });
    }
    // For anonymous users, get current status
    const headersList = await headers();
    const ip = getClientIP(headersList);
    const today = new Date().toISOString().split("T")[0];
    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        ipAddress_date: {
          ipAddress: ip,
          date: today,
        },
      },
    });
    const clickCount = rateLimit?.clickCount || 0;
    const remainingClicks = Math.max(0, MAX_DAILY_CLICKS - clickCount);
    return NextResponse.json({
      unlimited: false,
      remainingClicks,
      isAuthenticated: false,
    });
  } catch (error) {
    console.error("Count status error:", error);
    return NextResponse.json(
      { error: "An error occurred", unlimited: false, remainingClicks: 3 },
      { status: 500 }
    );
  }
}
