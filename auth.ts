import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import db from "./lib/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getUserById } from "./data/user";
import { UserRole } from "@prisma/client";

/**
 * NextAuth configuration with custom callbacks and Prisma adapter.
 *
 * - Callbacks:
 *   - `signIn`: Validates user sign-in, ensuring email is verified for credentials provider.
 *   - `session`: Adds user ID and role to the session object.
 *   - `jwt`: Adds user role to the JWT token.
 * - Events:
 *   - `linkAccount`: Marks email as verified when a new account is linked.
 * - Adapter: Uses Prisma adapter for database interactions.
 * - Session strategy: Uses JWT for sessions.
 * - Additional configurations from `authConfig`.
 * - handlers is called in app/api/auth/[...nextauth]/route.ts
 */

export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;

      if (!user.id) return false;
      const existingUser = await getUserById(user.id);
      if (!existingUser || existingUser.emailVerified === null) {
        return false;
      }

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as UserRole;
        // add more fields to the session object if needed
        // to add additional fields also update the next-auth.d.ts file like UserRole
        // for more info check next-auth.d.ts
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);
      if (existingUser) {
        token.role = existingUser.role;
      }
      return token;
    },
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  ...authConfig,
});
