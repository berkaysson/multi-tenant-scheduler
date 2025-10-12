"use server";

import { signIn } from "@/auth";
import { generateVerificationToken } from "@/data/tokens";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail } from "@/lib/mail";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { LoginSchema } from "@/schemas";
import { AuthError } from "next-auth";
import { z } from "zod";
import bcrypt from "bcryptjs";

/**
 * Authenticates user login based on provided data.
 *
 * @param {z.infer<typeof LoginSchema>} data - The user login data to be validated.
 * @return {Promise<{ message: string }>} Message indicating the result of the login attempt.
 * @throws {AuthError} If there's an authentication error.
 */
export const login = async (data: z.infer<typeof LoginSchema>) => {
  // Validate the login data
  const validatedFields = LoginSchema.safeParse(data);

  // If the validation fails, return an error message
  if (!validatedFields.success) {
    return { message: "Invalid fields!" };
  }

  // Destructure the validated fields
  const { email, password } = validatedFields.data;

  // Check if the user exists and has a password
  const existingUser = await getUserByEmail(email);
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { message: "Invalid credentials!" };
  }

  // Compare the provided password with the stored password
  const isValidPassword = await bcrypt.compare(password, existingUser.password);
  if (!isValidPassword) {
    return { message: "Invalid credentials!" };
  }

  // If the user hasn't verified their email, send a verification email and return a message
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return { message: "Confirmation email sent!" };
  }

  try {
    // Attempt to sign in the user
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
    return { message: "Login successful!" };
  } catch (error) {
    // If there's an authentication error, handle it
    if (error instanceof AuthError) {
      console.log("🚀 ~ file: login.ts:25 ~ login ~ error:", error);
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Invalid credentials!" };
        default:
          return { message: "Authentication error" };
      }
    }

    // If there's any other error, rethrow it
    throw error;
  }
};
