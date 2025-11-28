"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { CreateWeeklyAvailabilitySchema } from "@/schemas/weekly-availability";
import { z } from "zod";

/**
 * Creates or updates the weekly availability for an organization.
 *
 * @param {z.infer<typeof CreateWeeklyAvailabilitySchema>} data - The weekly availability data.
 * @returns {Promise<{ success: boolean; message: string }>} - A promise that resolves to an object indicating the result of the operation.
 */
export const createWeeklyAvailability = async (data: z.infer<typeof CreateWeeklyAvailabilitySchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  const validatedFields = CreateWeeklyAvailabilitySchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, message: "Invalid fields!" };
  }

  const { organizationId, availabilities } = validatedFields.data;

  try {
    // Check if the user is a member of the organization
    const member = await db.organizationMember.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return { success: false, message: "You are not a member of this organization." };
    }

    // Use a transaction to ensure all or nothing
    await db.$transaction(async (prisma) => {
      // First, delete all existing availabilities for the organization
      await prisma.weeklyAvailability.deleteMany({
        where: {
          organizationId,
        },
      });

      // Then, create the new availabilities
      if (availabilities && availabilities.length > 0) {
        await prisma.weeklyAvailability.createMany({
          data: availabilities.map((availability) => ({
            ...availability,
            organizationId,
          })),
        });
      }
    });

    return { success: true, message: "Weekly availability updated successfully!" };
  } catch (error) {
    console.error("Error creating weekly availability:", error);
    return { success: false, message: "Something went wrong!" };
  }
};
