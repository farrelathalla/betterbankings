import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { uploadPDF } from "@/lib/cloudinary";

// GET /api/basel/pdfs - List PDFs for a chapter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");

    if (!chapterId) {
      return NextResponse.json(
        { error: "chapterId is required" },
        { status: 400 }
      );
    }

    const pdfs = await prisma.baselChapterPDF.findMany({
      where: { chapterId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ pdfs });
  } catch (error) {
    console.error("Error fetching PDFs:", error);
    return NextResponse.json(
      { error: "Failed to fetch PDFs" },
      { status: 500 }
    );
  }
}

// POST /api/basel/pdfs - Upload PDF (admin only)
export async function POST(request: Request) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string | null;
    const chapterId = formData.get("chapterId") as string | null;

    if (!file || !name || !chapterId) {
      return NextResponse.json(
        { error: "file, name, and chapterId are required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate chapter exists
    const chapter = await prisma.baselChapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Get current max order for this chapter
    const maxOrder = await prisma.baselChapterPDF.aggregate({
      where: { chapterId },
      _max: { order: true },
    });

    // Convert File to Buffer and upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { url, publicId } = await uploadPDF(buffer, file.name);

    // Save to database
    const pdf = await prisma.baselChapterPDF.create({
      data: {
        name,
        url,
        publicId,
        chapterId,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    return NextResponse.json({ pdf }, { status: 201 });
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return NextResponse.json(
      { error: "Failed to upload PDF" },
      { status: 500 }
    );
  }
}
