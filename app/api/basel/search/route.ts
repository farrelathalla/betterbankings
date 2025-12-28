import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/basel/search - Search across Basel content
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const searchTerm = `%${query}%`;

    // Search in standards
    const standards = await prisma.baselStandard.findMany({
      where: {
        OR: [
          { code: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
      take: 5,
    });

    // Search in chapters
    const chapters = await prisma.baselChapter.findMany({
      where: {
        OR: [
          { code: { contains: query, mode: "insensitive" } },
          { title: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        code: true,
        title: true,
        standard: { select: { code: true } },
      },
      take: 10,
    });

    // Search in sections
    const sections = await prisma.baselSection.findMany({
      where: {
        title: { contains: query, mode: "insensitive" },
      },
      select: {
        id: true,
        title: true,
        chapter: {
          select: {
            code: true,
            standard: { select: { code: true } },
          },
        },
      },
      take: 10,
    });

    // Search in subsections (content)
    const subsections = await prisma.baselSubsection.findMany({
      where: {
        OR: [
          { number: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        number: true,
        section: {
          select: {
            title: true,
            chapter: {
              select: {
                code: true,
                standard: { select: { code: true } },
              },
            },
          },
        },
      },
      take: 20,
    });

    return NextResponse.json({
      results: {
        standards: standards.map((s) => ({
          type: "standard",
          id: s.id,
          code: s.code,
          title: s.name,
          url: `/basel-center/${s.code.toLowerCase()}`,
        })),
        chapters: chapters.map((c) => ({
          type: "chapter",
          id: c.id,
          code: `${c.standard.code}${c.code}`,
          title: c.title,
          url: `/basel-center/${c.standard.code.toLowerCase()}/${c.code}`,
        })),
        sections: sections.map((s) => ({
          type: "section",
          id: s.id,
          code: `${s.chapter.standard.code}${s.chapter.code}`,
          title: s.title,
          url: `/basel-center/${s.chapter.standard.code.toLowerCase()}/${
            s.chapter.code
          }#${s.id}`,
        })),
        subsections: subsections.map((sub) => ({
          type: "subsection",
          id: sub.id,
          code: `${sub.section.chapter.standard.code}${sub.section.chapter.code}.${sub.number}`,
          title: sub.section.title,
          url: `/basel-center/${sub.section.chapter.standard.code.toLowerCase()}/${
            sub.section.chapter.code
          }#${sub.id}`,
        })),
      },
      total:
        standards.length +
        chapters.length +
        sections.length +
        subsections.length,
    });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
