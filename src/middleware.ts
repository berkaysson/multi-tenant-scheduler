import authConfig from "./auth.config";
import NextAuth from "next-auth";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthRoute,
  authRoutes,
  publicRoutes,
} from "./routes";

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

  if (isApiAuthRoute) {
    return null;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && !isPublicRoute) {
    const signInUrl = new URL("/auth/login", nextUrl);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);

    return Response.redirect(signInUrl);
  }
  return null;
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};
