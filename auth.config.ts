import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { LoginSchema } from "./schemas";
import { getUserByEmail } from "./data/user";
import bcrypt from "bcryptjs";

/**
 * NextAuth configuration with GitHub, Google, and credentials providers.
 * Add other providers as needed.
 *
 * - GitHub and Google: Use OAuth for authentication.
 * - Credentials: Custom provider for email and password authentication.
 * - Passwords are compared using bcrypt.
 * - Login credentials are validated using Zod.
 * 
 * This file is used in auth.ts to configure NextAuth.
 */

export default {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) return null;
          return user;
        }
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
