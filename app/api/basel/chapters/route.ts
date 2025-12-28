import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET /api/basel/chapters - List chapters (optionally filter by standardId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const standardId = searchParams.get("standardId");
    const standardCode = searchParams.get("standardCode");

    const where: { standardId?: string; standard?: { code: string } } = {};
    if (standardId) where.standardId = standardId;
    if (standardCode) where.standard = { code: standardCode.toUpperCase() };

    const chapters = await prisma.baselChapter.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        standard: {
          select: { id: true, code: true, name: true },
        },
        sections: {
          orderBy: { order: "asc" },
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 }
    );
  }
}

// POST /api/basel/chapters - Create new chapter (admin only)
export async function POST(request: Request) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const body = await request.json();
    const { code, title, standardId, effectiveDate, status, order } = body;

    if (!code || !title || !standardId) {
      return NextResponse.json(
        { error: "Code, title, and standardId are required" },
        { status: 400 }
      );
    }

    // Check if chapter already exists in this standard
    const existing = await prisma.baselChapter.findUnique({
      where: {
        standardId_code: { standardId, code },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A chapter with this code already exists in this standard" },
        { status: 409 }
      );
    }

    const chapter = await prisma.baselChapter.create({
      data: {
        code,
        title,
        standardId,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        lastUpdate: new Date(),
        status: status || "current",
        order: order || 0,
      },
      include: {
        standard: { select: { code: true, name: true } },
      },
    });

    return NextResponse.json({ chapter }, { status: 201 });
  } catch (error) {
    console.error("Error creating chapter:", error);
    return NextResponse.json(
      { error: "Failed to create chapter" },
      { status: 500 }
    );
  }
}
