"use server";

import { auth } from "@/auth";
import db from "@/lib/db";

/**
 * Checks if the current user owns the organization.
 *
 * @param {string} organizationId - The organization ID.
 * @returns {Promise<{ success: boolean; isOwner: boolean }>} - A promise that resolves to an object indicating if the user owns the organization.
 */
export const checkOrganizationOwnership = async (organizationId: string) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, isOwner: false };
    }

    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      select: {
        createdById: true,
      },
    });

    if (!organization) {
      return { success: false, isOwner: false };
    }

    const isOwner = organization.createdById === userId;

    return { success: true, isOwner };
  } catch (error) {
    console.error("Error checking organization ownership:", error);
    return { success: false, isOwner: false };
  }
};

