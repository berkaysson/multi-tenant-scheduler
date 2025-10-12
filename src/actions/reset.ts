"use server";

import { generateResetPasswordToken } from "@/data/tokens";
import { getUserByEmail } from "@/data/user";
import { sendResetPasswordEmail } from "@/lib/mail";
import { ResetSchema } from "@/schemas";
import * as z from "zod";

/**
 * Resets the password for a user with the given email.
 *
 * @param {z.infer<typeof ResetSchema>} data - The email of the user whose password is being reset.
 * @return {Promise<{ message: string }>} A promise that resolves to an object with a message indicating the result of the password reset.
 */
export const reset = async (data: z.infer<typeof ResetSchema>) => {
  // Validate the reset data
  const validatedFields = ResetSchema.safeParse(data);

  // If the validation fails, return an error message
  if (!validatedFields.success) {
    return { message: "Invalid fields!" };
  }

  // Destructure the validated fields
  const { email } = validatedFields.data;

  // Check if the user exists
  const user = await getUserByEmail(email);
  if (!user) {
    return { message: "Email Sent" };
  }

  // Generate a reset password token
  const resetPasswordToken = await generateResetPasswordToken(email);

  // Send a reset password email
  await sendResetPasswordEmail(
    resetPasswordToken.email,
    resetPasswordToken.token
  );

  // Return a success message
  return { message: "Email Sent" };
};
