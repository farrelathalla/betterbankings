import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, getClientIP } from "@/lib/auth";
import { headers } from "next/headers";
const MAX_DAILY_CLICKS = 3;
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { a, b } = body;
    // Validate inputs
    if (typeof a !== "number" || typeof b !== "number") {
      return NextResponse.json(
        { error: "Please provide valid numbers for A and B" },
        { status: 400 }
      );
    }
    // Check if user is authenticated
    const user = await getAuthUser();
    if (user) {
      // Authenticated users have unlimited access
      const result = a + b;
      return NextResponse.json({
        success: true,
        result,
        unlimited: true,
      });
    }
    // For anonymous users, check rate limit
    const headersList = await headers();
    const ip = getClientIP(headersList);
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    // Find or create rate limit record
    let rateLimit = await prisma.rateLimit.findUnique({
      where: {
        ipAddress_date: {
          ipAddress: ip,
          date: today,
        },
      },
    });
    if (!rateLimit) {
      // First request today
      rateLimit = await prisma.rateLimit.create({
        data: {
          ipAddress: ip,
          date: today,
          clickCount: 0,
        },
      });
    }
    // Check if limit exceeded
    if (rateLimit.clickCount >= MAX_DAILY_CLICKS) {
      return NextResponse.json(
        {
          error: "Daily limit reached. Please sign in for unlimited access.",
          remainingClicks: 0,
          limitReached: true,
        },
        { status: 429 }
      );
    }
    // Increment click count
    await prisma.rateLimit.update({
      where: {
        ipAddress_date: {
          ipAddress: ip,
          date: today,
        },
      },
      data: {
        clickCount: rateLimit.clickCount + 1,
      },
    });
    const result = a + b;
    const remainingClicks = MAX_DAILY_CLICKS - (rateLimit.clickCount + 1);
    return NextResponse.json({
      success: true,
      result,
      remainingClicks,
      unlimited: false,
    });
  } catch (error) {
    console.error("Count API error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
