"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { UserRole } from "@prisma/client";

/**
 * Gets appointments for a specific organization and date.
 * If the user owns the organization, shows all appointments.
 * If the user doesn't own the organization, only shows their own appointments.
 *
 * @param {string} organizationId - The organization ID.
 * @param {string} date - The date in YYYY-MM-DD format.
 * @returns {Promise<{ success: boolean; message: string; appointments?: any[] }>} - A promise that resolves to an object with appointments array or error message.
 */
export const getAppointmentsByDate = async (
  organizationId: string,
  date: string
) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // Parse the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if user owns the organization
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      select: {
        createdById: true,
      },
    });

    if (!organization) {
      return { success: false, message: "Organization not found!", appointments: [] };
    }

    // Check if user is admin (admins can see all appointments)
    const isAdmin = session?.user?.role === UserRole.ADMIN;
    
    // Check if user owns the organization
    const isOwner = organization.createdById === userId;
    
    // Build the where clause
    const whereClause: any = {
      organizationId,
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    // If user doesn't own the organization and is not an admin, only show their own appointments
    if (!isOwner && !isAdmin && userId) {
      whereClause.userId = userId;
    }

    const appointments = await db.appointment.findMany({
      where: whereClause,
      include: {
        appointmentType: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return { success: true, appointments };
  } catch (error) {
    console.error("Error getting appointments by date:", error);
    return { success: false, message: "Something went wrong!", appointments: [] };
  }
};

