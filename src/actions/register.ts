"use server";

import { generateVerificationToken } from "@/data/tokens";
import { getUserByEmail } from "@/data/user";
import db from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { RegisterSchema } from "@/schemas";
import { z } from "zod";
const bcrypt = require("bcryptjs");

/**
 * Registers a new user with the provided data.
 *
 * @param {z.infer<typeof RegisterSchema>} data - The user registration data.
 * @returns {Promise<{ message: string }>} - A promise that resolves to an object with a message indicating the result of the registration.
 * @throws {Error} - If the registration data is invalid or if the email is already in use.
 */
export const register = async (data: z.infer<typeof RegisterSchema>) => {
  // Validate the registration data
  const validatedFields = RegisterSchema.safeParse(data);

  if (!validatedFields.success) {
    // If the data is invalid, return an error message
    return { message: "Invalid fields!" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if the email is already in use
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { message: "Email already in use!" };
  }

  // Create a new user with the provided data
  await db.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  // Generate a verification token for the new user
  const verificationToken = await generateVerificationToken(email);

  // Send a verification email to the user
  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  // Return a success message
  return { message: "Email Sent" };
};
