"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { UserRole } from "@prisma/client";

/**
 * Deletes an appointment type.
 *
 * @param {string} id - The appointment type ID.
 * @returns {Promise<{ success: boolean; message: string }>} - A promise that resolves to an object indicating the result of the deletion.
 */
export const deleteAppointmentType = async (id: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  // Only Managers and Admins can delete appointment types
  if (session.user.role !== UserRole.MANAGER && session.user.role !== UserRole.ADMIN) {
    return { success: false, message: "Only Managers and Admins can delete appointment types!" };
  }

  try {
    // Check if the appointment type exists and if the user has permission
    const appointmentType = await db.appointmentType.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });

    if (!appointmentType) {
      return { success: false, message: "Appointment type not found!" };
    }

    // Check if user is the owner of the organization or an admin
    const isOwner = appointmentType.organization.createdById === session.user.id;
    const isAdmin = session.user.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      return { success: false, message: "You don't have permission to delete this appointment type!" };
    }

    // Delete the appointment type
    await db.appointmentType.delete({
      where: { id },
    });

    return { success: true, message: "Appointment type deleted successfully!" };
  } catch (error) {
    console.error("Error deleting appointment type:", error);
    return { success: false, message: "Something went wrong!" };
  }
};

