"use server";

import { auth } from "@/auth";
import db from "@/lib/db";

/**
 * Gets notifications for the current user.
 *
 * @param {Object} options - Query options.
 * @param {number} [options.limit=20] - Number of notifications to return.
 * @param {number} [options.offset=0] - Number of notifications to skip.
 * @param {boolean} [options.read] - Filter by read status (optional).
 * @returns {Promise<{ success: boolean; notifications?: any[]; total?: number; unreadCount?: number; hasMore?: boolean; message?: string }>} - A promise that resolves to notifications data.
 */
export const getNotifications = async (options?: {
  limit?: number;
  offset?: number;
  read?: boolean;
}) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    if (options?.read !== undefined) {
      where.read = options.read;
    }

    // Fetch notifications
    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      db.notification.count({ where }),
      db.notification.count({
        where: {
          userId: session.user.id,
          read: false,
        },
      }),
    ]);

    return {
      success: true,
      notifications,
      total,
      unreadCount,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error("Error getting notifications:", error);
    return { success: false, message: "Something went wrong!" };
  }
};

/**
 * Gets unread notification count for the current user.
 *
 * @returns {Promise<{ success: boolean; count?: number; message?: string }>} - A promise that resolves to the unread count.
 */
export const getUnreadNotificationCount = async () => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const count = await db.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    return {
      success: true,
      count,
    };
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    return { success: false, message: "Something went wrong!" };
  }
};

