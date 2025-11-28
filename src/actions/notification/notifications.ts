"use server";

import db from "@/lib/db";
import { NotificationType } from "@prisma/client";

/**
 * Creates notifications for organization owner and members.
 *
 * @param {string} organizationId - The organization ID.
 * @param {string} appointmentId - The appointment ID.
 * @param {NotificationType} type - The notification type.
 * @param {string} title - The notification title.
 * @param {string} message - The notification message.
 * @param {Record<string, any>} [metadata] - Optional metadata to store with the notification.
 * @returns {Promise<void>} - A promise that resolves when notifications are created.
 */
export const createOrganizationNotifications = async (
  organizationId: string,
  appointmentId: string,
  type: NotificationType,
  title: string,
  message: string
): Promise<void> => {
  try {
    // Get organization with owner and members
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      include: {
        createdBy: {
          select: {
            id: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!organization) {
      console.error("Organization not found:", organizationId);
      return;
    }

    // Collect all recipient user IDs (owner + members)
    const recipientIds = new Set<string>();

    // Add owner
    if (organization.createdBy.id) {
      recipientIds.add(organization.createdBy.id);
    }

    // Add members
    organization.members.forEach((member) => {
      if (member.user.id) {
        recipientIds.add(member.user.id);
      }
    });

    // Create notifications for all recipients
    const notifications = Array.from(recipientIds).map((userId) => ({
      userId,
      organizationId,
      appointmentId,
      type,
      title,
      message,
      read: false,
    }));

    // Create notifications in batch
    if (notifications.length > 0) {
      await db.notification.createMany({
        data: notifications,
      });
    }
  } catch (error) {
    console.error("Error creating organization notifications:", error);
    // Don't throw error to prevent breaking the main operation
  }
};

/**
 * Creates a notification for a specific user.
 *
 * @param {string} userId - The user ID to send notification to.
 * @param {string} organizationId - The organization ID.
 * @param {string} appointmentId - The appointment ID.
 * @param {NotificationType} type - The notification type.
 * @param {string} title - The notification title.
 * @param {string} message - The notification message.
 * @param {Record<string, any>} [metadata] - Optional metadata to store with the notification.
 * @returns {Promise<void>} - A promise that resolves when notification is created.
 */
export const createUserNotification = async (
  userId: string,
  organizationId: string,
  appointmentId: string,
  type: NotificationType,
  title: string,
  message: string
): Promise<void> => {
  try {
    await db.notification.create({
      data: {
        userId,
        organizationId,
        appointmentId,
        type,
        title,
        message,
        read: false,
      },
    });
  } catch (error) {
    console.error("Error creating user notification:", error);
    // Don't throw error to prevent breaking the main operation
  }
};
