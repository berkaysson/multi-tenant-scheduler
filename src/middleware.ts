import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthRoute,
  authRoutes,
  publicRoutes,
  getRequiredRoles,
} from "./routes";
import { UserRole } from "@prisma/client";
import { getRoleRedirect } from "./lib/role-redirect";
import { auth } from "./auth";

/**
 * Middleware for handling authentication and route protection.
 * Now includes role-based access control.
 * * NOTE: The MAIN_DOMAIN variable is not used inside the middleware
 * because Next.js handles the base URL internally when using new URL().
 */
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role as UserRole | undefined;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthRoute);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return null;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      // Redirect to role-based page instead of default
      const redirectUrl = userRole
        ? getRoleRedirect(userRole)
        : DEFAULT_LOGIN_REDIRECT;
      return Response.redirect(new URL(redirectUrl, nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && !isPublicRoute) {
    const signInUrl = new URL("/auth/login", nextUrl);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);

    return Response.redirect(signInUrl);
  }

  // Role-based access control - check AFTER authentication check
  if (isLoggedIn && !isPublicRoute && userRole) {
    const requiredRoles = getRequiredRoles(nextUrl.pathname);

    // Debug logging
    console.log("🔐 Access Check:", {
      pathname: nextUrl.pathname,
      userRole,
      requiredRoles,
      hasAccess: requiredRoles.includes(userRole),
    });

    // If route requires specific roles and user doesn't have access
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
      // Redirect to role-appropriate page
      const redirectUrl = getRoleRedirect(userRole);

      console.log("🚫 Access Denied - Redirecting to:", redirectUrl);
      return Response.redirect(new URL(redirectUrl, nextUrl));
    }
  }

  return null;
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};
