import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { cache, CACHE_TTL, CACHE_KEYS } from "@/lib/cache";

// GET /api/angle/podcasts - List all podcasts with optional category filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    // Generate cache key based on query params
    const cacheKey = `${CACHE_KEYS.PODCASTS}:${categoryId || "all"}:${
      search || ""
    }`;

    // Only use cache for non-search requests (search should be real-time)
    if (!search) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached, {
          headers: { "X-Cache": "HIT" },
        });
      }
    }

    const where: Record<string, unknown> = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        {
          topics: { some: { name: { contains: search, mode: "insensitive" } } },
        },
      ];
    }

    const podcasts = await prisma.podcast.findMany({
      where,
      orderBy: [{ date: "desc" }, { order: "asc" }],
      include: {
        category: true,
        speakers: {
          orderBy: { order: "asc" },
        },
        topics: true,
      },
    });

    const response = { podcasts };

    // Cache non-search results
    if (!search) {
      cache.set(cacheKey, response, CACHE_TTL.PODCASTS);
    }

    return NextResponse.json(response, {
      headers: { "X-Cache": search ? "BYPASS" : "MISS" },
    });
  } catch (error) {
    console.error("Error fetching podcasts:", error);
    return NextResponse.json(
      { error: "Failed to fetch podcasts" },
      { status: 500 }
    );
  }
}

// POST /api/angle/podcasts - Create new podcast (admin only)
export async function POST(request: Request) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

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

    // Validate required fields
    if (
      !label ||
      !title ||
      !description ||
      !date ||
      !duration ||
      !link ||
      !categoryId
    ) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.podcastCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const podcast = await prisma.podcast.create({
      data: {
        label,
        title,
        description,
        date: new Date(date),
        duration,
        link,
        categoryId,
        order: order || 0,
        speakers: speakers?.length
          ? {
              create: speakers.map(
                (speaker: { name: string; title: string }, index: number) => ({
                  name: speaker.name,
                  title: speaker.title,
                  order: index,
                })
              ),
            }
          : undefined,
        topics: topics?.length
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

    return NextResponse.json({ podcast }, { status: 201 });
  } catch (error) {
    console.error("Error creating podcast:", error);
    return NextResponse.json(
      { error: "Failed to create podcast" },
      { status: 500 }
    );
  }
}
