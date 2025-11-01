"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { UserRole } from "@prisma/client";

/**
 * Gets the organization that the current manager created.
 * Managers can only see the organization they created.
 *
 * @returns {Promise<{ success: boolean; message: string; organization?: any }>} - A promise that resolves to an object with organization data or error message.
 */
export const getManagerOrganization = async () => {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Only Managers and Admins can access this
    if (session.user.role !== UserRole.MANAGER && session.user.role !== UserRole.ADMIN) {
      return { success: false, message: "Only Managers and Admins can access this!" };
    }

    // Get the organization created by this user
    const organization = await db.organization.findFirst({
      where: {
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        appointmentTypes: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            appointments: true,
            appointmentTypes: true,
          }
        }
      }
    });

    if (!organization) {
      return { success: false, message: "You don't have an organization yet!" };
    }

    return { success: true, organization };
  } catch (error) {
    console.error("Error getting manager organization:", error);
    return { success: false, message: "Something went wrong!" };
  }
};

