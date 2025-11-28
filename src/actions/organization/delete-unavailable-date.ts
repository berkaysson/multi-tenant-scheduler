"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { DeleteUnavailableDateSchema } from "@/schemas/unavailable-date";
import { z } from "zod";

/**
 * Deletes a specific unavailable date entry.
 *
 * @param {z.infer<typeof DeleteUnavailableDateSchema>} data - The data for deleting the unavailable date.
 * @returns {Promise<{ success: boolean; message: string }>} - A promise that resolves to an object indicating the result of the operation.
 */
export const deleteUnavailableDate = async (data: z.infer<typeof DeleteUnavailableDateSchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  const validatedFields = DeleteUnavailableDateSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, message: "Invalid fields!" };
  }

  const { id } = validatedFields.data;

  try {
    const existingUnavailableDate = await db.unavailableDate.findUnique({
      where: { id },
      select: { organizationId: true },
    });

    if (!existingUnavailableDate) {
      return { success: false, message: "Unavailable date not found." };
    }

    const member = await db.organizationMember.findFirst({
      where: {
        organizationId: existingUnavailableDate.organizationId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return { success: false, message: "You are not a member of this organization." };
    }

    await db.unavailableDate.delete({
      where: { id },
    });

    return { success: true, message: "Unavailable date deleted successfully!" };
  } catch (error) {
    console.error("Error deleting unavailable date:", error);
    return { success: false, message: "Something went wrong!" };
  }
};

