"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { CreateUnavailableDateSchema } from "@/schemas/unavailable-date";
import { z } from "zod";

/**
 * Creates an unavailable date for an organization.
 *
 * @param {z.infer<typeof CreateUnavailableDateSchema>} data - The unavailable date data.
 * @returns {Promise<{ success: boolean; message: string }>} - A promise that resolves to an object indicating the result of the operation.
 */
export const createUnavailableDate = async (data: z.infer<typeof CreateUnavailableDateSchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  const validatedFields = CreateUnavailableDateSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, message: "Invalid fields!" };
  }

  const { organizationId, date, reason } = validatedFields.data;

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

    // Parse the date string to ensure it's a valid date
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return { success: false, message: "Invalid date format!" };
    }

    // Extract only the date part (YYYY-MM-DD) without time
    const dateOnly = dateObj.toISOString().split('T')[0];

    // Check if the date already exists for this organization
    const existing = await db.unavailableDate.findUnique({
      where: {
        organizationId_date: {
          organizationId,
          date: new Date(dateOnly),
        },
      },
    });

    if (existing) {
      return { success: false, message: "This date is already marked as unavailable." };
    }

    // Create the unavailable date
    await db.unavailableDate.create({
      data: {
        organizationId,
        date: new Date(dateOnly),
        reason: reason || null,
      },
    });

    return { success: true, message: "Unavailable date created successfully!" };
  } catch (error: any) {
    console.error("Error creating unavailable date:", error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return { success: false, message: "This date is already marked as unavailable." };
    }
    
    return { success: false, message: "Something went wrong!" };
  }
};

