"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import { UserRole } from "@prisma/client";

/**
 * Gets all organizations that the current manager created.
 * Managers can only see the organizations they created.
 *
 * @returns {Promise<{ success: boolean; message: string; organizations?: any[] }>} - A promise that resolves to an object with organizations data or error message.
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

    // Get all organizations created by this user
    const organizations = await db.organization.findMany({
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
        weeklyAvailability: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
        unavailableDates: {
          orderBy: {
            date: 'asc',
          },
        },
        _count: {
          select: {
            appointments: true,
            appointmentTypes: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!organizations || organizations.length === 0) {
      return { success: false, message: "You don't have any organizations yet!" };
    }

    return { success: true, organizations };
  } catch (error) {
    console.error("Error getting manager organizations:", error);
    return { success: false, message: "Something went wrong!" };
  }
};

