/**
 * This module contains the routes used in the application.
 */
import { UserRole } from "@prisma/client";

/**
 * An array of public routes.
 * @type {string[]}
 */
export const publicRoutes = ["/", "/auth/new-verification"];

/**
 * An array of authentication routes.
 * @type {string[]}
 */
export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/reset",
  "/auth/new-password",
];

/**
 * The route for API authentication.
 * @type {string}
 */
export const apiAuthRoute = "/api/auth";

/**
 * The default redirect route after successful login.
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/organizations";

/**
 * The main domain of the application.
 * @type {string}
 */
export const MAIN_DOMAIN = "http://localhost:3000";

/**
 * Maps routes to their required roles
 * @type {Record<string, UserRole[]>}
 */
export const routeRoles: Record<string, UserRole[]> = {
  "/admin": [UserRole.ADMIN],
  "/manager": [UserRole.MANAGER, UserRole.ADMIN],
  "/settings": [UserRole.MANAGER, UserRole.ADMIN, UserRole.USER],
  "/dashboard": [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
  "/organizations": [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
  "/organizations/create": [UserRole.MANAGER, UserRole.ADMIN, UserRole.USER],
  "/organizations/update": [UserRole.MANAGER, UserRole.ADMIN],
  "/appointments": [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN],
};

/**
 * Gets the required roles for a given route
 * @param pathname - The pathname to check
 * @returns Array of required roles, or empty array if route is public
 */
export function getRequiredRoles(pathname: string): UserRole[] {
  // Check exact matches first
  if (routeRoles[pathname]) {
    return routeRoles[pathname];
  }

  // Check if any route starts with the pathname
  for (const [route, roles] of Object.entries(routeRoles)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }

  return [];
}