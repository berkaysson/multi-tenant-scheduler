"use server";

import db from "@/lib/db";

/**
 * Gets appointments for a specific organization and date.
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
    // Parse the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await db.appointment.findMany({
      where: {
        organizationId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
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

