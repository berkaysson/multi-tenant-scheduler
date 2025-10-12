"use server";

import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import db from "@/lib/db";

/**
 * Verifies a user's email using a token.
 *
 * @param {string} token - The verification token.
 * @returns {Promise<{ message: string }>} - A promise that resolves to an object with a message indicating the result of the verification.
 * @throws {Error} - If the token does not exist or has expired, or if the user does not exist.
 */
export const newVerification = async (token: string) => {
  // Retrieve the token from the database
  const existingToken = await getVerificationTokenByToken(token);

  // If the token does not exist, return an error message
  if (!existingToken) {
    return { message: "Token does not exist!" };
  }

  // Check if the token has expired
  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return { message: "Token has expired!" };
  }

  // Retrieve the user associated with the token
  const existingUser = await getUserByEmail(existingToken.email);

  // If the user does not exist, return an error message
  if (!existingUser) {
    return { message: "Email does not exist!" };
  }

  // Update the user's email and emailVerified fields
  await db.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(),
      email: existingToken.email,
    },
  });

  // Delete the verification token
  await db.verificationToken.delete({
    where: { id: existingToken.id },
  });

  // Return a success message
  return { message: "Email verified!" };
};
