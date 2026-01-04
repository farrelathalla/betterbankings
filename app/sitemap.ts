import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://betterbankings.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/advisory-services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/basel-center`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/betterbankings-angle`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/banking-data`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // Dynamic Basel chapter pages
  let baselPages: MetadataRoute.Sitemap = [];
  try {
    const standards = await prisma.baselStandard.findMany({
      include: {
        chapters: {
          select: { code: true, updatedAt: true },
        },
      },
    });

    baselPages = standards.flatMap((standard) =>
      standard.chapters.map((chapter) => ({
        url: `${baseUrl}/basel-center/${standard.code.toLowerCase()}/${
          chapter.code
        }`,
        lastModified: chapter.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
    );
  } catch (error) {
    console.error("Error fetching Basel pages for sitemap:", error);
  }

  return [...staticPages, ...baselPages];
}
