import db from "@/lib/db";

// db(PrismaClient) is defined in lib/db.ts,

/**
 * Retrieves a user from the database by their email.
 *
 * @param {string} email - The email of the user to retrieve.
 * @return {Promise<User | null>} A Promise that resolves to the user object if found, or null if not found.
 */
export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({ where: { email } });
    return user;
  } catch {
    return null;
  }
};

/**
 * Retrieves a user from the database by their ID.
 *
 * @param {string} id - The ID of the user to retrieve.
 * @return {Promise<User | null>} A Promise that resolves to the user object if found, or null if not found.
 */
export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({ where: { id } });
    return user;
  } catch {
    return null;
  }
};
