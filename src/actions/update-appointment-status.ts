"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { AppointmentStatus, UserRole, NotificationType } from "@prisma/client";
import { createUserNotification } from "@/actions/notifications";

/**
 * Updates the status of an appointment.
 * Organization owners and admins can update appointments for their organization.
 * Users can only cancel their own appointments.
 *
 * @param {string} appointmentId - The appointment ID.
 * @param {AppointmentStatus} status - The new status.
 * @param {string} cancellationReason - Optional cancellation reason (required if status is CANCELLED).
 * @returns {Promise<{ success: boolean; message: string }>} - A promise that resolves to an object indicating the result of the operation.
 */
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
  cancellationReason?: string
) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Find the appointment with organization info
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        userId: true,
        organizationId: true,
        title: true,
        startTime: true,
        status: true,
        organization: {
          select: {
            id: true,
            name: true,
            createdById: true,
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
    });

    if (!appointment) {
      return { success: false, message: "Appointment not found!" };
    }

    const isAdmin = session.user.role === UserRole.ADMIN;
    const isOwner = appointment.organization.createdById === session.user.id;
    const isAppointmentOwner = appointment.userId === session.user.id;

    // Check permissions
    // Organization owners and admins can update any appointment status
    // Users can only cancel their own appointments
    if (status === AppointmentStatus.CANCELLED) {
      if (!isOwner && !isAdmin && !isAppointmentOwner) {
        return {
          success: false,
          message: "You don't have permission to cancel this appointment!",
        };
      }
    } else {
      // For other status updates (like COMPLETED), only owners and admins can do it
      if (!isOwner && !isAdmin) {
        return {
          success: false,
          message: "You don't have permission to update this appointment!",
        };
      }
    }

    // Validate cancellation reason if cancelling
    if (status === AppointmentStatus.CANCELLED && !cancellationReason) {
      return { success: false, message: "Cancellation reason is required!" };
    }

    // Check if appointment is already in the target status
    if (appointment.status === status) {
      return {
        success: false,
        message: `Appointment is already ${status.toLowerCase()}!`,
      };
    }

    // Check if trying to update a completed appointment
    if (
      appointment.status === AppointmentStatus.COMPLETED &&
      status !== AppointmentStatus.COMPLETED
    ) {
      return {
        success: false,
        message: "Cannot modify a completed appointment!",
      };
    }

    // Update the appointment status
    await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status,
        cancellationReason:
          status === AppointmentStatus.CANCELLED
            ? cancellationReason
            : undefined,
      },
    });

    // Send notifications when organization confirms or cancels an appointment
    // Check if the update is done by organization (not by the appointment owner)
    const isOrganizationUpdate = (isOwner || isAdmin) && !isAppointmentOwner;

    if (isOrganizationUpdate) {
      if (status === AppointmentStatus.CONFIRMED) {
        // Organization confirmed the appointment - notify the user
        const formattedStartTime = appointment.startTime.toLocaleString();
        const notificationTitle = "Appointment Confirmed";
        const notificationMessage = `Your appointment "${appointment.title}" scheduled for ${formattedStartTime} in ${appointment.organization.name} has been confirmed.`;

        await createUserNotification(
          appointment.userId,
          appointment.organizationId,
          appointmentId,
          NotificationType.APPOINTMENT_CONFIRMED,
          notificationTitle,
          notificationMessage
        );
      } else if (status === AppointmentStatus.CANCELLED) {
        // Organization cancelled the appointment - notify the user
        const formattedStartTime = appointment.startTime.toLocaleString();
        const notificationTitle = "Appointment Cancelled by Organization";
        const notificationMessage = `Your appointment "${
          appointment.title
        }" scheduled for ${formattedStartTime} in ${
          appointment.organization.name
        } has been cancelled.${
          cancellationReason ? ` Reason: ${cancellationReason}` : ""
        }`;

        await createUserNotification(
          appointment.userId,
          appointment.organizationId,
          appointmentId,
          NotificationType.APPOINTMENT_CANCELLED,
          notificationTitle,
          notificationMessage
        );
      }
    }

    return {
      success: true,
      message: `Appointment ${status.toLowerCase()} successfully!`,
    };
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return { success: false, message: "Something went wrong!" };
  }
};
