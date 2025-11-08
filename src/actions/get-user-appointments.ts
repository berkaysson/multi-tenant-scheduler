"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { AppointmentStatus } from "@prisma/client";

/**
 * Gets all appointments for the current user.
 * Orders by startTime ascending to show nearest appointments first.
 *
 * @returns {Promise<{ success: boolean; message: string; appointments?: any[] }>} - A promise that resolves to an object with appointments array or error message.
 */
export const getUserAppointments = async () => {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const appointments = await db.appointment.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        startTime: true,
        endTime: true,
        status: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        notes: true,
        cancellationReason: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            country: true,
          },
        },
        appointmentType: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            color: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return { success: true, appointments };
  } catch (error) {
    console.error("Error getting user appointments:", error);
    return { success: false, message: "Something went wrong!", appointments: [] };
  }
};

/**
 * Gets the nearest upcoming appointment for the current user.
 *
 * @returns {Promise<{ success: boolean; message: string; appointment?: any }>} - A promise that resolves to an object with appointment data or error message.
 */
export const getNearestAppointment = async () => {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const now = new Date();

    const appointment = await db.appointment.findFirst({
      where: {
        userId: session.user.id,
        startTime: {
          gte: now,
        },
        status: {
          not: AppointmentStatus.CANCELLED,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        startTime: true,
        endTime: true,
        status: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        notes: true,
        cancellationReason: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            country: true,
          },
        },
        appointmentType: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            color: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return { success: true, appointment };
  } catch (error) {
    console.error("Error getting nearest appointment:", error);
    return { success: false, message: "Something went wrong!" };
  }
};

