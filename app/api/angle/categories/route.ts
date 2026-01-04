import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { cache, CACHE_TTL, CACHE_KEYS } from "@/lib/cache";

// GET /api/angle/categories - List all categories (public)
export async function GET() {
  try {
    // Check cache first
    const cacheKey = CACHE_KEYS.PODCAST_CATEGORIES;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "X-Cache": "HIT" },
      });
    }

    const categories = await prisma.podcastCategory.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { podcasts: true },
        },
      },
    });

    const response = { categories };
    cache.set(cacheKey, response, CACHE_TTL.PODCAST_CATEGORIES);

    return NextResponse.json(response, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("Error fetching podcast categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/angle/categories - Create new category (admin only)
export async function POST(request: Request) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const body = await request.json();
    const { name, order } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existing = await prisma.podcastCategory.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    const category = await prisma.podcastCategory.create({
      data: {
        name,
        order: order || 0,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating podcast category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
