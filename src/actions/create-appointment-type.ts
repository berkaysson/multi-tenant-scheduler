"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { CreateAppointmentTypeSchema } from "@/schemas";
import { UserRole } from "@prisma/client";
import { z } from "zod";

/**
 * Creates a new appointment type for an organization.
 *
 * @param {z.infer<typeof CreateAppointmentTypeSchema>} data - The appointment type data.
 * @returns {Promise<{ success: boolean; message: string; appointmentType?: any }>} - A promise that resolves to an object indicating the result of the operation.
 */
export const createAppointmentType = async (data: z.infer<typeof CreateAppointmentTypeSchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  // Only Managers and Admins can create appointment types
  if (session.user.role !== UserRole.MANAGER && session.user.role !== UserRole.ADMIN) {
    return { success: false, message: "Only Managers and Admins can create appointment types!" };
  }

  const validatedFields = CreateAppointmentTypeSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, message: "Invalid fields!" };
  }

  const { organizationId, ...appointmentTypeData } = validatedFields.data;

  try {
    // Check if the user is the owner of the organization or an admin
    const organization = await db.organization.findFirst({
      where: {
        id: organizationId,
        OR: [
          { createdById: session.user.id },
          ...(session.user.role === UserRole.ADMIN ? [{}] : [])
        ]
      },
    });

    if (!organization) {
      return { success: false, message: "Organization not found or you don't have permission to add appointment types!" };
    }

    // Create the appointment type
    const appointmentType = await db.appointmentType.create({
      data: {
        organizationId,
        ...appointmentTypeData,
        color: appointmentTypeData.color || null,
      },
    });

    return { success: true, message: "Appointment type created successfully!", appointmentType };
  } catch (error) {
    console.error("Error creating appointment type:", error);
    return { success: false, message: "Something went wrong!" };
  }
};

