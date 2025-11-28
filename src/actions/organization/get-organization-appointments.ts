"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { UserRole, AppointmentStatus } from "@prisma/client";

/**
 * Gets all appointments for a specific organization.
 * Organization owners and admins can see all appointments.
 * Supports optional date and hour filtering.
 * If no date is provided, returns the closest upcoming appointment.
 *
 * @param {string} organizationId - The organization ID.
 * @param {string} date - Optional date in YYYY-MM-DD format.
 * @param {string} hour - Optional hour in HH:mm format.
 * @returns {Promise<{ success: boolean; message: string; appointments?: any[]; closestAppointment?: any }>} - A promise that resolves to an object with appointments array or error message.
 */
export const getOrganizationAppointments = async (
  organizationId: string,
  date?: string,
  hour?: string
) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, message: "Unauthorized", appointments: [] };
    }

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

    // Only owners and admins can view all appointments
    if (!isOwner && !isAdmin) {
      return { success: false, message: "You don't have permission to view these appointments!", appointments: [] };
    }

    // Build the where clause
    const whereClause: any = {
      organizationId,
    };

    // Apply date filter if provided
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.startTime = {
        gte: startOfDay,
        lte: endOfDay,
      };

      // Apply hour filter if provided
      if (hour) {
        const [hourNum] = hour.split(':').map(Number);
        const hourStart = new Date(date);
        hourStart.setHours(hourNum, 0, 0, 0);
        
        const hourEnd = new Date(date);
        hourEnd.setHours(hourNum, 59, 59, 999);

        // Update the startTime to combine with date filter
        whereClause.startTime = {
          gte: hourStart >= startOfDay ? hourStart : startOfDay,
          lte: hourEnd <= endOfDay ? hourEnd : endOfDay,
        };
      }
    } else {
      // If no date provided, show all upcoming appointments
      whereClause.startTime = {
        gte: new Date(), // Only future appointments
      };
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

    // If no date provided, get the closest appointment for highlighting
    let closestAppointment = null;
    if (!date && appointments.length > 0) {
      // Find the first non-cancelled appointment (which is the closest since we ordered by startTime)
      closestAppointment = appointments.find(apt => apt.status !== AppointmentStatus.CANCELLED) || appointments[0];
    }

    return { success: true, appointments, closestAppointment };
  } catch (error) {
    console.error("Error getting organization appointments:", error);
    return { success: false, message: "Something went wrong!", appointments: [] };
  }
};

