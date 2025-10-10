/**
 * This module contains the routes used in the application.
 */

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
export const DEFAULT_LOGIN_REDIRECT = "/settings";

/**
 * The main domain of the application.
 * @type {string}
 */
export const MAIN_DOMAIN = "http://localhost:3000";