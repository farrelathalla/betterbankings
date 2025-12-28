import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET /api/basel/standards - List all standards
export async function GET() {
  try {
    const standards = await prisma.baselStandard.findMany({
      orderBy: { order: "asc" },
      include: {
        chapters: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            code: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({ standards });
  } catch (error) {
    console.error("Error fetching standards:", error);
    return NextResponse.json(
      { error: "Failed to fetch standards" },
      { status: 500 }
    );
  }
}

// POST /api/basel/standards - Create new standard (admin only)
export async function POST(request: Request) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const body = await request.json();
    const { code, name, description, order } = body;

    if (!code || !name) {
      return NextResponse.json(
        { error: "Code and name are required" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.baselStandard.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A standard with this code already exists" },
        { status: 409 }
      );
    }

    const standard = await prisma.baselStandard.create({
      data: {
        code: code.toUpperCase(),
        name,
        description: description || null,
        order: order || 0,
      },
    });

    return NextResponse.json({ standard }, { status: 201 });
  } catch (error) {
    console.error("Error creating standard:", error);
    return NextResponse.json(
      { error: "Failed to create standard" },
      { status: 500 }
    );
  }
}
