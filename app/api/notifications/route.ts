import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { getAuthUser } from "@/lib/auth";

// GET /api/notifications - Get notifications for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const unreadOnly = searchParams.get("unread") === "true";

    // Get all notifications with user's read status
    const notifications = await prisma.notification.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        userReads: {
          where: { userId: user.id },
        },
      },
    });

    // Transform to include isRead status
    const result = notifications.map((notification) => {
      const userRead = notification.userReads[0];
      return {
        id: notification.id,
        title: notification.title,
        description: notification.description,
        category: notification.category,
        link: notification.link,
        createdAt: notification.createdAt,
        isRead: userRead?.isRead ?? false,
      };
    });

    // Filter unread if requested
    const filtered = unreadOnly ? result.filter((n) => !n.isRead) : result;
    const unreadCount = result.filter((n) => !n.isRead).length;

    return NextResponse.json({ notifications: filtered, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create notification (admin only)
export async function POST(request: Request) {
  try {
    const adminError = await requireAdmin();
    if (adminError) return adminError;

    const body = await request.json();
    const { title, description, category, link } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Title, description, and category are required" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ["Content", "Data", "Regulation"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category. Must be Content, Data, or Regulation" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        description,
        category,
        link: link || null,
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
