import db from "@/lib/db";

// db(PrismaClient) is defined in lib/db.ts,

/**
 * Retrieves a verification token from the database based on the provided email.
 *
 * @param {string} email - The email address used to search for the verification token.
 * @return {Promise<verificationToken | null>} A Promise that resolves to the verification token if found, or null if not found.
 */
export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await db.verificationToken.findFirst({
      where: { email },
    });

    return verificationToken;
  } catch {
    return null;
  }
};

/**
 * Retrieves a verification token by its token value.
 *
 * @param {string} token - The token value to search for.
 * @return {Promise<VerificationToken | null>} A promise that resolves to the found verification token or null if not found.
 */
export const getVerificationTokenByToken = async (token: string) => {
  try {
    const verificationToken = await db.verificationToken.findFirst({
      where: { token },
    });

    return verificationToken;
  } catch {
    return null;
  }
};
