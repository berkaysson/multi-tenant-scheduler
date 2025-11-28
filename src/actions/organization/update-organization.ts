"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { UpdateOrganizationSchema } from "@/schemas";
import { UserRole } from "@prisma/client";
import { z } from "zod";

/**
 * Updates an existing organization with the provided data.
 *
 * @param {z.infer<typeof UpdateOrganizationSchema>} data - The organization update data.
 * @returns {Promise<{ success: boolean; message: string }>} - A promise that resolves to an object indicating the result of the update.
 * @throws {Error} - If the organization data is invalid or if the user doesn't have permission to update the organization.
 */
export const updateOrganization = async (data: z.infer<typeof UpdateOrganizationSchema>) => {
  // Get the current user session
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  // Check if user has permission to update organizations
  // Only Managers and organization owners can update
  if (session.user.role !== UserRole.MANAGER && session.user.role !== UserRole.ADMIN) {
    return { success: false, message: "Only Managers and Admins can update organizations!" };
  }

  // Validate the organization data
  const validatedFields = UpdateOrganizationSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, message: "Invalid fields!" };
  }

  const { id, ...updateData } = validatedFields.data;

  try {
    // Check if the organization exists and if the user has permission to update it
    const organization = await db.organization.findFirst({
      where: {
        id: id,
        OR: [
          { createdById: session.user.id }, // Organization owner can update
          // Admins can update any organization
          ...(session.user.role === UserRole.ADMIN ? [{}] : [])
        ]
      },
    });

    if (!organization) {
      return { success: false, message: "Organization not found or you don't have permission to update it!" };
    }

    // If slug is being updated, check if the new slug is available
    if (updateData.slug && updateData.slug !== organization.slug) {
      const existingOrganization = await db.organization.findUnique({
        where: { slug: updateData.slug },
      });

      if (existingOrganization) {
        return { success: false, message: "Slug already in use!" };
      }
    }

    // Update the organization
    await db.organization.update({
      where: { id: id },
      data: updateData,
    });

    return { success: true, message: "Organization updated successfully!" };
  } catch (error) {
    console.error("Error updating organization:", error);
    return { success: false, message: "Something went wrong!" };
  }
};
