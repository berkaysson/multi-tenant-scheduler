import { UserRole } from "@prisma/client";

/**
 * Returns the appropriate redirect URL based on user role
 * @param role - The user's role
 * @returns The redirect URL for the role
 */
export function getRoleRedirect(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return "/admin";
    case UserRole.MANAGER:
      return "/manager";
    case UserRole.USER:
      return "/dashboard";
    default:
      return "/dashboard";
  }
}

/**
 * Checks if a user has access to a specific route based on their role
 * @param userRole - The user's role
 * @param requiredRoles - Array of roles that can access the route
 * @returns true if user has access, false otherwise
 */
export function hasRoleAccess(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

