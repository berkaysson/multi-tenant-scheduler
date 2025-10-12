"use server";

import { getResetPasswordTokenByToken } from "@/data/reset-password-token";
import { getUserByEmail } from "@/data/user";
import db from "@/lib/db";
import { NewPasswordSchema } from "@/schemas";
import { z } from "zod";
const bcrypt = require("bcryptjs");

/**
 * Updates the password for a user with the given token.
 *
 * @param {z.infer<typeof NewPasswordSchema>} data - The new password data to update.
 * @param {string | null} token - The password reset token.
 * @returns {Promise<{ message: string }>} - A promise that resolves to an object with a message indicating the result of the password update.
 */
export const newPassword = async (
  data: z.infer<typeof NewPasswordSchema>,
  token?: string | null
) => {
  // Check if the token is valid
  if (!token) {
    return { message: "Invalid token" };
  }

  // Validate the new password data
  const validatedFields = NewPasswordSchema.safeParse(data);

  // If the validation fails, return an error message
  if (!validatedFields.success) {
    return { message: "Invalid fields!" };
  }

  // Retrieve the password reset token
  const existingToken = await getResetPasswordTokenByToken(token);

  // If the token does not exist, return an error message
  if (!existingToken) {
    return { message: "Token does not exist!" };
  }

  // Check if the token has expired
  if (new Date() > new Date(existingToken.expires)) {
    return { message: "Token has expired!" };
  }

  // Retrieve the user associated with the token
  const existingUser = await getUserByEmail(existingToken.email);

  // If the user does not exist, return an error message
  if (!existingUser) {
    return { message: "User does not exist!" };
  }

  // Hash the new password
  const { password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update the user's password
  await db.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  // Delete the password reset token
  await db.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  // Return a success message
  return { message: "Password changed successfully" };
};
