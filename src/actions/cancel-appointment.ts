"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { AppointmentStatus, NotificationType } from "@prisma/client";
import { createOrganizationNotifications } from "@/lib/notifications";

/**
 * Cancels an appointment for the current user.
 * Only the owner of the appointment can cancel it.
 *
 * @param {string} appointmentId - The appointment ID.
 * @param {string} cancellationReason - Optional cancellation reason/notes.
 * @returns {Promise<{ success: boolean; message: string }>} - A promise that resolves to an object indicating the result of the operation.
 */
export const cancelAppointment = async (
  appointmentId: string,
  cancellationReason?: string
) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Find the appointment and verify ownership
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        userId: true,
        organizationId: true,
        status: true,
        title: true,
        startTime: true,
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

    if (!appointment) {
      return { success: false, message: "Appointment not found!" };
    }

    // Check if the user owns the appointment
    if (appointment.userId !== session.user.id) {
      return { success: false, message: "You don't have permission to cancel this appointment!" };
    }

    // Check if appointment is already cancelled
    if (appointment.status === AppointmentStatus.CANCELLED) {
      return { success: false, message: "Appointment is already cancelled!" };
    }

    // Check if appointment is completed (usually can't cancel completed appointments)
    if (appointment.status === AppointmentStatus.COMPLETED) {
      return { success: false, message: "Cannot cancel a completed appointment!" };
    }

    // Update the appointment status to CANCELLED
    await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancellationReason: cancellationReason || null,
      },
    });

    // Send notifications to organization owner and members
    const userName = appointment.user.name || appointment.user.email || "A user";
    const formattedStartTime = appointment.startTime.toLocaleString();
    const notificationTitle = "Appointment Cancelled";
    const notificationMessage = `${userName} has cancelled the appointment "${appointment.title}" scheduled for ${formattedStartTime} in ${appointment.organization.name}.${cancellationReason ? ` Reason: ${cancellationReason}` : ""}`;

    await createOrganizationNotifications(
      appointment.organizationId,
      appointment.id,
      NotificationType.APPOINTMENT_CANCELLED,
      notificationTitle,
      notificationMessage,
      {
        appointmentTitle: appointment.title,
        appointmentStartTime: appointment.startTime.toISOString(),
        cancellationReason: cancellationReason || null,
        userName: userName,
      }
    );

    return { success: true, message: "Appointment cancelled successfully!" };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return { success: false, message: "Something went wrong!" };
  }
};

