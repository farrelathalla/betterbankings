import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET /api/basel/subsections - List subsections (filter by sectionId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("sectionId");

    if (!sectionId) {
      return NextResponse.json(
        { error: "sectionId is required" },
        { status: 400 }
      );
    }

    const subsections = await prisma.baselSubsection.findMany({
      where: { sectionId },
      orderBy: { order: "asc" },
      include: {
        footnotes: { orderBy: { number: "asc" } },
        faqs: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json({ subsections });
  } catch (error) {
    console.error("Error fetching subsections:", error);
    return NextResponse.json(
      { error: "Failed to fetch subsections" },
      { status: 500 }
    );
  }
}

// POST /api/basel/subsections - Create new subsection (admin only)
export async function POST(request: Request) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const body = await request.json();
    const { number, content, sectionId, order } = body;

    if (!number || !sectionId) {
      return NextResponse.json(
        { error: "Number and sectionId are required" },
        { status: 400 }
      );
    }

    // Check if subsection number already exists in this section
    const existing = await prisma.baselSubsection.findUnique({
      where: {
        sectionId_number: { sectionId, number },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "A subsection with this number already exists in this section",
        },
        { status: 409 }
      );
    }

    const subsection = await prisma.baselSubsection.create({
      data: {
        number,
        content: content || "",
        sectionId,
        order: order || 0,
      },
    });

    return NextResponse.json({ subsection }, { status: 201 });
  } catch (error) {
    console.error("Error creating subsection:", error);
    return NextResponse.json(
      { error: "Failed to create subsection" },
      { status: 500 }
    );
  }
}
