import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { deletePDF } from "@/lib/cloudinary";

// DELETE /api/basel/pdfs/[id] - Delete PDF (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await params;

    // Find the PDF
    const pdf = await prisma.baselChapterPDF.findUnique({
      where: { id },
    });

    if (!pdf) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    // Delete from Cloudinary
    try {
      await deletePDF(pdf.publicId);
    } catch (cloudinaryError) {
      console.error("Error deleting from Cloudinary:", cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
    }

    // Delete from database
    await prisma.baselChapterPDF.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting PDF:", error);
    return NextResponse.json(
      { error: "Failed to delete PDF" },
      { status: 500 }
    );
  }
}
