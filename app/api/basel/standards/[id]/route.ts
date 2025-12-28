import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET /api/basel/standards/[id] - Get single standard with chapters
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const standard = await prisma.baselStandard.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: { order: "asc" },
          include: {
            sections: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!standard) {
      return NextResponse.json(
        { error: "Standard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ standard });
  } catch (error) {
    console.error("Error fetching standard:", error);
    return NextResponse.json(
      { error: "Failed to fetch standard" },
      { status: 500 }
    );
  }
}

// PUT /api/basel/standards/[id] - Update standard (admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await params;
    const body = await request.json();
    const { code, name, description, order } = body;

    const standard = await prisma.baselStandard.update({
      where: { id },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json({ standard });
  } catch (error) {
    console.error("Error updating standard:", error);
    return NextResponse.json(
      { error: "Failed to update standard" },
      { status: 500 }
    );
  }
}

// DELETE /api/basel/standards/[id] - Delete standard (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await params;

    await prisma.baselStandard.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting standard:", error);
    return NextResponse.json(
      { error: "Failed to delete standard" },
      { status: 500 }
    );
  }
}
