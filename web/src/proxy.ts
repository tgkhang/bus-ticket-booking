import { auth0 } from "./lib/auth/auth0";
import { NextResponse } from "next/server";

export async function proxy(request: Request) {
  const url = new URL(request.url);

  // Handle Auth0 callback - redirect to our OAuth sync endpoint
  if (url.pathname === '/auth/callback') {
    const response = await auth0.middleware(request);

    // After Auth0 processes the callback, redirect to our sync endpoint
    if (response.status === 302 || response.status === 307) {
      return NextResponse.redirect(new URL('/api/auth/oauth/login', request.url));
    }

    return response;
  }

  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
  ]
};
