"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { UpdateAppointmentTypeSchema } from "@/schemas";
import { UserRole } from "@prisma/client";
import { z } from "zod";

/**
 * Updates an existing appointment type.
 *
 * @param {z.infer<typeof UpdateAppointmentTypeSchema>} data - The appointment type update data.
 * @returns {Promise<{ success: boolean; message: string }>} - A promise that resolves to an object indicating the result of the update.
 */
export const updateAppointmentType = async (data: z.infer<typeof UpdateAppointmentTypeSchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  // Only Managers and Admins can update appointment types
  if (session.user.role !== UserRole.MANAGER && session.user.role !== UserRole.ADMIN) {
    return { success: false, message: "Only Managers and Admins can update appointment types!" };
  }

  const validatedFields = UpdateAppointmentTypeSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, message: "Invalid fields!" };
  }

  const { id, ...updateData } = validatedFields.data;

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
      return { success: false, message: "You don't have permission to update this appointment type!" };
    }

    // Update the appointment type
    await db.appointmentType.update({
      where: { id },
      data: {
        ...updateData,
        color: updateData.color === "" ? null : updateData.color,
      },
    });

    return { success: true, message: "Appointment type updated successfully!" };
  } catch (error) {
    console.error("Error updating appointment type:", error);
    return { success: false, message: "Something went wrong!" };
  }
};

