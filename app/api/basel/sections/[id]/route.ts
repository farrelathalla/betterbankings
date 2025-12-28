import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET /api/basel/sections/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const section = await prisma.baselSection.findUnique({
      where: { id },
      include: {
        chapter: {
          include: {
            standard: { select: { code: true, name: true } },
          },
        },
        subsections: {
          orderBy: { order: "asc" },
          include: {
            footnotes: { orderBy: { number: "asc" } },
            faqs: { orderBy: { order: "asc" } },
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    return NextResponse.json({ section });
  } catch (error) {
    console.error("Error fetching section:", error);
    return NextResponse.json(
      { error: "Failed to fetch section" },
      { status: 500 }
    );
  }
}

// PUT /api/basel/sections/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await params;
    const body = await request.json();
    const { title, order } = body;

    const section = await prisma.baselSection.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json({ section });
  } catch (error) {
    console.error("Error updating section:", error);
    return NextResponse.json(
      { error: "Failed to update section" },
      { status: 500 }
    );
  }
}

// DELETE /api/basel/sections/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await params;

    await prisma.baselSection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json(
      { error: "Failed to delete section" },
      { status: 500 }
    );
  }
}
