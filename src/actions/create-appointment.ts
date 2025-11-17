"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { CreateAppointmentSchema } from "@/schemas";
import { AppointmentStatus, NotificationType } from "@prisma/client";
import { z } from "zod";
import { createOrganizationNotifications } from "@/actions/notifications";

/**
 * Creates a new appointment for an organization.
 *
 * @param {z.infer<typeof CreateAppointmentSchema>} data - The appointment data.
 * @returns {Promise<{ success: boolean; message: string; appointment?: any }>} - A promise that resolves to an object indicating the result of the operation.
 */
export const createAppointment = async (
  data: z.infer<typeof CreateAppointmentSchema>
) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  const validatedFields = CreateAppointmentSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, message: "Invalid fields!" };
  }

  const {
    organizationId,
    appointmentTypeId,
    title,
    description,
    startTime,
    endTime,
    contactName,
    contactEmail,
    contactPhone,
    notes,
  } = validatedFields.data;

  try {
    // Parse dates
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    // Validate dates
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return { success: false, message: "Invalid date format!" };
    }

    if (startDateTime >= endDateTime) {
      return { success: false, message: "End time must be after start time!" };
    }

    // Check if organization exists
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return { success: false, message: "Organization not found!" };
    }

    // Check if appointment type exists (if provided)
    if (appointmentTypeId) {
      const appointmentType = await db.appointmentType.findFirst({
        where: {
          id: appointmentTypeId,
          organizationId,
          isActive: true,
        },
      });

      if (!appointmentType) {
        return {
          success: false,
          message: "Appointment type not found or inactive!",
        };
      }
    }

    // Conflict checking removed - allowing multiple appointments for the same time slot
    // This can be re-implemented later when needed

    // Create the appointment
    const appointment = await db.appointment.create({
      data: {
        organizationId,
        appointmentTypeId: appointmentTypeId || null,
        userId: session.user.id,
        title,
        description: description || null,
        startTime: startDateTime,
        endTime: endDateTime,
        status: AppointmentStatus.PENDING,
        contactName: contactName || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        notes: notes || null,
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
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Send notifications to organization owner and members
    const userName =
      appointment.user.name || appointment.user.email || "A user";
    const formattedStartTime = startDateTime.toLocaleString();
    const notificationTitle = "New Appointment Created";
    const notificationMessage = `${userName} has created a new appointment "${title}" on ${formattedStartTime} in ${appointment.organization.name}.`;

    await createOrganizationNotifications(
      organizationId,
      appointment.id,
      NotificationType.APPOINTMENT_CREATED,
      notificationTitle,
      notificationMessage
    );

    return {
      success: true,
      message: "Appointment created successfully!",
      appointment,
    };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return { success: false, message: "Something went wrong!" };
  }
};
