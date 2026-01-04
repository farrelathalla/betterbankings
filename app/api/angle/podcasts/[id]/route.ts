import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET /api/angle/podcasts/[id] - Get single podcast
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const podcast = await prisma.podcast.findUnique({
      where: { id },
      include: {
        category: true,
        speakers: {
          orderBy: { order: "asc" },
        },
        topics: true,
      },
    });

    if (!podcast) {
      return NextResponse.json({ error: "Podcast not found" }, { status: 404 });
    }

    return NextResponse.json({ podcast });
  } catch (error) {
    console.error("Error fetching podcast:", error);
    return NextResponse.json(
      { error: "Failed to fetch podcast" },
      { status: 500 }
    );
  }
}

// PUT /api/angle/podcasts/[id] - Update podcast (admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await params;
    const body = await request.json();
    const {
      label,
      title,
      description,
      date,
      duration,
      link,
      categoryId,
      speakers,
      topics,
      order,
    } = body;

    // Check if podcast exists
    const existing = await prisma.podcast.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Podcast not found" }, { status: 404 });
    }

    // If categoryId is provided, check if it exists
    if (categoryId) {
      const category = await prisma.podcastCategory.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
    }

    // Delete existing speakers and topics if new ones are provided
    if (speakers !== undefined) {
      await prisma.podcastSpeaker.deleteMany({
        where: { podcastId: id },
      });
    }

    if (topics !== undefined) {
      await prisma.podcastTopic.deleteMany({
        where: { podcastId: id },
      });
    }

    const podcast = await prisma.podcast.update({
      where: { id },
      data: {
        label: label ?? undefined,
        title: title ?? undefined,
        description: description ?? undefined,
        date: date ? new Date(date) : undefined,
        duration: duration ?? undefined,
        link: link ?? undefined,
        categoryId: categoryId ?? undefined,
        order: order ?? undefined,
        speakers:
          speakers !== undefined
            ? {
                create: speakers.map(
                  (
                    speaker: { name: string; title: string },
                    index: number
                  ) => ({
                    name: speaker.name,
                    title: speaker.title,
                    order: index,
                  })
                ),
              }
            : undefined,
        topics:
          topics !== undefined
            ? {
                create: topics.map((topic: string) => ({
                  name: topic,
                })),
              }
            : undefined,
      },
      include: {
        category: true,
        speakers: true,
        topics: true,
      },
    });

    return NextResponse.json({ podcast });
  } catch (error) {
    console.error("Error updating podcast:", error);
    return NextResponse.json(
      { error: "Failed to update podcast" },
      { status: 500 }
    );
  }
}

// DELETE /api/angle/podcasts/[id] - Delete podcast (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const { id } = await params;

    // Check if podcast exists
    const existing = await prisma.podcast.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Podcast not found" }, { status: 404 });
    }

    // Delete podcast (speakers and topics will be cascade deleted)
    await prisma.podcast.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting podcast:", error);
    return NextResponse.json(
      { error: "Failed to delete podcast" },
      { status: 500 }
    );
  }
}
