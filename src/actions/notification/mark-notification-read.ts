"use server";

import { auth } from "@/auth";
import db from "@/lib/db";

/**
 * Marks a notification as read or unread.
 *
 * @param {string} notificationId - The notification ID.
 * @param {boolean} read - Whether to mark as read (true) or unread (false).
 * @returns {Promise<{ success: boolean; message?: string; notification?: any }>} - A promise that resolves to the operation result.
 */
export const markNotificationRead = async (
  notificationId: string,
  read: boolean
) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Verify the notification belongs to the user
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    });

    if (!notification) {
      return { success: false, message: "Notification not found!" };
    }

    if (notification.userId !== session.user.id) {
      return { success: false, message: "Forbidden" };
    }

    // Update notification
    const updated = await db.notification.update({
      where: { id: notificationId },
      data: {
        read,
        readAt: read ? new Date() : null,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      message: `Notification marked as ${read ? "read" : "unread"}`,
      notification: updated,
    };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, message: "Something went wrong!" };
  }
};

/**
 * Marks all notifications as read for the current user.
 *
 * @returns {Promise<{ success: boolean; message?: string; count?: number }>} - A promise that resolves to the operation result.
 */
export const markAllNotificationsRead = async () => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Mark all unread notifications as read
    const result = await db.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return {
      success: true,
      message: `Marked ${result.count} notification(s) as read`,
      count: result.count,
    };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, message: "Something went wrong!" };
  }
};

