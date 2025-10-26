"use server";

import db from "@/lib/db";

/**
 * Gets organization details by ID.
 *
 * @param {string} organizationId - The organization ID.
 * @returns {Promise<{ success: boolean; message: string; organization?: any }>} - A promise that resolves to an object with organization data or error message.
 */
export const getOrganization = async (organizationId: string) => {
  try {
    // Everyone can see organizations (no access control)
    const organization = await db.organization.findUnique({
      where: {
        id: organizationId,
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
        _count: {
          select: {
            appointments: true,
            appointmentTypes: true,
          }
        }
      }
    });

    if (!organization) {
      return { success: false, message: "Organization not found!" };
    }

    return { success: true, organization };
  } catch (error) {
    console.error("Error getting organization:", error);
    return { success: false, message: "Something went wrong!" };
  }
};

/**
 * Gets all organizations (public access).
 *
 * @returns {Promise<{ success: boolean; message: string; organizations?: any[] }>} - A promise that resolves to an object with organizations array or error message.
 */
export const getAllOrganizations = async () => {
  try {
    // Everyone can see all organizations (no access control)
    const organizations = await db.organization.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: {
            members: true,
            appointments: true,
            appointmentTypes: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { success: true, organizations };
  } catch (error) {
    console.error("Error getting all organizations:", error);
    return { success: false, message: "Something went wrong!" };
  }
};

/**
 * Gets only public and active organizations.
 *
 * @returns {Promise<{ success: boolean; message: string; organizations?: any[] }>} - A promise that resolves to an object with organizations array or error message.
 */
export const getPublicOrganizations = async () => {
  try {
    // Everyone can see public and active organizations
    const organizations = await db.organization.findMany({
      where: {
        isActive: true,
        isPublic: true,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: {
            members: true,
            appointments: true,
            appointmentTypes: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { success: true, organizations };
  } catch (error) {
    console.error("Error getting public organizations:", error);
    return { success: false, message: "Something went wrong!" };
  }
};

/**
 * Gets all organizations with search and sort support.
 *
 * @param {string} searchQuery - Search query to filter organizations by name, city, or country
 * @param {string} sortBy - Field to sort by ('name', 'city', 'country', 'createdAt', 'appointments')
 * @param {string} sortOrder - Sort order ('asc' or 'desc')
 * @returns {Promise<{ success: boolean; message: string; organizations?: any[] }>} - A promise that resolves to an object with organizations array or error message.
 */
export const getOrganizations = async (
  searchQuery?: string,
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  try {
    // Build where clause for search
    const where = searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' as const } },
            { city: { contains: searchQuery, mode: 'insensitive' as const } },
            { country: { contains: searchQuery, mode: 'insensitive' as const } },
            { description: { contains: searchQuery, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Build orderBy clause
    let orderBy: any = {};
    
    if (sortBy === 'appointments') {
      orderBy = {
        appointments: {
          _count: sortOrder
        }
      };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const organizations = await db.organization.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: {
            members: true,
            appointments: true,
            appointmentTypes: true,
          }
        }
      },
      orderBy,
    });

    return { success: true, organizations };
  } catch (error) {
    console.error("Error getting organizations:", error);
    return { success: false, message: "Something went wrong!" };
  }
};