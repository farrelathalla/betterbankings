import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// POST /api/notifications/read-all - Mark all notifications as read
export async function POST() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get all notifications
    const notifications = await prisma.notification.findMany({
      select: { id: true },
    });

    // Create or update read status for all notifications
    for (const notification of notifications) {
      await prisma.userNotification.upsert({
        where: {
          userId_notificationId: {
            userId: user.id,
            notificationId: notification.id,
          },
        },
        update: {
          isRead: true,
          readAt: new Date(),
        },
        create: {
          userId: user.id,
          notificationId: notification.id,
          isRead: true,
          readAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all as read" },
      { status: 500 }
    );
  }
}
