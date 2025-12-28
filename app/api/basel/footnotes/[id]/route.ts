import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// PUT /api/basel/footnotes/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await params;
    const body = await request.json();
    const { number, content } = body;

    const footnote = await prisma.baselFootnote.update({
      where: { id },
      data: {
        ...(number !== undefined && { number }),
        ...(content && { content }),
      },
    });

    return NextResponse.json({ footnote });
  } catch (error) {
    console.error("Error updating footnote:", error);
    return NextResponse.json(
      { error: "Failed to update footnote" },
      { status: 500 }
    );
  }
}

// DELETE /api/basel/footnotes/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await params;

    await prisma.baselFootnote.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting footnote:", error);
    return NextResponse.json(
      { error: "Failed to delete footnote" },
      { status: 500 }
    );
  }
}
