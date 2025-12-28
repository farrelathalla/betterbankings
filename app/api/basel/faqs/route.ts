import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// POST /api/basel/faqs - Create FAQ (admin only)
export async function POST(request: Request) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const body = await request.json();
    const { question, answer, subsectionId, order } = body;

    if (!question || !answer || !subsectionId) {
      return NextResponse.json(
        { error: "Question, answer, and subsectionId are required" },
        { status: 400 }
      );
    }

    const faq = await prisma.baselFAQ.create({
      data: {
        question,
        answer,
        subsectionId,
        order: order || 0,
      },
    });

    return NextResponse.json({ faq }, { status: 201 });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}
