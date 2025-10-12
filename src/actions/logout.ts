"use server";

import { signOut } from "@/auth";

/**
 * Logout function that signs out the user using the signOut function from the auth module.
 *
 * @returns {Promise<void>} - A promise that resolves when the user is signed out.
 */
export const logout = async () => {
  // Sign out the user
  await signOut();
};
