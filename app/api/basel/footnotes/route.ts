import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// POST /api/basel/footnotes - Create footnote (admin only)
export async function POST(request: Request) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const body = await request.json();
    const { number, content, subsectionId } = body;

    if (number === undefined || !content || !subsectionId) {
      return NextResponse.json(
        { error: "Number, content, and subsectionId are required" },
        { status: 400 }
      );
    }

    const footnote = await prisma.baselFootnote.create({
      data: {
        number,
        content,
        subsectionId,
      },
    });

    return NextResponse.json({ footnote }, { status: 201 });
  } catch (error) {
    console.error("Error creating footnote:", error);
    return NextResponse.json(
      { error: "Failed to create footnote" },
      { status: 500 }
    );
  }
}
