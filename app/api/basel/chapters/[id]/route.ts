import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET /api/basel/chapters/[id] - Get single chapter with full content
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const chapter = await prisma.baselChapter.findUnique({
      where: { id },
      include: {
        standard: { select: { id: true, code: true, name: true } },
        sections: {
          orderBy: { order: "asc" },
          include: {
            subsections: {
              orderBy: { order: "asc" },
              include: {
                footnotes: { orderBy: { number: "asc" } },
                faqs: { orderBy: { order: "asc" } },
              },
            },
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json({ chapter });
  } catch (error) {
    console.error("Error fetching chapter:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapter" },
      { status: 500 }
    );
  }
}

// PUT /api/basel/chapters/[id] - Update chapter (admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await params;
    const body = await request.json();
    const { code, title, effectiveDate, status, order } = body;

    const chapter = await prisma.baselChapter.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(title && { title }),
        ...(effectiveDate !== undefined && {
          effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        }),
        ...(status && { status }),
        ...(order !== undefined && { order }),
        lastUpdate: new Date(),
      },
    });

    return NextResponse.json({ chapter });
  } catch (error) {
    console.error("Error updating chapter:", error);
    return NextResponse.json(
      { error: "Failed to update chapter" },
      { status: 500 }
    );
  }
}

// DELETE /api/basel/chapters/[id] - Delete chapter (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await params;

    await prisma.baselChapter.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    return NextResponse.json(
      { error: "Failed to delete chapter" },
      { status: 500 }
    );
  }
}
