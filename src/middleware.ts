import authConfig from "./auth.config";
import NextAuth from "next-auth";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthRoute,
  authRoutes,
  publicRoutes,
} from "./routes";

// Note: Ensure `authConfig` is correctly defined and exported.
const { auth } = NextAuth(authConfig);

/**
 * Middleware for handling authentication and route protection.
 * * NOTE: The MAIN_DOMAIN variable is not used inside the middleware 
 * because Next.js handles the base URL internally when using new URL().
 */
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthRoute);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // --- FIX 1: Allow NextAuth API to run without redirect ---
  if (isApiAuthRoute) {
    // When the path is `/api/auth/*`, we MUST let the request go to 
    // the NextAuth API handler. Redirecting here breaks the authentication flow
    // and was a major cause of the loop.
    return null; 
  }

  // --- FIX 2: Correctly handle Auth Routes ---
  if (isAuthRoute) {
    if (isLoggedIn) {
      // If logged in, redirect away from /login, /register, etc.
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    // If NOT logged in, allow them to view the auth page without redirecting!
    // The previous code had an unnecessary redirect here, causing a loop:
    // `return Response.redirect(new URL("/auth/login", nextUrl));`
    return null; 
  }

  // --- 3. Handle Protected Routes ---
  if (!isLoggedIn && !isPublicRoute) {
    // If not logged in and trying to access a protected page, 
    // redirect to login and pass the current URL as a callback.
    const signInUrl = new URL("/auth/login", nextUrl);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    
    return Response.redirect(signInUrl);
  }

  // --- FIX 3: Default action must be to allow the request ---
  // If the user is logged in, OR the route is public, the request should
  // proceed to the destination page. Returning a redirect here was causing 
  // the infinite loop for all successful requests.
  return null;
});

// The matcher configuration is fine, it ensures the middleware runs on most routes.
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};