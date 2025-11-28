"use server";

import { auth } from "@/auth";
import db from "@/lib/db";

/**
 * Deletes a notification.
 *
 * @param {string} notificationId - The notification ID.
 * @returns {Promise<{ success: boolean; message?: string }>} - A promise that resolves to the operation result.
 */
export const deleteNotification = async (notificationId: string) => {
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

    // Delete notification
    await db.notification.delete({
      where: { id: notificationId },
    });

    return {
      success: true,
      message: "Notification deleted successfully!",
    };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, message: "Something went wrong!" };
  }
};

