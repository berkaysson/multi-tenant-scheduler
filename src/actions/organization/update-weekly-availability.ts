"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { UpdateWeeklyAvailabilitySchema } from "@/schemas/update-weekly-availability";
import { z } from "zod";

/**
 * Updates a specific weekly availability entry for an organization.
 *
 * @param {z.infer<typeof UpdateWeeklyAvailabilitySchema>} data - The data for updating the weekly availability.
 * @returns {Promise<{ success: boolean; message: string }>} - A promise that resolves to an object indicating the result of the operation.
 */
export const updateWeeklyAvailability = async (data: z.infer<typeof UpdateWeeklyAvailabilitySchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  const validatedFields = UpdateWeeklyAvailabilitySchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, message: "Invalid fields!" };
  }

  const { id, ...updateData } = validatedFields.data;

  try {
    const existingAvailability = await db.weeklyAvailability.findUnique({
      where: { id },
      select: { organizationId: true },
    });

    if (!existingAvailability) {
      return { success: false, message: "Weekly availability not found." };
    }

    const member = await db.organizationMember.findFirst({
      where: {
        organizationId: existingAvailability.organizationId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return { success: false, message: "You are not a member of this organization." };
    }

    await db.weeklyAvailability.update({
      where: { id },
      data: updateData,
    });

    return { success: true, message: "Weekly availability updated successfully!" };
  } catch (error) {
    console.error("Error updating weekly availability:", error);
    return { success: false, message: "Something went wrong!" };
  }
};
