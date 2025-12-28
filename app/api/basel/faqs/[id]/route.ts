import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// PUT /api/basel/faqs/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await params;
    const body = await request.json();
    const { question, answer, order } = body;

    const faq = await prisma.baselFAQ.update({
      where: { id },
      data: {
        ...(question && { question }),
        ...(answer && { answer }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json({ faq });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to update FAQ" },
      { status: 500 }
    );
  }
}

// DELETE /api/basel/faqs/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await params;

    await prisma.baselFAQ.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return NextResponse.json(
      { error: "Failed to delete FAQ" },
      { status: 500 }
    );
  }
}
