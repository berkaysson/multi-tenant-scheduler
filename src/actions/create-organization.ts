"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { CreateOrganizationSchema } from "@/schemas";
import { z } from "zod";

/**
 * Creates a new organization with the provided data.
 *
 * @param {z.infer<typeof CreateOrganizationSchema>} data - The organization creation data.
 * @returns {Promise<{ success: boolean; message: string; organizationId?: string }>} - A promise that resolves to an object indicating the result of the creation.
 * @throws {Error} - If the organization data is invalid or if the slug is already in use.
 */
export const createOrganization = async (data: z.infer<typeof CreateOrganizationSchema>) => {
  // Get the current user session
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  // Everyone can create organizations (no role restriction)

  // Validate the organization data
  const validatedFields = CreateOrganizationSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, message: "Invalid fields!" };
  }

  const organizationData = validatedFields.data;

  try {
    // Check if the slug is already in use
    const existingOrganization = await db.organization.findUnique({
      where: { slug: organizationData.slug },
    });

    if (existingOrganization) {
      return { success: false, message: "Slug already in use!" };
    }

    // Create the organization
    const organization = await db.organization.create({
      data: {
        ...organizationData,
        createdById: session.user.id,
      },
    });

    // Add the creator as a member of the organization
    await db.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: session.user.id,
      },
    });

    return { 
      success: true, 
      message: "Organization created successfully!", 
      organizationId: organization.id 
    };
  } catch (error) {
    console.error("Error creating organization:", error);
    return { success: false, message: "Something went wrong!" };
  }
};
