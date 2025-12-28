import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET /api/basel/sections - List sections (filter by chapterId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");

    if (!chapterId) {
      return NextResponse.json(
        { error: "chapterId is required" },
        { status: 400 }
      );
    }

    const sections = await prisma.baselSection.findMany({
      where: { chapterId },
      orderBy: { order: "asc" },
      include: {
        subsections: {
          orderBy: { order: "asc" },
          select: { id: true, number: true },
        },
      },
    });

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Error fetching sections:", error);
    return NextResponse.json(
      { error: "Failed to fetch sections" },
      { status: 500 }
    );
  }
}

// POST /api/basel/sections - Create new section (admin only)
export async function POST(request: Request) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const body = await request.json();
    const { title, chapterId, order } = body;

    if (!title || !chapterId) {
      return NextResponse.json(
        { error: "Title and chapterId are required" },
        { status: 400 }
      );
    }

    const section = await prisma.baselSection.create({
      data: {
        title,
        chapterId,
        order: order || 0,
      },
    });

    // Update chapter's lastUpdate
    await prisma.baselChapter.update({
      where: { id: chapterId },
      data: { lastUpdate: new Date() },
    });

    return NextResponse.json({ section }, { status: 201 });
  } catch (error) {
    console.error("Error creating section:", error);
    return NextResponse.json(
      { error: "Failed to create section" },
      { status: 500 }
    );
  }
}
