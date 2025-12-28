import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET /api/basel/subsections/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const subsection = await prisma.baselSubsection.findUnique({
      where: { id },
      include: {
        section: {
          include: {
            chapter: {
              include: {
                standard: { select: { code: true, name: true } },
              },
            },
          },
        },
        footnotes: { orderBy: { number: "asc" } },
        faqs: { orderBy: { order: "asc" } },
      },
    });

    if (!subsection) {
      return NextResponse.json(
        { error: "Subsection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ subsection });
  } catch (error) {
    console.error("Error fetching subsection:", error);
    return NextResponse.json(
      { error: "Failed to fetch subsection" },
      { status: 500 }
    );
  }
}

// PUT /api/basel/subsections/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await params;
    const body = await request.json();
    const { number, content, order } = body;

    const subsection = await prisma.baselSubsection.update({
      where: { id },
      data: {
        ...(number && { number }),
        ...(content !== undefined && { content }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json({ subsection });
  } catch (error) {
    console.error("Error updating subsection:", error);
    return NextResponse.json(
      { error: "Failed to update subsection" },
      { status: 500 }
    );
  }
}

// DELETE /api/basel/subsections/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await params;

    await prisma.baselSubsection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subsection:", error);
    return NextResponse.json(
      { error: "Failed to delete subsection" },
      { status: 500 }
    );
  }
}
