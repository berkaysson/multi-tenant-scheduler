"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { UserRole } from "@prisma/client";

/**
 * Gets all appointment types for an organization.
 *
 * @param {string} organizationId - The organization ID.
 * @returns {Promise<{ success: boolean; message: string; appointmentTypes?: any[] }>} - A promise that resolves to an object with appointment types array or error message.
 */
export const getAppointmentTypes = async (organizationId: string) => {
  try {
    const session = await auth();

    // If user is logged in and is a manager/admin, they can see all types
    // Otherwise, only active types are visible
    const where: any = {
      organizationId,
    };

    if (!session?.user?.id || (session.user.role !== UserRole.MANAGER && session.user.role !== UserRole.ADMIN)) {
      where.isActive = true;
    }

    const appointmentTypes = await db.appointmentType.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, appointmentTypes };
  } catch (error) {
    console.error("Error getting appointment types:", error);
    return { success: false, message: "Something went wrong!" };
  }
};

