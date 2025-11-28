"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { DeleteWeeklyAvailabilitySchema } from "@/schemas/delete-weekly-availability";
import { z } from "zod";

/**
 * Deletes a specific weekly availability entry.
 *
 * @param {z.infer<typeof DeleteWeeklyAvailabilitySchema>} data - The data for deleting the weekly availability.
 * @returns {Promise<{ success: boolean; message: string }>} - A promise that resolves to an object indicating the result of the operation.
 */
export const deleteWeeklyAvailability = async (data: z.infer<typeof DeleteWeeklyAvailabilitySchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  const validatedFields = DeleteWeeklyAvailabilitySchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, message: "Invalid fields!" };
  }

  const { id } = validatedFields.data;

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

    await db.weeklyAvailability.delete({
      where: { id },
    });

    return { success: true, message: "Weekly availability deleted successfully!" };
  } catch (error) {
    console.error("Error deleting weekly availability:", error);
    return { success: false, message: "Something went wrong!" };
  }
};
